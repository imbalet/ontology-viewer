import React from 'react';

import { EdgeTypesEditor } from './EdgeTypesEditor';
import { NodeTypesEditor } from './NodeTypesEditor';
import styles from './SchemaEditor.module.scss';
import { useOntologyStore } from '../../state/useOntologyStore';

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
