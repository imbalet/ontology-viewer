import clsx from 'clsx';

import styles from './nodes.module.scss';

interface NodeStyleOptions {
  selected?: boolean;
  highlighted?: boolean;
  collapsed?: boolean;
}

export function getNodeClassName({ selected, highlighted, collapsed }: NodeStyleOptions = {}) {
  return clsx(
    styles.node,
    selected && styles['node--selected'],
    highlighted && styles['node--highlighted'],
    collapsed && styles['node--collapsed']
  );
}
