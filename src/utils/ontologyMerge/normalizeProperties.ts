import { createDefaultValues } from '../../models/defaultValues';
import { type PrimitiveValue, type SchemaField } from '../../models/ontology';

export const normalizeProperties = (
  incoming: Record<string, PrimitiveValue | undefined>,
  schemaFields: Record<string, SchemaField>
): Record<string, PrimitiveValue | undefined> => {
  const result: Record<string, PrimitiveValue | undefined> = {};
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
