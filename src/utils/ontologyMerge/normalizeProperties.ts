import { type SchemaField } from '../../models/ontology';
import { createDefaultValues } from '../../models/defaultValues';

export const normalizeProperties = (
  incoming: Record<string, any>,
  schemaFields: Record<string, SchemaField>
): Record<string, any> => {
  const result: Record<string, any> = {};
  const defaults = createDefaultValues(schemaFields);

  for (const field of Object.values(schemaFields)) {
    if (incoming[field.id] !== undefined) {
      result[field.id] = incoming[field.id];
    } else if (defaults[field.id] !== undefined) {
      result[field.id] = defaults[field.id];
    }
  }

  return result;
};
