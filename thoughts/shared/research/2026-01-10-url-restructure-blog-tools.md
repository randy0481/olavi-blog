---
date: 2026-01-10T12:00:00-08:00
researcher: Claude
git_commit: ea8575a9868aa63e469102642562e9be25a68e4d
branch: main
repository: olavi-blog
topic: "URL Restructuring: Move Blog to /blog and Create /tools Section"
tags: [research, codebase, routing, seo, url-structure]
status: complete
last_updated: 2026-01-10
last_updated_by: Claude
last_updated_note: "Added follow-up research for subdomain vs subdirectory routing architecture"
---

# Research: URL Restructuring for /blog and /tools

**Date**: 2026-01-10T12:00:00-08:00
**Researcher**: Claude
**Git Commit**: ea8575a9868aa63e469102642562e9be25a68e4d
**Branch**: main
**Repository**: olavi-blog

## Research Question
How to restructure the blog to serve blog pages under `/blog` path and create a new `/tools` section for publicly accessible free tools (engineering as marketing).

## Summary

The current site serves blog posts at the root level (`/post-slug`). To restructure for `/blog` and `/tools`:

1. **Blog restructure**: Move `src/pages/[regular].astro` to `src/pages/blog/[slug].astro` and update all internal links
2. **Tools section**: Create `src/pages/tools/` directory with an index and individual tool pages
3. **Redirects**: Add 301 redirects in `netlify.toml` from old URLs to new `/blog/` URLs
4. **SEO**: Update canonical URLs, sitemap will auto-regenerate

## Current URL Structure

| Route | File | Current URL |
|-------|------|-------------|
| Homepage | `src/pages/index.astro` | `/` |
| Blog posts | `src/pages/[regular].astro` | `/{post-slug}` |
| Pagination | `src/pages/page/[slug].astro` | `/page/2`, `/page/3` |
| Categories | `src/pages/categories/[category].astro` | `/categories/{slug}` |
| Tags | `src/pages/tags/[tag].astro` | `/tags/{slug}` |
| Authors | `src/pages/authors/[single].astro` | `/authors/{slug}` |
| About | `src/pages/about.astro` | `/about` |
| Contact | `src/pages/contact.astro` | `/contact` |
| Search | `src/pages/search.astro` | `/search` |

## Detailed Findings

### 1. Blog Post Routing (`src/pages/[regular].astro`)

The catch-all route at `src/pages/[regular].astro:11-23` handles both posts and pages:

```typescript
export async function getStaticPaths() {
  const posts = await getSinglePage("posts");
  const pages = await getSinglePage("pages");
  const allPages = [...posts, ...pages];
  const paths = allPages.map((page) => ({
    params: {
      regular: page.id.replace(/\.(md|mdx)$/, ""),  // Line 18
    },
    props: { page },
  }));
  return paths;
}
```

**Key insight**: The `page.id` is the filename (e.g., `post-1.md`), and `.md`/`.mdx` is stripped to create the URL slug.

### 2. Post Listing & Pagination

**Homepage** (`src/pages/index.astro:9-12`):
- Fetches posts via `getSinglePage("posts")`
- Sorts by date, displays first 8 posts
- Pagination configured in `src/config/config.json:15` as `"pagination": 8`

**Pagination pages** (`src/pages/page/[slug].astro`):
- Serves `/page/2`, `/page/3`, etc.
- Page 1 is the homepage

### 3. Internal Link Patterns

Links to posts are generated in multiple places:

| File | Line | Pattern |
|------|------|---------|
| `src/layouts/Posts.astro` | 29 | `href={\`/${post.id}\`}` |
| `src/layouts/PostSingle.astro` | 42 | `/authors/${slugify(author.id)}` |
| `src/layouts/PostSingle.astro` | 71 | `/categories/${slugify(category)}` |
| `src/layouts/PostSingle.astro` | 110 | `/tags/${slugify(tag)}` |
| `src/layouts/components/SimilarPosts.astro` | 12 | `href={\`/${post.id}\`}` |

### 4. Content Collection Structure

Posts are stored in `src/content/posts/` with schema defined in `src/content.config.ts:43-56`:

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

### 5. Navigation Menu

Defined in `src/config/menu.json` - will need to be updated for new URL structure.

### 6. SEO Configuration

**Canonical URLs** (`src/layouts/Base.astro:100`):
```astro
{canonical && <link rel="canonical" href={canonical} item-prop="url" />}
```
- Currently supported but not actively used

