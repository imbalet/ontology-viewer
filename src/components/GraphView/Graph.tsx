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
import { useOntologyStore } from '../../state/useOntologyStore';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { getEdgeStyle } from './edgeStyles';
import { getNodeStyle } from './nodeStyles';
import { getHighlights } from './highlightUtils';

export const GraphView: React.FC = () => {
  const ontology = useOntologyStore((s) => s.ontology);
  const selectNode = useOntologyStore((s) => s.selectNode);
  const selectEdge = useOntologyStore((s) => s.selectEdge);
  const addEdgeToStore = useOntologyStore((s) => s.addEdge);
  const updateNode = useOntologyStore((s) => s.updateNode);

  const openContextMenu = useOntologyStore((s) => s.openContextMenu);
  const closeContextMenu = useOntologyStore((s) => s.closeContextMenu);

  const selectedNodeId = useOntologyStore((s) => s.selectedNodeId);
  const selectedEdgeId = useOntologyStore((s) => s.selectedEdgeId);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const hasOntology = ontology !== null;


  useEffect(() => {
    if (!ontology) return;

    const { highlightedNodes, highlightedEdges } = getHighlights(
      ontology.nodes,
      ontology.edges,
      selectedNodeId,
      selectedEdgeId
    );

    setNodes(
      ontology.nodes.map((n) => ({
        id: n.id,
        type: 'default',
        data: { label: n.properties.name || n.id },
        position: n.position,
        selected: n.id === selectedNodeId,
        style: getNodeStyle({
          selected: n.id === selectedNodeId,
          highlighted: highlightedNodes.has(n.id),
        }),
      }))
    );

    setEdges(
      ontology.edges.map((e) =>
      ({
        id: e.id,
        source: e.source,
        target: e.target,
        ...getEdgeStyle(e.type, {
          selected: e.id === selectedEdgeId,
          highlighted: highlightedEdges.has(e.id),
        }),
      } as any)
      )
    );
  }, [ontology, selectedNodeId, selectedEdgeId]);


  const onNodeDragStop = (_event: any, node: RFNode) => {
    const n = ontology?.nodes.find((n) => n.id === node.id);
    if (!n) return;

    updateNode({ ...n, position: node.position });
  };

  const onNodeClick = (_event: any, node: RFNode) => selectNode(node.id);
  const onEdgeClick = (_event: any, edge: RFEdge) => selectEdge(edge.id);

  const onConnect = (params: any) => {
    if (!ontology) return;
    const edgeTypes = Object.keys(ontology.schema.edgeTypes);
    const defaultType = edgeTypes[0] || 'related_to';

    const exists = ontology.edges.some(
      (e) => e.source === params.source && e.target === params.target
    );

    if (exists) {
      console.warn('Edge already exists:', params.source, '→', params.target);
      return;
    }

    addEdgeToStore({
      id: `e-${params.source}-${params.target}-${Date.now()}`,
      source: params.source,
      target: params.target,
      type: defaultType,
    });
  };

  const onNodeContextMenu = (_event: React.MouseEvent, node: RFNode) => {
    _event.preventDefault();
    openContextMenu('node', node.id, {
      x: _event.clientX,
      y: _event.clientY,
    });
  };

  const onEdgeContextMenu = (_event: React.MouseEvent, edge: RFEdge) => {
    _event.preventDefault();
    openContextMenu('edge', edge.id, {
      x: _event.clientX,
      y: _event.clientY,
    });
  };

  const onPaneContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();

    openContextMenu('pane', null, {
      x: event.clientX,
      y: event.clientY,
    });
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
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onPaneContextMenu={onPaneContextMenu}
            onPaneClick={closeContextMenu}
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
      <ContextMenu />
    </ReactFlowProvider>
  );
};
