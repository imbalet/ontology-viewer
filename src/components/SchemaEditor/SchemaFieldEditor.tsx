import React, { useEffect, useState } from 'react';
import { TextInput } from '../TextInput/TextInput';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';
import { EnumOptionsEditor } from './EnumOptionsEditor';
import type { SchemaField, FieldType } from '../../models/ontology';
import styles from './SchemaEditor.module.scss';

interface Props {
  field: SchemaField;
  onChange: (field: SchemaField) => void;
  onRename: (oldName: string, newName: string) => void;
  onRemove: () => void;
}

export const SchemaFieldEditor: React.FC<Props> = ({ field, onChange, onRename, onRemove }) => {
  const [editingValue, setEditingValue] = useState(field.name);

  useEffect(() => {
    setEditingValue(field.name);
  }, [field.name]);

  return (
    <div className={styles.field}>
      <div className={styles.fieldRow}>
        <TextInput
          value={editingValue}
          placeholder="name"
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={() => onRename(field.name, editingValue)}
        />

        <Select
          value={field.type}
          onChange={(e) =>
            onChange({
              ...field,
              type: e.target.value as FieldType,
              options: e.target.value === 'enum' ? (field.options ?? []) : undefined,
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
            checked={field.required ?? false}
            onChange={(e) => onChange({ ...field, required: e.target.checked })}
          />
          required
        </label>

        <Button onClick={onRemove}>🗑</Button>
      </div>

      {field.type === 'enum' && (
        <EnumOptionsEditor
          options={field.options}
          onChange={(options) => onChange({ ...field, options })}
        />
      )}
    </div>
  );
};
