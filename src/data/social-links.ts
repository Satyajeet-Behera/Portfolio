/**
 * Centralized Social Links Configuration
 * Phase 4 — Satyajeet Behera Portfolio
 */

export interface SocialLink {
  name: string;
  url: string;
  displayValue: string;
  icon: 'github' | 'instagram' | 'whatsapp' | 'email';
  ariaLabel: string;
}

export const socialLinks = {
  github: {
    name: 'GitHub',
    url: 'https://github.com/Satyajeet-Behera',
    displayValue: 'github.com/Satyajeet-Behera',
    icon: 'github' as const,
    ariaLabel: 'Explore GitHub: Satyajeet Behera public repositories (opens in new tab)',
  },
  instagram: {
    name: 'Instagram',
    url: 'https://instagram.com/_raja__577',
    displayValue: '@_raja__577',
    icon: 'instagram' as const,
    ariaLabel: 'Follow on Instagram: @_raja__577 visual stories and updates (opens in new tab)',
  },
  whatsapp: {
    name: 'WhatsApp',
    url: 'https://wa.me/918074783962',
    displayValue: '+91 8074783962',
    icon: 'whatsapp' as const,
    ariaLabel: 'Message on WhatsApp: Satyajeet Behera instant messaging (opens in new tab)',
  },
  email: {
    name: 'Email',
    url: 'mailto:iq218satya@gmail.com',
    displayValue: 'iq218satya@gmail.com',
    icon: 'email' as const,
    ariaLabel: 'Send Direct Email to Satyajeet Behera at iq218satya@gmail.com',
  },
} as const;

export type SocialLinks = typeof socialLinks;
