import { siteConfig } from './site-config';
import { socialLinks } from '@/data/social-links';

export function generatePersonStructuredData() {
  const baseUrl = siteConfig.url;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${baseUrl}/#person`,
        name: siteConfig.name,
        url: baseUrl,
        jobTitle: 'AI Enthusiast & Developer',
        description: siteConfig.description,
        image: `${baseUrl}/images/satyajeet-hero.webp`,
        knowsAbout: siteConfig.author.knowsAbout,
        sameAs: [
          socialLinks.github.url,
          socialLinks.instagram.url,
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: {
          '@id': `${baseUrl}/#person`,
        },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${baseUrl}/#profilepage`,
        url: baseUrl,
        name: siteConfig.title,
        mainEntity: {
          '@id': `${baseUrl}/#person`,
        },
      },
    ],
  };
}
