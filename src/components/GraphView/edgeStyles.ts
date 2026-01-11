import clsx from 'clsx';
import { MarkerType, type Edge as RFEdge } from 'reactflow';

import styles from './edges.module.scss';

interface EdgeStyleOptions {
  selected?: boolean;
  highlighted?: boolean;
}

export function getEdgeClassName(type: string, { selected, highlighted }: EdgeStyleOptions = {}) {
  return clsx(
    styles.edge,
    styles[`edge--${type}`] ?? styles['edge--default'],
    selected && styles['edge--selected'],
    highlighted && styles['edge--highlighted']
  );
}

export const edgeBehavior: Record<string, Partial<RFEdge>> = {
  includes: {
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#2b6cb0',
    },
    label: 'includes',
  },
  requires: {
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#c53030',
    },
    label: 'requires',
    animated: true,
  },
  related_to: {
    label: 'related_to',
  },
};
