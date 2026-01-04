import React from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import { type Edge, type SchemaField } from '../../models/ontology';

export const EdgeForm: React.FC = () => {
    const ontology = useOntologyStore((s) => s.ontology);
    const selectedEdgeId = useOntologyStore((s) => s.selectedEdgeId);
    const addEdge = useOntologyStore((s) => s.addEdge);
    const removeEdge = useOntologyStore((s) => s.removeEdge);

    if (!ontology || !selectedEdgeId) {
        return <div>Select an edge to edit</div>;
    }

    const edge = ontology.edges.find((e) => e.id === selectedEdgeId);
    if (!edge) return null;

    const edgeTypes = Object.keys(ontology.schema.edgeTypes);
    const edgeSchema = ontology.schema.edgeTypes[edge.type];
    const fields = edgeSchema?.fields ?? [];



    const update = (updated: Edge) => {
        removeEdge(edge.id);
        addEdge(updated);
    };

    const handleTypeChange = (newType: string) => {
        update({
            ...edge,
            type: newType,
            properties: {},
        });
    };

    const handleFieldChange = (field: SchemaField, value: any) => {
        update({
            ...edge,
            properties: {
                ...edge.properties,
                [field.name]: value,
            },
        });
    };



    const renderField = (field: SchemaField) => {
        const value = edge.properties?.[field.name] ?? '';

        switch (field.type) {
            case 'string':
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleFieldChange(field, Number(e.target.value))}
                    />
                );

            case 'boolean':
                return (
                    <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => handleFieldChange(field, e.target.checked)}
                    />
                );

            case 'enum':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                    >
                        <option value="">—</option>
                        {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                );

            default:
                return null;
        }
    };


    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', width: '250px' }}>
            <h3>Edit Edge</h3>

            <div style={{ marginBottom: '10px' }}>
                <label>Type</label>
                <select value={edge.type} onChange={(e) => handleTypeChange(e.target.value)}>
                    {edgeTypes.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
            </div>

            {fields.length > 0 && (
                <>
                    <h4 style={{ marginTop: '10px' }}>Properties</h4>

                    {fields.map((field) => (
                        <div key={field.name} style={{ marginBottom: '8px' }}>
                            <label style={{ display: 'block' }}>{field.name}</label>
                            {renderField(field)}
                        </div>
                    ))}
                </>
            )}

            <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                {edge.source} → {edge.target}
            </div>
        </div>
    );
};
