import clsx from 'clsx';
import React from 'react';

import styles from './Select.module.scss';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  variant?: 'default' | 'required';
  active?: boolean;
  error?: boolean;
};

export const Select: React.FC<SelectProps> = ({
  variant = 'default',
  active,
  error,
  className,
  children,
  ...props
}) => {
  return (
    <select
      className={clsx(
        styles.select,
        styles[variant],
        active && styles.active,
        error && styles.error,
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
};
