import React from 'react';

import styles from './SchemaEditor.module.scss';
import { Button } from '../Button/Button';
import { TextInput } from '../TextInput/TextInput';

interface Props {
  options?: string[];
  onChange: (options: string[]) => void;
}

export const EnumOptionsEditor: React.FC<Props> = ({ options = [], onChange }) => {
  const addOption = () => onChange([...options, '']);

  const updateOption = (index: number, value: string) =>
    onChange(options.map((o, i) => (i === index ? value : o)));

  const removeOption = (index: number) => onChange(options.filter((_, i) => i !== index));

  return (
    <div className={styles.enumOptions}>
      <div className={styles.enumTitle}>Enum values</div>

      {options.map((opt, i) => (
        <div key={i} className={styles.enumOption}>
          <TextInput
            value={opt}
            placeholder="value"
            onChange={(e) => updateOption(i, e.target.value)}
          />
          <Button onClick={() => removeOption(i)}>🗑</Button>
        </div>
      ))}

      <Button onClick={addOption}>+ Add value</Button>
    </div>
  );
};
