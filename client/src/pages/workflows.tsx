import { useState, useCallback, useRef } from "react";
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  Handle, 
  Position
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Plus, Save, Play, Database, MessageSquare, Globe, Cpu, Zap } from "lucide-react";

// Custom Node Components
const CustomNode = ({ data, icon: Icon, label, type }: any) => {
  return (
    <div className="min-w-[180px] bg-background border border-border shadow-sm rounded-none group hover:border-primary transition-colors">
      <div className="flex items-center gap-2 p-2 border-b border-border bg-secondary/30">
        <div className="p-1 bg-primary text-primary-foreground">
          <Icon className="w-3 h-3" />
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-tighter">{type}</span>
      </div>
      <div className="p-3">
        <div className="text-xs font-medium mb-1">{label}</div>
        <div className="text-[10px] text-muted-foreground font-mono">{data.status || "IDLE"}</div>
      </div>
      
      {/* Handles */}
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-muted-foreground !rounded-none !border-none" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-primary !rounded-none !border-none" />
    </div>
  );
};

const nodeTypes = {
  llm: (props: any) => <CustomNode {...props} icon={Cpu} label="LLM Processor" type="MODEL" />,
  database: (props: any) => <CustomNode {...props} icon={Database} label="Vector DB" type="STORAGE" />,
  trigger: (props: any) => <CustomNode {...props} icon={Zap} label="Webhook" type="TRIGGER" />,
  output: (props: any) => <CustomNode {...props} icon={MessageSquare} label="Response" type="OUTPUT" />,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 100, y: 100 },
    data: { label: 'Start', status: 'LISTENING' },
  },
  {
    id: '2',
    type: 'llm',
    position: { x: 400, y: 100 },
    data: { label: 'GPT-4o', status: 'READY' },
  },
  {
    id: '3',
    type: 'output',
    position: { x: 700, y: 100 },
    data: { label: 'Output', status: 'PENDING' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'var(--primary)' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: 'var(--primary)' } },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

export default function Workflows() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: 'var(--primary)' } }, eds)),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Layout>
      <div className="flex h-full w-full">
        {/* Node Toolbar */}
        <div className="w-64 border-r border-border bg-background/95 backdrop-blur p-4 flex flex-col gap-4 z-10 ml-10 lg:ml-0">
          <div>
             <h2 className="text-sm font-bold tracking-tight uppercase mb-4">Component Library</h2>
             <div className="space-y-2">
               <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2">Inputs</div>
               <div 
                  className="p-3 border border-border bg-secondary/20 hover:bg-secondary hover:border-primary cursor-move flex items-center gap-3 transition-all"
                  onDragStart={(event) => onDragStart(event, 'trigger')} 
                  draggable
                >
                  <Zap className="w-4 h-4" />
                  <div className="text-xs font-medium">Trigger</div>
               </div>
               
               <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2 mt-4">Logic</div>
               <div 
                  className="p-3 border border-border bg-secondary/20 hover:bg-secondary hover:border-primary cursor-move flex items-center gap-3 transition-all"
                  onDragStart={(event) => onDragStart(event, 'llm')} 
                  draggable
                >
                  <Cpu className="w-4 h-4" />
                  <div className="text-xs font-medium">LLM Model</div>
               </div>
               <div 
                  className="p-3 border border-border bg-secondary/20 hover:bg-secondary hover:border-primary cursor-move flex items-center gap-3 transition-all"
                  onDragStart={(event) => onDragStart(event, 'database')} 
                  draggable
                >
                  <Database className="w-4 h-4" />
                  <div className="text-xs font-medium">Vector DB</div>
               </div>

               <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2 mt-4">Outputs</div>
               <div 
                  className="p-3 border border-border bg-secondary/20 hover:bg-secondary hover:border-primary cursor-move flex items-center gap-3 transition-all"
                  onDragStart={(event) => onDragStart(event, 'output')} 
                  draggable
                >
                  <MessageSquare className="w-4 h-4" />
                  <div className="text-xs font-medium">Response</div>
               </div>
             </div>
          </div>

          <div className="mt-auto pt-4 border-t border-border">
             <Button className="w-full gap-2 text-xs font-mono rounded-none" size="sm">
                <Play className="w-3 h-3" />
                TEST_FLOW
             </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative h-full" ref={reactFlowWrapper}>
           <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button variant="outline" size="sm" className="rounded-none bg-background/80 backdrop-blur gap-2 text-xs font-mono">
                <Save className="w-3 h-3" />
                SAVE_CONFIG
              </Button>
           </div>
           <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
          >
            <Background 
              variant={BackgroundVariant.Lines} 
              gap={20} 
              size={1} 
              color="var(--border)" 
              className="opacity-30"
            />
            <Controls className="!bg-background !border !border-border !rounded-none [&>button]:!border-b [&>button]:!border-border [&>button]:!rounded-none [&>button:last-child]:!border-b-0 hover:[&>button]:!bg-secondary" />
          </ReactFlow>
        </div>
      </div>
    </Layout>
  );
}
