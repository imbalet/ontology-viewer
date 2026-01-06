import React, { useMemo } from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import { type SchemaField } from '../../models/ontology';
import { validateField } from '../../models/validation';
import { Select } from '../Select/Select';
import { TextInput } from '../TextInput/TextInput';

export const EdgeForm: React.FC = () => {
  const ontology = useOntologyStore((s) => s.ontology);
  const selectedEdgeId = useOntologyStore((s) => s.selectedEdgeId);
  const updateEdge = useOntologyStore((s) => s.updateEdge);

  const edge = ontology?.edges.find((e) => e.id === selectedEdgeId);

  const fields = useMemo(() => {
    if (!ontology || !edge) return [];
    return ontology.schema.edgeTypes[edge.type]?.fields ?? [];
  }, [ontology, edge]);

  const errors = useMemo(() => {
    if (!edge) return {};

    const result: Record<string, string | null> = {};
    for (const field of fields) {
      result[field.name] = validateField(field, edge.properties?.[field.name]);
    }
    return result;
  }, [fields, edge]);

  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  if (!ontology || !selectedEdgeId || !edge) {
    return null;
  }

  const edgeTypes = Object.keys(ontology.schema.edgeTypes);

  const handleTypeChange = (newType: string) => {
    updateEdge({
      ...edge,
      type: newType,
      properties: {},
    });
  };

  const handleFieldChange = (field: SchemaField, value: any) => {
    updateEdge({
      ...edge,
      properties: {
        ...edge.properties,
        [field.name]: value,
      },
    });
  };

  const renderField = (field: SchemaField) => {
    const value = edge.properties?.[field.name] ?? '';
    const error = errors[field.name];

    return (
      <div key={field.name} style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          {field.name}
          {field.required && ' *'}
        </label>

        {field.type === 'string' && (
          <TextInput value={value} onChange={(e) => handleFieldChange(field, e.target.value)} />
        )}

        {field.type === 'number' && (
          <TextInput
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field, Number(e.target.value))}
          />
        )}

        {field.type === 'boolean' && (
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => handleFieldChange(field, e.target.checked)}
          />
        )}

        {field.type === 'enum' && (
          <Select value={value} onChange={(e) => handleFieldChange(field, e.target.value)}>
            <option value="">—</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        )}

        {error && <div style={{ color: 'red', fontSize: '12px' }}>{error}</div>}
      </div>
    );
  };

  return (
    <div
      style={{ border: '1px solid #ccc', padding: '10px', width: '250px', boxSizing: 'border-box' }}
    >
      <h3>Edit Edge</h3>

      <div key="type" style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Type</label>
        <Select value={edge.type} onChange={(e) => handleTypeChange(e.target.value)}>
          {edgeTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      <h4>Properties</h4>
      {fields.map(renderField)}

      {hasErrors && (
        <div style={{ color: '#c53030', fontSize: '12px' }}>Please fix validation errors</div>
      )}

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
        {edge.source} → {edge.target}
      </div>
    </div>
  );
};
