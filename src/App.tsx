import React, { useState } from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { GraphView } from './components/GraphView/Graph';
import { NodeForm } from './components/Sidebar/NodeForm';
import { EdgeForm } from './components/Sidebar/EdgeForm';
import { SchemaEditor } from './components/SchemaEditor/SchemaEditor';
import { Button } from './components/Button/Button';
import styles from './App.module.scss';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'graph' | 'schema'>('graph');

  return (
    <div className={styles.app}>
      <div className={styles['tab-buttons']}>
        <Button active={activeTab === 'graph'} onClick={() => setActiveTab('graph')}>
          Graph
        </Button>
        <Button active={activeTab === 'schema'} onClick={() => setActiveTab('schema')}>
          Schema Editor
        </Button>
      </div>
      <div className={styles.view}>
        <Toolbar />
        {activeTab === 'graph' && (
          <div className={styles.graphWrapper}>
            <GraphView />
            <div className={styles.form}>
              <NodeForm />
              <EdgeForm />
            </div>
          </div>
        )}
        {activeTab === 'schema' && <SchemaEditor />}
      </div>
    </div>
  );
};
