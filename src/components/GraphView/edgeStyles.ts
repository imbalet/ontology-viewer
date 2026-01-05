import { type Edge as RFEdge, MarkerType } from 'reactflow';

interface EdgeStyleOptions {
  selected?: boolean;
  highlighted?: boolean;
}

const baseStyles: Record<string, Partial<RFEdge>> = {
  includes: {
    style: { stroke: '#2b6cb0', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#2b6cb0' },
    label: 'includes',
  },
  requires: {
    style: { stroke: '#c53030', strokeWidth: 2, strokeDasharray: '5 5' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#c53030' },
    label: 'requires',
    animated: true,
  },
  related_to: {
    style: { stroke: '#4a5568' },
    label: 'related_to',
  },
  default: {
    style: { stroke: '#999' },
  },
};

export function getEdgeStyle(type: string, options: EdgeStyleOptions = {}): Partial<RFEdge> {
  const base = baseStyles[type] || { ...baseStyles.default, label: type };
  const { selected, highlighted } = options;

  return {
    ...base,
    style: {
      ...base.style,
      stroke: selected ? '#f00' : highlighted ? '#f90' : base.style?.stroke,
      strokeWidth: selected ? (Number(base.style?.strokeWidth) || 2) + 1 : base.style?.strokeWidth,
    },
    labelStyle: {
      fontWeight: selected || highlighted ? 'bold' : 'normal',
      fill: selected ? '#f00' : highlighted ? '#f90' : '#333',
      fontSize: selected ? 14 : 12,
    },
  };
}
