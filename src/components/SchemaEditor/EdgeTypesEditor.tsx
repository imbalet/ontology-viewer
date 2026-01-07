import React from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import type { SchemaField, Ontology } from '../../models/ontology';
import { TextInput } from '../TextInput/TextInput';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';
import { emptyField, updateAt, removeAt } from './schemaUtils';
import type { EdgeTypeConfig, FieldType } from './types';
import { EnumOptionsEditor } from './EnumOptionsEditor';
import styles from './SchemaEditor.module.scss';

interface Props {
  schema: Ontology['schema'];
}

export const EdgeTypesEditor: React.FC<Props> = ({ schema }) => {
  const updateSchema = useOntologyStore((s) => s.updateSchema);
  const { edgeTypes } = schema;

  const addEdgeType = () =>
    updateSchema((s) => ({
      ...s,
      edgeTypes: { ...s.edgeTypes, [`edge_${Date.now()}`]: { directed: true, fields: [] } },
    }));

  const updateEdgeType = (type: string, patch: Partial<EdgeTypeConfig>) =>
    updateSchema((s) => ({
      ...s,
      edgeTypes: { ...s.edgeTypes, [type]: { ...s.edgeTypes[type], ...patch } },
    }));

  const removeEdgeType = (type: string) =>
    updateSchema((s) => {
      const { [type]: _, ...rest } = s.edgeTypes;
      return { ...s, edgeTypes: rest };
    });

  const renameEdgeType = (oldType: string, newType: string) =>
    updateSchema((s) => {
      if (!newType || oldType === newType || s.edgeTypes[newType]) return s;
      const { [oldType]: cfg, ...rest } = s.edgeTypes;
      return { ...s, edgeTypes: { ...rest, [newType]: cfg } };
    });

  const addEdgeField = (type: string) =>
    updateEdgeType(type, { fields: [...(edgeTypes[type].fields ?? []), emptyField()] });

  const updateEdgeField = (type: string, index: number, field: SchemaField) =>
    updateEdgeType(type, { fields: updateAt(edgeTypes[type].fields ?? [], index, field) });

  const removeEdgeField = (type: string, index: number) =>
    updateEdgeType(type, { fields: removeAt(edgeTypes[type].fields ?? [], index) });

  return (
    <div className={styles.column}>
      <h3>Edge Types</h3>

      {Object.entries(edgeTypes).map(([type, cfg]) => (
        <div key={type} className={styles.edgeField}>
          <div className={styles.edgeGeneral}>
            <TextInput value={type} onChange={(e) => renameEdgeType(type, e.target.value)} />

            <label>
              <input
                type="checkbox"
                checked={cfg.directed}
                onChange={(e) => updateEdgeType(type, { directed: e.target.checked })}
              />
              directed
            </label>

            <Button onClick={() => removeEdgeType(type)}>🗑</Button>
          </div>

          <div className={styles.edgeProperties}>
            {(cfg.fields ?? []).map((f, i) => (
              <div key={i} className={styles.edgePropertiesField}>
                <div className={styles.edgeFieldRow}>
                  <TextInput
                    value={f.name}
                    onChange={(e) => updateEdgeField(type, i, { ...f, name: e.target.value })}
                  />

                  <Select
                    value={f.type}
                    onChange={(e) =>
                      updateEdgeField(type, i, {
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

                  <Button onClick={() => removeEdgeField(type, i)}>🗑</Button>
                </div>

                {f.type === 'enum' && (
                  <EnumOptionsEditor
                    options={f.options}
                    onChange={(options) => updateEdgeField(type, i, { ...f, options })}
                  />
                )}
              </div>
            ))}
          </div>

          <Button onClick={() => addEdgeField(type)}>+ Add field</Button>
        </div>
      ))}

      <Button onClick={addEdgeType}>+ Add edge type</Button>
    </div>
  );
};
