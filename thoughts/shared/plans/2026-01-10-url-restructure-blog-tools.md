# URL Restructure: /blog and /tools Implementation Plan

## Overview

Restructure the Olavi blog URL structure to:
1. Move all blog content under `/blog` path
2. Create a new `/tools` section for free marketing tools

**Note**: Homepage is handled by Framer (not this repo). No redirects needed (new site with no existing backlinks).

## Current State Analysis

**Current URL Structure:**
- Blog posts: `/{slug}` (e.g., `/post-1`)
- Categories: `/categories/{slug}`
- Tags: `/tags/{slug}`
- Authors: `/authors/{slug}`
- Pagination: `/page/2`, `/page/3`

**Existing Posts (7 total):**
- post-1, post-2, post-3, post-4, post-5, post-6, post-7

**Key Files:**
- `src/pages/[regular].astro` - Catch-all route for posts/pages
- `src/pages/page/[slug].astro` - Pagination
- `src/pages/categories/` - Category routes
- `src/pages/tags/` - Tag routes
- `src/pages/authors/` - Author routes
- `src/layouts/Posts.astro` - Post listing with links
- `src/layouts/PostSingle.astro` - Single post with links
- `src/layouts/components/SimilarPosts.astro` - Similar posts links
- `src/layouts/components/Pagination.astro` - Already supports `section` prop

## Desired End State

**New URL Structure:**
| Content | Old URL | New URL |
|---------|---------|---------|
| Blog listing | `/` | `/blog` |
| Blog posts | `/{slug}` | `/blog/{slug}` |
| Pagination | `/page/2` | `/blog/page/2` |
| Categories | `/categories/{slug}` | `/blog/categories/{slug}` |
| Tags | `/tags/{slug}` | `/blog/tags/{slug}` |
| Authors | `/authors/{slug}` | `/blog/authors/{slug}` |
| Tools listing | - | `/tools` |
| Individual tools | - | `/tools/{slug}` |

**Verification:**
- `npm run build` completes without errors
- All internal links point to `/blog/` prefixed URLs
- Sitemap contains new URLs
- Tools section accessible at `/tools`

## What We're NOT Doing

- Not changing content collection locations (`src/content/posts/` stays)
- Not modifying post frontmatter
- Not changing the search functionality (will work automatically)
- Not building actual tools yet (just the infrastructure)
- Not modifying homepage (handled by Framer, not this repo)
- Not adding 301 redirects (new site with no existing backlinks)

## Implementation Approach

1. **Phase 1**: Create blog directory structure and move routing files
2. **Phase 2**: Update all internal link patterns
3. **Phase 3**: Create tools content collection and routing
4. **Phase 4**: Update navigation menu

---

## Phase 1: Blog Directory Structure

### Overview
Create the `/blog` directory structure and move existing routing files.

### Changes Required:

#### 1. Create blog directory structure
```bash
mkdir -p src/pages/blog/page
mkdir -p src/pages/blog/categories
mkdir -p src/pages/blog/tags
mkdir -p src/pages/blog/authors/page
```

#### 2. Create blog index page
**File**: `src/pages/blog/index.astro`
**Action**: Create new file (copy from current index.astro with modifications)

```astro
---
import config from "@/config/config.json";
import Base from "@/layouts/Base.astro";
import Pagination from "@/layouts/components/Pagination.astro";
import Posts from "@/layouts/Posts.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import { sortByDate } from "@/lib/utils/sortFunctions";

const posts = await getSinglePage("posts");
const sortedPosts = sortByDate(posts);
const totalPages = Math.ceil(posts.length / config.settings.pagination);
const currentPosts = sortedPosts.slice(0, config.settings.pagination);
---

<Base title="Blog | Olavi" description="Insights on AI Brand Visibility in Generative Search">
  <section class="section">
    <div class="container">
      <h1 class="h2 mb-8 text-center">Blog</h1>
      <Posts posts={currentPosts} className="mb-16" />
      <Pagination section="blog" currentPage={1} totalPages={totalPages} />
    </div>
  </section>
</Base>
```

