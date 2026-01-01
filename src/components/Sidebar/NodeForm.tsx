import React from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import type { Node, SchemaField } from '../../models/ontology';

export const NodeForm: React.FC = () => {
    const selectedNodeId = useOntologyStore((s) => s.selectedNodeId);
    const ontology = useOntologyStore((s) => s.ontology);
    const updateNode = useOntologyStore((s) => s.updateNode);

    if (!selectedNodeId || !ontology) return <div>Select a node to edit</div>;

    const node = ontology.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return <div>Node not found</div>;

    const handleChange = (field: SchemaField, value: any) => {
        const updatedNode: Node = {
            ...node,
            properties: {
                ...node.properties,
                [field.name]: value,
            },
        };
        updateNode(updatedNode);
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', width: '250px' }}>
            <h3>Edit Node: {node.properties.name || node.id}</h3>
            {ontology.schema.nodeFields.map((field) => {
                const val = node.properties[field.name] || '';
                switch (field.type) {
                    case 'string':
                        return (
                            <div key={field.name}>
                                <label>{field.name}</label>
                                <input
                                    type="text"
                                    value={val}
                                    onChange={(e) => handleChange(field, e.target.value)}
                                />
                            </div>
                        );
                    case 'number':
                        return (
                            <div key={field.name}>
                                <label>{field.name}</label>
                                <input
                                    type="number"
                                    value={val}
                                    onChange={(e) => handleChange(field, Number(e.target.value))}
                                />
                            </div>
                        );
                    case 'boolean':
                        return (
                            <div key={field.name}>
                                <label>{field.name}</label>
                                <input
                                    type="checkbox"
                                    checked={val}
                                    onChange={(e) => handleChange(field, e.target.checked)}
                                />
                            </div>
                        );
                    case 'enum':
                        return (
                            <div key={field.name}>
                                <label>{field.name}</label>
                                <select value={val} onChange={(e) => handleChange(field, e.target.value)}>
                                    {field.options?.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
};