**OG URL** (`src/layouts/Base.astro:120-123`):
```astro
<meta
  property="og:url"
  content={`${config.site.base_url}/${Astro.url.pathname.replace("/", "")}`}
/>
```

**Sitemap**: Auto-generated via `@astrojs/sitemap` integration in `astro.config.mjs:28`

### 7. Netlify Configuration

`netlify.toml` currently has NO redirect rules:

```toml
[build]
publish = "dist"
command = "yarn build"

[[headers]]
for = "/*"
[headers.values]
X-Frame-Options = "DENY"
# ... security headers
```

## Proposed New URL Structure

| Content Type | New URL | New File Location |
|--------------|---------|-------------------|
| Homepage | `/` | `src/pages/index.astro` (keep) |
| Blog listing | `/blog` | `src/pages/blog/index.astro` |
| Blog posts | `/blog/{slug}` | `src/pages/blog/[slug].astro` |
| Blog pagination | `/blog/page/2` | `src/pages/blog/page/[slug].astro` |
| Categories | `/blog/categories/{slug}` | `src/pages/blog/categories/[category].astro` |
| Tags | `/blog/tags/{slug}` | `src/pages/blog/tags/[tag].astro` |
| Tools index | `/tools` | `src/pages/tools/index.astro` |
| Individual tools | `/tools/{tool-slug}` | `src/pages/tools/[slug].astro` |

## Files to Modify

### Move/Create Files

1. **Create** `src/pages/blog/` directory
2. **Move** `src/pages/[regular].astro` → `src/pages/blog/[slug].astro`
3. **Move** `src/pages/page/[slug].astro` → `src/pages/blog/page/[slug].astro`
4. **Move** `src/pages/categories/` → `src/pages/blog/categories/`
5. **Move** `src/pages/tags/` → `src/pages/blog/tags/`
6. **Create** `src/pages/tools/index.astro`
7. **Create** `src/pages/tools/[slug].astro`
8. **Create** `src/content/tools/` for tool content (optional)

### Update Link Patterns

| File | Change Required |
|------|-----------------|
| `src/layouts/Posts.astro:29` | `/${post.id}` → `/blog/${post.id}` |
| `src/layouts/PostSingle.astro:71` | `/categories/` → `/blog/categories/` |
| `src/layouts/PostSingle.astro:110` | `/tags/` → `/blog/tags/` |
| `src/layouts/components/SimilarPosts.astro:12` | `/${post.id}` → `/blog/${post.id}` |
| `src/config/menu.json` | Update navigation links |
| `src/pages/index.astro` | Update to link to `/blog` |

### Add Redirects

Add to `netlify.toml`:

```toml
[[redirects]]
from = "/post-1"
to = "/blog/post-1"
status = 301

# Or use a wildcard pattern if possible
[[redirects]]
from = "/:slug"
to = "/blog/:slug"
status = 301
force = false  # Don't redirect if file exists at destination
```

**Note**: Wildcard redirects need careful ordering to not break `/about`, `/contact`, etc.

## Tools Section Architecture

### Option A: Static Pages (Simplest)
Create individual `.astro` files for each tool:
```
src/pages/tools/
├── index.astro           # Tool listing
├── keyword-analyzer.astro
├── meta-tag-generator.astro
└── ...
```

### Option B: Content Collection (Scalable)
Create a tools content collection for metadata + dynamic routing:
```
src/content/tools/
├── keyword-analyzer.md   # Tool metadata
├── meta-tag-generator.md
└── ...

src/pages/tools/
├── index.astro           # Lists all tools
└── [slug].astro          # Dynamic tool pages
```

### Option C: Hybrid (Recommended)
- Use content collection for tool metadata (title, description, category)
- Use React components in `src/layouts/tools/` for interactive functionality
- Keep tool logic separate from content

## Code References

- `src/pages/[regular].astro:11-23` - Current post routing logic
- `src/pages/page/[slug].astro:9-21` - Pagination generation
- `src/layouts/Posts.astro:29` - Post link generation
- `src/layouts/PostSingle.astro:71,110` - Category/tag links
- `src/config/config.json:15` - Pagination setting
- `src/content.config.ts:43-56` - Posts collection schema
- `netlify.toml:1-3` - Build configuration
- `astro.config.mjs:28` - Sitemap integration

## Architecture Insights

