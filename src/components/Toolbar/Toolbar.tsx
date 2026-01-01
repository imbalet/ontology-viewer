import React, { useCallback } from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import { importOntology, exportOntology } from '../../utils/jsonIO';
import { applyAutoLayout } from '../../utils/layout';

export const Toolbar: React.FC = () => {
    const loadOntology = useOntologyStore((s) => s.loadOntology);

    // Обновление узлов через getState, чтобы избежать бесконечного цикла
    const updateNodes = useCallback((nodes: any) => {
        const state = useOntologyStore.getState();
        const ontology = state.ontology;
        if (!ontology) return;
        loadOntology({ ...ontology, nodes });
    }, [loadOntology]);

    const handleAutoLayout = () => {
        const state = useOntologyStore.getState();
        const ontology = state.ontology;
        if (!ontology) return;

        const newNodes = applyAutoLayout(ontology.nodes, ontology.edges);
        updateNodes(newNodes);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            importOntology(e.target.files[0])
                .then(loadOntology)
                .catch((err) => alert(err.message));
        }
    };

    const handleExport = () => {
        const state = useOntologyStore.getState();
        const ontology = state.ontology;
        if (!ontology) return;
        exportOntology(ontology);
    };

    return (
        <div style={{ marginBottom: '10px' }}>
            <input type="file" accept=".json" onChange={handleImport} />
            <button onClick={handleExport}>Export</button>
            <button onClick={handleAutoLayout}>Auto-layout</button>
        </div>
    );
};
