import { type Edge, type Node } from '../../models/ontology';
import { getSelectedOneNodeId } from '../../utils/selectedOneNode';

export function getHighlights(
  nodes: Node[],
  edges: Edge[],
  selectedNodeIds: string[],
  selectedEdgeId: string | null
) {
  const highlightedNodes = new Set<string>();
  const highlightedEdges = new Set<string>();

  const nodesMap = new Map(nodes.map((n) => [n.id, n]));
  const edgesMap = new Map(edges.map((e) => [e.id, e]));

  const selectedNodeId = getSelectedOneNodeId(selectedNodeIds);
  const selectedNode = selectedNodeId ? nodesMap.get(selectedNodeId) : null;
  const selectedEdge = selectedEdgeId ? edgesMap.get(selectedEdgeId) : null;

  if (selectedNode) {
    edges.forEach((e) => {
      if (e.source === selectedNode.id || e.target === selectedNode.id) {
        highlightedEdges.add(e.id);
        highlightedNodes.add(e.source);
        highlightedNodes.add(e.target);
      }
    });
    highlightedNodes.add(selectedNode.id);
  } else if (selectedEdge) {
    highlightedEdges.add(selectedEdge.id);
    highlightedNodes.add(selectedEdge.source);
    highlightedNodes.add(selectedEdge.target);
  }

  return { highlightedNodes, highlightedEdges };
}
