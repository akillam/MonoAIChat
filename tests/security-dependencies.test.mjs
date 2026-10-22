import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import proxyaddr from "proxy-addr";
import { createServer, loadConfigFromFile } from "vite";

test("proxy trust rejects unrelated IPv4 addresses for IPv6 prefixes", () => {
  for (const subnet of ["::ffff:10.0.0.0/8", "::/1"]) {
    assert.equal(proxyaddr.compile([subnet])("203.0.113.9"), false, subnet);
  }
  const valid = proxyaddr.compile(["::ffff:10.0.0.0/104"]);
  assert.equal(valid("10.2.3.4"), true);
  assert.equal(valid("203.0.113.9"), false);
});

test("Vite protects denied files across query forms and serves public modules", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "monoai-vite-security-"));
  let server;
  try {
    const marker = "SYNTHETIC_PRIVATE_FIXTURE";
    await writeFile(path.join(root, ".hidden.txt"), marker);
    await writeFile(path.join(root, "entry.js"), 'export const message = "public-module";');
    await writeFile(path.join(root, "index.html"), '<script type="module" src="/entry.js"></script>');
    const loaded = await loadConfigFromFile({ command: "serve", mode: "test" });
    assert.ok(loaded);
    server = await createServer({
      ...loaded.config,
      configFile: false,
      root,
      logLevel: "silent",
      server: {
        ...loaded.config.server,
        host: "127.0.0.1",
        port: 0,
        fs: { ...loaded.config.server.fs, allow: [root] },
      },
    });
    await server.listen();
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    for (const query of ["", "?raw", "?import&raw", "?import&url&inline"]) {
      const response = await fetch(`${origin}/.hidden.txt${query}`);
      const body = await response.text();
      assert.equal(response.status, 403, query);
      assert.equal(body.includes(marker), false, query);
    }
    const publicModule = await fetch(`${origin}/entry.js`);
    assert.equal(publicModule.status, 200);
    assert.match(await publicModule.text(), /public-module/);
  } finally {
    await server?.close();
    await rm(root, { recursive: true, force: true });
  }
});
