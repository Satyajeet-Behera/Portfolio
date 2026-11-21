import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/blog';
import { siteConfig } from '@/lib/site-config';

export async function GET() {
  const posts = getAllPosts();
  const baseUrl = siteConfig.url;

  const rssItems = posts
    .map((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.description}]]></description>
      <category>${post.category}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[Satyajeet Behera | Engineering Log & Articles]]></title>
    <link>${baseUrl}/blog</link>
    <description><![CDATA[Deep dives into artificial intelligence, autonomous agent engineering, 3D web graphics, speedcubing algorithms, and technology reflections by Satyajeet Behera.]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssFeed.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