#### 3. Create blog post route
**File**: `src/pages/blog/[slug].astro`
**Action**: Create new file (adapted from [regular].astro, posts only)

```astro
---
import Base from "@/layouts/Base.astro";
import PostSingle from "@/layouts/PostSingle.astro";
import { getSinglePage } from "@/lib/contentParser.astro";

export async function getStaticPaths() {
  const posts = await getSinglePage("posts");

  const paths = posts.map((post) => ({
    params: {
      slug: post.id.replace(/\.(md|mdx)$/, ""),
    },
    props: { post },
  }));
  return paths;
}

const { post } = Astro.props;
const { title, meta_title, description, image } = post.data;
---

<Base
  title={title}
  meta_title={meta_title}
  description={description}
  image={image}
>
  <PostSingle post={post} />
</Base>
```

#### 4. Create blog pagination route
**File**: `src/pages/blog/page/[slug].astro`
**Action**: Create new file

```astro
---
import config from "@/config/config.json";
import Base from "@/layouts/Base.astro";
import Pagination from "@/layouts/components/Pagination.astro";
import Posts from "@/layouts/Posts.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import { sortByDate } from "@/lib/utils/sortFunctions";

export async function getStaticPaths() {
  const posts = await getSinglePage("posts");
  const totalPages = Math.ceil(posts.length / config.settings.pagination);
  const paths = [];

  for (let i = 1; i < totalPages; i++) {
    paths.push({
      params: {
        slug: (i + 1).toString(),
      },
    });
  }
  return paths;
}

const { slug } = Astro.params;
const posts = await getSinglePage("posts");
const sortedPosts = sortByDate(posts);
const totalPages = Math.ceil(posts.length / config.settings.pagination);
const currentPage = slug && !isNaN(Number(slug)) ? Number(slug) : 1;
const indexOfLastPost = currentPage * config.settings.pagination;
const indexOfFirstPost = indexOfLastPost - config.settings.pagination;
const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
---

<Base title={`Blog - Page ${currentPage}`}>
  <section class="section">
    <div class="container">
      <h1 class="h2 mb-8 text-center">Blog</h1>
      <Posts className="mb-16" posts={currentPosts} />
      <Pagination section="blog" totalPages={totalPages} currentPage={currentPage} />
    </div>
  </section>
</Base>
```

#### 5. Move categories routes
**File**: `src/pages/blog/categories/index.astro`
**Action**: Copy from `src/pages/categories/index.astro`, update links to `/blog/categories/`

**File**: `src/pages/blog/categories/[category].astro`
**Action**: Copy from `src/pages/categories/[category].astro`

#### 6. Move tags routes
**File**: `src/pages/blog/tags/index.astro`
**Action**: Copy from `src/pages/tags/index.astro`, update links to `/blog/tags/`

**File**: `src/pages/blog/tags/[tag].astro`
**Action**: Copy from `src/pages/tags/[tag].astro`

#### 7. Move authors routes
**File**: `src/pages/blog/authors/index.astro`
**Action**: Copy from `src/pages/authors/index.astro`, update section to `blog/authors`

**File**: `src/pages/blog/authors/[single].astro`
**Action**: Copy from `src/pages/authors/[single].astro`

**File**: `src/pages/blog/authors/page/[slug].astro`
**Action**: Copy from `src/pages/authors/page/[slug].astro` (if exists)

#### 8. Update [regular].astro for pages only
**File**: `src/pages/[regular].astro`
**Action**: Modify to handle only pages (not posts)

