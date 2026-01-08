import React, { useState } from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import type { SchemaField, Ontology } from '../../models/ontology';
import { TextInput } from '../TextInput/TextInput';
import { Button } from '../Button/Button';
import { emptyField, updateAt, removeAt } from './schemaUtils';
import type { EdgeTypeConfig } from './types';
import { SchemaFieldEditor } from './SchemaFieldEditor';
import styles from './SchemaEditor.module.scss';

interface Props {
  schema: Ontology['schema'];
}

export const EdgeTypesEditor: React.FC<Props> = ({ schema }) => {
  const updateSchema = useOntologyStore((s) => s.updateSchema);
  const { edgeTypes } = schema;

  const [editingTypes, setEditingTypes] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(edgeTypes).map(([type, cfg]) => [cfg.id, type]))
  );

  const addEdgeType = () =>
    updateSchema((s) => {
      const id = `edge_${Date.now()}`;
      return {
        ...s,
        edgeTypes: {
          ...s.edgeTypes,
          [id]: { id, directed: true, fields: [] },
        },
      };
    });

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

  return (
    <div className={styles.column}>
      <h3>Edge Types</h3>

      {Object.entries(edgeTypes)
        .sort(([aId], [bId]) => aId.localeCompare(bId))
        .map(([type, cfg]) => {
          const editingType = editingTypes[cfg.id] ?? type;

          return (
            <div key={cfg.id} className={styles.edgeField}>
              <div className={styles.edgeGeneral}>
                <TextInput
                  value={editingType}
                  onChange={(e) =>
                    setEditingTypes((prev) => ({ ...prev, [cfg.id]: e.target.value }))
                  }
                  onBlur={() => {
                    renameEdgeType(type, editingTypes[cfg.id]);
                  }}
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

              <div className={styles.edgeProperties}>
                {(cfg.fields ?? []).map((f, i) => (
                  <SchemaFieldEditor
                    key={i}
                    field={f}
                    onChange={(field) => updateEdgeField(type, i, field)}
                    onRename={(oldName, newName) => renameEdgeField(type, oldName, newName)}
                    onRemove={() => removeEdgeField(type, i)}
                  />
                ))}
              </div>

              <Button onClick={() => addEdgeField(type)}>+ Add field</Button>
            </div>
          );
        })}

      <Button onClick={addEdgeType}>+ Add edge type</Button>
    </div>
  );
};
