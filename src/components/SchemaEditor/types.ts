import type { SchemaField } from '../../models/ontology';

export interface EdgeTypeConfig {
  directed: boolean;
  fields?: SchemaField[];
}

export type FieldType = SchemaField['type'];
