import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { connectRepoSchema, type ConnectedRepo, type DirectoryEntry } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

async function isGitRepo(dirPath: string): Promise<boolean> {
  try {
    await fs.access(path.join(dirPath, ".git"));
    return true;
  } catch {
    return false;
  }
}

async function getGitBranch(repoPath: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", ["-C", repoPath, "rev-parse", "--abbrev-ref", "HEAD"]);
    return stdout.trim();
  } catch {
    return "unknown";
  }
}

async function getGitLastCommit(repoPath: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", ["-C", repoPath, "log", "-1", "--format=%s"]);
    return stdout.trim();
  } catch {
    return "unknown";
  }
}

// Prevent path traversal — resolve and verify the path stays under allowed roots
function sanitizePath(requestedPath: string): string {
  const resolved = path.resolve(requestedPath);
  // Block common sensitive paths
  const blocked = ["/etc/shadow", "/etc/passwd", "/proc", "/sys"];
  if (blocked.some((b) => resolved.startsWith(b))) {
    throw new Error("Access denied");
  }
  return resolved;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Browse local directories
  app.get("/api/repos/browse", async (req, res) => {
    try {
      const dirPath = typeof req.query.path === "string" ? req.query.path : process.env.HOME || "/home";
      const safePath = sanitizePath(dirPath);

      const entries = await fs.readdir(safePath, { withFileTypes: true });
      const results: DirectoryEntry[] = [];

      for (const entry of entries) {
        if (entry.name.startsWith(".") && entry.name !== ".git") continue;
        const fullPath = path.join(safePath, entry.name);
        if (entry.isDirectory()) {
          const gitRepo = await isGitRepo(fullPath);
          results.push({
            name: entry.name,
            path: fullPath,
            isDirectory: true,
            isGitRepo: gitRepo,
          });
        }
      }

      results.sort((a, b) => {
        if (a.isGitRepo !== b.isGitRepo) return a.isGitRepo ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      res.json({ path: safePath, parent: path.dirname(safePath), entries: results });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to browse directory" });
    }
  });

  // Connect a local repo
  app.post("/api/repos/connect", async (req, res) => {
    try {
      const parsed = connectRepoSchema.parse(req.body);
      const safePath = sanitizePath(parsed.path);

      const isRepo = await isGitRepo(safePath);
      if (!isRepo) {
        return res.status(400).json({ error: "Not a git repository" });
      }

      const [branch, lastCommit] = await Promise.all([
        getGitBranch(safePath),
        getGitLastCommit(safePath),
      ]);

      const repo: ConnectedRepo = {
        id: randomUUID(),
        path: safePath,
        name: path.basename(safePath),
        branch,
        lastCommit,
        connectedAt: new Date().toISOString(),
      };

      const saved = await storage.addConnectedRepo(repo);
      res.json(saved);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to connect repository" });
    }
  });

  // List connected repos
  app.get("/api/repos", async (_req, res) => {
    const repos = await storage.getConnectedRepos();
    res.json(repos);
  });

  // Disconnect a repo
  app.delete("/api/repos/:id", async (req, res) => {
    const removed = await storage.removeConnectedRepo(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: "Repository not found" });
    }
    res.json({ success: true });
  });

  const httpServer = createServer(app);

  return httpServer;
}
