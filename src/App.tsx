import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';

import styles from './App.module.scss';
import { Button } from './components/Button/Button';
import { GraphView } from './components/GraphView/Graph';
import { SchemaEditor } from './components/SchemaEditor/SchemaEditor';
import { EdgeForm } from './components/Sidebar/EdgeForm';
import { NodeForm } from './components/Sidebar/NodeForm';
import { Toolbar } from './components/Toolbar/Toolbar';
import { useOntologyStore } from './state/useOntologyStore';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'graph' | 'schema'>('graph');
  const undo = useOntologyStore((s) => s.undo);
  const redo = useOntologyStore((s) => s.redo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Y / Cmd+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyY' || (e.code === 'KeyZ' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

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
            <ReactFlowProvider>
              <GraphView />
            </ReactFlowProvider>
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
