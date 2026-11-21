import React from 'react';
import Link from 'next/link';
import styles from './Button.module.scss';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
  ariaLabel?: string;
  target?: string;
  rel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className,
  ariaLabel,
  target,
  rel,
}) => {
  const buttonClasses = `${styles.button} ${styles[variant]} ${styles[size]}${
    className ? ` ${className}` : ''
  }`;

  if (href) {
    const isExternal = href.startsWith('http') || href.startsWith('mailto:');
    if (isExternal) {
      return (
        <a
          href={href}
          className={buttonClasses}
          aria-label={ariaLabel}
          target={target || '_blank'}
          rel={rel || 'noopener noreferrer'}
          onClick={onClick}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={buttonClasses} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={buttonClasses}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
