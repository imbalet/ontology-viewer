import React, { useCallback, useRef } from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import { importOntology, exportOntology } from '../../utils/jsonIO';
import { applyAutoLayout } from '../../utils/layout';
import { Button } from '../Button/Button';
import styles from './Toolbar.module.scss';

export const Toolbar: React.FC = () => {
  const loadOntology = useOntologyStore((s) => s.loadOntology);
  const updateNodesWithHistory = useOntologyStore((s) => s.updateNodesWithHistory);
  const undo = useOntologyStore((s) => s.undo);
  const redo = useOntologyStore((s) => s.redo);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNew = useCallback(() => {
    loadOntology({ nodes: [], edges: [], schema: { nodeFields: [], edgeTypes: {} } });
  }, [loadOntology]);

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

  const handleAutoLayout = useCallback(() => {
    const state = useOntologyStore.getState();
    const ontology = state.ontology;
    if (!ontology) return;

    const newNodes = applyAutoLayout(ontology.nodes, ontology.edges);
    updateNodesWithHistory(newNodes);
  }, [updateNodesWithHistory]);

  return (
    <div className={styles.toolbar}>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImport}
      />
      <Button onClick={handleNew}>Создать новую</Button>
      <Button onClick={() => fileInputRef.current?.click()}>Загрузить</Button>
      <Button onClick={handleExport}>Export</Button>
      <Button onClick={handleAutoLayout}>Auto-layout</Button>
      <Button onClick={undo}>Undo</Button>
      <Button onClick={redo}>Redo</Button>
    </div>
  );
};
