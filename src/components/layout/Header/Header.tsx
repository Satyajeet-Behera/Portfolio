import React from 'react';
import Link from 'next/link';
import { Container } from '../Container/Container';
import { siteConfig } from '@/lib/site-config';
import styles from './Header.module.scss';

export const Header: React.FC = () => {
  // Only expose navigation destinations that actually exist in this phase
  const visibleNavItems = siteConfig.navItems.filter((item) => item.enabled);

  return (
    <header className={styles.header} role="banner">
      <Container className={styles.container}>
        <div className={styles.brandWrapper}>
          <Link href="/" className={styles.brand}>
            <span className={styles.monogram} aria-hidden="true">
              SB
            </span>
            <span className={styles.wordmark}>
              <span className={styles.wordmarkFirst}>SATYAJEET</span>{' '}
              <span className={styles.wordmarkLast}>BEHERA</span>
            </span>
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Primary Navigation">
          <ul className={styles.navList} role="list">
            {visibleNavItems.map((item) => (
              <li key={item.label} className={styles.navItem}>
                <Link
                  href={item.href}
                  className={`${styles.navLink}${item.active ? ` ${styles.active}` : ''}`}
                  aria-current={item.active ? 'page' : undefined}
                >
                  <span className={styles.navText}>{item.label}</span>
                  {item.active && <span className={styles.activeIndicator} aria-hidden="true" />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
};
