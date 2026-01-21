import React from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import { NodeTypesEditor } from './NodeTypesEditor';
import { EdgeTypesEditor } from './EdgeTypesEditor';
import styles from './SchemaEditor.module.scss';

export const SchemaEditor: React.FC = () => {
  const schema = useOntologyStore((s) => s.ontology?.schema);

  if (!schema) return <div>Load ontology first</div>;

  return (
    <div className={styles.container}>
      <NodeTypesEditor schema={schema} />
      <EdgeTypesEditor schema={schema} />
    </div>
  );
};
