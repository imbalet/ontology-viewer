import { type SchemaField } from './ontology';

export function createDefaultValues(fields: SchemaField[]): Record<string, any> {
  const defaults: Record<string, any> = {};
  for (const field of fields) {
    if (field.required) {
      switch (field.type) {
        case 'string':
          defaults[field.name] = 'empty';
          break;
        case 'number':
          defaults[field.name] = 0;
          break;
        case 'boolean':
          defaults[field.name] = false;
          break;
        case 'enum':
          defaults[field.name] = field.options?.[0] ?? '';
          break;
      }
    } else {
      if (field.type === 'boolean') {
        defaults[field.name] = false;
      } else {
        defaults[field.name] = undefined;
      }
    }
  }
  return defaults;
}
