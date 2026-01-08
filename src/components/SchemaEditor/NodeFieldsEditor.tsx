import React from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import type { SchemaField, Ontology } from '../../models/ontology';
import { Button } from '../Button/Button';
import { emptyField, updateAt, removeAt } from './schemaUtils';
import { SchemaFieldEditor } from './SchemaFieldEditor';
import styles from './SchemaEditor.module.scss';

interface Props {
  schema: Ontology['schema'];
}

export const NodeFieldsEditor: React.FC<Props> = ({ schema }) => {
  const updateSchema = useOntologyStore((s) => s.updateSchema);
  const { nodeFields } = schema;

  const addNodeField = () =>
    updateSchema((s) => ({ ...s, nodeFields: [...s.nodeFields, emptyField()] }));

  const updateNodeField = (index: number, field: SchemaField) =>
    updateSchema((s) => ({ ...s, nodeFields: updateAt(s.nodeFields, index, field) }));

  const removeNodeField = (index: number) =>
    updateSchema((s) => ({ ...s, nodeFields: removeAt(s.nodeFields, index) }));

  const renameNodeField = (oldName: string, newName: string) => {
    const { updateSchema, ontology, updateNodesWithHistory } = useOntologyStore.getState();
    if (!ontology || oldName === newName || !newName) return;

    updateSchema((schema) => ({
      ...schema,
      nodeFields: schema.nodeFields.map((f) => (f.name === oldName ? { ...f, name: newName } : f)),
    }));

    const newNodes = ontology.nodes.map((node) => {
      if (!(oldName in node.properties)) return node;
      const value = node.properties[oldName];
      const newProps = { ...node.properties, [newName]: value };
      delete newProps[oldName];
      return { ...node, properties: newProps };
    });

    // TODO: change saving in history
    updateNodesWithHistory(newNodes);
  };

  return (
    <div className={styles.column}>
      <h3>Node Fields</h3>

      {nodeFields.map((f, i) => (
        <SchemaFieldEditor
          key={f.id}
          field={f}
          onChange={(field) => updateNodeField(i, field)}
          onRename={(oldName, newName) => renameNodeField(oldName, newName)}
          onRemove={() => removeNodeField(i)}
        />
      ))}

      <Button onClick={addNodeField}>+ Add field</Button>
    </div>
  );
};