```astro
---
import Base from "@/layouts/Base.astro";
import Default from "@/layouts/Default.astro";
import { getSinglePage } from "@/lib/contentParser.astro";

export async function getStaticPaths() {
  const pages = await getSinglePage("pages");

  const paths = pages.map((page) => ({
    params: {
      regular: page.id.replace(/\.(md|mdx)$/, ""),
    },
    props: { page },
  }));
  return paths;
}

const { page } = Astro.props;
const { title, meta_title, description, image } = page.data;
---

<Base
  title={title}
  meta_title={meta_title}
  description={description}
  image={image}
>
  <Default data={page} />
</Base>
```

#### 9. Delete old routing directories
**Action**: Remove after verifying new routes work
- Delete `src/pages/page/` directory
- Delete `src/pages/categories/` directory
- Delete `src/pages/tags/` directory
- Delete `src/pages/authors/` directory

### Success Criteria:

#### Automated Verification:
- [x] `npm run build` completes without errors
- [x] Blog pages generate at `/blog/` path
- [x] Category pages generate at `/blog/categories/` path
- [x] Tag pages generate at `/blog/tags/` path
- [x] Author pages generate at `/blog/authors/` path

#### Manual Verification:
- [ ] `/blog` shows blog listing
- [ ] `/blog/post-1` shows individual post
- [ ] `/blog/page/2` shows pagination
- [ ] `/blog/categories/art` shows category posts
- [ ] `/blog/tags/diy` shows tag posts

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to Phase 2.

---

## Phase 2: Update Internal Link Patterns

### Overview
Update all internal links to use the new `/blog` prefix.

### Changes Required:

#### 1. Update Posts.astro
**File**: `src/layouts/Posts.astro`

**Line 29**: Change post link
```astro
<!-- Old -->
href={`/${post.id}`}
<!-- New -->
href={`/blog/${post.id}`}
```

**Line 51**: Change author link
```astro
<!-- Old -->
href={`/authors/${slugify(author.data.title)}`}
<!-- New -->
href={`/blog/authors/${slugify(author.data.title)}`}
```

**Line 78**: Change category link
```astro
<!-- Old -->
href={`/categories/${slugify(category)}`}
<!-- New -->
href={`/blog/categories/${slugify(category)}`}
```

**Line 91**: Change post title link
```astro
<!-- Old -->
href={`/${post.id}`}
<!-- New -->
href={`/blog/${post.id}`}
```

#### 2. Update PostSingle.astro
**File**: `src/layouts/PostSingle.astro`

**Line 42**: Change author link
```astro
<!-- Old -->
href={`/authors/${slugify(author.id)}`}
<!-- New -->
href={`/blog/authors/${slugify(author.id)}`}
```

**Line 71**: Change category link
```astro
<!-- Old -->
href={`/categories/${slugify(category)}`}
<!-- New -->
href={`/blog/categories/${slugify(category)}`}
```

**Line 110**: Change tag link
```astro
<!-- Old -->
href={`/tags/${slugify(tag)}`}
<!-- New -->
href={`/blog/tags/${slugify(tag)}`}
```

#### 3. Update SimilarPosts.astro
**File**: `src/layouts/components/SimilarPosts.astro`

**Line 20**: Change post image link
```astro
<!-- Old -->
href={`/${post.id}`}
<!-- New -->
href={`/blog/${post.id}`}
```

**Line 44**: Change category link
```astro
<!-- Old -->
href={`/categories/${slugify(category)}`}
<!-- New -->
href={`/blog/categories/${slugify(category)}`}
```

**Line 57**: Change post title link
```astro
<!-- Old -->
href={`/${post.id}`}
<!-- New -->
href={`/blog/${post.id}`}
```

#### 4. Update blog/authors/[single].astro
**File**: `src/pages/blog/authors/[single].astro`

**Line 58**: Change post image link
```astro
<!-- Old -->
href={`/${post.id}`}
<!-- New -->
href={`/blog/${post.id}`}
```

**Line 82**: Change category link
```astro
<!-- Old -->
href={`/categories/${slugify(category)}`}
<!-- New -->
href={`/blog/categories/${slugify(category)}`}
```

