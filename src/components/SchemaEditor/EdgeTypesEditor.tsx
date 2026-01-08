import React, { useState } from 'react';
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

  /* ---------- edge types ---------- */

  const addEdgeType = () =>
    updateSchema((s) => ({
      ...s,
      edgeTypes: {
        ...s.edgeTypes,
        [`edge_${Date.now()}`]: { directed: true, fields: [] },
      },
    }));

  const updateEdgeType = (type: string, patch: Partial<EdgeTypeConfig>) =>
    updateSchema((s) => ({
      ...s,
      edgeTypes: {
        ...s.edgeTypes,
        [type]: { ...s.edgeTypes[type], ...patch },
      },
    }));

  const removeEdgeType = (type: string) =>
    updateSchema((s) => {
      const { [type]: _, ...rest } = s.edgeTypes;
      return { ...s, edgeTypes: rest };
    });

  const renameEdgeType = (oldType: string, newType: string) => {
    const { updateSchema, ontology, updateEdgesWithHistory } = useOntologyStore.getState();

    if (!ontology || !newType || oldType === newType) return;

    updateSchema((schema) => {
      if (schema.edgeTypes[newType]) return schema;

      const { [oldType]: cfg, ...rest } = schema.edgeTypes;

      return {
        ...schema,
        edgeTypes: {
          ...rest,
          [newType]: cfg,
        },
      };
    });

    const newEdges = ontology.edges.map((edge) => {
      if (edge.type !== oldType) return edge;
      return { ...edge, type: newType };
    });

    // TODO: change saving in history
    updateEdgesWithHistory(newEdges);
  };

  /* ---------- fields ---------- */

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

  const renameEdgeField = (edgeType: string, oldName: string, newName: string) => {
    const { updateSchema, ontology, updateEdgesWithHistory } = useOntologyStore.getState();

    if (!ontology || oldName === newName || !newName) return;

    updateSchema((schema) => ({
      ...schema,
      edgeTypes: {
        ...schema.edgeTypes,
        [edgeType]: {
          ...schema.edgeTypes[edgeType],
          fields: (schema.edgeTypes[edgeType].fields ?? []).map((f) =>
            f.name === oldName ? { ...f, name: newName } : f
          ),
        },
      },
    }));

    const newEdges = ontology.edges.map((edge) => {
      if (edge.type !== edgeType) return edge;
      if (!(oldName in (edge.properties ?? {}))) return edge;

      const value = edge.properties![oldName];
      const newProps = { ...edge.properties, [newName]: value };
      delete newProps[oldName];

      return { ...edge, properties: newProps };
    });

    updateEdgesWithHistory(newEdges);
  };

  /* ---------- render ---------- */

  return (
    <div className={styles.column}>
      <h3>Edge Types</h3>

      {Object.entries(edgeTypes).map(([type, cfg]) => {
        const [editingType, setEditingType] = useState(type);

        return (
          <div key={type} className={styles.edgeField}>
            {/* ---------- edge general ---------- */}
            <div className={styles.edgeGeneral}>
              <TextInput
                value={type}
                onChange={(e) => setEditingType(e.target.value)}
                onBlur={() => renameEdgeType(type, editingType)}
              />

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

            {/* ---------- edge fields ---------- */}
            <div className={styles.edgeProperties}>
              {(cfg.fields ?? []).map((f, i) => {
                const [editingValue, setEditingValue] = useState(f.name);

                return (
                  <div key={f.name} className={styles.edgePropertiesField}>
                    <div className={styles.edgeFieldRow}>
                      <TextInput
                        value={f.name}
                        placeholder="name"
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => renameEdgeField(type, f.name, editingValue)}
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

                      <label>
                        <input
                          type="checkbox"
                          checked={f.required ?? false}
                          onChange={(e) =>
                            updateEdgeField(type, i, {
                              ...f,
                              required: e.target.checked,
                            })
                          }
                        />
                        required
                      </label>

                      <Button onClick={() => removeEdgeField(type, i)}>🗑</Button>
                    </div>

                    {f.type === 'enum' && (
                      <EnumOptionsEditor
                        options={f.options}
                        onChange={(options) => updateEdgeField(type, i, { ...f, options })}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <Button onClick={() => addEdgeField(type)}>+ Add field</Button>
          </div>
        );
      })}

      <Button onClick={addEdgeType}>+ Add edge type</Button>
    </div>
  );
};
