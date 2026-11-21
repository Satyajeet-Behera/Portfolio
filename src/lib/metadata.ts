import type { Metadata } from 'next';
import { siteConfig } from './site-config';

export function constructMetadata({
  title = siteConfig.title,
  description = siteConfig.description,
  image = '/images/satyajeet-hero.webp',
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const siteUrl = siteConfig.url;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    authors: [{ name: siteConfig.name, url: siteUrl }],
    creator: siteConfig.name,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: siteConfig.name,
      locale: 'en_US',
      type: 'profile',
      images: [
        {
          url: image,
          width: 1024,
          height: 768,
          alt: `Portrait of ${siteConfig.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: siteConfig.name,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}
