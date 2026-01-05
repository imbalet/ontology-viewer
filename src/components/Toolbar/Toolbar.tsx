import React, { useCallback } from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import { importOntology, exportOntology } from '../../utils/jsonIO';
import { applyAutoLayout } from '../../utils/layout';

export const Toolbar: React.FC = () => {
  const loadOntology = useOntologyStore((s) => s.loadOntology);
  const updateNodesWithHistory = useOntologyStore((s) => s.updateNodesWithHistory);
  const undo = useOntologyStore((s) => s.undo);
  const redo = useOntologyStore((s) => s.redo);

  const handleAutoLayout = useCallback(() => {
    const state = useOntologyStore.getState();
    const ontology = state.ontology;
    if (!ontology) return;

    const newNodes = applyAutoLayout(ontology.nodes, ontology.edges);
    updateNodesWithHistory(newNodes);
  }, [updateNodesWithHistory]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        importOntology(e.target.files[0])
          .then(loadOntology)
          .catch((err) => alert(err.message));
      }
    },
    [loadOntology]
  );

  const handleExport = useCallback(() => {
    const state = useOntologyStore.getState();
    const ontology = state.ontology;
    if (!ontology) return;
    exportOntology(ontology);
  }, []);

  return (
    <div style={{ marginBottom: '10px', display: 'flex', gap: '6px' }}>
      <input type="file" accept=".json" onChange={handleImport} />
      <button onClick={handleExport}>Export</button>
      <button onClick={handleAutoLayout}>Auto-layout</button>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
    </div>
  );
};
