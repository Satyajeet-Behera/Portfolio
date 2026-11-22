'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Container } from '../Container/Container';
import { siteConfig } from '@/lib/site-config';
import styles from './Header.module.scss';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const isBlog = pathname?.startsWith('/blog');

  // Exact section IDs matching page layout in order
  const sectionIds = [
    'hero',
    'intelligence',
    'magix',
    'cuber',
    'story',
    'interests',
    'projects',
    'contact',
  ];

  const [activeId, setActiveId] = useState<string>(isBlog ? 'blog' : 'hero');
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isBlog) {
      setActiveId('blog');
      return;
    }

    // Check for initial hash on page load
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      if (sectionIds.includes(hashId)) {
        setActiveId(hashId);
      }
    }

    // High-performance scroll spy
    const handleScroll = () => {
      if (isClickScrollingRef.current) return;

      // Near top of document
      if (window.scrollY < 120) {
        setActiveId('hero');
        return;
      }

      // Check if near bottom of document (footer / contact area)
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100
      ) {
        setActiveId('contact');
        return;
      }

      // Check sections from bottom to top so that current visible section wins
      const headerThreshold = 200;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Active when section top is at or above header threshold and bottom is still visible
          if (rect.top <= headerThreshold && rect.bottom > 80) {
            setActiveId(id);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [isBlog]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: { label: string; href: string; id: string }
  ) => {
    if (item.id === 'blog') {
      setActiveId('blog');
      return;
    }

    if (pathname === '/') {
      e.preventDefault();
      setActiveId(item.id);

      // Lock scroll-spy listener during programmatic smooth scroll
      isClickScrollingRef.current = true;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      const unlock = () => {
        isClickScrollingRef.current = false;
      };

      // Fallback timeout to resume scroll spy
      clickTimeoutRef.current = setTimeout(unlock, 1000);

      // Listen for native scrollend event if supported
      const onScrollEnd = () => {
        unlock();
        window.removeEventListener('scrollend', onScrollEnd);
      };
      window.addEventListener('scrollend', onScrollEnd, { once: true });

      if (item.id === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
        return;
      }

      const el = document.getElementById(item.id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        // Smooth scroll with fixed header clearance
        window.scrollTo({ top: Math.max(0, top - 65), behavior: 'smooth' });
        window.history.pushState(null, '', `/#${item.id}`);
      }
    }
  };

  const visibleNavItems = siteConfig.navItems.filter((item) => item.enabled);

  return (
    <header className={styles.header} role="banner">
      <Container className={styles.container}>
        <div className={styles.brandWrapper}>
          <Link
            href="/"
            className={styles.brand}
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setActiveId('hero');
                window.history.pushState(null, '', '/');
              }
            }}
          >
            <div className={styles.logoBadge} aria-hidden="true">
              <Image
                src="/images/logo.webp"
                alt="Satyajeet Behera Official Logo"
                width={42}
                height={42}
                className={styles.logoImage}
                priority
              />
            </div>
            <span className={styles.wordmark}>
              <span className={styles.wordmarkFirst}>SATYAJEET</span>{' '}
              <span className={styles.wordmarkLast}>BEHERA</span>
            </span>
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Primary Navigation">
          <ul className={styles.navList} role="list">
            {visibleNavItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id} className={styles.navItem}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`${styles.navLink}${isActive ? ` ${styles.active}` : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={styles.navText}>{item.label}</span>
                    {isActive && (
                      <span className={styles.activeIndicator} aria-hidden="true" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </header>
  );
};
