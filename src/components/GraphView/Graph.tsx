import React, { useEffect, useRef, type RefObject } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Edge as RFEdge,
  type Node as RFNode,
  type OnConnectStartParams,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useOntologyStore } from '../../state/useOntologyStore';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { edgeBehavior, getEdgeClassName } from './edgeStyles';
import { getNodeClassName } from './nodeStyles';
import { getHighlights } from './highlightUtils';
import { createDefaultValues } from '../../models/defaultValues';
import styles from './Graph.module.scss';
import type { Schema, Node, NodeId } from '../../models/ontology';
import { createEmptyNode } from '../../models/createNode';
import { useReactFlow } from 'reactflow';
import { generateId } from '../../utils/id';
import { getDefaultNodeType, getDefaultEdgeType } from '../../utils/defaultTypes';

export const GraphView: React.FC = () => {
  const screenToFlowPosition = useReactFlow().screenToFlowPosition;
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
  const ontology = useOntologyStore((s) => s.ontology);
  const hasHydrated = useOntologyStore((s) => s._hasHydrated);
  const selectNode = useOntologyStore((s) => s.selectNode);
  const selectEdge = useOntologyStore((s) => s.selectEdge);
  const addEdgeToStore = useOntologyStore((s) => s.addEdge);
  const updateNode = useOntologyStore((s) => s.updateNode);
  const addNode = useOntologyStore((s) => s.addNode);
  const removeNode = useOntologyStore((s) => s.removeNode);
  const removeEdge = useOntologyStore((s) => s.removeEdge);

  const openContextMenu = useOntologyStore((s) => s.openContextMenu);
  const closeContextMenu = useOntologyStore((s) => s.closeContextMenu);

  const selectedNodeId = useOntologyStore((s) => s.selectedNodeId);
  const selectedEdgeId = useOntologyStore((s) => s.selectedEdgeId);

  const collapsedNodes = useOntologyStore((s) => s.collapsedNodes);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const isOntologyValid = ontology && hasHydrated;

  const getNodeLabel = (node: Node, schema: Schema): string => {
    const schemaNodeType = schema.nodeTypes[node.typeId];
    const nameField = Object.values(schemaNodeType.fields).find((f) => f.name === 'name');
    if (nameField?.type === 'string' && node.properties[nameField.id]?.trim()) {
      return node.properties[nameField.id];
    }
    const firstStringField = Object.values(schema.nodeTypes[node.typeId].fields).find(
      (f) => f.type === 'string'
    );
    if (firstStringField) {
      const value = node.properties?.[firstStringField.name];
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }

    return node.id;
  };

  useEffect(() => {
    if (!isOntologyValid) return;

    const hiddenNodeIds = new Set<NodeId>();
    for (const rootId of collapsedNodes) {
      const stack = [rootId];
      while (stack.length) {
        const current = stack.pop()!;
        for (const e of ontology.edges) {
          if (e.source === current && !hiddenNodeIds.has(e.target)) {
            hiddenNodeIds.add(e.target);
            stack.push(e.target);
          }
        }
      }
    }

    const { highlightedNodes, highlightedEdges } = getHighlights(
      ontology.nodes,
      ontology.edges,
      selectedNodeId,
      selectedEdgeId
    );

    setNodes(
      ontology.nodes
        .filter((n) => !hiddenNodeIds.has(n.id))
        .map((n) => ({
          id: n.id,
          type: 'default',
          data: { label: getNodeLabel(n, ontology.schema) },
          position: n.position,
          className: getNodeClassName({
            selected: n.id === selectedNodeId,
            highlighted: highlightedNodes.has(n.id),
            collapsed: collapsedNodes.has(n.id),
          }),
        }))
    );

    setEdges(
      ontology.edges
        .filter((e) => !hiddenNodeIds.has(e.source) && !hiddenNodeIds.has(e.target))
        .map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          ...edgeBehavior[ontology.schema.edgeTypes[e.typeId].name],
          className: getEdgeClassName(ontology.schema.edgeTypes[e.typeId].name, {
            selected: e.id === selectedEdgeId,
            highlighted: highlightedEdges.has(e.id),
          }),
          label: ontology.schema.edgeTypes[e.typeId].name,
        }))
    );
  }, [ontology, selectedNodeId, selectedEdgeId, collapsedNodes]);

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

  const onNodeClick = (_event: any, node: RFNode) => {
    closeContextMenu();
    selectNode(node.id);
  };
  const onEdgeClick = (_event: any, edge: RFEdge) => {
    closeContextMenu();
    selectEdge(edge.id);
  };

  const onConnect = (params: any) => {
    if (!isOntologyValid) return;
    connectingNodeId.current = null;

    const defaultEdgeTypeId = getDefaultEdgeType(ontology.schema);

    const exists = ontology.edges.some(
      (e) => e.source === params.source && e.target === params.target
    );

    if (exists) {
      console.warn('Edge already exists:', params.source, '→', params.target);
      return;
    }

    const id = `e-${params.source}-${params.target}-${Date.now()}`;
    addEdgeToStore({
      id: id,
      source: params.source,
      target: params.target,
      typeId: defaultEdgeTypeId,
      properties: createDefaultValues(ontology.schema.edgeTypes[defaultEdgeTypeId]?.fields || []),
    });
    selectEdge(id);
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

  const onMoveStart = () => {
    closeContextMenu();
  };
  const onNodeDragStart = () => {
    closeContextMenu();
  };

  const connectingNodeId: RefObject<string | null> = useRef(null);

  const onConnectStart = (_event: any, params: OnConnectStartParams) => {
    connectingNodeId.current = params.nodeId;
  };

  const onConnectEndHandler = (event: MouseEvent | TouchEvent) => {
    if (!connectingNodeId.current || !isOntologyValid) return;

    const defaultNodeTypeId = getDefaultNodeType(ontology.schema);
    const defaultEdgeTypeId = getDefaultEdgeType(ontology.schema);

    let x: number;
    let y: number;

    if ('clientX' in event) {
      // MouseEvent
      x = event.clientX;
      y = event.clientY;
    } else if (event.touches && event.touches.length > 0) {
      // TouchEvent
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    } else {
      connectingNodeId.current = null;
      return;
    }

    const positionInFlow = screenToFlowPosition({ x, y });

    const id = generateId('node');
    const newNode = createEmptyNode(
      id,
      defaultNodeTypeId,
      ontology.schema.nodeTypes[defaultNodeTypeId].fields,
      positionInFlow
    );
    addNode(newNode);

    addEdgeToStore({
      id: `e-${connectingNodeId.current}-${newNode.id}-${Date.now()}`,
      source: connectingNodeId.current,
      target: newNode.id,
      typeId: defaultEdgeTypeId,
      properties: createDefaultValues(ontology.schema.edgeTypes[defaultEdgeTypeId]?.fields || []),
    });

    setTimeout(() => {
      selectNode(newNode.id);
    }, 0);
    connectingNodeId.current = null;
  };

  return (
    <div ref={reactFlowWrapperRef} className={styles.container}>
      {!isOntologyValid ? (
        <div className={styles.noOntologyMessage}>Load ontology to view graph</div>
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
          onMoveStart={onMoveStart}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onNodeDragStart={onNodeDragStart}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEndHandler}
          fitView
        >
          <MiniMap className={styles.miniMap} />
          <Controls className={styles.controls} />
          <Background />
        </ReactFlow>
      )}
      <ContextMenu />
    </div>
  );
};
