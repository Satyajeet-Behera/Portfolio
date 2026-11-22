import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Container } from '@/components/layout/Container/Container';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { siteConfig } from '@/lib/site-config';
import { PostReaderClient } from '@/components/blog/PostReaderClient';
import styles from './post.module.scss';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Satyajeet Behera',
    };
  }

  const postUrl = `${siteConfig.url}/blog/${post.slug}`;
  const ogImages = post.image ? [{ url: post.image, alt: post.imageAlt || post.title }] : [];

  return {
    title: `${post.title} | Satyajeet Behera`,
    description: post.description,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: postUrl,
      publishedTime: post.date,
      authors: [siteConfig.name],
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const postUrl = `${siteConfig.url}/blog/${post.slug}`;

  // JSON-LD structured data for article
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Person',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    image: post.image ? `${siteConfig.url}${post.image}` : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };

  return (
    <article className={styles.articlePage}>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Container className={styles.container}>
        {/* Client-Side Reading Progress Bar & Share Bar */}
        <PostReaderClient postTitle={post.title} postUrl={postUrl} />

        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
          <Link href="/blog" className={styles.breadcrumbLink}>Blog</Link>
          <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
          <span className={styles.breadcrumbCurrent}>{post.category}</span>
        </nav>

        {/* Article Header */}
        <header className={styles.header}>
          <div className={styles.metaRow}>
            <Link
              href={`/blog/category/${encodeURIComponent(post.category.toLowerCase())}`}
              className={styles.categoryPill}
            >
              {post.category}
            </Link>
            <span className={styles.metaDot} aria-hidden="true">•</span>
            <time dateTime={post.date} className={styles.publishDate}>
              {post.date}
            </time>
            <span className={styles.metaDot} aria-hidden="true">•</span>
            <span className={styles.readTime}>{post.readTime}</span>
          </div>

          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.description}>{post.description}</p>

          {/* Author Card */}
          <div className={styles.authorRow}>
            <div className={styles.authorAvatar} aria-hidden="true">
              SB
            </div>
            <div className={styles.authorMeta}>
              <span className={styles.authorName}>Satyajeet Behera</span>
              <span className={styles.authorRole}>Software Engineer & Developer</span>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.image && (
          <div className={styles.heroImageWrapper}>
            <Image
              src={post.image}
              alt={post.imageAlt || post.title}
              width={1200}
              height={675}
              quality={90}
              priority
              className={styles.heroImage}
            />
          </div>
        )}

        {/* MDX Body Content */}
        <div className={styles.contentWrapper}>
          <div className={styles.markdownBody}>
            <MDXRemote source={post.content} />
          </div>
        </div>

        {/* Article Footer & Tags */}
        <footer className={styles.postFooter}>
          <div className={styles.tagsSection}>
            <span className={styles.tagsLabel}>Tags:</span>
            <div className={styles.tagsList}>
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tagItem}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bio Callout */}
          <div className={styles.bioCard}>
            <div className={styles.bioAvatar} aria-hidden="true">SB</div>
            <div className={styles.bioContent}>
              <h3 className={styles.bioName}>Written by Satyajeet Behera</h3>
              <p className={styles.bioText}>
                Software engineer, full-stack developer, and speedcuber building autonomous agents, interactive digital experiences, and high-performance web systems.
              </p>
              <div className={styles.bioLinks}>
                <a href="https://github.com/Satyajeet-Behera" target="_blank" rel="noopener noreferrer">GitHub</a>
                <span>•</span>
                <a href="https://instagram.com/_raja__577" target="_blank" rel="noopener noreferrer">Instagram</a>
                <span>•</span>
                <a href="mailto:iq218satya@gmail.com">Email</a>
              </div>
            </div>
          </div>

          {/* Pagination Navigation */}
          <nav className={styles.paginationNav} aria-label="Previous and Next Articles">
            {prevPost ? (
              <Link href={`/blog/${prevPost.slug}`} className={`${styles.paginationCard} ${styles.prevCard}`}>
                <span className={styles.paginationLabel}>← Previous Article</span>
                <span className={styles.paginationTitle}>{prevPost.title}</span>
              </Link>
            ) : <div />}

            {nextPost ? (
              <Link href={`/blog/${nextPost.slug}`} className={`${styles.paginationCard} ${styles.nextCard}`}>
                <span className={styles.paginationLabel}>Next Article →</span>
                <span className={styles.paginationTitle}>{nextPost.title}</span>
              </Link>
            ) : <div />}
          </nav>

          <div className={styles.backToBlog}>
            <Link href="/blog" className={styles.backBtn}>
              ← Back to All Articles
            </Link>
          </div>
        </footer>
      </Container>
    </article>
  );
}
