import type { SchemaField } from '../../models/ontology';

export const emptyField = (id: string): SchemaField => ({
  id,
  name: '',
  type: 'string',
  required: false,
});
