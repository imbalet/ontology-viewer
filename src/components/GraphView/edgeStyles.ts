import { type Edge as RFEdge, MarkerType } from 'reactflow';

export function getEdgeStyle(type: string): Partial<RFEdge> {
  switch (type) {
    case 'includes':
      return {
        style: { stroke: '#2b6cb0', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#2b6cb0',
        },
        label: 'includes',
      };

    case 'requires':
      return {
        style: { stroke: '#c53030', strokeWidth: 2, strokeDasharray: '5 5' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#c53030',
        },
        label: 'requires',
        animated: true,
      };

    case 'related_to':
      return {
        style: { stroke: '#4a5568' },
        label: 'related_to',
      };

    default:
      return {
        style: { stroke: '#999' },
        label: type,
      };
  }
}
