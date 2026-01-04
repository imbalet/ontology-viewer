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
    updateEdge: (edge: Edge) => void;


    selectNode: (nodeId?: NodeId) => void;
    selectEdge: (edgeId?: EdgeId) => void;

    contextMenu: ContextMenuState | null;

    openContextMenu: (
        type: 'node' | 'edge',
        targetId: string,
        position: { x: number; y: number }
    ) => void;

    closeContextMenu: () => void;
}

interface ContextMenuState {
    type: 'node' | 'edge' | null;
    targetId?: string;
    position?: { x: number; y: number };
}

const withPosition = (node: Node): Node => ({
    ...node,
    position: node.position ?? {
        x: Math.random() * 400,
        y: Math.random() * 400,
    },
});


export const useOntologyStore = create<OntologyState>((set) => ({
    ontology: null,
    selectedNodeId: undefined,
    selectedEdgeId: undefined,

    loadOntology: (data) =>
        set({
            ontology: {
                ...data,
                nodes: data.nodes.map(withPosition),
            },
        }),

    addNode: (node) =>
        set((state) => {
            const nodeWithPosition: Node = withPosition(node);

            return {
                ontology: state.ontology
                    ? {
                        ...state.ontology,
                        nodes: [...state.ontology.nodes, nodeWithPosition],
                    }
                    : {
                        schema: { nodeFields: [], edgeTypes: {} },
                        nodes: [nodeWithPosition],
                        edges: [],
                    },
            };
        }),

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

    updateEdge: (edge) =>
        set((state) => ({
            ontology: state.ontology
                ? {
                    ...state.ontology,
                    edges: state.ontology.edges.map((e) =>
                        e.id === edge.id ? edge : e
                    ),
                }
                : state.ontology,
        })),


    selectNode: (nodeId) => set({ selectedNodeId: nodeId, selectedEdgeId: undefined }),
    selectEdge: (edgeId) => set({ selectedEdgeId: edgeId, selectedNodeId: undefined }),

    // context menu
    contextMenu: null,
    openContextMenu: (type, targetId, position) =>
        set({
            contextMenu: { type, targetId, position },
        }),

    closeContextMenu: () => set({ contextMenu: null }),

}));
