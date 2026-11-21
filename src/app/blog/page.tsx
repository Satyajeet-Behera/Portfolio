import React from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container/Container';
import { SectionLabel } from '@/components/ui/SectionLabel/SectionLabel';
import { getAllPosts, getAllCategories } from '@/lib/blog';
import { BlogListClient } from '@/components/blog/BlogListClient';
import styles from './blog.module.scss';

export const metadata: Metadata = {
  title: 'Blog & Engineering Notes | Satyajeet Behera',
  description:
    'Deep dives into artificial intelligence, autonomous agent engineering, 3D web graphics, speedcubing algorithms, and technology reflections by Satyajeet Behera.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog & Engineering Notes | Satyajeet Behera',
    description:
      'Deep dives into artificial intelligence, autonomous agent engineering, 3D web graphics, speedcubing algorithms, and technology reflections by Satyajeet Behera.',
    type: 'website',
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  // Pass post metadata without full content body to optimize client payload
  const postsMeta = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    category: post.category,
    tags: post.tags,
    image: post.image,
    imageAlt: post.imageAlt,
    readTime: post.readTime,
    featured: post.featured,
  }));

  return (
    <main className={styles.main} id="main-content">
      {/* Blog Hero Header */}
      <section className={styles.heroSection} aria-labelledby="blog-header-heading">
        <Container className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrowWrapper}>
              <SectionLabel text="WRITING & LOGS // KNOWLEDGE BASE" />
            </div>

            <h1 id="blog-header-heading" className={styles.title}>
              Engineering Log & Insights<span className={styles.period}>.</span>
            </h1>

            <p className={styles.subtitle}>
              Documenting technical explorations, architectural breakthroughs, autonomous agent experiments, and speedcubing insights. An open record of continuous learning.
            </p>
          </div>
        </Container>
      </section>

      {/* Interactive Blog List & Filtering */}
      <section className={styles.feedSection} aria-label="Articles Feed">
        <Container className={styles.container}>
          <BlogListClient posts={postsMeta} categories={categories} />
        </Container>
      </section>
    </main>
  );
}
