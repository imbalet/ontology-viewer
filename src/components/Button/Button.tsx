import clsx from 'clsx';
import React from 'react';

import styles from './Button.module.scss';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'danger';
  active?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  active,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(styles.button, styles[variant], active && styles.active, className)}
      {...props}
    />
  );
};
