import React from 'react';
import { useOntologyStore } from '../../state/useOntologyStore';

export const ContextMenu: React.FC = () => {
    const contextMenu = useOntologyStore((s) => s.contextMenu);
    const closeMenu = useOntologyStore((s) => s.closeContextMenu);
    const removeNode = useOntologyStore((s) => s.removeNode);
    const removeEdge = useOntologyStore((s) => s.removeEdge);

    if (!contextMenu) return null;

    const { type, targetId, position } = contextMenu;

    const handleDelete = () => {
        if (!targetId) return;

        if (type === 'node') removeNode(targetId);
        if (type === 'edge') removeEdge(targetId);

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
            onMouseLeave={closeMenu}
        >
            <button onClick={handleDelete}>🗑 Delete {type}</button>
        </div>
    );
};
