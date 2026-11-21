# Satyajeet Behera — Personal Portfolio (Phase 1)

> A premium, cinematic, performance-first personal portfolio built for **Satyajeet Behera**.

---

## 1. Overview & Identity

This project establishes the digital presence and technical identity of **Satyajeet Behera** — AI enthusiast, developer, and builder. Phase 1 establishes the core architectural foundation, navigation system, SEO infrastructure, and an atmospheric hero experience featuring an authentic portrait of Satyajeet at his workstation.

The architecture is engineered to scale across upcoming development phases (Phase 2 binary transformation, Phase 3 interactive 3D Rubik's Cube, Phase 4 project showcase & blog, Phase 5 production hardening) without requiring structural rewrites.

---

## 2. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Latest stable with React 19, Server Components by default |
| **Language** | TypeScript | Strict mode enabled, no untyped props or `any` |
| **Styling** | SCSS Modules & Global SCSS | Modular design tokens, fluid typography, no utility CSS frameworks |
| **Images** | `next/image` + Sharp | Pre-optimized WebP generation, accurate responsive `sizes`, LCP priority |
| **Typography** | `next/font/google` | Self-hosted Inter, Space Grotesk, and JetBrains Mono with zero FOIT |
| **Structured Data** | Schema.org JSON-LD | `Person` schema with truthful attributes and canonical linking |
| **Hosting Target** | Vercel | Production edge delivery, optimal Core Web Vitals |

---

## 3. Architecture & Directory Structure

```text
satyajeet-portfolio/
│
├── assets/
│   └── raw/
│       └── satyajeet-original.jpg       # Untouched original high-res photograph
│
├── public/
│   ├── images/
│   │   ├── satyajeet-hero.webp         # Web-optimized WebP portrait (58 KB)
│   │   └── satyajeet-hero.jpg          # Web-optimized fallback JPEG (77 KB)
│   ├── icons/
│   │   └── icon-192.png                # App icon
│   ├── favicon/
│   │   └── icon.svg                    # Vector icon
│   ├── favicon.ico                     # Standard favicon
│   ├── favicon.svg                     # Crisp SVG favicon
│   └── apple-touch-icon.png            # Apple device icon
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout, fonts, meta & JSON-LD
│   │   ├── page.tsx                    # Homepage entry (Server Component)
│   │   ├── globals.scss                # Resets, ambient glow & accessibility
│   │   ├── robots.ts                   # Search crawler directives
│   │   └── sitemap.ts                  # Dynamic XML sitemap generator
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Container/              # Centered fluid layout container
│   │   │   │   ├── Container.tsx
│   │   │   │   └── Container.module.scss
│   │   │   └── Header/                 # Navigation & SB monogram brand
│   │   │       ├── Header.tsx
│   │   │       └── Header.module.scss
│   │   │
│   │   ├── sections/
│   │   │   └── Hero/                   # Phase 1 Hero Section
│   │   │       ├── Hero.tsx            # Two-column responsive hero
│   │   │       ├── Hero.module.scss    # Editorial layout & fluid scaling
│   │   │       ├── HeroPortrait.tsx    # Isolated portrait for Phase 2 integration
│   │   │       └── HeroPortrait.module.scss # Atmospheric framing & accents
│   │   │
│   │   └── ui/
│   │       ├── Button/                 # Accessible button & link component
│   │       │   ├── Button.tsx
│   │       │   └── Button.module.scss
│   │       └── SectionLabel/           # Metallic gold eyebrow badge
│   │           ├── SectionLabel.tsx
│   │           └── SectionLabel.module.scss
│   │
│   ├── lib/
│   │   ├── site-config.ts              # Single source of truth for site content
│   │   ├── metadata.ts                 # Canonical OpenGraph & Twitter metadata
│   │   └── structured-data.ts          # Schema.org Person JSON-LD builder
│   │
│   ├── styles/
│   │   ├── _variables.scss             # Color tokens, easings, spacing
│   │   ├── _breakpoints.scss           # Responsive media query mixins
│   │   ├── _typography.scss            # Fluid type clamp calculators
│   │   └── _mixins.scss                # Focus rings, accessibility utilities
│   │
│   └── types/
│       └── index.ts                    # Strict TypeScript interfaces
│
├── .env.example
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Setup & Local Development

### Prerequisites
- Node.js `v20.x` or higher (verified on Node.js `v26.x`)
- npm `v10.x` or higher

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Portfolio

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Update `NEXT_PUBLIC_SITE_URL` to your production domain once acquired (defaults to `http://localhost:3000` for development).

### Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Verification & Production Build

### Static Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

### Production Build
```bash
npm run build
```

### Run Production Server
```bash
npm run start
```

---

## 6. Image Asset Treatment

- **Untouched Original**: Kept outside the public directory at `assets/raw/satyajeet-original.jpg` (219 KB, 1024x768).
- **Web-Ready Asset**: Generated at `public/images/satyajeet-hero.webp` (58 KB, 90% quality WebP).
- **Facial Integrity**: Zero AI modifications, distortion, or artificial enhancement. Preserves authentic lighting, facial structure, and workstation elements (Rubik's cube, warm lamp, laptop).
- **Phase 2 Ready**: Embedded via `<HeroPortrait />` component with an explicit architectural wrapper for the forthcoming binary transformation layer.

---

## 7. Deployment Instructions (Vercel)

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. Set the Environment Variable:
   - `NEXT_PUBLIC_SITE_URL`: `https://your-production-domain.com`
4. Deploy. Vercel automatically runs `npm run build` and optimizes static assets.
