'use client';

import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';

interface Props {
  topology: {
    nodes: any[];
    edges: any[];
  };
}

// Custom node styles to make it look like an industrial PFD
const nodeTypes = {
  default: ({ data }: any) => (
    <div className="px-4 py-2 shadow-lg rounded-md bg-white border-2 border-blue-500 text-center">
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Equipment</div>
      <div className="text-sm font-semibold text-gray-800 whitespace-pre-wrap">{data.label}</div>
    </div>
  ),
};

export default function ProcessFlowDiagram({ topology }: Props) {
  if (!topology || topology.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <p className="text-gray-500">Configure inputs and generate a scheme to view the Process Flow Diagram.</p>
      </div>
    );
  }

  // Apply custom styling to edges
  const styledEdges = topology.edges.map((edge: any) => ({
    ...edge,
    animated: edge.animated || false,
    style: { stroke: edge.label === 'Rejects' ? '#ef4444' : '#3b82f6', strokeWidth: 2 },
    labelStyle: { fill: '#1f2937', fontWeight: 600 }
  }));

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-md border border-gray-200">
      <ReactFlow
        nodes={topology.nodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background color="#ddd" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(n) => n.id === 'n4' ? '#ef4444' : '#3b82f6'} 
          maskColor="rgba(0, 0, 0, 0.1)" 
        />
      </ReactFlow>
    </div>
  );
}
