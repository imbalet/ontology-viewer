import { type CSSProperties } from 'react';

interface NodeStyleOptions {
  selected?: boolean;
  highlighted?: boolean;
}

export function getNodeStyle(options: NodeStyleOptions = {}): CSSProperties {
  const { selected, highlighted } = options;

  if (selected) {
    return { border: '2px solid #f00', padding: 4, backgroundColor: '#ffe' };
  }

  if (highlighted) {
    return { border: '2px solid #f90', padding: 4, backgroundColor: '#fff8e1' };
  }

  return {};
}
