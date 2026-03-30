import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FolderOpen, GitBranch, ChevronRight, ArrowUp, Plus, Trash2, HardDrive, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Layout from "@/components/Layout";
import type { ConnectedRepo, DirectoryEntry } from "@shared/schema";

interface BrowseResponse {
  path: string;
  parent: string;
  entries: DirectoryEntry[];
}

export default function Repositories() {
  const queryClient = useQueryClient();
  const [browsePath, setBrowsePath] = useState<string>("");
  const [pathInput, setPathInput] = useState("");

  const browseQuery = useQuery<BrowseResponse>({
    queryKey: ["/api/repos/browse", browsePath],
    queryFn: async () => {
      const params = browsePath ? `?path=${encodeURIComponent(browsePath)}` : "";
      const res = await fetch(`/api/repos/browse${params}`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const reposQuery = useQuery<ConnectedRepo[]>({
    queryKey: ["/api/repos"],
  });

  const connectMutation = useMutation({
    mutationFn: async (repoPath: string) => {
      const res = await apiRequest("POST", "/api/repos/connect", { path: repoPath });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repos"] });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/repos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repos"] });
    },
  });

  const navigateTo = (path: string) => {
    setBrowsePath(path);
    setPathInput(path);
  };

  const handlePathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBrowsePath(pathInput);
  };

  const connectedPaths = new Set((reposQuery.data || []).map((r) => r.path));

  return (
    <Layout>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 bg-secondary/20">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5" />
            <div>
              <h1 className="text-sm font-mono font-bold tracking-tight">LOCAL_REPOSITORIES</h1>
              <p className="text-[10px] text-muted-foreground font-mono">Connect and manage local git repositories</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Left panel: File browser */}
          <div className="flex-1 flex flex-col border-r border-border min-w-0">
            <div className="px-4 py-3 border-b border-border bg-secondary/10">
              <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">Directory Browser</h2>
              <form onSubmit={handlePathSubmit} className="flex gap-2">
                <Input
                  value={pathInput}
                  onChange={(e) => setPathInput(e.target.value)}
                  placeholder={browseQuery.data?.path || "Enter path..."}
                  className="font-mono text-xs h-8 rounded-none border-border bg-background"
                />
                <Button type="submit" variant="outline" size="sm" className="rounded-none h-8 font-mono text-xs">
                  GO
                </Button>
              </form>
            </div>

            {/* Current path + parent nav */}
            {browseQuery.data && (
              <div className="px-4 py-2 border-b border-border flex items-center gap-2 text-xs font-mono text-muted-foreground bg-background/50">
                <FolderOpen className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{browseQuery.data.path}</span>
                {browseQuery.data.parent !== browseQuery.data.path && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 rounded-none ml-auto flex-shrink-0"
                    onClick={() => navigateTo(browseQuery.data!.parent)}
                  >
                    <ArrowUp className="w-3 h-3 mr-1" />
                    UP
                  </Button>
                )}
              </div>
            )}

            <ScrollArea className="flex-1">
              <div className="p-2">
                {browseQuery.isLoading && (
                  <div className="p-4 text-xs font-mono text-muted-foreground animate-pulse">
                    Scanning directory...
                  </div>
                )}
                {browseQuery.error && (
                  <div className="p-4 text-xs font-mono text-red-500">
                    ERROR: {(browseQuery.error as Error).message}
                  </div>
                )}
                {browseQuery.data?.entries.length === 0 && (
                  <div className="p-4 text-xs font-mono text-muted-foreground">
                    No subdirectories found.
                  </div>
                )}
                {browseQuery.data?.entries.map((entry) => (
                  <div
                    key={entry.path}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 group cursor-pointer border-l-2 border-transparent hover:border-primary"
                  >
                    <div
                      className="flex items-center gap-2 flex-1 min-w-0"
                      onClick={() => navigateTo(entry.path)}
                    >
                      {entry.isGitRepo ? (
                        <FolderGit2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <FolderOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="text-xs font-mono truncate">{entry.name}</span>
                      {entry.isGitRepo && (
                        <span className="text-[10px] font-mono text-green-500 border border-green-500/30 px-1 flex-shrink-0">
                          GIT
                        </span>
                      )}
                      <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto flex-shrink-0" />
                    </div>
                    {entry.isGitRepo && !connectedPaths.has(entry.path) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 rounded-none opacity-0 group-hover:opacity-100 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          connectMutation.mutate(entry.path);
                        }}
                        disabled={connectMutation.isPending}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        <span className="text-[10px] font-mono">CONNECT</span>
                      </Button>
                    )}
                    {entry.isGitRepo && connectedPaths.has(entry.path) && (
                      <span className="text-[10px] font-mono text-primary flex-shrink-0">LINKED</span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right panel: Connected repos */}
          <div className="w-80 flex flex-col flex-shrink-0">
            <div className="px-4 py-3 border-b border-border bg-secondary/10">
              <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                Connected ({reposQuery.data?.length || 0})
              </h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2">
                {reposQuery.isLoading && (
                  <div className="p-4 text-xs font-mono text-muted-foreground animate-pulse">
                    Loading repositories...
                  </div>
                )}
                {reposQuery.data?.length === 0 && (
                  <div className="p-4 text-xs font-mono text-muted-foreground">
                    No repositories connected. Browse and connect a git repo.
                  </div>
                )}
                {reposQuery.data?.map((repo) => (
                  <div
                    key={repo.id}
                    className="border border-border p-3 mb-2 bg-background/50 hover:bg-secondary/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FolderGit2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="text-xs font-mono font-bold truncate">{repo.name}</span>
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground truncate mb-1">
                          {repo.path}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            {repo.branch}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-1 truncate">
                          {repo.lastCommit}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-none text-muted-foreground hover:text-red-500 flex-shrink-0"
                        onClick={() => disconnectMutation.mutate(repo.id)}
                        disabled={disconnectMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </Layout>
  );
}
