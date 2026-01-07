import React, { useMemo } from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import type { Node, SchemaField } from '../../models/ontology';
import { validateField } from '../../models/validation';
import { Select } from '../Select/Select';
import { TextInput } from '../TextInput/TextInput';
import styles from './NodeForm.module.scss';

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
    return null;
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
    <div className={styles.container}>
      <h3 className={styles.header}>Edit Node: {node.properties.name || node.id}</h3>

      {fields.map((field) => {
        const value = node.properties?.[field.name] ?? '';
        const error = errors[field.name];

        return (
          <div key={field.name} className={styles.field}>
            <label className={styles.label}>
              {field.name}
              {field.required && ' *'}
            </label>

            {field.type === 'string' && (
              <TextInput
                type="text"
                variant={field.required ? 'required' : 'default'}
                value={value}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            )}

            {field.type === 'number' && (
              <TextInput
                type="number"
                variant={field.required ? 'required' : 'default'}
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
              <Select
                variant={field.required ? 'required' : 'default'}
                value={value}
                onChange={(e) => handleChange(field, e.target.value)}
              >
                <option value="">—</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            )}

            {error && <div className={styles.errorText}>{error}</div>}
          </div>
        );
      })}

      {hasErrors && <div className={styles.validationError}>Please fix validation errors</div>}
    </div>
  );
};
