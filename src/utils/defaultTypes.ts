import { type Schema } from '../models/ontology';

export function getDefaultNodeType(schema: Schema): string {
  const nodeTypes = Object.keys(schema.nodeTypes).sort((a, b) => a.localeCompare(b));
  return nodeTypes[0];
}

export function getDefaultEdgeType(schema: Schema): string {
  const edgeTypes = Object.keys(schema.edgeTypes).sort((a, b) => a.localeCompare(b));
  return edgeTypes[0];
}
