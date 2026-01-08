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
    if (!confirmLoseOntology()) return;

    loadOntology({
      nodes: [],
      edges: [],
      schema: { nodeFields: [], edgeTypes: {} },
    });
  }, [loadOntology]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0]) return;

      if (!confirmLoseOntology()) {
        e.target.value = '';
        return;
      }

      importOntology(e.target.files[0])
        .then(loadOntology)
        .catch((err) => alert(err.message))
        .finally(() => {
          e.target.value = '';
        });
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

  const confirmLoseOntology = () => {
    const state = useOntologyStore.getState();
    const ontology = state.ontology;

    if (!ontology || ontology.nodes.length === 0) {
      return true;
    }

    const wantContinue = window.confirm(
      'Текущая онтология будет потеряна. Нажмите OK чтобы продолжить.\n\n' +
        'Рекомендуется сначала экспортировать.'
    );

    if (!wantContinue) return false;

    const wantExport = window.confirm(
      'Хотите экспортировать текущую онтологию перед продолжением?'
    );

    if (wantExport) {
      exportOntology(ontology);
    }

    return true;
  };

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