1. **File-based routing**: Astro uses filesystem for routes - moving files changes URLs automatically
2. **Content collections**: Decoupled from routing - posts stay in `src/content/posts/` regardless of URL
3. **Static generation**: All routes pre-built at build time via `getStaticPaths()`
4. **Centralized config**: Site settings in `src/config/config.json` - update once, applies everywhere
5. **No server-side routing**: Redirects must be handled by Netlify, not Astro

## Implementation Phases

### Phase 1: Blog Restructure
1. Create `src/pages/blog/` directory structure
2. Move routing files to new locations
3. Update all internal link patterns
4. Add redirects for existing posts in `netlify.toml`

### Phase 2: Tools Section
1. Create tools content collection schema
2. Create `src/pages/tools/` routing
3. Build first tool as proof of concept
4. Add tools to navigation

### Phase 3: SEO Cleanup
1. Verify sitemap regenerates correctly
2. Test all redirects
3. Submit updated sitemap to Google Search Console
4. Monitor 404s in Netlify analytics

## Open Questions

1. **Redirect strategy**: Use individual redirects per post, or wildcard with exclusions?
2. **Tools architecture**: Static pages vs content collection vs hybrid?
3. **Homepage content**: Should `/` show blog posts, or become a landing page with links to `/blog` and `/tools`?
4. **Authors location**: Keep at `/authors/` or move to `/blog/authors/`?

---

## Follow-up Research: Subdomain vs Subdirectory Routing (2026-01-10T22:55:00-08:00)

### Context
The main olavi.ai site is hosted on **Framer**. This Astro blog is deployed to **Netlify** at `blog.olavi.ai`. The question: should we keep the subdomain approach or route to `olavi.ai/blog` and `olavi.ai/tools`?

### Current Configuration

| Setting | Value |
|---------|-------|
| Site URL | `https://blog.olavi.ai` |
| Base Path | `/` |
| Hosting | Netlify |
| Main Site | Framer (olavi.ai) |

Files:
- `astro.config.mjs:22` - `site: "https://blog.olavi.ai"`
- `src/config/config.json:4` - `"base_url": "https://blog.olavi.ai"`

### Architecture Options

#### Option 1: Cloudflare Workers Reverse Proxy (RECOMMENDED for SEO)

**How it works:** Cloudflare Workers proxy requests from `olavi.ai/blog/*` and `olavi.ai/tools/*` to `blog.olavi.ai`.

**Pros:**
- **SEO benefit**: Subdirectories inherit main domain authority (30-40% traffic increase reported in case studies)
- Clean URLs (`olavi.ai/blog` instead of `blog.olavi.ai`)
- No changes needed to Framer
- Works regardless of hosting provider

**Cons:**
- Requires Cloudflare as DNS provider
- Need to maintain Worker scripts
- Small added latency

**Implementation:**
1. Move DNS to Cloudflare (if not already)
2. Create Worker script for reverse proxy
3. Configure routes for `/blog/*` and `/tools/*`
4. Update Astro config to use `olavi.ai` as base URL

#### Option 2: Keep Subdomain Structure (CURRENT - Simplest)

**How it works:** Keep blog at `blog.olavi.ai`, link from main site.

**Pros:**
- Already working
- No additional infrastructure
- Separate deployment pipelines
- Simplest to maintain

**Cons:**
- SEO disadvantage: subdomains treated as separate sites by Google
- Split domain authority
- Less cohesive branding

#### Option 3: Framer Proxy to Netlify (NOT SUPPORTED)

Framer does NOT support proxying outbound to external services. This is not viable.

### SEO Considerations

| Factor | Subdomain | Subdirectory |
|--------|-----------|--------------|
| Domain Authority | Split | Consolidated |
| Backlink Value | Split | Shared |
| Google Treatment | Separate site | Same site |
| Indexing Speed | Slower | Faster |
| Implementation | Simple | Complex |

