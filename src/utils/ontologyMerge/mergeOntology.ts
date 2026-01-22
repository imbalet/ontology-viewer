import { type Edge, type Node, type Ontology } from '../../models/ontology';
import { generateId } from '../id';
import { getNodeSignature } from './nodeEquality';
import { normalizeProperties } from './normalizeProperties';
import { matchEdgeTypes } from './schemaMatch';

export const mergeOntology = (base: Ontology, incoming: Ontology): Ontology => {
  const edgeTypeMap = matchEdgeTypes(base.schema, incoming.schema);

  const nodeIdMap = new Map<string, string>();

  const existingNodeMap = new Map<string, string>();
  base.nodes.forEach((node) => {
    const signature = getNodeSignature(node, base.schema);
    existingNodeMap.set(signature, node.id);
  });

  const importedNodes: Node[] = [];
  incoming.nodes.forEach((node) => {
    const signature = getNodeSignature(node, base.schema);

    if (existingNodeMap.has(signature)) {
      nodeIdMap.set(node.id, existingNodeMap.get(signature)!);
      return;
    }

    const newId = generateId('n');
    nodeIdMap.set(node.id, newId);

    importedNodes.push({
      ...node,
      id: newId,
      properties: normalizeProperties(node.properties, base.schema.nodeTypes[node.typeId].fields),
      position: {
        x: node.position.x + 40,
        y: node.position.y + 40,
      },
    });
  });

  const importedEdges: Edge[] = incoming.edges
    .map((edge) => {
      const mappedType = edgeTypeMap.get(edge.typeId);
      if (!mappedType) return null;

      const sourceId = nodeIdMap.get(edge.source);
      const targetId = nodeIdMap.get(edge.target);
      if (!sourceId || !targetId) return null;

      return {
        ...edge,
        id: generateId('e'),
        type: mappedType,
        source: sourceId,
        target: targetId,
        properties: normalizeProperties(
          edge.properties ?? {},
          base.schema.edgeTypes[mappedType].fields ?? []
        ),
      };
    })
    .filter(Boolean) as Edge[];

  return {
    ...base,
    nodes: [...base.nodes, ...importedNodes],
    edges: [...base.edges, ...importedEdges],
  };
};