**Line 95**: Change post title link
```astro
<!-- Old -->
href={`/${post.id}`}
<!-- New -->
href={`/blog/${post.id}`}
```

### Success Criteria:

#### Automated Verification:
- [x] `npm run build` completes without errors
- [x] `grep -r "href={\`/\${post" src/` returns no matches (all updated)
- [x] `grep -r 'href=`/categories/' src/` returns no matches
- [x] `grep -r 'href=`/tags/' src/` returns no matches
- [x] `grep -r 'href=`/authors/' src/` returns no matches

#### Manual Verification:
- [ ] Click post links on `/blog` - navigate to `/blog/{slug}`
- [ ] Click category links - navigate to `/blog/categories/{slug}`
- [ ] Click tag links - navigate to `/blog/tags/{slug}`
- [ ] Click author links - navigate to `/blog/authors/{slug}`
- [ ] Similar posts links work correctly

**Implementation Note**: Phase 2 automated verification complete.

---

## Phase 3: Tools Content Collection and Routing

### Overview
Create the tools infrastructure using Astro content collections for scalability.

### Changes Required:

#### 1. Add tools content collection schema
**File**: `src/content.config.ts`
**Action**: Add toolsCollection after postsCollection

```typescript
// Tools collection schema
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
    component: z.string(), // React component name to render
  }),
});

// Update exports
export const collections = {
  posts: postsCollection,
  about: aboutCollection,
  authors: authorsCollection,
  pages: pagesCollection,
  tools: toolsCollection, // Add this
};
```

#### 2. Create tools content directory
```bash
mkdir -p src/content/tools
```

#### 3. Create placeholder tool content
**File**: `src/content/tools/example-tool.md`

```markdown
---
title: "Example Tool"
description: "This is a placeholder for your first tool"
category: "general"
featured: true
draft: true
component: "ExampleTool"
---

This tool will help you...
```

#### 4. Create tools index page
**File**: `src/pages/tools/index.astro`

```astro
---
import Base from "@/layouts/Base.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import { Image } from "astro:assets";

const tools = await getSinglePage("tools");
const publishedTools = tools.filter((tool) => !tool.data.draft);
---

<Base
  title="Free Marketing Tools | Olavi"
  description="Free tools to help optimize your brand visibility in AI-powered search"
>
  <section class="section">
    <div class="container">
      <div class="text-center mb-12">
        <h1 class="h2 mb-4">Free Marketing Tools</h1>
        <p class="text-lg text-text max-w-2xl mx-auto">
          Powerful tools to help you optimize your brand visibility in AI-powered search engines like ChatGPT, Perplexity, and Gemini.
        </p>
      </div>

      {publishedTools.length > 0 ? (
        <div class="row gy-5 gx-4">
          {publishedTools.map((tool) => (
            <div class="col-12 sm:col-6 lg:col-4">
              <a
                href={`/tools/${tool.id.replace(/\.(md|mdx)$/, "")}`}
                class="block p-6 rounded-lg border border-border hover:border-primary transition duration-300 h-full"
              >
                <h3 class="h4 mb-2">{tool.data.title}</h3>
                <p class="text-text">{tool.data.description}</p>
                <span class="inline-block mt-4 text-primary font-medium">
                  Try it free →
                </span>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div class="text-center py-12">
          <p class="text-text text-lg">Tools coming soon! Check back later.</p>
        </div>
      )}
    </div>
  </section>
</Base>
```

#### 5. Create individual tool page route
**File**: `src/pages/tools/[slug].astro`

