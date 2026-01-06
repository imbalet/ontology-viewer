import React from 'react';
import styles from './Button.module.scss';
import clsx from 'clsx';

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
