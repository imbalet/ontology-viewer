import { createDefaultValues } from './defaultValues';

import type { Node, SchemaField } from './ontology';

export function createEmptyNode(
  id: string,
  typeId: string,
  fields: Record<string, SchemaField>,
  position: { x: number; y: number }
): Node {
  return {
    id,
    typeId,
    position,
    properties: createDefaultValues(fields),
  };
}
