import { siteConfig } from './site-config';

export function generatePersonStructuredData() {
  const baseUrl = siteConfig.url;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.name,
    url: baseUrl,
    jobTitle: siteConfig.author.role,
    description: siteConfig.description,
    image: `${baseUrl}/images/satyajeet-hero.webp`,
    knowsAbout: siteConfig.author.knowsAbout,
    sameAs: [
      // Verified public links can be populated in future phases
    ],
  };
}
