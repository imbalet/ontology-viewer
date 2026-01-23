import React, { useEffect, useState } from 'react';

import styles from './SchemaEditor.module.scss';
import { SchemaFieldEditor } from './SchemaFieldEditor';
import { emptyField } from './schemaUtils';
import { useOntologyStore } from '../../state/useOntologyStore';
import { Button } from '../Button/Button';
import { TextInput } from '../TextInput/TextInput';

import type { Ontology, SchemaField } from '../../models/ontology';

interface Props {
  schema: Ontology['schema'];
}

export const EdgeTypesEditor: React.FC<Props> = ({ schema }) => {
  const updateSchema = useOntologyStore((s) => s.updateSchema);
  const { edgeTypes: edgeTypes } = schema;

  const hiddenEdgeTypes = useOntologyStore((s) => s.hiddenEdgeTypes);
  const hideEdgeType = useOntologyStore((s) => s.hideEdgeType);
  const showEdgeType = useOntologyStore((s) => s.showEdgeType);

  const [editingTypes, setEditingTypes] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(edgeTypes).map(([id, cfg]) => [id, cfg.name]))
  );

  useEffect(() => {
    setEditingTypes(
      Object.fromEntries(Object.entries(edgeTypes).map(([id, cfg]) => [id, cfg.name]))
    );
  }, [edgeTypes]);

  const addEdgeType = () => {
    updateSchema((s) => {
      const id = `edge_${Date.now()}`;
      return {
        ...s,
        edgeTypes: {
          ...s.edgeTypes,
          [id]: { name: 'New Edge', directed: true, fields: {} },
        },
      };
    });
  };

  const updateEdgeType = (
    id: string,
    patch: Partial<{ name: string; directed: boolean; fields: Record<string, SchemaField> }>
  ) => {
    updateSchema((s) => ({
      ...s,
      edgeTypes: {
        ...s.edgeTypes,
        [id]: { ...s.edgeTypes[id], ...patch },
      },
    }));
  };

  const removeEdgeType = (id: string) =>
    updateSchema((s) => {
      const { [id]: _, ...rest } = s.edgeTypes;
      return { ...s, edgeTypes: rest };
    });

  const renameEdgeType = (id: string, newName: string) => {
    if (!newName || edgeTypes[id].name === newName) return;
    updateEdgeType(id, { name: newName });
  };

  const addEdgeField = (edgeTypeId: string) => {
    const id = `field_${Date.now()}`;
    updateEdgeType(edgeTypeId, {
      fields: { ...edgeTypes[edgeTypeId].fields, [id]: emptyField(id) },
    });
  };

  const updateEdgeField = (edgeTypeId: string, fieldId: string, field: SchemaField) => {
    updateEdgeType(edgeTypeId, {
      fields: { ...edgeTypes[edgeTypeId].fields, [fieldId]: field },
    });
  };

  const removeEdgeField = (edgeTypeId: string, fieldId: string) => {
    const { [fieldId]: _, ...rest } = edgeTypes[edgeTypeId].fields;
    updateEdgeType(edgeTypeId, { fields: rest });
  };

  const renameEdgeField = (edgeTypeId: string, fieldId: string, newName: string) => {
    const field = edgeTypes[edgeTypeId].fields[fieldId];
    if (!field || field.name === newName) return;
    updateEdgeField(edgeTypeId, fieldId, { ...field, name: newName });
  };

  return (
    <div className={styles.column}>
      <h3>Edge Types</h3>
      {Object.entries(edgeTypes)
        .sort(([aId], [bId]) => aId.localeCompare(bId))
        .map(([id, cfg]) => {
          const editingName = editingTypes[id] ?? cfg.name;
          return (
            <div key={id} className={styles.field}>
              <div className={styles.general}>
                <TextInput
                  value={editingName}
                  onChange={(e) => setEditingTypes((prev) => ({ ...prev, [id]: e.target.value }))}
                  onBlur={() => renameEdgeType(id, editingTypes[id])}
                />

                <label>
                  <input
                    type="checkbox"
                    checked={cfg.directed}
                    onChange={(e) => updateEdgeType(id, { directed: e.target.checked })}
                  />
                  directed
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={hiddenEdgeTypes.has(id)}
                    onChange={(e) => (e.target.checked ? hideEdgeType(id) : showEdgeType(id))}
                  />
                  hide
                </label>

                <Button onClick={() => removeEdgeType(id)}>🗑</Button>
              </div>

              <div className={styles.properties}>
                {Object.entries(cfg.fields).map(([fieldId, field]) => (
                  <SchemaFieldEditor
                    key={fieldId}
                    field={field}
                    onChange={(f) => updateEdgeField(id, fieldId, f)}
                    onRename={(_, newName) => renameEdgeField(id, fieldId, newName)}
                    onRemove={() => removeEdgeField(id, fieldId)}
                  />
                ))}
              </div>

              <Button onClick={() => addEdgeField(id)}>+ Add field</Button>
            </div>
          );
        })}

      <Button onClick={addEdgeType}>+ Add edge type</Button>
    </div>
  );
};
