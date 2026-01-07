import React from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import { Button } from '../Button/Button';
import { NodeFieldsEditor } from './NodeFieldsEditor';
import { EdgeTypesEditor } from './EdgeTypesEditor';
import styles from './SchemaEditor.module.scss';

export const SchemaEditor: React.FC = () => {
  const schema = useOntologyStore((s) => s.ontology?.schema);
  const undo = useOntologyStore((s) => s.undo);
  const redo = useOntologyStore((s) => s.redo);

  if (!schema) return <div>Load ontology first</div>;

  return (
    <div className={styles.container}>
      <NodeFieldsEditor schema={schema} />
      <EdgeTypesEditor schema={schema} />

      <div className={styles.fixed}>
        <Button onClick={undo}>Undo</Button>
        <Button onClick={redo}>Redo</Button>
      </div>
    </div>
  );
};
