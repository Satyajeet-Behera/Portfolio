import React from 'react';
import styles from './SectionLabel.module.scss';

interface SectionLabelProps {
  children?: React.ReactNode;
  text?: string;
  className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  children,
  text,
  className,
}) => {
  return (
    <div className={`${styles.label}${className ? ` ${className}` : ''}`} role="doc-subtitle">
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.text}>{children || text}</span>
    </div>
  );
};
