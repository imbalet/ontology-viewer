import React from 'react';
import { useReactFlow } from 'reactflow';

import styles from './ContextMenu.module.scss';
import { createEmptyNode } from '../../models/createNode';
import { useOntologyStore } from '../../state/useOntologyStore';
import { getDefaultNodeType } from '../../utils/defaultTypes';
import { generateId } from '../../utils/id';
import { Button } from '../Button/Button';


export const ContextMenu: React.FC = () => {
  const contextMenu = useOntologyStore((s) => s.contextMenu);
  const closeMenu = useOntologyStore((s) => s.closeContextMenu);
  const removeNode = useOntologyStore((s) => s.removeNode);
  const removeEdge = useOntologyStore((s) => s.removeEdge);
  const addNode = useOntologyStore((s) => s.addNode);
  const selectNode = useOntologyStore((s) => s.selectNode);

  const ontology = useOntologyStore((s) => s.ontology);
  const hasHydrated = useOntologyStore((s) => s._hasHydrated);
  const isOntologyValid = ontology && hasHydrated;

  const { project } = useReactFlow();

  if (!contextMenu) return null;
  if (!isOntologyValid) return null;

  const { type, targetId, position } = contextMenu;

  const handleDelete = () => {
    if (!targetId) return;

    const label = type === 'node' ? 'node (and all connected edges)' : 'edge';

    const ok = window.confirm(`Delete ${label}?`);
    if (!ok) return;

    if (type === 'node') removeNode(targetId);
    if (type === 'edge') removeEdge(targetId);

    closeMenu();
  };

  const handleCreateNode = () => {
    if (!position) return;

    const graphPos = project(position);
    const id = generateId('node');
    const typeId = getDefaultNodeType(ontology.schema);

    const node = createEmptyNode(id, typeId, ontology.schema.nodeTypes[typeId].fields, graphPos);

    addNode(node);
    selectNode(id);
    closeMenu();
  };

  return (
    <div
      className={styles.contextMenu}
      style={{
        top: position?.y,
        left: position?.x,
      }}
    >
      {type === 'pane' && <Button onClick={handleCreateNode}>+ Create Node</Button>}
      {(type === 'node' || type === 'edge') && (
        <Button variant="danger" onClick={handleDelete}>
          🗑 Delete {type}
        </Button>
      )}
    </div>
  );
};
