import React from 'react';
import ReactFlow, {
    ReactFlowProvider,
    MiniMap,
    Controls,
    Background,
    type Edge as RFEdge,
    type Node as RFNode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useOntologyStore } from '../../state/useOntologyStore';
import type { Edge } from '../../models/ontology';
export const GraphView: React.FC = () => {
    const ontology = useOntologyStore((s) => s.ontology);
    const selectNode = useOntologyStore((s) => s.selectNode);
    const selectEdge = useOntologyStore((s) => s.selectEdge);
    const addEdgeToStore = useOntologyStore((s) => s.addEdge);

    if (!ontology) return <div>Load ontology to view graph</div>;

    // Преобразуем нашу модель в React Flow
    const nodes: RFNode[] = ontology.nodes.map((n) => ({
        id: n.id,
        data: { label: n.properties.name || n.id },
        position: n.position || { x: Math.random() * 400, y: Math.random() * 400 },
    }));

    const edges: RFEdge[] = ontology.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.type,
        animated: e.type === 'requires', // визуально выделяем связи requires
    }));

    const onNodeClick = (_event: any, node: RFNode) => {
        selectNode(node.id);
    };

    const onEdgeClick = (_event: any, edge: RFEdge) => {
        selectEdge(edge.id);
    };

    const onConnect = (params: any) => {
        // Добавляем новую связь в store
        const newEdge: Edge = {
            id: `e-${params.source}-${params.target}`,
            source: params.source,
            target: params.target,
            type: 'related_to', // по умолчанию
        };
        addEdgeToStore(newEdge);
    };

    return (
        <ReactFlowProvider>
            <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodeClick={onNodeClick}
                    onEdgeClick={onEdgeClick}
                    onConnect={onConnect}
                    fitView
                >
                    <MiniMap />
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>
        </ReactFlowProvider>
    );
};
