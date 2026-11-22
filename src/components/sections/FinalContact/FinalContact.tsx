'use client';

import React, { useState } from 'react';
import { Container } from '@/components/layout/Container/Container';
import { SectionLabel } from '@/components/ui/SectionLabel/SectionLabel';
import { socialLinks } from '@/data/social-links';
import styles from './FinalContact.module.scss';

export const FinalContact: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <section
      id="connect"
      className={styles.section}
      aria-labelledby="final-contact-heading"
    >
      <Container className={styles.container}>
        <div className={styles.header}>
          <div className={styles.eyebrowWrapper}>
            <SectionLabel text="CHANNELS // DIRECT NETWORK" className={styles.sectionLabelCustom} />
          </div>

          <h2 id="final-contact-heading" className={styles.heading}>
            Let&apos;s Connect<span className={styles.period}>.</span>
          </h2>

          <p className={styles.description}>
            Available across platforms. Whether you prefer open-source exploration on GitHub, visual updates on Instagram, real-time messaging on WhatsApp, or direct communication via email — feel free to reach out.
          </p>
        </div>

        <div className={styles.grid}>
          {/* GitHub Card: Black and White */}
          <div className={`${styles.card} ${styles.cardGithub}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconCircle} aria-hidden="true">
                <svg
                  className={styles.svgIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </div>
              <div className={styles.channelMeta}>
                <span className={styles.protocolTag}>SOURCE CODE & REPOS</span>
                <h3 className={styles.channelName}>{socialLinks.github.name}</h3>
              </div>
            </div>

            <p className={styles.channelDesc}>
              Explore public repositories, architecture experiments, open-source AI utilities, and interactive builds.
            </p>

            <div className={styles.valueRow}>
              <span className={styles.displayValue}>{socialLinks.github.displayValue}</span>
              <button
                type="button"
                onClick={() => handleCopy(socialLinks.github.url, 'github')}
                className={styles.copyBtn}
                aria-label="Copy GitHub profile URL"
              >
                {copiedKey === 'github' ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <a
              href={socialLinks.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionLink}
              aria-label={socialLinks.github.ariaLabel}
            >
              <span>Explore GitHub</span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </a>

            <div className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
            <div className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />
          </div>

          {/* Instagram Card: Official Brand Sunset Gradient */}
          <div className={`${styles.card} ${styles.cardInstagram}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconCircle} aria-hidden="true">
                <svg
                  className={styles.svgIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <div className={styles.channelMeta}>
                <span className={styles.protocolTag}>VISUAL & STORIES</span>
                <h3 className={styles.channelName}>{socialLinks.instagram.name}</h3>
              </div>
            </div>

            <p className={styles.channelDesc}>
              Follow day-to-day stories, workspace updates, speedcubing sessions, and personal interests.
            </p>

            <div className={styles.valueRow}>
              <span className={styles.displayValue}>{socialLinks.instagram.displayValue}</span>
              <button
                type="button"
                onClick={() => handleCopy(socialLinks.instagram.displayValue, 'instagram')}
                className={styles.copyBtn}
                aria-label="Copy Instagram handle"
              >
                {copiedKey === 'instagram' ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <a
              href={socialLinks.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionLink}
              aria-label={socialLinks.instagram.ariaLabel}
            >
              <span>Follow on Instagram</span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </a>

            <div className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
            <div className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />
          </div>

          {/* WhatsApp Card: Official Brand Green */}
          <div className={`${styles.card} ${styles.cardWhatsapp}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconCircle} aria-hidden="true">
                <svg
                  className={styles.svgIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div className={styles.channelMeta}>
                <span className={styles.protocolTag}>REAL-TIME MESSAGING</span>
                <h3 className={styles.channelName}>{socialLinks.whatsapp.name}</h3>
              </div>
            </div>

            <p className={styles.channelDesc}>
              Instant communication for urgent discussions, project coordination, and rapid feedback loops.
            </p>

            <div className={styles.valueRow}>
              <span className={styles.displayValue}>{socialLinks.whatsapp.displayValue}</span>
              <button
                type="button"
                onClick={() => handleCopy(socialLinks.whatsapp.displayValue, 'whatsapp')}
                className={styles.copyBtn}
                aria-label="Copy WhatsApp contact number"
              >
                {copiedKey === 'whatsapp' ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <a
              href={socialLinks.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionLink}
              aria-label={socialLinks.whatsapp.ariaLabel}
            >
              <span>Message on WhatsApp</span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </a>

            <div className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
            <div className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />
          </div>

          {/* Email Card: Official Google Gmail Brand Logo & Colors */}
          <div className={`${styles.card} ${styles.cardEmail}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconCircle} aria-hidden="true">
                <svg
                  className={styles.svgIconGmail}
                  viewBox="0 0 512 384"
                  aria-hidden="true"
                >
                  <path fill="#4285F4" d="M512 85v214c0 16-14 30-30 30h-30V170L256 226 62 170v159H32c-16 0-32-14-32-30V85c0-22 26-33 41-18l215 150L471 67c15-15 41-4 41 18z"/>
                  <path fill="#EA4335" d="M452 67L256 217 60 67C46 56 32 67 32 85v4l224 156L480 89v-4c0-18-14-29-28-18z"/>
                  <path fill="#34A853" d="M32 89v210c0 16 14 30 30 30h30V170L32 89z"/>
                  <path fill="#FBBC05" d="M450 299c16 0 30-14 30-30V89l-60 81v129h30z"/>
                  <path fill="#C5221F" d="M420 170v159h30c16 0 30-14 30-30V170H420z"/>
                </svg>
              </div>
              <div className={styles.channelMeta}>
                <span className={styles.protocolTag}>PRIMARY INBOX</span>
                <h3 className={styles.channelName}>{socialLinks.email.name}</h3>
              </div>
            </div>

            <p className={styles.channelDesc}>
              Formal correspondence, detailed proposals, engineering collaboration, and business inquiries.
            </p>

            <div className={styles.valueRow}>
              <span className={styles.displayValue}>{socialLinks.email.displayValue}</span>
              <button
                type="button"
                onClick={() => handleCopy(socialLinks.email.displayValue, 'email')}
                className={styles.copyBtn}
                aria-label="Copy email address"
              >
                {copiedKey === 'email' ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <a
              href={socialLinks.email.url}
              className={styles.actionLink}
              aria-label={socialLinks.email.ariaLabel}
            >
              <span>Send Direct Email</span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </a>

            <div className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
            <div className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />
          </div>
        </div>
      </Container>
    </section>
  );
};
