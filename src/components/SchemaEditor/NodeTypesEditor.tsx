import React, { useState, useEffect } from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import type { SchemaField, Ontology } from '../../models/ontology';
import { TextInput } from '../TextInput/TextInput';
import { Button } from '../Button/Button';
import { emptyField } from './schemaUtils';
import { SchemaFieldEditor } from './SchemaFieldEditor';
import styles from './SchemaEditor.module.scss';

interface Props {
  schema: Ontology['schema'];
}

export const NodeTypesEditor: React.FC<Props> = ({ schema }) => {
  const updateSchema = useOntologyStore((s) => s.updateSchema);
  const { nodeTypes: nodeTypes } = schema;

  const [editingTypes, setEditingTypes] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(nodeTypes).map(([id, cfg]) => [id, cfg.name]))
  );

  useEffect(() => {
    setEditingTypes(
      Object.fromEntries(Object.entries(nodeTypes).map(([id, cfg]) => [id, cfg.name]))
    );
  }, [nodeTypes]);

  const addNodeType = () => {
    updateSchema((s) => {
      const id = `n_${Date.now()}`;
      return {
        ...s,
        nodeTypes: {
          ...s.nodeTypes,
          [id]: { name: 'New Node', directed: true, fields: {} },
        },
      };
    });
  };

  const updateNodeType = (
    id: string,
    patch: Partial<{ name: string; directed: boolean; fields: Record<string, SchemaField> }>
  ) => {
    updateSchema((s) => ({
      ...s,
      nodeTypes: {
        ...s.nodeTypes,
        [id]: { ...s.nodeTypes[id], ...patch },
      },
    }));
  };

  const removeNodeType = (id: string) =>
    updateSchema((s) => {
      const { [id]: _, ...rest } = s.nodeTypes;
      return { ...s, nodeTypes: rest };
    });

  const renameNodeType = (id: string, newName: string) => {
    if (!newName || nodeTypes[id].name === newName) return;
    updateNodeType(id, { name: newName });
  };

  const addNodeField = (nodeTypeId: string) => {
    const id = `field_${Date.now()}`;
    updateNodeType(nodeTypeId, {
      fields: { ...nodeTypes[nodeTypeId].fields, [id]: emptyField(id) },
    });
  };

  const updateNodeField = (nodeTypeId: string, fieldId: string, field: SchemaField) => {
    updateNodeType(nodeTypeId, {
      fields: { ...nodeTypes[nodeTypeId].fields, [fieldId]: field },
    });
  };

  const removeNodeField = (nodeTypeId: string, fieldId: string) => {
    const { [fieldId]: _, ...rest } = nodeTypes[nodeTypeId].fields;
    updateNodeType(nodeTypeId, { fields: rest });
  };

  const renameNodeField = (nodeTypeId: string, fieldId: string, newName: string) => {
    const field = nodeTypes[nodeTypeId].fields[fieldId];
    if (!field || field.name === newName) return;
    updateNodeField(nodeTypeId, fieldId, { ...field, name: newName });
  };

  return (
    <div className={styles.column}>
      <h3>Node Types</h3>
      {Object.entries(nodeTypes)
        .sort(([aId], [bId]) => aId.localeCompare(bId))
        .map(([id, cfg]) => {
          const editingName = editingTypes[id] ?? cfg.name;
          return (
            <div key={id} className={styles.field}>
              <div className={styles.general}>
                <TextInput
                  value={editingName}
                  onChange={(e) => setEditingTypes((prev) => ({ ...prev, [id]: e.target.value }))}
                  onBlur={() => renameNodeType(id, editingTypes[id])}
                />

                <Button onClick={() => removeNodeType(id)}>🗑</Button>
              </div>

              <div className={styles.properties}>
                {Object.entries(cfg.fields).map(([fieldId, field]) => (
                  <SchemaFieldEditor
                    key={fieldId}
                    field={field}
                    onChange={(f) => updateNodeField(id, fieldId, f)}
                    onRename={(_, newName) => renameNodeField(id, fieldId, newName)}
                    onRemove={() => removeNodeField(id, fieldId)}
                  />
                ))}
              </div>

              <Button onClick={() => addNodeField(id)}>+ Add field</Button>
            </div>
          );
        })}

      <Button onClick={addNodeType}>+ Add node type</Button>
    </div>
  );
};
