'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { BlogPostMeta } from '@/lib/blog';
import styles from './BlogListClient.module.scss';

interface BlogListClientProps {
  posts: BlogPostMeta[];
  categories: string[];
}

export const BlogListClient: React.FC<BlogListClientProps> = ({
  posts,
  categories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter posts based on search query and category
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Find featured post if viewing 'All' and no search
  const featuredPost = useMemo(() => {
    if (selectedCategory === 'All' && !searchQuery.trim()) {
      return posts.find((p) => p.featured) || posts[0];
    }
    return null;
  }, [posts, selectedCategory, searchQuery]);

  // Remaining posts excluding the featured post in default view
  const remainingPosts = useMemo(() => {
    if (featuredPost) {
      return filteredPosts.filter((p) => p.slug !== featuredPost.slug);
    }
    return filteredPosts;
  }, [filteredPosts, featuredPost]);

  return (
    <div className={styles.wrapper}>
      {/* Search & Filter Toolbar */}
      <div className={styles.toolbar}>
        {/* Category Pills */}
        <div className={styles.categoryPills} role="tablist" aria-label="Blog categories">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'All'}
            onClick={() => setSelectedCategory('All')}
            className={`${styles.pill} ${selectedCategory === 'All' ? styles.pillActive : ''}`}
          >
            All Articles ({posts.length})
          </button>
          {categories.map((cat) => {
            const count = posts.filter(
              (p) => p.category.toLowerCase() === cat.toLowerCase()
            ).length;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`${styles.pill} ${selectedCategory === cat ? styles.pillActive : ''}`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon} aria-hidden="true">🔍</span>
          <input
            type="search"
            placeholder="Search articles, topics or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            aria-label="Search articles"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className={styles.clearSearchBtn}
              aria-label="Clear search query"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Featured Spotlight Card */}
      {featuredPost && (
        <article className={styles.featuredCard}>
          <div className={styles.featuredInner}>
            {featuredPost.image && (
              <div className={styles.featuredMedia}>
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.imageAlt || featuredPost.title}
                  width={640}
                  height={360}
                  quality={90}
                  className={styles.featuredImg}
                  priority
                />
                <div className={styles.featuredBadge}>FEATURED ARTICLE</div>
              </div>
            )}
            <div className={styles.featuredContent}>
              <div className={styles.metaRow}>
                <span className={styles.categoryTag}>{featuredPost.category}</span>
                <span className={styles.metaDot}>•</span>
                <time dateTime={featuredPost.date} className={styles.metaDate}>
                  {featuredPost.date}
                </time>
                <span className={styles.metaDot}>•</span>
                <span className={styles.metaReadTime}>{featuredPost.readTime}</span>
              </div>

              <h2 className={styles.featuredTitle}>
                <Link href={`/blog/${featuredPost.slug}`} className={styles.articleLink}>
                  {featuredPost.title}
                </Link>
              </h2>

              <p className={styles.featuredDesc}>{featuredPost.description}</p>

              <div className={styles.tagsRow}>
                {featuredPost.tags.map((tag) => (
                  <span key={tag} className={styles.tagPill}>
                    #{tag}
                  </span>
                ))}
              </div>

              <div className={styles.featuredAction}>
                <Link href={`/blog/${featuredPost.slug}`} className={styles.readMoreBtn}>
                  Read Complete Article <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Grid of Articles */}
      {remainingPosts.length > 0 ? (
        <div className={styles.articlesGrid}>
          {remainingPosts.map((post) => (
            <article key={post.slug} className={styles.card}>
              {post.image && (
                <div className={styles.cardMedia}>
                  <Image
                    src={post.image}
                    alt={post.imageAlt || post.title}
                    width={480}
                    height={270}
                    quality={90}
                    className={styles.cardImg}
                    loading="lazy"
                  />
                  <span className={styles.cardCategory}>{post.category}</span>
                </div>
              )}

              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  <time dateTime={post.date}>{post.date}</time>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                <h3 className={styles.cardTitle}>
                  <Link href={`/blog/${post.slug}`} className={styles.articleLink}>
                    {post.title}
                  </Link>
                </h3>

                <p className={styles.cardDesc}>{post.description}</p>

                <div className={styles.cardFooter}>
                  <div className={styles.tagsWrap}>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.cardTag}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link href={`/blog/${post.slug}`} className={styles.cardLink} aria-label={`Read article: ${post.title}`}>
                    <span>Read</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">🔎</span>
          <h3 className={styles.emptyTitle}>No matching articles found</h3>
          <p className={styles.emptyDesc}>
            Try adjusting your search terms or selecting a different category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className={styles.resetBtn}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
