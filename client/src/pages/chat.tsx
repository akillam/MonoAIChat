import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Send, Plus, Command, Square, Box, Terminal, Cpu, Activity, Zap, Menu, MoreHorizontal, Settings, Download, Hash, Clock, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

// Mock Data
const MOCK_HISTORY = [
  { id: 1, title: "System Architecture Analysis", date: "2024-11-18" },
  { id: 2, title: "Data Protocol V2", date: "2024-11-17" },
  { id: 3, title: "Neural Net Optimization", date: "2024-11-16" },
];

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
  timestamp: Date;
  latency?: number;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      role: "system",
      content: "System initialized. Neural interface ready. Waiting for input...",
      timestamp: new Date(),
      latency: 12
    }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset } = useForm<{ prompt: string }>();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const onSubmit = async (data: { prompt: string }) => {
    if (!data.prompt.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: data.prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    reset();
    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(() => {
      const sysMsg: Message = {
        id: `sys-${Date.now()}`,
        role: "system",
        content: "Analyzing request parameters. Calculating optimal response vector. \n\nOutput generated: The requested data structure aligns with protocol V4. Confirmed integration with sub-modules.",
        timestamp: new Date(),
        latency: Math.floor(Math.random() * 50) + 10
      };
      setMessages(prev => [...prev, sysMsg]);
      setIsProcessing(false);
    }, 1500);
  };

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

            <div className="p-2 flex-1 overflow-hidden">
              <Button className="w-full justify-start gap-2 rounded-none border border-dashed border-border bg-transparent hover:bg-primary hover:text-primary-foreground transition-all mb-4" variant="outline">
                <Plus className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider font-mono">New Session</span>
              </Button>

              <div className="space-y-6">
                <div className="px-2">
                  <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">Active Threads</h3>
                  <div className="space-y-1">
                    {MOCK_HISTORY.map((item) => (
                      <button key={item.id} className="w-full text-left px-2 py-2 text-xs hover:bg-border/50 group flex items-center gap-2 transition-colors border-l-2 border-transparent hover:border-primary">
                        <Hash className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                        <span className="truncate font-medium">{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

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

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
               <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-primary hover:text-primary-foreground" onClick={() => setIsSidebarOpen(true)}>
                 <Menu className="w-4 h-4" />
               </Button>
            )}
            <div>
              <h1 className="text-sm font-bold tracking-tight uppercase">System Architecture Analysis</h1>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                <span>MODEL: GPT-4o-TURBO</span>
                <span className="text-border">|</span>
                <span>TEMP: 0.7</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" className="h-8 rounded-none text-xs font-mono gap-2">
               <Download className="w-3 h-3" />
               EXPORT_LOG
             </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
               <MoreHorizontal className="w-4 h-4" />
             </Button>
          </div>
        </header>

        {/* Chat Scroll Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-8 pb-24">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border border-border ${msg.role === 'system' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  {msg.role === 'system' ? <Cpu className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase opacity-70">
                      {msg.role === 'user' ? 'User_Input' : 'System_Response'}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {format(msg.timestamp, "HH:mm:ss")}
                    </span>
                  </div>
                  
                  <div className={`p-4 border border-border text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-secondary/50' 
                      : 'bg-background shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap font-mono text-xs md:text-sm">{msg.content}</p>
                  </div>
                  
                  {msg.latency && (
                    <div className="mt-1 text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      COMPUTE_TIME: {msg.latency}ms
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-border bg-primary text-primary-foreground">
                  <Cpu className="w-4 h-4 animate-pulse" />
                </div>
                <div className="flex flex-col items-start">
                   <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase opacity-70">System_Response</span>
                  </div>
                  <div className="p-3 border border-border bg-background flex items-center gap-2">
                    <span className="w-2 h-2 bg-foreground animate-bounce"></span>
                    <span className="w-2 h-2 bg-foreground animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-foreground animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 bg-background/95 backdrop-blur border-t border-border">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="relative group">
              <div className="absolute -top-3 left-4 px-2 bg-background text-[10px] font-mono uppercase tracking-wider text-muted-foreground border border-border border-b-0 z-10">
                Input_Command
              </div>
              <div className="relative flex items-end gap-2 border border-border bg-background p-2 focus-within:ring-1 focus-within:ring-ring transition-all">
                <div className="flex-1">
                  <Textarea 
                    {...register("prompt")}
                    placeholder="Enter command or query..." 
                    className="min-h-[60px] w-full resize-none border-0 bg-transparent p-2 text-sm font-mono focus-visible:ring-0 placeholder:text-muted-foreground/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(onSubmit)();
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2 pb-1">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-secondary">
                    <Square className="w-4 h-4 text-muted-foreground" />
                  </Button>
                   <Button type="submit" size="icon" className="h-8 w-8 rounded-none bg-foreground hover:bg-foreground/90 text-background">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                 <div className="flex gap-4">
                    <span className="flex items-center gap-1"><Command className="w-3 h-3"/> + ENTER TO SEND</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3"/> ENCRYPTED_CHANNEL</span>
                 </div>
                 <div>
                    STATUS: CONNECTED
                 </div>
              </div>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}
