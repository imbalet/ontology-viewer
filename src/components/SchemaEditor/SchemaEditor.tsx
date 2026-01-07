import React from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import type { SchemaField } from '../../models/ontology';
import { Select } from '../Select/Select';
import { TextInput } from '../TextInput/TextInput';
import { Button } from '../Button/Button';
import styles from './SchemaEditor.module.scss';

interface EdgeTypeConfig {
  directed: boolean;
  fields?: SchemaField[];
}

type FieldType = SchemaField['type'];

const emptyField = (): SchemaField => ({
  name: '',
  type: 'string',
  required: false,
});

const updateAt = <T,>(arr: T[], index: number, value: T) =>
  arr.map((item, i) => (i === index ? value : item));

const removeAt = <T,>(arr: T[], index: number) => arr.filter((_, i) => i !== index);

export const SchemaEditor: React.FC = () => {
  const schema = useOntologyStore((s) => s.ontology?.schema);
  const updateSchema = useOntologyStore((s) => s.updateSchema);
  const undo = useOntologyStore((s) => s.undo);
  const redo = useOntologyStore((s) => s.redo);

  if (!schema) return <div>Load ontology first</div>;

  const { nodeFields, edgeTypes } = schema;

  /* =======================
     Node fields
  ======================= */
  const addNodeField = () =>
    updateSchema((s) => ({
      ...s,
      nodeFields: [...s.nodeFields, emptyField()],
    }));

  const updateNodeField = (index: number, field: SchemaField) =>
    updateSchema((s) => ({
      ...s,
      nodeFields: updateAt(s.nodeFields, index, field),
    }));

  const removeNodeField = (index: number) =>
    updateSchema((s) => ({
      ...s,
      nodeFields: removeAt(s.nodeFields, index),
    }));

  /* =======================
     Edge types
  ======================= */
  const addEdgeType = () => {
    const name = `edge_${Date.now()}`;
    updateSchema((s) => ({
      ...s,
      edgeTypes: {
        ...s.edgeTypes,
        [name]: { directed: true, fields: [] },
      },
    }));
  };

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

  const updateEdgeType = (type: string, patch: Partial<EdgeTypeConfig>) =>
    updateSchema((s) => ({
      ...s,
      edgeTypes: {
        ...s.edgeTypes,
        [type]: { ...s.edgeTypes[type], ...patch },
      },
    }));

  /* =======================
     Edge fields
  ======================= */
  const addEdgeField = (type: string) =>
    updateEdgeType(type, {
      fields: [...(edgeTypes[type].fields ?? []), emptyField()],
    });

  const updateEdgeField = (type: string, index: number, field: SchemaField) =>
    updateEdgeType(type, {
      fields: updateAt(edgeTypes[type].fields ?? [], index, field),
    });

  const removeEdgeField = (type: string, index: number) =>
    updateEdgeType(type, {
      fields: removeAt(edgeTypes[type].fields ?? [], index),
    });

  /* =======================
     Render
  ======================= */
  return (
    <div className={styles.container}>
      {/* Node fields */}
      <div className={styles.column}>
        <h3>Node Fields</h3>
        {nodeFields.map((f, i) => (
          <div key={i} className={styles.nodeField}>
            <TextInput
              value={f.name}
              placeholder="name"
              onChange={(e) => updateNodeField(i, { ...f, name: e.target.value })}
            />
            <Select
              value={f.type}
              onChange={(e) => updateNodeField(i, { ...f, type: e.target.value as FieldType })}
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
        ))}
        <Button onClick={addNodeField}>+ Add field</Button>
      </div>

      {/* Edge types */}
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
                  <TextInput
                    value={f.name}
                    onChange={(e) => updateEdgeField(type, i, { ...f, name: e.target.value })}
                  />
                  <Select
                    value={f.type}
                    onChange={(e) =>
                      updateEdgeField(type, i, { ...f, type: e.target.value as FieldType })
                    }
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="enum">enum</option>
                  </Select>
                  <Button onClick={() => removeEdgeField(type, i)}>🗑</Button>
                </div>
              ))}
            </div>

            <Button onClick={() => addEdgeField(type)}>+ Add field</Button>
          </div>
        ))}
        <Button onClick={addEdgeType}>+ Add edge type</Button>
      </div>

      {/* Undo / Redo */}
      <div className={styles.fixed}>
        <Button onClick={undo}>Undo</Button>
        <Button onClick={redo}>Redo</Button>
      </div>
    </div>
  );
};
