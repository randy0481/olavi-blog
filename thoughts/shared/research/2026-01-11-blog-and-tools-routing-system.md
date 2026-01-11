---
date: 2026-01-11T00:00:00-08:00
researcher: Claude
git_commit: 91476097bcaee721e6ee5c6ff5f7d24733f34914
branch: main
repository: olavi-blog
topic: "How does the blog system work and how to replicate it for /tools"
tags: [research, codebase, blog, tools, routing, astro, content-collections]
status: complete
last_updated: 2026-01-11
last_updated_by: Claude
---

# Research: Blog System Architecture and Tools Section Comparison

**Date**: 2026-01-11
**Researcher**: Claude
**Git Commit**: 91476097bcaee721e6ee5c6ff5f7d24733f34914
**Branch**: main
**Repository**: olavi-blog

## Research Question

How does the current codebase handle the /blog pages? And how does the process work of adding a new blog? Reason for asking is because we added a new /tools section which should operate in the same way, so we can easily create new /tools pages quickly.

## Summary

The blog system uses Astro's content collections with file-based routing. Posts are markdown files in `src/content/posts/` with frontmatter metadata. The routing is handled by 10 page files under `src/pages/blog/`. The tools section has a basic foundation (content collection schema, index page, single page) but lacks many features present in the blog system. To make tools work like blog, you'd need to add layouts, category pages, and pagination.

## Detailed Findings

### How the Blog System Works

#### 1. Content Collection (Schema Definition)

**File**: `src/content.config.ts:43-56`

```typescript
const postsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/posts" }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    date: z.date().optional(),
    image: z.string().optional(),
    categories: z.array(z.string()).default(["others"]),
    authors: z.array(z.string()).default(["Admin"]),
    tags: z.array(z.string()).default(["others"]),
    draft: z.boolean().optional(),
  }),
});
```

#### 2. Blog Routing Structure

| Route | File | Purpose |
|-------|------|---------|
| `/blog` | `src/pages/blog/index.astro` | First page of posts |
| `/blog/page/[2,3,...]` | `src/pages/blog/page/[slug].astro` | Pagination pages |
| `/blog/[post-slug]` | `src/pages/blog/[slug].astro` | Individual post |
| `/blog/categories` | `src/pages/blog/categories/index.astro` | All categories listing |
| `/blog/categories/[cat]` | `src/pages/blog/categories/[category].astro` | Posts by category |
| `/blog/tags` | `src/pages/blog/tags/index.astro` | All tags listing |
| `/blog/tags/[tag]` | `src/pages/blog/tags/[tag].astro` | Posts by tag |
| `/blog/authors` | `src/pages/blog/authors/index.astro` | All authors listing |
| `/blog/authors/[name]` | `src/pages/blog/authors/[single].astro` | Author profile + posts |
| `/blog/authors/page/[n]` | `src/pages/blog/authors/page/[slug].astro` | Authors pagination |

#### 3. Key Layouts

- **`src/layouts/PostSingle.astro`** - Single post layout with:
  - Author metadata with avatars
  - Date formatting
  - Category links
  - Featured image
  - Post content
  - Tag cloud
  - Share buttons (Facebook, Twitter, LinkedIn, Pinterest)
  - Similar posts section

- **`src/layouts/Posts.astro`** - Post listing grid with:
  - Responsive grid layout
  - Post cards with image, metadata, title, excerpt
  - First post can be featured (larger)
  - Author avatars and links

#### 4. Core Utility Functions

| Function | File | Purpose |
|----------|------|---------|
| `getSinglePage()` | `src/lib/contentParser.astro` | Fetches collection, filters drafts |
| `getTaxonomy()` | `src/lib/taxonomyParser.astro` | Extracts unique categories/tags |
| `taxonomyFilter()` | `src/lib/utils/taxonomyFilter.ts` | Filters posts by category/tag |
| `sortByDate()` | `src/lib/utils/sortFunctions.ts` | Sorts posts by date (newest first) |
| `similerItems()` | `src/lib/utils/similarItems.ts` | Finds related posts |
| `slugify()` | `src/lib/utils/textConverter.ts` | Creates URL-safe slugs |
| `humanize()` | `src/lib/utils/textConverter.ts` | Converts slug to readable text |
| `dateFormat()` | `src/lib/utils/dateFormat.ts` | Formats dates consistently |

### How to Add a New Blog Post

1. **Create markdown file**: `src/content/posts/your-post-slug.md`

2. **Add frontmatter**:
```yaml
---
title: "Your Post Title"
meta_title: ""
description: "A brief description for SEO"
date: 2026-01-11T05:00:00Z
image: "/images/posts/your-image.jpg"
categories: ["ai-search"]
authors: ["Randy Wattilete"]
tags: ["seo", "ai", "brand-visibility"]
draft: false
---
```

