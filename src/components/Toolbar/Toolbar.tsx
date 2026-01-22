import React, { useCallback, useRef } from 'react';

import styles from './Toolbar.module.scss';
import { useOntologyStore } from '../../state/useOntologyStore';
import { exportOntology, importOntology } from '../../utils/jsonIO';
import { applyAutoLayout } from '../../utils/layout';
import { Button } from '../Button/Button';


export const Toolbar: React.FC = () => {
  const loadOntology = useOntologyStore((s) => s.loadOntology);
  const mergeOntology = useOntologyStore((s) => s.mergeOntology);
  const updateNodesWithHistory = useOntologyStore((s) => s.updateNodesWithHistory);
  const undo = useOntologyStore((s) => s.undo);
  const redo = useOntologyStore((s) => s.redo);

  const replaceInputRef = useRef<HTMLInputElement>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  const confirmLoseOntology = () => {
    const { ontology } = useOntologyStore.getState();

    if (!ontology || ontology.nodes.length === 0) {
      return true;
    }

    const wantContinue = window.confirm(
      'The current ontology will be lost. Click OK to continue.\n\n' +
        'It is recommended to export it first.'
    );

    if (!wantContinue) return false;

    const wantExport = window.confirm(
      'Do you want to export the current ontology before continuing?'
    );

    if (wantExport) {
      exportOntology(ontology);
    }

    return true;
  };

  const handleNew = useCallback(() => {
    if (!confirmLoseOntology()) return;

    loadOntology({
      nodes: [],
      edges: [],
      schema: { nodeTypes: {}, edgeTypes: {} },
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
            'Are you sure you want to merge the current ontology with the imported one?'
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

  return (
    <div className={styles.toolbar}>
      <input
        type="file"
        accept=".json"
        ref={replaceInputRef}
        style={{ display: 'none' }}
        onChange={handleReplaceImport}
      />

      <input
        type="file"
        accept=".json"
        ref={mergeInputRef}
        style={{ display: 'none' }}
        onChange={handleMergeImport}
      />

      <Button onClick={handleNew}>Create New</Button>

      <Button onClick={() => replaceInputRef.current?.click()}>Load (Replace)</Button>

      <Button onClick={() => mergeInputRef.current?.click()}>Import into Current</Button>

      <Button onClick={handleExport}>Export</Button>
      <Button onClick={handleAutoLayout}>Auto-layout</Button>
      <Button onClick={undo}>Undo</Button>
      <Button onClick={redo}>Redo</Button>
    </div>
  );
};
