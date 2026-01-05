import React, { useMemo } from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import type { Node, SchemaField } from '../../models/ontology';
import { validateField } from '../../models/validation';

export const NodeForm: React.FC = () => {
  const selectedNodeId = useOntologyStore((s) => s.selectedNodeId);
  const ontology = useOntologyStore((s) => s.ontology);
  const updateNode = useOntologyStore((s) => s.updateNode);

  const node = ontology?.nodes.find((n) => n.id === selectedNodeId);
  const fields = ontology?.schema.nodeFields ?? [];

  const errors = useMemo(() => {
    if (!node) return {};

    const result: Record<string, string | null> = {};
    for (const field of fields) {
      result[field.name] = validateField(field, node.properties?.[field.name]);
    }
    return result;
  }, [fields, node]);

  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  if (!selectedNodeId || !ontology || !node) {
    return <div>Select a node to edit</div>;
  }

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

      {fields.map((field) => {
        const value = node.properties?.[field.name] ?? '';
        const error = errors[field.name];

        return (
          <div key={field.name} style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block' }}>
              {field.name}
              {field.required && ' *'}
            </label>

            {field.type === 'string' && (
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={value}
                onChange={(e) => handleChange(field, Number(e.target.value))}
              />
            )}

            {field.type === 'boolean' && (
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => handleChange(field, e.target.checked)}
              />
            )}

            {field.type === 'enum' && (
              <select value={value} onChange={(e) => handleChange(field, e.target.value)}>
                <option value="">—</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {error && <div style={{ color: 'red', fontSize: '12px' }}>{error}</div>}
          </div>
        );
      })}

      {hasErrors && (
        <div style={{ color: '#c53030', fontSize: '12px' }}>Please fix validation errors</div>
      )}
    </div>
  );
};
