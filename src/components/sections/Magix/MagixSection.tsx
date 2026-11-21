import React from 'react';
import { Container } from '@/components/layout/Container/Container';
import { SectionLabel } from '@/components/ui/SectionLabel/SectionLabel';
import { MagixVisual } from './MagixVisual';
import { magixConfig } from './magix-config';
import styles from './MagixSection.module.scss';

export const MagixSection: React.FC = () => {
  return (
    <section id="magix" className={styles.section} aria-label="Magix Personal AI Assistant Section">
      <Container className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column: Narrative, Features & Description */}
          <div className={styles.contentCol}>
            <div className={styles.eyebrowWrapper}>
              <SectionLabel text={magixConfig.eyebrow} className={styles.magixSectionLabel} />
            </div>

            <h2 className={styles.heading}>
              Satyajeet&apos;s Jarvis is{' '}
              <span className={styles.magixHighlight}>Magix</span>
              <span className={styles.period}>.</span>
            </h2>

            <p className={styles.description}>{magixConfig.description}</p>

            {/* Feature Highlights Grid */}
            <div className={styles.featuresList}>
              {magixConfig.features.map((feat) => (
                <div key={feat.label} className={styles.featureCard}>
                  <div className={styles.featureHeader}>
                    <span className={styles.featureDot} aria-hidden="true" />
                    <h3 className={styles.featureTitle}>{feat.label}</h3>
                  </div>
                  <p className={styles.featureDetail}>{feat.detail}</p>
                </div>
              ))}
            </div>

            {/* Action Row & GitHub Repository Link */}
            <div className={styles.actionRow}>
              <a
                href={magixConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubButton}
              >
                <svg
                  className={styles.githubIcon}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>View Magix on GitHub</span>
                <span className={styles.externalArrow} aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
          </div>

          {/* Right Column: Cinematic Futuristic Preview */}
          <div className={styles.stageCol}>
            <MagixVisual />
          </div>
        </div>
      </Container>
    </section>
  );
};
