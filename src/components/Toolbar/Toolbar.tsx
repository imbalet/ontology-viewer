import React, { useCallback, useRef } from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import { importOntology, exportOntology } from '../../utils/jsonIO';
import { applyAutoLayout } from '../../utils/layout';
import { Button } from '../Button/Button';
import styles from './Toolbar.module.scss';

export const Toolbar: React.FC = () => {
  const loadOntology = useOntologyStore((s) => s.loadOntology);
  const mergeOntology = useOntologyStore((s) => s.mergeOntology);
  const updateNodesWithHistory = useOntologyStore((s) => s.updateNodesWithHistory);
  const undo = useOntologyStore((s) => s.undo);
  const redo = useOntologyStore((s) => s.redo);

  const replaceInputRef = useRef<HTMLInputElement>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  const handleNew = useCallback(() => {
    if (!confirmLoseOntology()) return;

    loadOntology({
      nodes: [],
      edges: [],
      schema: { nodeFields: [], edgeTypes: {} },
    });
  }, [loadOntology]);

  const handleReplaceImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!confirmLoseOntology()) {
        e.target.value = '';
        return;
      }

      importOntology(file)
        .then(loadOntology)
        .catch((err) => alert(err.message))
        .finally(() => {
          e.target.value = '';
        });
    },
    [loadOntology]
  );

  const handleMergeImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      importOntology(file)
        .then((incoming) => {
          const wantMerge = window.confirm(
            'Вы уверены, что хотите объединить текущую онтологию с импортируемой?'
          );
          if (wantMerge) {
            mergeOntology(incoming);
          }
        })
        .catch((err) => alert(err.message))
        .finally(() => {
          e.target.value = '';
        });
    },
    [mergeOntology]
  );

  const handleExport = useCallback(() => {
    const { ontology } = useOntologyStore.getState();
    if (!ontology) return;
    exportOntology(ontology);
  }, []);

  const handleAutoLayout = useCallback(() => {
    const { ontology } = useOntologyStore.getState();
    if (!ontology) return;

    const newNodes = applyAutoLayout(ontology.nodes, ontology.edges);
    updateNodesWithHistory(newNodes);
  }, [updateNodesWithHistory]);

  const confirmLoseOntology = () => {
    const { ontology } = useOntologyStore.getState();

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
      {/* replace import */}
      <input
        type="file"
        accept=".json"
        ref={replaceInputRef}
        style={{ display: 'none' }}
        onChange={handleReplaceImport}
      />

      {/* merge import */}
      <input
        type="file"
        accept=".json"
        ref={mergeInputRef}
        style={{ display: 'none' }}
        onChange={handleMergeImport}
      />

      <Button onClick={handleNew}>Создать новую</Button>

      <Button onClick={() => replaceInputRef.current?.click()}>Загрузить (заменить)</Button>

      <Button onClick={() => mergeInputRef.current?.click()}>Импортировать в текущую</Button>

      <Button onClick={handleExport}>Export</Button>
      <Button onClick={handleAutoLayout}>Auto-layout</Button>
      <Button onClick={undo}>Undo</Button>
      <Button onClick={redo}>Redo</Button>
    </div>
  );
};
