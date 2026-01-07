import React from 'react';
import clsx from 'clsx';
import styles from './TextInput.module.scss';

type InputType = 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';

export type TextInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  type?: InputType;
  variant?: 'default' | 'required';
  active?: boolean;
  error?: boolean;
};

export const TextInput: React.FC<TextInputProps> = ({
  type = 'text',
  variant = 'default',
  active,
  error,
  className,
  ...props
}) => {
  return (
    <input
      type={type}
      className={clsx(
        styles.input,
        styles[variant],
        active && styles.active,
        error && styles.error,
        className
      )}
      {...props}
    />
  );
};
