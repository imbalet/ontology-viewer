import React, { useEffect } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    type Edge as RFEdge,
    type Node as RFNode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Edge } from '../../models/ontology';
import { useOntologyStore } from '../../state/useOntologyStore';

export const GraphView: React.FC = () => {
    const ontology = useOntologyStore((s) => s.ontology);
    const selectNode = useOntologyStore((s) => s.selectNode);
    const selectEdge = useOntologyStore((s) => s.selectEdge);
    const addEdgeToStore = useOntologyStore((s) => s.addEdge);
    const updateNode = useOntologyStore((s) => s.updateNode);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const hasOntology = ontology !== null;

    useEffect(() => {
        if (!ontology) return;
        setNodes(
            ontology.nodes.map((n) => ({
                id: n.id,
                type: 'default',
                data: { label: n.properties.name || n.id },
                position: n.position,
            }))
        );

        setEdges(
            ontology.edges.map((e) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                label: e.type,
                animated: e.type === 'requires',
            }))
        );
    }, [ontology]);



    const onNodeDragStop = (_event: any, node: RFNode) => {
        const n = ontology?.nodes.find((n) => n.id === node.id);
        if (!n) return;

        updateNode({ ...n, position: node.position });
    };

    const onNodeClick = (_event: any, node: RFNode) => selectNode(node.id);
    const onEdgeClick = (_event: any, edge: RFEdge) => selectEdge(edge.id);
    const onConnect = (params: any) => {
        const newEdge: Edge = {
            id: `e-${params.source}-${params.target}`,
            source: params.source!,
            target: params.target!,
            type: 'related_to',
        };
        addEdgeToStore(newEdge);
    };

    return (
        <ReactFlowProvider>
            <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
                {!hasOntology ? (
                    <div>Load ontology to view graph</div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        onConnect={onConnect}
                        onNodeDragStop={onNodeDragStop}
                        fitView
                    >
                        <MiniMap />
                        <Controls />
                        <Background />
                    </ReactFlow>
                )}
            </div>
        </ReactFlowProvider>
    );

}
