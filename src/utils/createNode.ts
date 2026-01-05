import type { Node, SchemaField } from '../models/ontology';

export function createEmptyNode(
  id: string,
  fields: SchemaField[],
  position: { x: number; y: number }
): Node {
  const properties: Record<string, any> = {};

  for (const field of fields) {
    switch (field.type) {
      case 'string':
        properties[field.name] = field.required ? 'empty' : '';
        break;
      case 'number':
        properties[field.name] = 0;
        break;
      case 'boolean':
        properties[field.name] = false;
        break;
      case 'enum':
        properties[field.name] = '';
        break;
    }
  }

  return {
    id,
    type: 'Skill',
    properties,
    position,
  };
}
