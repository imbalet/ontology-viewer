import React, { useMemo } from 'react';

import styles from './NodeForm.module.scss';
import { createDefaultValues } from '../../models/defaultValues';
import { validateField } from '../../models/validation';
import { useOntologyStore } from '../../state/useOntologyStore';
import { getSelectedOneNodeId } from '../../utils/selectedOneNode';
import { Select } from '../Select/Select';
import { TextInput } from '../TextInput/TextInput';

import type { Node, PrimitiveValue, SchemaField } from '../../models/ontology';

export const NodeForm: React.FC = () => {
  const selectedNodeIds = useOntologyStore((s) => s.selectedNodeIds);
  const ontology = useOntologyStore((s) => s.ontology);
  const hasHydrated = useOntologyStore((s) => s._hasHydrated);
  const updateNode = useOntologyStore((s) => s.updateNode);
  const collapseNode = useOntologyStore((s) => s.collapseNode);
  const expandNode = useOntologyStore((s) => s.expandNode);

  const collapsedNodes = useOntologyStore((s) => s.collapsedNodes);

  const selectedNodeId = getSelectedOneNodeId(selectedNodeIds);
  const node = ontology?.nodes.find((n) => n.id === selectedNodeId);

  const isOntologyValid = ontology && hasHydrated;

  const fields = useMemo(() => {
    if (!node?.typeId) return {};
    return ontology?.schema.nodeTypes[node.typeId]?.fields ?? {};
  }, [node, ontology?.schema.nodeTypes]);

  const errors = useMemo(() => {
    if (!node) return {};

    const result: Record<string, string | null> = {};
    for (const field of Object.values(fields)) {
      result[field.id] = validateField(field, node.properties?.[field.id]);
    }
    return result;
  }, [fields, node]);

  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  if (!isOntologyValid || !selectedNodeIds || !node) {
    return null;
  }

  const nodeTypes = Object.keys(ontology.schema.nodeTypes);

  const handleTypeChange = (newTypeId: string) => {
    console.log('Changing node type to', newTypeId);
    updateNode({
      ...node,
      typeId: newTypeId,
      properties: createDefaultValues(ontology.schema.nodeTypes[newTypeId].fields),
    });
  };

  const handleFieldChange = (field: SchemaField, value: PrimitiveValue | undefined) => {
    const updatedNode: Node = {
      ...node,
      properties: {
        ...node.properties,
        [field.id]: value,
      },
    };
    updateNode(updatedNode);
  };

  const renderField = (field: SchemaField) => {
    const value = node.properties?.[field.id] ?? '';
    const error = errors[field.id];

    return (
      <div key={field.id} className={styles.fieldWrapper}>
        <label className={styles.label}>
          {field.name}
          {field.required && ' *'}
        </label>

        {field.type === 'string' && (
          <TextInput
            variant={field.required ? 'required' : 'default'}
            value={value as string}
            onChange={(e) => handleFieldChange(field, e.target.value)}
          />
        )}

        {field.type === 'number' && (
          <TextInput
            variant={field.required ? 'required' : 'default'}
            type="number"
            value={value as number}
            onChange={(e) => {
              const val = e.target.value;
              handleFieldChange(field, val === '' ? '' : Number(val));
            }}
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
          <Select
            variant={field.required ? 'required' : 'default'}
            value={value as string}
            onChange={(e) => handleFieldChange(field, e.target.value)}
          >
            <option value="">—</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        )}

        {error && <div className={styles.error}>{error}</div>}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Edit Node</h3>

      <div className={styles.typeSelect}>
        <label className={styles.label}>Type</label>
        <Select value={node.typeId} onChange={(e) => handleTypeChange(e.target.value)}>
          {nodeTypes.map((t) => (
            <option key={t} value={t}>
              {ontology.schema.nodeTypes[t].name}
            </option>
          ))}
        </Select>
      </div>

      <h4>Properties</h4>
      {Object.values(fields).map(renderField)}

      <input
        type="checkbox"
        checked={collapsedNodes.has(node.id)}
        onChange={(e) => {
          if (e.target.checked) {
            collapseNode(node.id);
          } else {
            expandNode(node.id);
          }
        }}
      />
      <label className={styles.label}>Collapsed</label>

      {hasErrors && <div className={styles.errorMessage}>Please fix validation errors</div>}
    </div>
  );
};
