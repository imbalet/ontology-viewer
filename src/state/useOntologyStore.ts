import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type PersistedOntologyState, storage, STORAGE_VERSION } from './storage';
import { createDefaultValues } from '../models/defaultValues';
import { validateOntology } from '../models/validation';
import { exportOntology } from '../utils/jsonIO';
import { applyAutoLayout } from '../utils/layout';
import { mergeOntology as mergeFn } from '../utils/ontologyMerge/mergeOntology';


import type { Edge, EdgeId, Node, NodeId, Ontology } from '../models/ontology';

const MAX_HISTORY = 70;
const HISTORY_DEBOUNCE_MS = 400;

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

  collapsedNodes: Set<NodeId>;

  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  loadOntology: (data: Ontology | null) => void;
  mergeOntology: (incoming: Ontology) => void;

  addNode: (node: Node) => void;
  updateNode: (node: Node) => void;
  removeNode: (nodeId: NodeId) => void;

  addEdge: (edge: Edge) => void;
  updateEdge: (edge: Edge) => void;
  removeEdge: (edgeId: EdgeId) => void;
  updateNodesWithHistory: (newNodes: Node[]) => void;
  updateEdgesWithHistory: (newEdges: Edge[]) => void;

  selectNode: (nodeId?: NodeId) => void;
  selectEdge: (edgeId?: NodeId) => void;

  contextMenu: ContextMenuState | null;
  openContextMenu: (
    type: 'node' | 'edge' | 'pane',
    targetId: string | null,
    position: { x: number; y: number }
  ) => void;
  closeContextMenu: () => void;

  updateSchema: (updater: (schema: Ontology['schema']) => Ontology['schema']) => void;

  undo: () => void;
  redo: () => void;

  collapseNode: (nodeId: NodeId) => void;
  expandNode: (nodeId: NodeId) => void;
}

const hasAllPositions = (nodes: Node[]) =>
  nodes.every((n) => n.position && typeof n.position.x === 'number');

let lastHistoryCommit = 0;

const pushHistory = (state: OntologyState, newOntology: Ontology) => {
  const now = Date.now();
  if (now - lastHistoryCommit < HISTORY_DEBOUNCE_MS) {
    return { ontology: newOntology };
  }

  lastHistoryCommit = now;

  const newUndoStack = [...state.undoStack, state.ontology!];

  return {
    ontology: newOntology,
    undoStack: newUndoStack.length > MAX_HISTORY ? newUndoStack.slice(-MAX_HISTORY) : newUndoStack,
    redoStack: [],
  };
};

