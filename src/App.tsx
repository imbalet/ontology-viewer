import React, { useState } from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { GraphView } from './components/GraphView/Graph';
import { NodeForm } from './components/Sidebar/NodeForm';
import { EdgeForm } from './components/Sidebar/EdgeForm';
import { SchemaEditor } from './components/SchemaEditor/SchemaEditor';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'graph' | 'schema'>('graph');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '10px', height: '100vh' }}>
      <Toolbar />

      {/* Вкладки: Graph или Schema Editor */}
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setActiveTab('graph')}>Graph</button>
        <button onClick={() => setActiveTab('schema')}>Schema Editor</button>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '10px', overflow: 'auto' }}>
        {activeTab === 'graph' && (
          <>
            <GraphView />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <NodeForm />
              <EdgeForm />
            </div>
          </>
        )}

        {activeTab === 'schema' && <SchemaEditor />}
      </div>
    </div>
  );
};
