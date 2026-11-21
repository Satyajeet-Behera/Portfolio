import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container/Container';
import { SectionLabel } from '@/components/ui/SectionLabel/SectionLabel';
import { getAllPosts, getAllCategories } from '@/lib/blog';
import { BlogListClient } from '@/components/blog/BlogListClient';
import styles from '../../blog.module.scss';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({
    category: encodeURIComponent(cat.toLowerCase()),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const capitalized = decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);

  return {
    title: `${capitalized} Articles & Notes | Satyajeet Behera`,
    description: `Browse all articles, engineering logs and deep dives in ${capitalized} by Satyajeet Behera.`,
    alternates: {
      canonical: `/blog/category/${category}`,
    },
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const allPosts = getAllPosts();
  const allCategories = getAllCategories();

  const matchingPosts = allPosts.filter(
    (p) => p.category.toLowerCase() === decodedCategory.toLowerCase()
  );

  if (matchingPosts.length === 0) {
    notFound();
  }

  const categoryName = matchingPosts[0].category;
  const postsMeta = matchingPosts.map((post) => ({
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
      <section className={styles.heroSection} aria-labelledby="category-heading">
        <Container className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrowWrapper}>
              <SectionLabel text={`CATEGORY // ${categoryName.toUpperCase()}`} />
            </div>

            <h1 id="category-heading" className={styles.title}>
              {categoryName}<span className={styles.period}>.</span>
            </h1>

            <p className={styles.subtitle}>
              Exploring engineering ideas, architecture reflections and notes focused on {categoryName}.
            </p>
          </div>
        </Container>
      </section>

      <section className={styles.feedSection} aria-label="Category articles list">
        <Container className={styles.container}>
          <BlogListClient posts={postsMeta} categories={allCategories} />
        </Container>
      </section>
    </main>
  );
}
