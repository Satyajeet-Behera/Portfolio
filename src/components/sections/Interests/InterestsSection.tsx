import React from 'react';
import Image from 'next/image';
import { Container } from '@/components/layout/Container/Container';
import { SectionLabel } from '@/components/ui/SectionLabel/SectionLabel';
import { interestsContent } from './interests-content';
import styles from './InterestsSection.module.scss';

export const InterestsSection: React.FC = () => {
  return (
    <section
      id="interests"
      className={styles.section}
      aria-labelledby="interests-heading"
    >
      <Container className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.eyebrowWrapper}>
            <SectionLabel text={interestsContent.eyebrow} />
          </div>

          <h2 id="interests-heading" className={styles.heading}>
            What I Like<span className={styles.questionMark}>?</span>
          </h2>
        </div>

        {/* 3-Column Editorial Grid */}
        <div className={styles.editorialGrid} role="list">
          {interestsContent.items.map((item) => (
            <article key={item.id} className={styles.interestCard} role="listitem">
              <div className={styles.imageWrapper}>
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  width={item.image.width}
                  height={item.image.height}
                  quality={90}
                  className={styles.interestImage}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                  loading="lazy"
                />

                {/* Card Top Meta */}
                <div className={styles.cardMeta} aria-hidden="true">
                  <span className={styles.cardNumber}>{item.number}</span>
                  <span className={styles.cardCategory}>{item.category}</span>
                </div>

                {/* Subtle Edge Vignette */}
                <div className={styles.cardVignette} aria-hidden="true" />
              </div>

              {/* Minimal Card Typography */}
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardSubtitle}>{item.subtitle}</p>
                <p className={styles.cardDescription}>{item.description}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Prominent Authentic Bottom Statement */}
        <div className={styles.statementWrapper} aria-label="Personal reflection">
          <div className={styles.statementBacklight} aria-hidden="true" />
          <div className={styles.statementCard}>
            <div className={styles.quoteMark} aria-hidden="true">
              &ldquo;
            </div>
            <p className={styles.statementText}>
              {interestsContent.bottomStatement}
            </p>
            <div className={styles.statementAuthor}>
              <span className={styles.authorDash} aria-hidden="true" />
              <span className={styles.authorName}>SATYAJEET BEHERA</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
