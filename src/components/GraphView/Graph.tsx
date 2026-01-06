import React, { useEffect, useRef } from 'react';
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
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
  const ontology = useOntologyStore((s) => s.ontology);
  const selectNode = useOntologyStore((s) => s.selectNode);
  const selectEdge = useOntologyStore((s) => s.selectEdge);
  const addEdgeToStore = useOntologyStore((s) => s.addEdge);
  const updateNode = useOntologyStore((s) => s.updateNode);
  const removeNode = useOntologyStore((s) => s.removeNode);
  const removeEdge = useOntologyStore((s) => s.removeEdge);

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
      ontology.edges.map(
        (e) =>
          ({
            id: e.id,
            source: e.source,
            target: e.target,
            ...getEdgeStyle(e.type, {
              selected: e.id === selectedEdgeId,
              highlighted: highlightedEdges.has(e.id),
            }),
          }) as any
      )
    );
  }, [ontology, selectedNodeId, selectedEdgeId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        selectNode(undefined);
        selectEdge(undefined);
        closeContextMenu();
        return;
      }

      if (e.key !== 'Delete' && e.key !== 'Backspace') return;

      if (selectedNodeId) {
        e.preventDefault();
        const ok = window.confirm('Delete selected node? All connected edges will be removed.');
        if (ok) removeNode(selectedNodeId);
        return;
      }

      if (selectedEdgeId) {
        e.preventDefault();
        const ok = window.confirm('Delete selected edge?');
        if (ok) removeEdge(selectedEdgeId);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, selectedEdgeId, removeNode, removeEdge]);

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

  function handleContextMenu(type: 'node' | 'edge' | 'pane', id: string | null) {
    return (event: React.MouseEvent) => {
      event.preventDefault();

      const bounds = reactFlowWrapperRef.current?.getBoundingClientRect();
      if (!bounds) return;

      openContextMenu(type, id, {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
    };
  }

  const onPaneClick = () => {
    selectNode(undefined);
    selectEdge(undefined);
    closeContextMenu();
  };

  return (
    <ReactFlowProvider>
      <div
        ref={reactFlowWrapperRef}
        style={{ width: '100%', height: '100%', border: '1px solid #ccc', position: 'relative' }}
      >
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
            onNodeContextMenu={(event, node) => handleContextMenu('node', node.id)(event)}
            onEdgeContextMenu={(event, edge) => handleContextMenu('edge', edge.id)(event)}
            onPaneContextMenu={(event) => handleContextMenu('pane', null)(event)}
            onPaneClick={onPaneClick}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        )}
        <ContextMenu />
      </div>
    </ReactFlowProvider>
  );
};