```astro
---
import Base from "@/layouts/Base.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import { render } from "astro:content";

export async function getStaticPaths() {
  const tools = await getSinglePage("tools");

  const paths = tools.map((tool) => ({
    params: {
      slug: tool.id.replace(/\.(md|mdx)$/, ""),
    },
    props: { tool },
  }));
  return paths;
}

const { tool } = Astro.props;
const { title, meta_title, description, image, component } = tool.data;
const { Content } = await render(tool);
---

<Base
  title={title}
  meta_title={meta_title}
  description={description}
  image={image}
>
  <section class="section">
    <div class="container">
      <div class="text-center mb-8">
        <h1 class="h2 mb-4">{title}</h1>
        <p class="text-lg text-text max-w-2xl mx-auto">{description}</p>
      </div>

      <!-- Tool component will be rendered here -->
      <div class="tool-container max-w-4xl mx-auto">
        <!-- Placeholder for React tool component -->
        <div class="bg-light rounded-lg p-8 text-center">
          <p class="text-text">Tool interface: {component}</p>
          <p class="text-sm text-gray-500 mt-2">React component will be loaded here</p>
        </div>
      </div>

      <!-- Tool description/documentation -->
      <div class="content mt-12 max-w-3xl mx-auto">
        <Content />
      </div>
    </div>
  </section>
</Base>
```

#### 6. Create tools React component directory
```bash
mkdir -p src/layouts/tools
```

#### 7. Create example tool component placeholder
**File**: `src/layouts/tools/ExampleTool.tsx`

```tsx
import React from "react";

export default function ExampleTool() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Example Tool</h3>
      <p className="text-gray-600">
        This is a placeholder for your tool's interactive interface.
      </p>
    </div>
  );
}
```

### Success Criteria:

#### Automated Verification:
- [x] `npm run build` completes without errors
- [x] Tools collection is recognized by Astro
- [x] `/tools` page generates successfully

#### Manual Verification:
- [ ] `/tools` shows tools listing page
- [ ] Tools listing shows "coming soon" message (example tool is draft)

**Implementation Note**: Phase 3 automated verification complete.

---

## Phase 4: Update Navigation Menu

### Overview
Update the navigation menu to reflect new URL structure.

### Changes Required:

#### 1. Update menu.json
**File**: `src/config/menu.json`

```json
{
  "main": [
    {
      "name": "Home",
      "url": "/"
    },
    {
      "name": "Blog",
      "url": "/blog"
    },
    {
      "name": "Tools",
      "url": "/tools"
    },
    {
      "name": "About",
      "url": "/about"
    },
    {
      "name": "Contact",
      "url": "/contact"
    }
  ],
  "footer": [
    {
      "name": "Blog",
      "url": "/blog"
    },
    {
      "name": "Tools",
      "url": "/tools"
    },
    {
      "name": "About",
      "url": "/about"
    },
    {
      "name": "Contact",
      "url": "/contact"
    },
    {
      "name": "Privacy Policy",
      "url": "/privacy-policy"
    }
  ]
}
```

### Success Criteria:

#### Automated Verification:
- [x] `npm run build` completes without errors
- [x] menu.json is valid JSON

#### Manual Verification:
- [ ] Navigation shows Blog and Tools links
- [ ] Blog link navigates to `/blog`
- [ ] Tools link navigates to `/tools`
- [ ] Footer links work correctly

**Implementation Note**: Phase 4 automated verification complete.

---

## Testing Strategy

### Unit Tests:
- Content collections load correctly
- Tools collection schema validates properly

### Integration Tests:
- All blog routes resolve correctly
- All tool routes resolve correctly
- Pagination works for both sections

### Manual Testing Steps:
1. Navigate through all blog pages
2. Test all internal links
3. Check sitemap.xml for new URLs
4. Test on mobile devices

## Performance Considerations

- Static generation ensures fast page loads
- Image optimization handled by Astro
- No additional runtime overhead from URL change

## Migration Notes

- Existing RSS feeds (if any) should be updated
- Consider submitting sitemap to Google Search Console after deploy

## References

- Research document: `thoughts/shared/research/2026-01-10-url-restructure-blog-tools.md`
- Astro routing docs: https://docs.astro.build/en/guides/routing/