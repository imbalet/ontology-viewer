export type NodeId = string;
export type EdgeId = string;

export interface Node {
    id: NodeId;
    type: 'Skill';
    properties: {
        [key: string]: any;
    };
    position?: { x: number; y: number };
}

export interface Edge {
    id: EdgeId;
    source: NodeId;
    target: NodeId;
    type: 'includes' | 'requires' | 'related_to';
    properties?: {
        [key: string]: any;
    };
}

export interface SchemaField {
    name: string;
    type: 'string' | 'number' | 'enum' | 'boolean';
    options?: string[];
    required?: boolean;
}

export interface Schema {
    nodeFields: SchemaField[];
    edgeTypes: {
        [type: string]: {
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
