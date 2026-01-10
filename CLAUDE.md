# Olavi Blog - Claude Code Configuration

This is the Olavi Blog, a technical blog for Olavi AI focused on AI Brand Visibility in Generative Search. It's built with Astro 5 and deployed to Netlify at blog.olavi.ai.

## Quick Reference

```bash
# Development
npm run dev          # Start dev server (localhost:4321)
npm run build        # Production build
npm run preview      # Preview production build
npm run format       # Format code with Prettier

# Deployment
# Automatic via Netlify on push to main
```

## Tech Stack

- **Framework**: Astro 5.8.0 (static site generator)
- **UI**: React 19 for interactive components
- **Styling**: Tailwind CSS 4.1 with Typography & Forms plugins
- **Content**: MDX/Markdown with frontmatter via Astro Content Collections
- **Search**: Fuse.js for client-side fuzzy search
- **Deployment**: Netlify (configured in `netlify.toml`)
- **Package Manager**: Yarn

## Project Structure

```
olavi-blog/
├── src/
│   ├── content/           # Content collections (MDX/MD files)
│   │   ├── posts/         # Blog posts
│   │   ├── authors/       # Author profiles
│   │   ├── pages/         # Static pages
│   │   └── about/         # About page content
│   ├── layouts/           # Astro layouts & components
│   │   ├── Base.astro     # Root HTML layout
│   │   ├── PostSingle.astro # Single post layout
│   │   ├── Posts.astro    # Posts listing layout
│   │   ├── components/    # Reusable Astro components
│   │   ├── partials/      # Header, Footer
│   │   └── shortcodes/    # MDX shortcodes (React)
│   ├── pages/             # File-based routing
│   ├── lib/               # Utilities and helpers
│   │   └── utils/         # Utility functions
│   ├── config/            # Site configuration (JSON)
│   └── styles/            # Global styles (CSS/SCSS)
├── public/                # Static assets
├── .claude/               # Claude Code configuration
│   ├── commands/          # Slash commands
│   └── agents/            # Sub-agents
└── thoughts/              # Research, plans, handoffs
    └── shared/
```

## Content Collections

Defined in `src/content.config.ts`:

### Posts Collection
```typescript
{
  title: string;
  meta_title?: string;
  description?: string;
  date?: Date;
  image?: string;
  categories: string[];
  authors: string[];
  tags: string[];
  draft?: boolean;
}
```

### Authors Collection
```typescript
{
  title: string;
  meta_title?: string;
  image?: string;
  description?: string;
  social?: { facebook?, twitter?, instagram? };
}
```

## Coding Conventions

### Astro Components (.astro)
- Frontmatter script in `---` fences at top
- Use Astro's built-in `<Image>` component for optimized images
- Props interface defined in frontmatter
- Use `set:html` directive for markdown content

### React Components (.tsx)
- Functional components with TypeScript
- Located in `src/layouts/shortcodes/` for MDX use
- Use React Icons (`react-icons`) for icons

### Styling
- Tailwind CSS utility classes
- Global styles in `src/styles/main.css`
- Theme configuration in `src/config/theme.json`
- Custom Tailwind plugin in `src/tailwind-plugin/`

### Path Aliases
```typescript
"@/components/*" -> "./src/layouts/components/*"
"@/shortcodes/*" -> "./src/layouts/shortcodes/*"
"@/helpers/*"    -> "./src/layouts/helpers/*"
"@/partials/*"   -> "./src/layouts/partials/*"
"@/*"            -> "./src/*"
```

## Key Files

| File | Purpose |
|------|---------|
| `src/config/config.json` | Site metadata, settings |
| `src/config/menu.json` | Navigation menu |
| `src/config/social.json` | Social links |
| `src/config/theme.json` | Theme/font settings |
| `src/content.config.ts` | Content collection schemas |
| `astro.config.mjs` | Astro configuration |
| `netlify.toml` | Netlify deployment config |

## Common Tasks

### Adding a New Blog Post
1. Create `src/content/posts/your-post-slug.md`
2. Add frontmatter with required fields (title, date, categories, tags, authors)
3. Write content in Markdown/MDX
4. Add images to `public/images/posts/`

### Adding a New Author
1. Create `src/content/authors/author-slug.md`
2. Add frontmatter (title, image, description, social)
3. Add author image to `public/images/authors/`

### Using MDX Shortcodes
Available shortcodes (auto-imported):
- `<Button>` - Call-to-action buttons
- `<Accordion>` - Collapsible content
- `<Notice>` - Alert/info boxes
- `<Video>` - Video embeds
- `<Youtube>` - YouTube embeds
- `<Tabs>` / `<Tab>` - Tabbed content

### Modifying Navigation
Edit `src/config/menu.json` to update main/footer navigation.

## Utilities

### Auto-Interlinking (`src/lib/utils/autoInterlinking.ts`)
- `findRelatedPosts()` - Find posts by matching categories/tags
- `injectInContentLinks()` - Add related article links
- `injectContextualLinks()` - Auto-link post titles in content

### Text Conversion (`src/lib/utils/textConverter.ts`)
- `slugify()` - Convert to URL-safe slug
- `humanize()` - Convert slug to human-readable
- `markdownify()` - Parse inline markdown
- `plainify()` - Strip HTML/markdown

## SEO & Meta

- OG/Twitter meta tags in `Base.astro`
- Sitemap auto-generated via `@astrojs/sitemap`
- Robots.txt in `public/robots.txt`
- Meta description from `config.json` or per-page

## Important Notes

1. **Images**: Always use `astro:assets` Image component for optimization
2. **Dates**: Use ISO format in frontmatter (YYYY-MM-DD)
3. **Categories/Tags**: Use lowercase, hyphenated slugs
4. **Drafts**: Set `draft: true` to hide from production
5. **Build**: Run `npm run build` to verify before deploying

## RPI Framework

This project uses the Research-Plan-Implement (RPI) framework for structured development:

### Slash Commands
- `/research_codebase` - Deep codebase exploration
- `/create_plan` - Create implementation plans
- `/implement_plan` - Execute plans phase by phase
- `/create_handoff` - Save session state
- `/resume_handoff` - Continue from saved state

### Directory Structure
```
thoughts/shared/
├── research/    # Codebase research findings
├── plans/       # Implementation plans
├── handoffs/    # Session handoff documents
└── tickets/     # Task definitions
```

### Workflow
1. Research before coding: `/research_codebase`
2. Plan changes: `/create_plan`
3. Implement: `/implement_plan thoughts/shared/plans/[plan-file].md`
4. Validate: `/validate_plan`
5. Commit: `/commit`

## Testing Checklist

Before committing:
- [ ] `npm run build` completes without errors
- [ ] `npm run format` applied
- [ ] Dev server works: `npm run dev`
- [ ] New content renders correctly
- [ ] Images are optimized and display properly
- [ ] No TypeScript errors
- [ ] SEO meta tags present on new pages