3. **Write content** in Markdown below the frontmatter

4. **Add image** to `public/images/posts/`

5. **Run dev server**: `npm run dev` - post appears automatically

### Current Tools Section State

#### What Exists

**Content Collection** (`src/content.config.ts:72-84`):
```typescript
const toolsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/tools" }),
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string(),
    image: z.string().optional(),
    category: z.string().default("general"),
    featured: z.boolean().default(false),
    draft: z.boolean().optional(),
    component: z.string(),  // Maps to React component
  }),
});
```

**Routing**:
- `src/pages/tools/index.astro` - Basic grid listing
- `src/pages/tools/[slug].astro` - Single tool page with dynamic component loading

**Components**:
- `src/layouts/tools/ExampleTool.tsx` - Sample React tool component

**Content**:
- `src/content/tools/example-tool.md` - One draft example

#### What's Missing (Compared to Blog)

| Feature | Blog Has | Tools Has |
|---------|----------|-----------|
| Pagination | Yes | No |
| Categories pages | Yes | No |
| Category filtering | Yes | No |
| Tags system | Yes | No |
| Rich single layout | PostSingle.astro | Inline in [slug].astro |
| Listing layout | Posts.astro | Inline in index.astro |
| Similar items | SimilarPosts.astro | No |
| Share buttons | Share.astro | No |
| Date sorting | Yes | No (no date field) |
| Author system | Yes | No |

### How to Add a New Tool (Current Process)

1. **Create markdown file**: `src/content/tools/your-tool-slug.md`

2. **Add frontmatter**:
```yaml
---
title: "Your Tool Name"
meta_title: ""
description: "Brief description of what the tool does"
image: "/images/tools/your-tool-image.jpg"
category: "general"
featured: false
draft: false
component: "YourToolComponent"
---
```

3. **Create React component**: `src/layouts/tools/YourToolComponent.tsx`

4. **Register component** in `src/pages/tools/[slug].astro`:
```typescript
const toolComponents: Record<string, any> = {
  ExampleTool: ExampleTool,
  YourToolComponent: YourToolComponent,  // Add this
};
```

5. **Run dev server**: `npm run dev`

## Architecture Insights

### Blog Architecture Strengths

1. **Separation of concerns**: Content (markdown) separate from presentation (layouts)
2. **Reusable components**: Posts.astro, SimilarPosts.astro, Pagination.astro
3. **Taxonomy system**: Categories and tags with dedicated pages
4. **SEO-friendly**: Meta titles, descriptions, structured URLs

### Tools Architecture Differences

1. **Interactive components**: Tools use React with `client:load` for interactivity
2. **Component registry**: Dynamic mapping of component names to imports
3. **Simpler schema**: No date, no tags, singular category
4. **Missing reusability**: Layouts inline in page files, not extracted

## Code References

- `src/content.config.ts:43-56` - Posts collection schema
- `src/content.config.ts:72-84` - Tools collection schema
- `src/pages/blog/index.astro` - Blog index with pagination
- `src/pages/blog/[slug].astro` - Individual post routing
- `src/pages/tools/index.astro` - Tools index (basic)
- `src/pages/tools/[slug].astro` - Individual tool routing
- `src/layouts/PostSingle.astro` - Rich single post layout
- `src/layouts/Posts.astro` - Reusable posts grid
- `src/layouts/components/Pagination.astro` - Pagination UI
- `src/layouts/components/SimilarPosts.astro` - Related posts
- `src/layouts/components/Share.astro` - Social sharing
- `src/lib/contentParser.astro` - Content fetching utilities
- `src/lib/taxonomyParser.astro` - Taxonomy extraction
- `src/config/config.json:15-16` - Pagination (8) and summary_length (160) settings

## Recommendations for Tools Section

To make tools work like blog posts:

### Option A: Minimal Enhancement
1. Add `date` field to tools schema for sorting
2. Create `src/layouts/Tools.astro` (similar to Posts.astro)
3. Create `src/layouts/ToolSingle.astro` (similar to PostSingle.astro)
4. Add pagination to tools index

### Option B: Full Feature Parity
1. All of Option A, plus:
2. Add `tags` array to tools schema
3. Create category pages (`src/pages/tools/categories/[category].astro`)
4. Create tag pages (`src/pages/tools/tags/[tag].astro`)
5. Add similar tools component
6. Add tools pagination config to `config.json`

### Key Insight
The current tools architecture uses a **component registry pattern** where each tool has an associated React component. This is different from blog posts which are purely content. When enhancing tools, preserve this pattern while adding the blog-like listing/categorization features.

## Open Questions

1. Should tools have authors like blog posts?
2. Should tools have a date field for "newest tools" sorting?
3. Should the `component` field become optional for informational tools?
4. What categories make sense for tools? (e.g., "seo", "analytics", "content")
