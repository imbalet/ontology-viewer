export type NodeId = string;
export type EdgeId = string;

export type NodeTypeId = string;
export type EdgeTypeId = string;

export type FieldType = 'string' | 'number' | 'boolean' | 'enum';

export interface Node {
  id: NodeId;
  typeId: NodeTypeId;
  properties: {
    [id: string]: any;
  };
  position: { x: number; y: number };
}

export interface Edge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  typeId: EdgeTypeId;
  properties?: {
    [id: string]: any;
  };
}

export interface SchemaField {
  id: string;
  name: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
}

export interface TypeConfig {
  name: string;
  fields: {
    [fieldId: string]: SchemaField;
  };
}

export interface EdgeTypeConfig extends TypeConfig {
  directed: boolean;
}

export interface Schema {
  nodeTypes: {
    [nodeTypeId: string]: TypeConfig;
  };
  edgeTypes: {
    [edgeTypeId: string]: EdgeTypeConfig;
  };
}

export interface Ontology {
  schema: Schema;
  nodes: Node[];
  edges: Edge[];
}
