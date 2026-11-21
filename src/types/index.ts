export interface NavItem {
  label: string;
  href: string;
  active: boolean;
  enabled: boolean;
}

export interface SectionProps {
  id?: string;
  className?: string;
}

export interface HeroPortraitProps {
  priority?: boolean;
  className?: string;
}
