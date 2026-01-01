import React from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { GraphView } from './components/GraphView/Graph';
import { NodeForm } from './components/Sidebar/NodeForm';

export const App: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
      <Toolbar />
      <div style={{ display: 'flex', gap: '10px' }}>
        <GraphView />
        <NodeForm />
      </div>
    </div>
  );
};
