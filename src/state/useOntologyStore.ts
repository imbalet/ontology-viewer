import { create } from 'zustand';
import type { Ontology, Node, Edge, NodeId, EdgeId } from '../models/ontology';

interface OntologyState {
    ontology: Ontology | null;
    selectedNodeId?: NodeId;
    selectedEdgeId?: EdgeId;

    // actions
    loadOntology: (data: Ontology) => void;
    addNode: (node: Node) => void;
    updateNode: (node: Node) => void;
    removeNode: (nodeId: NodeId) => void;

    addEdge: (edge: Edge) => void;
    removeEdge: (edgeId: EdgeId) => void;

    selectNode: (nodeId?: NodeId) => void;
    selectEdge: (edgeId?: EdgeId) => void;
}

export const useOntologyStore = create<OntologyState>((set) => ({
    ontology: null,
    selectedNodeId: undefined,
    selectedEdgeId: undefined,

    loadOntology: (data) => set({ ontology: data }),

    addNode: (node) =>
        set((state) => ({
            ontology: state.ontology
                ? { ...state.ontology, nodes: [...state.ontology.nodes, node] }
                : { schema: { nodeFields: [], edgeTypes: {} }, nodes: [node], edges: [] },
        })),

    updateNode: (node) =>
        set((state) => ({
            ontology: state.ontology
                ? {
                    ...state.ontology,
                    nodes: state.ontology.nodes.map((n) => (n.id === node.id ? node : n)),
                }
                : state.ontology,
        })),

    removeNode: (nodeId) =>
        set((state) => ({
            ontology: state.ontology
                ? {
                    ...state.ontology,
                    nodes: state.ontology.nodes.filter((n) => n.id !== nodeId),
                    edges: state.ontology.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
                }
                : state.ontology,
        })),

    addEdge: (edge) =>
        set((state) => ({
            ontology: state.ontology
                ? { ...state.ontology, edges: [...state.ontology.edges, edge] }
                : state.ontology,
        })),

    removeEdge: (edgeId) =>
        set((state) => ({
            ontology: state.ontology
                ? { ...state.ontology, edges: state.ontology.edges.filter((e) => e.id !== edgeId) }
                : state.ontology,
        })),

    selectNode: (nodeId) => set({ selectedNodeId: nodeId, selectedEdgeId: undefined }),
    selectEdge: (edgeId) => set({ selectedEdgeId: edgeId, selectedNodeId: undefined }),
}));
