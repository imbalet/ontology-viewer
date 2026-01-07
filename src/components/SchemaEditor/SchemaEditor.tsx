import React from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import type { SchemaField } from '../../models/ontology';
import { Select } from '../Select/Select';
import { TextInput } from '../TextInput/TextInput';
import styles from './SchemaEditor.module.scss';
import { Button } from '../Button/Button';

interface EdgeTypeConfig {
  directed: boolean;
  fields?: SchemaField[];
}

export const SchemaEditor: React.FC = () => {
  const ontology = useOntologyStore((s) => s.ontology);
  const setOntology = useOntologyStore((s) => s.loadOntology);
  const undo = useOntologyStore((s) => s.undo);
  const redo = useOntologyStore((s) => s.redo);

  if (!ontology) return <div>Load ontology first</div>;

  const { nodeFields, edgeTypes } = ontology.schema;

  const updateSchema = (
    newNodeFields: SchemaField[],
    newEdgeTypes: Record<string, EdgeTypeConfig>
  ) => {
    setOntology({
      ...ontology,
      schema: {
        nodeFields: newNodeFields,
        edgeTypes: newEdgeTypes,
      },
    });
  };

  const addNodeField = () =>
    updateSchema([...nodeFields, { name: '', type: 'string', required: false }], edgeTypes);

  const updateNodeField = (index: number, field: SchemaField) =>
    updateSchema(
      nodeFields.map((f, i) => (i === index ? field : f)),
      edgeTypes
    );

  const removeNodeField = (index: number) =>
    updateSchema(
      nodeFields.filter((_, i) => i !== index),
      edgeTypes
    );

  const addEdgeType = () => {
    const name = `new_edge_${Date.now()}`;
    updateSchema(nodeFields, {
      ...edgeTypes,
      [name]: { directed: true, fields: [] },
    });
  };

  const removeEdgeType = (type: string) => {
    const copy = { ...edgeTypes };
    delete copy[type];
    updateSchema(nodeFields, copy);
  };

  const renameEdgeType = (oldType: string, newType: string) => {
    if (!newType || oldType === newType || edgeTypes[newType]) return;
    const copy = { ...edgeTypes };
    copy[newType] = copy[oldType];
    delete copy[oldType];
    updateSchema(nodeFields, copy);
  };

  const toggleEdgeDirected = (type: string, directed: boolean) =>
    updateSchema(nodeFields, {
      ...edgeTypes,
      [type]: { ...edgeTypes[type], directed },
    });

  const addEdgeField = (type: string) =>
    updateSchema(nodeFields, {
      ...edgeTypes,
      [type]: {
        ...edgeTypes[type],
        fields: [...(edgeTypes[type].fields ?? []), { name: '', type: 'string', required: false }],
      },
    });

  const updateEdgeField = (type: string, index: number, field: SchemaField) =>
    updateSchema(nodeFields, {
      ...edgeTypes,
      [type]: {
        ...edgeTypes[type],
        fields: edgeTypes[type].fields!.map((f, i) => (i === index ? field : f)),
      },
    });

  const removeEdgeField = (type: string, index: number) =>
    updateSchema(nodeFields, {
      ...edgeTypes,
      [type]: {
        ...edgeTypes[type],
        fields: edgeTypes[type].fields!.filter((_, i) => i !== index),
      },
    });

  return (
    <div className={styles.container}>
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
              onChange={(e) =>
                updateNodeField(i, {
                  ...f,
                  type: e.target.value as any,
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
                  updateNodeField(i, {
                    ...f,
                    required: e.target.checked,
                  })
                }
              />
              required
            </label>
            <Button onClick={() => removeNodeField(i)}>🗑</Button>
          </div>
        ))}
        <Button onClick={addNodeField}>+ Add field</Button>
      </div>

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
                  onChange={(e) => toggleEdgeDirected(type, e.target.checked)}
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
                    onChange={(e) =>
                      updateEdgeField(type, i, {
                        ...f,
                        name: e.target.value,
                      })
                    }
                  />
                  <Select
                    value={f.type}
                    onChange={(e) =>
                      updateEdgeField(type, i, {
                        ...f,
                        type: e.target.value as any,
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
              ))}
            </div>

            <Button onClick={() => addEdgeField(type)}>+ Add field</Button>
          </div>
        ))}
        <Button onClick={addEdgeType}>+ Add edge type</Button>
      </div>

      <div className={styles.fixed}>
        <Button onClick={undo}>Undo</Button>
        <Button onClick={redo}>Redo</Button>
      </div>
    </div>
  );
};
