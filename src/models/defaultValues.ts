import { type PrimitiveValue, type SchemaField } from './ontology';

export function createDefaultValues(
  fields: Record<string, SchemaField>
): Record<string, PrimitiveValue | undefined> {
  const defaults: Record<string, PrimitiveValue | undefined> = {};

  for (const fieldId in fields) {
    const field = fields[fieldId];

    if (field.required) {
      switch (field.type) {
        case 'string':
          defaults[field.id] = 'empty';
          break;
        case 'number':
          defaults[field.id] = 0;
          break;
        case 'boolean':
          defaults[field.id] = false;
          break;
        case 'enum':
          defaults[field.id] = field.options?.[0] ?? '';
          break;
      }
    } else {
      defaults[field.id] = field.type === 'boolean' ? false : undefined;
    }
  }

  return defaults;
}
