export type NodeId = string;
export type EdgeId = string;

export type FieldType = 'string' | 'number' | 'boolean' | 'enum';

export interface Node {
  id: NodeId;
  type: 'Skill';
  properties: {
    [key: string]: any;
  };
  position: { x: number; y: number };
}

export interface Edge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  type: string;
  properties?: {
    [key: string]: any;
  };
}

export interface SchemaField {
  id: string;
  name: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
}

export interface Schema {
  nodeFields: SchemaField[];
  edgeTypes: {
    [type: string]: {
      id: string;
      directed: boolean;
      fields?: SchemaField[];
    };
  };
}

export interface Ontology {
  schema: Schema;
  nodes: Node[];
  edges: Edge[];
}
