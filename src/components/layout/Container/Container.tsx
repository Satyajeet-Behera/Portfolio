import React from 'react';
import styles from './Container.module.scss';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'main' | 'header' | 'footer';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  as: Component = 'div',
}) => {
  return (
    <Component className={`${styles.container}${className ? ` ${className}` : ''}`}>
      {children}
    </Component>
  );
};
