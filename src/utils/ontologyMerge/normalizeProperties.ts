import { type SchemaField } from '../../models/ontology';
import { createDefaultValues } from '../../models/defaultValues';

export const normalizeProperties = (
  incoming: Record<string, any>,
  schemaFields: SchemaField[]
): Record<string, any> => {
  const result: Record<string, any> = {};
  const defaults = createDefaultValues(schemaFields);

  for (const field of schemaFields) {
    if (incoming[field.name] !== undefined) {
      result[field.name] = incoming[field.name];
    } else if (defaults[field.name] !== undefined) {
      result[field.name] = defaults[field.name];
    }
  }

  return result;
};