export const useOntologyStore = create<OntologyState>()(
  persist<OntologyState, [], [], PersistedOntologyState>(
    (set) => ({
      ontology: null,
      selectedNodeId: null,
      selectedEdgeId: null,
      undoStack: [],
      redoStack: [],
      collapsedNodes: new Set<NodeId>(),

      loadOntology: (data) =>
        set(() => {
          if (data === null) {
            return {
              ontology: null,
              undoStack: [],
              redoStack: [],
            };
          }
          const nodesHavePositions = hasAllPositions(data.nodes);
          const nodes = nodesHavePositions
            ? data.nodes
            : applyAutoLayout(
                data.nodes.map((n) => ({ ...n, position: { x: 0, y: 0 } })),
                data.edges
              );
          return {
            ontology: { ...data, nodes },
            undoStack: [],
            redoStack: [],
          };
        }),

      mergeOntology: (incoming) =>
        set((state) => {
          if (!state.ontology) return state;
          const merged = mergeFn(state.ontology, incoming);
          return { ...state, ...pushHistory(state, merged) };
        }),

      addNode: (node) =>
        set((state) => {
          if (!state.ontology) return state;
          const typeSchema = state.ontology.schema.nodeTypes[node.typeId];
          if (!typeSchema) throw new Error(`Unknown node type id: ${node.typeId}`);

          const newNode: Node = {
            ...node,
            position: node.position ?? { x: 0, y: 0 },
            properties: createDefaultValues(typeSchema.fields),
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
          const typeSchema = state.ontology.schema.nodeTypes[node.typeId];
          if (!typeSchema) throw new Error(`Unknown node type id: ${node.typeId}`);

          const newOntology: Ontology = {
            ...state.ontology,
            nodes: state.ontology.nodes.map((n) => (n.id === node.id ? { ...n, ...node } : n)),
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

      updateNodesWithHistory: (newNodes: Node[]) =>
        set((state) => {
          if (!state.ontology) return state;
          const newOntology: Ontology = { ...state.ontology, nodes: newNodes };
          return { ...state, ...pushHistory(state, newOntology) };
        }),

      updateEdgesWithHistory: (newEdges: Edge[]) =>
        set((state) => {
          if (!state.ontology) return state;
          const newOntology: Ontology = { ...state.ontology, edges: newEdges };
          return { ...state, ...pushHistory(state, newOntology) };
        }),

      selectNode: (nodeId) => set({ selectedNodeId: nodeId ?? null, selectedEdgeId: null }),
      selectEdge: (edgeId) => set({ selectedEdgeId: edgeId ?? null, selectedNodeId: null }),

      contextMenu: null,
      openContextMenu: (type, targetId, position) =>
        set({ contextMenu: { type, targetId, position } }),
      closeContextMenu: () => set({ contextMenu: null }),

      updateSchema: (updater) =>
        set((state) => {
          if (!state.ontology) return state;
          const newOntology: Ontology = {
            ...state.ontology,
            schema: updater(state.ontology.schema),
          };
          return { ...state, ...pushHistory(state, newOntology) };
        }),

      undo: () =>
        set((state) => {
          if (state.undoStack.length === 0) return state;
          const previous = state.undoStack[state.undoStack.length - 1];
          const newUndo = state.undoStack.slice(0, -1);
          return {
            ...state,
            ontology: previous,
            undoStack: newUndo,
            redoStack: state.ontology
              ? [...state.redoStack, state.ontology].slice(-MAX_HISTORY)
              : state.redoStack,
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
            undoStack: state.ontology
              ? [...state.undoStack, state.ontology].slice(-MAX_HISTORY)
              : state.undoStack,
            redoStack: newRedo,
          };
        }),

      collapseNode: (nodeId) =>
        set((state) => {
          const newSet = new Set(state.collapsedNodes);
          newSet.add(nodeId);
          return { collapsedNodes: newSet };
        }),

      expandNode: (nodeId) =>
        set((state) => {
          const newSet = new Set(state.collapsedNodes);
          newSet.delete(nodeId);
          return { collapsedNodes: newSet };
        }),

      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: 'ontology-storage',
      version: STORAGE_VERSION,
      storage,

      partialize: (state): PersistedOntologyState => ({
        ontology: state.ontology,
        collapsedNodes: state.collapsedNodes,
      }),

      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.log('an error happened during hydration', error);
          } else {
            const isValid = validateOntology(state?.ontology);
            if (state?.ontology && !isValid) {
              console.warn('Hydrated ontology is invalid, resetting to null.');
              const wantExport = window.confirm(
                'Persisted ontology version mismatch, cannot load. Do you want to export the current ontology before continuing?'
              );
              if (wantExport && state?.ontology) {
                exportOntology(state.ontology, 'ontology_backup.json');
              }

              state?.loadOntology(null);
              state?.setHasHydrated(true);
              return;
            }
            console.log('hydration finished');
            if (state) {
              state.setHasHydrated(true);
            }
          }
        };
      },

      migrate: (persistedState: unknown, version) => {
        console.log('Migrating persisted state...');
        let result: PersistedOntologyState = {
          ontology: null,
          collapsedNodes: new Set<NodeId>(),
        };

        try {
          const state = persistedState as PersistedOntologyState | undefined;
          if (!state) {
            console.warn('No persisted state found, starting fresh.');
            return { ontology: null, collapsedNodes: new Set<NodeId>() };
          }
          if (version !== STORAGE_VERSION) {
            console.warn('Persisted ontology version mismatch, cannot load.');
            if (state?.ontology) {
              const wantExport = window.confirm(
                'Persisted ontology version mismatch, cannot load. Do you want to export the current ontology before continuing?'
              );
              if (wantExport) {
                exportOntology(state.ontology, 'ontology_backup.json');
              }
            }
            return {
              ontology: null,
              collapsedNodes: new Set<NodeId>(),
            };
          }
          result = state;
        } catch (e) {
          console.error('Failed to load persisted ontology state', e);
          const state = persistedState as PersistedOntologyState | undefined;
          if (state?.ontology) {
            const wantExport = window.confirm(
              'Persisted ontology version mismatch, cannot load. Do you want to export the current ontology before continuing?'
            );
            if (wantExport) {
              exportOntology(state.ontology, 'ontology_backup.json');
            }
          }
        }
        return result;
      },
    }
  )
);
