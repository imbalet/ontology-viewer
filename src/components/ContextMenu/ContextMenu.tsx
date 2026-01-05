import React from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';
import { useReactFlow } from 'reactflow';
import { createEmptyNode } from '../../models/createNode';
import { generateId } from '../../utils/id';

export const ContextMenu: React.FC = () => {
  const contextMenu = useOntologyStore((s) => s.contextMenu);
  const closeMenu = useOntologyStore((s) => s.closeContextMenu);
  const removeNode = useOntologyStore((s) => s.removeNode);
  const removeEdge = useOntologyStore((s) => s.removeEdge);
  const addNode = useOntologyStore((s) => s.addNode);
  // const setSelectedNodeId = useOntologyStore((s) => s.setSelectedNodeId);
  const ontology = useOntologyStore((s) => s.ontology);

  const { project } = useReactFlow();

  if (!contextMenu) return null;
  if (!ontology) return null;

  const { type, targetId, position } = contextMenu;

  const handleDelete = () => {
    if (!targetId) return;

    if (type === 'node') removeNode(targetId);
    if (type === 'edge') removeEdge(targetId);

    closeMenu();
  };

  const handleCreateNode = () => {
    if (!position) return;

    const graphPos = project(position);
    const id = generateId('node');

    const node = createEmptyNode(id, ontology.schema.nodeFields, graphPos);

    addNode(node);
    // setSelectedNodeId(id);
    closeMenu();
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: position?.y,
        left: position?.x,
        background: '#fff',
        border: '1px solid #ccc',
        padding: '6px',
        zIndex: 1000,
      }}
    >
      {type === 'pane' && <button onClick={handleCreateNode}>+ Create Node</button>}
      {(type === 'node' || type === 'edge') && (
        <button onClick={handleDelete}>🗑 Delete {type}</button>
      )}
    </div>
  );
};