**References:**
- [Cloudflare Blog](https://blog.cloudflare.com/subdomains-vs-subdirectories-best-practices-workers-part-1/)
- [Semrush Analysis](https://www.semrush.com/blog/subdomain-vs-subdirectory/)

### Recommendation

**For now: Keep the subdomain (`blog.olavi.ai`)**

Reasons:
1. Already working and deployed
2. URL restructure to `/blog` and `/tools` paths is complete
3. Cloudflare Workers setup adds complexity
4. Can migrate to subdirectory later if SEO becomes priority

**Future consideration:** If SEO performance is critical, implement Cloudflare Workers reverse proxy to serve at `olavi.ai/blog`.

### DNS Configuration (Current Setup)

For the subdomain approach to work:
1. `olavi.ai` → Framer (A record or CNAME to Framer)
2. `blog.olavi.ai` → Netlify (CNAME to `your-site.netlify.app`)

In your DNS provider:
```
Type    Name    Value
A       @       [Framer IP] or CNAME to Framer
CNAME   blog    your-site.netlify.app
```

### Files Updated by URL Restructure

The implementation moved all blog content to `/blog` prefix:

| Route | Old URL | New URL |
|-------|---------|---------|
| Blog listing | `/` | `/blog` |
| Blog posts | `/{slug}` | `/blog/{slug}` |
| Categories | `/categories/{slug}` | `/blog/categories/{slug}` |
| Tags | `/tags/{slug}` | `/blog/tags/{slug}` |
| Authors | `/authors/{slug}` | `/blog/authors/{slug}` |
| Tools | N/A | `/tools` |

This means the Astro site at `blog.olavi.ai` serves:
- `blog.olavi.ai/blog` - Blog listing
- `blog.olavi.ai/blog/post-slug` - Individual posts
- `blog.olavi.ai/tools` - Tools section

If this feels redundant (`blog.olavi.ai/blog`), alternatives:
1. Change Netlify subdomain to just `olavi-blog.netlify.app` (internal only)
2. Update to serve posts at root: `blog.olavi.ai/post-slug` (requires reverting URL restructure)

---

## Final Setup: Vercel + Framer + GoDaddy (2026-01-10T23:05:00-08:00)

### Architecture Decision
Moved from subdomain (`blog.olavi.ai`) to subdirectory (`olavi.ai/blog` and `olavi.ai/tools`) for SEO benefits.

### Tech Stack
- **Main site (olavi.ai)**: Framer
- **Blog & Tools**: Astro on Vercel
- **DNS**: GoDaddy

### How It Works
Framer proxies `/blog/*` and `/tools/*` requests to Vercel. This is configured in Framer's site settings.

### Step 1: Deploy to Vercel

1. Push this repo to GitHub (if not already)
2. Import project in Vercel Dashboard
3. Vercel auto-detects Astro framework
4. Note your Vercel deployment URL (e.g., `olavi-blog.vercel.app`)

### Step 2: Configure Framer Proxying

In Framer Site Settings → Hosting → Proxying:

| Path | Target URL |
|------|-----------|
| `/blog/*` | `https://olavi-blog.vercel.app/blog/*` |
| `/tools/*` | `https://olavi-blog.vercel.app/tools/*` |

This tells Framer to forward these paths to Vercel while keeping the `olavi.ai` domain visible to users.

### Step 3: GoDaddy DNS (Keep As-Is)

DNS should point to Framer. No changes needed if olavi.ai already works:

```
Type    Name    Value
A       @       [Framer IP addresses]
CNAME   www     [Framer CNAME target]
```

Remove the `blog` CNAME record if it exists (no longer needed).

### Step 4: Remove Custom Domain from Netlify

If `blog.olavi.ai` was configured in Netlify, remove it to avoid conflicts.

### Files Changed

| File | Change |
|------|--------|
| `src/config/config.json` | `base_url` → `https://olavi.ai` |
| `vercel.json` | Created with security headers |
| `netlify.toml` | Can be deleted (switching to Vercel) |

### Final URL Structure

| Content | URL |
|---------|-----|
| Main site | `olavi.ai` (Framer) |
| Blog listing | `olavi.ai/blog` (Vercel via Framer proxy) |
| Blog posts | `olavi.ai/blog/{slug}` |
| Categories | `olavi.ai/blog/categories/{slug}` |
| Tags | `olavi.ai/blog/tags/{slug}` |
| Authors | `olavi.ai/blog/authors/{slug}` |
| Tools | `olavi.ai/tools` |
| Individual tools | `olavi.ai/tools/{slug}` |

### Verification Checklist

After setup:
- [ ] `olavi.ai` loads Framer site
- [ ] `olavi.ai/blog` loads Astro blog listing
- [ ] `olavi.ai/blog/post-1` loads a blog post
- [ ] `olavi.ai/tools` loads tools page
- [ ] Sitemap at `olavi.ai/sitemap-index.xml` shows correct URLs
- [ ] OG meta tags show `olavi.ai` domain