import React, { useEffect, useState } from 'react';

import { EnumOptionsEditor } from './EnumOptionsEditor';
import styles from './SchemaEditor.module.scss';
import { Button } from '../Button/Button';
import { Select } from '../Select/Select';
import { TextInput } from '../TextInput/TextInput';


import type { FieldType, SchemaField } from '../../models/ontology';

interface Props {
  field: SchemaField;
  onChange: (field: SchemaField) => void;
  onRename: (oldName: string, newName: string) => void;
  onRemove: () => void;
}

export const SchemaFieldEditor: React.FC<Props> = ({ field, onChange, onRename, onRemove }) => {
  const [editingValue, setEditingValue] = useState(field.name);

  useEffect(() => {
    if (editingValue !== field.name) {
      setEditingValue(field.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
