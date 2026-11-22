'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '../Container/Container';
import { socialLinks } from '@/data/social-links';
import styles from './Footer.module.scss';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      <Container className={styles.container}>
        <div className={styles.topRow}>
          {/* Brand & Identity */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand}>
              <span className={styles.monogram} aria-hidden="true">
                SB
              </span>
              <span className={styles.wordmark}>
                <span className={styles.wordmarkFirst}>SATYAJEET</span>{' '}
                <span className={styles.wordmarkLast}>BEHERA</span>
              </span>
            </Link>
            <p className={styles.tagline}>
              Curious by nature. Driven by ideas. Always building something new.
            </p>
          </div>

          {/* Navigation Links */}
          <div className={styles.navCol}>
            <h3 className={styles.colTitle}>Navigation</h3>
            <ul className={styles.linkList} role="list">
              <li>
                <Link href="/" className={styles.footerLink}>Home</Link>
              </li>
              <li>
                <Link href="/#intelligence" className={styles.footerLink}>Intelligence</Link>
              </li>
              <li>
                <Link href="/#magix" className={styles.footerLink}>Magix AI</Link>
              </li>
              <li>
                <Link href="/#cuber" className={styles.footerLink}>Speedcubing</Link>
              </li>
              <li>
                <Link href="/#story" className={styles.footerLink}>My Story</Link>
              </li>
              <li>
                <Link href="/#interests" className={styles.footerLink}>Interests</Link>
              </li>
              <li>
                <Link href="/#projects" className={styles.footerLink}>My Projects</Link>
              </li>
              <li>
                <Link href="/#contact" className={styles.footerLink}>Contact</Link>
              </li>
              <li>
                <Link href="/blog" className={styles.footerLink}>Blog</Link>
              </li>
            </ul>
          </div>

          {/* Social Channels */}
          <div className={styles.socialCol}>
            <h3 className={styles.colTitle}>Connect</h3>
            <ul className={styles.linkList} role="list">
              <li>
                <a
                  href={socialLinks.github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                  aria-label={socialLinks.github.ariaLabel}
                >
                  GitHub
                  <span className={styles.externalArrow} aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={socialLinks.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                  aria-label={socialLinks.instagram.ariaLabel}
                >
                  Instagram
                  <span className={styles.externalArrow} aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={socialLinks.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                  aria-label={socialLinks.whatsapp.ariaLabel}
                >
                  WhatsApp
                  <span className={styles.externalArrow} aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={socialLinks.email.url}
                  className={styles.footerLink}
                  aria-label={socialLinks.email.ariaLabel}
                >
                  Direct Email
                  <span className={styles.externalArrow} aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Action: Back to top + Availability */}
          <div className={styles.actionCol}>
            <button
              type="button"
              onClick={scrollToTop}
              className={styles.backToTopButton}
              aria-label="Scroll back to top of the page"
            >
              <span>Back to Top</span>
              <span className={styles.topArrow} aria-hidden="true">↑</span>
            </button>

            <div className={styles.statusIndicator} role="status">
              <span className={styles.statusDot} aria-hidden="true" />
              <span className={styles.statusText}>Open to Collabs & Engineering</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            &copy; {currentYear} Satyajeet Behera. All rights reserved.
          </p>
          <p className={styles.techCredit}>
            Designed & Engineered with Next.js & TypeScript
          </p>
        </div>
      </Container>
    </footer>
  );
};
