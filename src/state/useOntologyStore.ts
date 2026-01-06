import { create } from 'zustand';
import type { Ontology, Node, Edge, NodeId, EdgeId } from '../models/ontology';
import { applyAutoLayout } from '../utils/layout';

interface ContextMenuState {
  type: 'node' | 'edge' | 'pane' | null;
  targetId?: string | null;
  position?: { x: number; y: number };
}

interface OntologyState {
  ontology: Ontology | null;
  selectedNodeId: NodeId | null;
  selectedEdgeId: EdgeId | null;

  undoStack: Ontology[];
  redoStack: Ontology[];

  loadOntology: (data: Ontology) => void;
  addNode: (node: Node) => void;
  updateNode: (node: Node) => void;
  removeNode: (nodeId: NodeId) => void;

  addEdge: (edge: Edge) => void;
  updateEdge: (edge: Edge) => void;
  removeEdge: (edgeId: EdgeId) => void;
  updateNodesWithHistory: (newNodes: Node[]) => void;

  selectNode: (nodeId?: NodeId) => void;
  selectEdge: (edgeId?: EdgeId) => void;

  contextMenu: ContextMenuState | null;
  openContextMenu: (
    type: 'node' | 'edge' | 'pane',
    targetId: string | null,
    position: { x: number; y: number }
  ) => void;
  closeContextMenu: () => void;

  undo: () => void;
  redo: () => void;
}

const hasAllPositions = (nodes: Node[]) =>
  nodes.every((n) => n.position && typeof n.position.x === 'number');

// helper: push current ontology to undo stack
const pushHistory = (state: OntologyState, newOntology: Ontology) => ({
  ontology: newOntology,
  undoStack: [...state.undoStack, state.ontology!],
  
  redoStack: [],
});

export const useOntologyStore = create<OntologyState>((set) => ({
  ontology: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  undoStack: [],
  redoStack: [],

  loadOntology: (data) =>
    set(() => {
      const nodesHavePositions = hasAllPositions(data.nodes);

      const nodes = nodesHavePositions
        ? data.nodes
        : applyAutoLayout(
            data.nodes.map((n) => ({
              ...n,
              position: { x: 0, y: 0 },
            })),
            data.edges
          );

      return {
        ontology: { ...data, nodes },
        undoStack: [],
        redoStack: [],
      };
    }),

  addNode: (node) =>
    set((state) => {
      if (!state.ontology) return state;

      const newNode: Node = {
        ...node,
        position: node.position ?? { x: 0, y: 0 },
      };

      const newOntology: Ontology = {
        ...state.ontology,
        nodes: [...state.ontology.nodes, newNode],
      };
      return { ...state, ...pushHistory(state, newOntology) };
    }),

  updateNode: (node) =>
    set((state) => {
      if (!state.ontology) return state;
      const newOntology: Ontology = {
        ...state.ontology,
        nodes: state.ontology.nodes.map((n) => (n.id === node.id ? node : n)),
      };
      return { ...state, ...pushHistory(state, newOntology) };
    }),

  removeNode: (nodeId) =>
    set((state) => {
      if (!state.ontology) return state;
      const newOntology: Ontology = {
        ...state.ontology,
        nodes: state.ontology.nodes.filter((n) => n.id !== nodeId),
        edges: state.ontology.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      };
      return { ...state, ...pushHistory(state, newOntology) };
    }),

  addEdge: (edge) =>
    set((state) => {
      if (!state.ontology) return state;
      const newOntology: Ontology = {
        ...state.ontology,
        edges: [...state.ontology.edges, edge],
      };
      return { ...state, ...pushHistory(state, newOntology) };
    }),

  updateEdge: (edge) =>
    set((state) => {
      if (!state.ontology) return state;
      const newOntology: Ontology = {
        ...state.ontology,
        edges: state.ontology.edges.map((e) => (e.id === edge.id ? edge : e)),
      };
      return { ...state, ...pushHistory(state, newOntology) };
    }),

  removeEdge: (edgeId) =>
    set((state) => {
      if (!state.ontology) return state;
      const newOntology: Ontology = {
        ...state.ontology,
        edges: state.ontology.edges.filter((e) => e.id !== edgeId),
      };
      return { ...state, ...pushHistory(state, newOntology) };
    }),

  updateNodesWithHistory: (newNodes: Node[]) => {
    set((state) => {
      if (!state.ontology) return state;

      const newOntology: Ontology = {
        ...state.ontology,
        nodes: newNodes,
      };

      return { ...state, ...pushHistory(state, newOntology) };
    });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId ?? null, selectedEdgeId: null }),
  selectEdge: (edgeId) => set({ selectedEdgeId: edgeId ?? null, selectedNodeId: null }),

  contextMenu: null,
  openContextMenu: (type, targetId, position) => set({ contextMenu: { type, targetId, position } }),
  closeContextMenu: () => set({ contextMenu: null }),

  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1];
      const newUndo = state.undoStack.slice(0, -1);
      return {
        ...state,
        ontology: previous,
        undoStack: newUndo,
        redoStack: state.ontology ? [...state.redoStack, state.ontology] : state.redoStack,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      const newRedo = state.redoStack.slice(0, -1);
      return {
        ...state,
        ontology: next,
        undoStack: state.ontology ? [...state.undoStack, state.ontology] : state.undoStack,
        redoStack: newRedo,
      };
    }),
}));
