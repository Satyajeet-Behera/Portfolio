import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIRECTORY = path.join(process.cwd(), 'content', 'blog');

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  readTime: string;
  featured?: boolean;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Get all published blog posts sorted by date descending
 */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIRECTORY)) {
    return [];
  }

  const fileNames = fs.readdirSync(BLOG_DIRECTORY);

  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.mdx') && !fileName.startsWith('_'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(BLOG_DIRECTORY, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      const { data, content } = matter(fileContents);

      const readTime = data.readTime || calculateReadingTime(content);

      return {
        slug,
        title: data.title || 'Untitled Post',
        description: data.description || '',
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
        category: data.category || 'General',
        tags: Array.isArray(data.tags) ? data.tags : [],
        image: data.image || undefined,
        imageAlt: data.imageAlt || undefined,
        readTime,
        featured: Boolean(data.featured),
        content,
      } as BlogPost;
    })
    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

  return posts;
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(BLOG_DIRECTORY, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    const readTime = data.readTime || calculateReadingTime(content);

    return {
      slug,
      title: data.title || 'Untitled Post',
      description: data.description || '',
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
      category: data.category || 'General',
      tags: Array.isArray(data.tags) ? data.tags : [],
      image: data.image || undefined,
      imageAlt: data.imageAlt || undefined,
      readTime,
      featured: Boolean(data.featured),
      content,
    };
  } catch {
    return null;
  }
}

/**
 * Get all posts for a given category
 */
export function getPostsByCategory(category: string): BlogPost[] {
  const posts = getAllPosts();
  return posts.filter(
    (post) => post.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const posts = getAllPosts();
  const categories = Array.from(new Set(posts.map((post) => post.category)));
  return categories.sort();
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = Array.from(
    new Set(posts.flatMap((post) => post.tags))
  );
  return tags.sort();
}
