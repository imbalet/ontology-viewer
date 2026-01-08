import React, { useState } from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import type { SchemaField, Ontology } from '../../models/ontology';
import { TextInput } from '../TextInput/TextInput';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';
import { emptyField, updateAt, removeAt } from './schemaUtils';
import type { FieldType } from './types';
import { EnumOptionsEditor } from './EnumOptionsEditor';
import styles from './SchemaEditor.module.scss';

interface Props {
  schema: Ontology['schema'];
}

export const NodeFieldsEditor: React.FC<Props> = ({ schema }) => {
  const updateSchema = useOntologyStore((s) => s.updateSchema);
  const { nodeFields } = schema;

  const addNodeField = () =>
    updateSchema((s) => ({ ...s, nodeFields: [...s.nodeFields, emptyField()] }));

  const updateNodeField = (index: number, field: SchemaField) =>
    updateSchema((s) => ({ ...s, nodeFields: updateAt(s.nodeFields, index, field) }));

  const removeNodeField = (index: number) =>
    updateSchema((s) => ({ ...s, nodeFields: removeAt(s.nodeFields, index) }));

  const renameNodeField = (oldName: string, newName: string) => {
    const { updateSchema, ontology, updateNodesWithHistory } = useOntologyStore.getState();
    if (!ontology || oldName === newName || !newName) return;

    updateSchema((schema) => ({
      ...schema,
      nodeFields: schema.nodeFields.map((f) => (f.name === oldName ? { ...f, name: newName } : f)),
    }));

    const newNodes = ontology.nodes.map((node) => {
      if (!(oldName in node.properties)) return node;
      const value = node.properties[oldName];
      const newProps = { ...node.properties, [newName]: value };
      delete newProps[oldName];
      return { ...node, properties: newProps };
    });

    // TODO: change saving in history
    updateNodesWithHistory(newNodes);
  };

  return (
    <div className={styles.column}>
      <h3>Node Fields</h3>

      {nodeFields.map((f, i) => {
        const [editingValue, setEditingValue] = useState(f.name);

        return (
          <div key={i} className={styles.nodeField}>
            <div className={styles.nodeFieldRow}>
              <TextInput
                value={editingValue}
                placeholder="name"
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={() => renameNodeField(f.name, editingValue)}
              />

              <Select
                value={f.type}
                onChange={(e) =>
                  updateNodeField(i, {
                    ...f,
                    type: e.target.value as FieldType,
                    options: e.target.value === 'enum' ? (f.options ?? []) : undefined,
                  })
                }
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
                <option value="enum">enum</option>
              </Select>

              <label>
                <input
                  type="checkbox"
                  checked={f.required ?? false}
                  onChange={(e) => updateNodeField(i, { ...f, required: e.target.checked })}
                />
                required
              </label>

              <Button onClick={() => removeNodeField(i)}>🗑</Button>
            </div>

            {f.type === 'enum' && (
              <EnumOptionsEditor
                options={f.options}
                onChange={(options) => updateNodeField(i, { ...f, options })}
              />
            )}
          </div>
        );
      })}

      <Button onClick={addNodeField}>+ Add field</Button>
    </div>
  );
};
