import type { Node, SchemaField } from './ontology';
import { createDefaultValues } from './defaultValues';

export function createEmptyNode(
  id: string,
  fields: SchemaField[],
  position: { x: number; y: number }
): Node {
  return {
    id,
    type: 'Skill',
    position,
    properties: createDefaultValues(fields),
  };
}
