import React from 'react';
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

  return (
    <div className={styles.column}>
      <h3>Node Fields</h3>

      {nodeFields.map((f, i) => (
        <div key={i} className={styles.nodeField}>
          <div className={styles.nodeFieldRow}>
            <TextInput
              value={f.name}
              placeholder="name"
              onChange={(e) => updateNodeField(i, { ...f, name: e.target.value })}
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
      ))}

      <Button onClick={addNodeField}>+ Add field</Button>
    </div>
  );
};
