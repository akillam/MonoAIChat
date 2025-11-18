import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Box, Menu, Plus, Hash, Activity, Zap, Settings, MessageSquare, GitGraph } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="h-full border-r border-border bg-secondary/30 backdrop-blur-sm flex flex-col flex-shrink-0"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-mono tracking-tighter font-bold">
                <Box className="w-4 h-4" />
                <span>NEXUS_OS</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none hover:bg-primary hover:text-primary-foreground" onClick={() => setIsSidebarOpen(false)}>
                <Menu className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-2 flex-1 overflow-hidden flex flex-col gap-6">
              {/* Navigation */}
              <div className="px-2 mt-4">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">Navigation</h3>
                <div className="space-y-1">
                  <Link href="/">
                    <Button 
                      variant={location === "/" ? "secondary" : "ghost"} 
                      className={`w-full justify-start gap-2 rounded-none h-9 ${location === "/" ? "border-l-2 border-primary bg-secondary" : "border-l-2 border-transparent"}`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-mono text-xs">Chat_Interface</span>
                    </Button>
                  </Link>
                  <Link href="/workflows">
                    <Button 
                      variant={location === "/workflows" ? "secondary" : "ghost"} 
                      className={`w-full justify-start gap-2 rounded-none h-9 ${location === "/workflows" ? "border-l-2 border-primary bg-secondary" : "border-l-2 border-transparent"}`}
                    >
                      <GitGraph className="w-4 h-4" />
                      <span className="font-mono text-xs">Workflow_Builder</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Context Specific (Mock for now) */}
              <div className="px-2">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">System Metrics</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-border p-2 bg-background/50">
                    <div className="text-[10px] text-muted-foreground font-mono">CPU_LOAD</div>
                    <div className="text-sm font-mono font-bold flex items-center gap-1">
                      <Activity className="w-3 h-3" /> 12%
                    </div>
                  </div>
                  <div className="border border-border p-2 bg-background/50">
                    <div className="text-[10px] text-muted-foreground font-mono">LATENCY</div>
                    <div className="text-sm font-mono font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> 24ms
                    </div>
                  </div>
                  <div className="col-span-2 border border-border p-2 bg-background/50">
                    <div className="text-[10px] text-muted-foreground font-mono">STATUS</div>
                    <div className="text-xs font-mono text-green-600 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 animate-pulse" />
                      OPERATIONAL
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground font-mono text-xs">
                  OP
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-bold truncate">OPERATOR_01</div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">ID: 884-2X-99</div>
                </div>
                <Settings className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-background">
        {/* Mobile/Collapsed Sidebar Toggle */}
        {!isSidebarOpen && (
           <div className="absolute top-3 left-4 z-50">
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-primary hover:text-primary-foreground bg-background border border-border" onClick={() => setIsSidebarOpen(true)}>
               <Menu className="w-4 h-4" />
             </Button>
           </div>
        )}
        {children}
      </main>
    </div>
  );
}
