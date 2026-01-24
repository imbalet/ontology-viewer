import React, { type RefObject, useEffect, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type OnConnect,
  type OnConnectEnd,
  type OnConnectStart,
  type OnSelectionChangeParams,
  PanOnScrollMode,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type XYPosition,
  type NodeChange,
} from 'reactflow';

import { edgeBehavior, getEdgeClassName } from './edgeStyles';
import styles from './Graph.module.scss';
import { getHighlights } from './highlightUtils';
import { getNodeClassName } from './nodeStyles';
import { createEmptyNode } from '../../models/createNode';
import { createDefaultValues } from '../../models/defaultValues';
import { useOntologyStore } from '../../state/useOntologyStore';
import { getDefaultEdgeType, getDefaultNodeType } from '../../utils/defaultTypes';
import { generateId } from '../../utils/id';
import { getSelectedOneNodeId } from '../../utils/selectedOneNode';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import 'reactflow/dist/style.css';

import type { Node, NodeId, Schema } from '../../models/ontology';

export const GraphView: React.FC = () => {
  const screenToFlowPosition = useReactFlow().screenToFlowPosition;
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
  const ontology = useOntologyStore((s) => s.ontology);
  const hasHydrated = useOntologyStore((s) => s._hasHydrated);
  const selectNode = useOntologyStore((s) => s.selectNode);
  const selectEdge = useOntologyStore((s) => s.selectEdge);
  const setSelectedNodeIds = useOntologyStore((s) => s.setSelectedNodeIds);
  const addEdgeToStore = useOntologyStore((s) => s.addEdge);
  const updateNode = useOntologyStore((s) => s.updateNode);
  const addNode = useOntologyStore((s) => s.addNode);
  const removeNode = useOntologyStore((s) => s.removeNode);
  const removeEdge = useOntologyStore((s) => s.removeEdge);

  const openContextMenu = useOntologyStore((s) => s.openContextMenu);
  const closeContextMenu = useOntologyStore((s) => s.closeContextMenu);

  const selectedNodeIds = useOntologyStore((s) => s.selectedNodeIds);
  const selectedEdgeId = useOntologyStore((s) => s.selectedEdgeId);

  const collapsedNodes = useOntologyStore((s) => s.collapsedNodes);
  const hiddenEdgeTypes = useOntologyStore((s) => s.hiddenEdgeTypes);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const isOntologyValid = ontology && hasHydrated;

  const getNodeLabel = (node: Node, schema: Schema): string => {
    const schemaNodeType = schema.nodeTypes[node.typeId];
    const nameField = Object.values(schemaNodeType.fields).find((f) => f.name === 'name');
    if (nameField?.type === 'string' && String(node.properties[nameField.id])?.trim()) {
      return String(node.properties[nameField.id]);
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

    setNodes(
      ontology.nodes
        .filter((n) => !hiddenNodeIds.has(n.id))
        .map((n) => ({
          id: n.id,
          type: 'default',
          data: { label: getNodeLabel(n, ontology.schema) },
          position: n.position,
          selected: selectedNodeIds.includes(n.id),
        }))
    );

    setEdges(
      ontology.edges
        .filter(
          (e) =>
            !hiddenNodeIds.has(e.source) &&
            !hiddenNodeIds.has(e.target) &&
            !hiddenEdgeTypes.has(e.typeId)
        )
        .map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: ontology.schema.edgeTypes[e.typeId].name,
          selected: e.id === selectedEdgeId,
          ...edgeBehavior[ontology.schema.edgeTypes[e.typeId].name],
        }))
    );
  }, [ontology, isOntologyValid, collapsedNodes, hiddenEdgeTypes, setNodes, setEdges]);

  useEffect(() => {
    if (!isOntologyValid) return;

    const { highlightedNodes, highlightedEdges } = getHighlights(
      ontology.nodes,
      ontology.edges,
      selectedNodeIds,
      selectedEdgeId
    );

    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        className: getNodeClassName({
          selected: selectedNodeIds.includes(n.id),
          highlighted: highlightedNodes.has(n.id),
          collapsed: collapsedNodes.has(n.id),
        }),
      }))
    );

    setEdges((prev) =>
      prev.map((e) => ({
        ...e,
        className: getEdgeClassName(e.label as string, {
          highlighted: highlightedEdges.has(e.id),
          selected: e.id === selectedEdgeId,
        }),
      }))
    );
  }, [
    selectedNodeIds,
    selectedEdgeId,
    collapsedNodes,
    ontology,
    isOntologyValid,
    setNodes,
    setEdges,
  ]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedNodeIds([]);
        selectEdge(null);
        closeContextMenu();
        return;
      }

      if (e.key !== 'Delete' && e.key !== 'Backspace') return;

      const selectedNodeId = getSelectedOneNodeId(selectedNodeIds);
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
  }, [
    selectedNodeIds,
    selectedEdgeId,
    removeNode,
    removeEdge,
    selectNode,
    selectEdge,
    closeContextMenu,
    setSelectedNodeIds,
  ]);

  const onNodeClick = (_event: React.MouseEvent) => {
    closeContextMenu();
  };
  const onEdgeClick = (_event: React.MouseEvent) => {
    closeContextMenu();
  };

  const onConnect: OnConnect = (params) => {
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

    if (!params.source || !params.target) {
      console.warn('Invalid connection parameters:', params);
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
    setSelectedNodeIds([]);
    selectEdge(null);
    closeContextMenu();
  };

  const onMoveStart = () => {
    closeContextMenu();
  };
  const onNodeDragStart = () => {
    closeContextMenu();
  };

  const connectingNodeId: RefObject<string | null> = useRef(null);

  const onConnectStart: OnConnectStart = (_event, params) => {
    connectingNodeId.current = params.nodeId;
  };

  const onConnectEndHandler: OnConnectEnd = (event: MouseEvent | TouchEvent) => {
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

  const onSelectionChange = (params: OnSelectionChangeParams) => {
    const nodeIds = params.nodes.map((n) => n.id);
    const edgeId = params.edges[0]?.id || null;
    const store = useOntologyStore.getState();

    if (
      nodeIds.length !== store.selectedNodeIds.length ||
      nodeIds.some((id, i) => id !== store.selectedNodeIds[i])
    ) {
      setSelectedNodeIds(nodeIds);
    }

    if (edgeId !== store.selectedEdgeId) {
      selectEdge(edgeId);
    }
  };

  const dragPositionsRef = useRef<Map<string, XYPosition>>(new Map());

  const onNodesChangeWithPositionSync = (changes: NodeChange[]) => {
    onNodesChange(changes);

    if (!ontology) return;

    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        dragPositionsRef.current.set(change.id, change.position);
      }

      if (change.type === 'position' && change.dragging === false) {
        dragPositionsRef.current.forEach((pos, id) => {
          const node = ontology.nodes.find((n) => n.id === id);
          if (!node) return;

          updateNode({
            ...node,
            position: pos,
          });
        });
        dragPositionsRef.current.clear();
      }
    });
  };

  // const onNodeDragStop = (_event: React.MouseEvent, node: RFNode) => {
  //   console.log('Node drag stopped for node:', node.id);
  //   const n = ontology?.nodes.find((n) => n.id === node.id);
  //   if (!n) return;

  //   if (n.position.x === node.position.x && n.position.y === node.position.y) return;

  //   updateNode({ ...n, position: node.position });
  // };

  return (
    <div ref={reactFlowWrapperRef} className={styles.container}>
      {!isOntologyValid ? (
        <div className={styles.noOntologyMessage}>Load ontology to view graph</div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          // onNodesChange={onNodesChange}
          // onNodeDragStop={onNodeDragStop}
          onNodesChange={onNodesChangeWithPositionSync}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onNodeContextMenu={(event, node) => handleContextMenu('node', node.id)(event)}
          onEdgeContextMenu={(event, edge) => handleContextMenu('edge', edge.id)(event)}
          onPaneContextMenu={(event) => handleContextMenu('pane', null)(event)}
          onPaneClick={onPaneClick}
          onMoveStart={onMoveStart}
          onConnect={onConnect}
          onNodeDragStart={onNodeDragStart}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEndHandler}
          fitView
          // selection
          selectionOnDrag
          onSelectionChange={onSelectionChange}
          selectionKeyCode={['Shift', 'Meta', 'Control']}
          // pan
          // panOnScroll
          panOnScrollMode={PanOnScrollMode.Free}
          panOnDrag={[2]}
          // zoom
          zoomOnPinch
          zoomOnScroll={true}
          zoomActivationKeyCode={['Control', 'Meta']}
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
