import React from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import type { SchemaField } from '../../models/ontology';

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

  // ===== helper =====
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

  // ===== Node fields =====
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

  // ===== Edge types =====
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

  // ===== UI =====
  return (
    <div style={{ display: 'flex', gap: 40, padding: 10 }}>
      {/* Node Fields */}
      <div style={{ flex: 1, border: '1px solid #ccc', padding: 10 }}>
        <h3>Node Fields</h3>
        {nodeFields.map((f, i) => (
          <div key={i}>
            <input
              value={f.name}
              placeholder="name"
              onChange={(e) => updateNodeField(i, { ...f, name: e.target.value })}
            />
            <select
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
            </select>
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
            <button onClick={() => removeNodeField(i)}>🗑</button>
          </div>
        ))}
        <button onClick={addNodeField}>+ Add field</button>
      </div>

      {/* Edge Types */}
      <div style={{ flex: 1, border: '1px solid #ccc', padding: 10 }}>
        <h3>Edge Types</h3>
        {Object.entries(edgeTypes).map(([type, cfg]) => (
          <div key={type}>
            <input value={type} onChange={(e) => renameEdgeType(type, e.target.value)} />
            <label>
              <input
                type="checkbox"
                checked={cfg.directed}
                onChange={(e) => toggleEdgeDirected(type, e.target.checked)}
              />
              directed
            </label>
            <button onClick={() => removeEdgeType(type)}>🗑</button>

            {(cfg.fields ?? []).map((f, i) => (
              <div key={i} style={{ marginLeft: 12 }}>
                <input
                  value={f.name}
                  onChange={(e) =>
                    updateEdgeField(type, i, {
                      ...f,
                      name: e.target.value,
                    })
                  }
                />
                <select
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
                </select>
                <button onClick={() => removeEdgeField(type, i)}>🗑</button>
              </div>
            ))}

            <button onClick={() => addEdgeField(type)}>+ Add field</button>
          </div>
        ))}
        <button onClick={addEdgeType}>+ Add edge type</button>
      </div>

      {/* Undo / Redo */}
      <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
      </div>
    </div>
  );
};
