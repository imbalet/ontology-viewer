import React from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import { NodeFieldsEditor } from './NodeFieldsEditor';
import { EdgeTypesEditor } from './EdgeTypesEditor';
import styles from './SchemaEditor.module.scss';

export const SchemaEditor: React.FC = () => {
  const schema = useOntologyStore((s) => s.ontology?.schema);

  if (!schema) return <div>Load ontology first</div>;

  return (
    <div className={styles.container}>
      <NodeFieldsEditor schema={schema} />
      <EdgeTypesEditor schema={schema} />
    </div>
  );
};
