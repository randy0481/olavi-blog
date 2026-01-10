---
date: 2026-01-11T00:15:00-08:00
researcher: Claude
git_commit: 17a516df7134a7b5e29e19c77a394be2b732d817
branch: main
repository: olavi-blog
topic: "Why olavi.ai root path shows blog instead of Framer homepage"
tags: [research, vercel, routing, rewrites, astro]
status: complete
last_updated: 2026-01-11
last_updated_by: Claude
---

# Research: Why olavi.ai Root Path Shows Blog Instead of Framer Homepage

**Date**: 2026-01-11T00:15:00-08:00
**Researcher**: Claude
**Git Commit**: 17a516df7134a7b5e29e19c77a394be2b732d817
**Branch**: main
**Repository**: olavi-blog

## Research Question

Why is `olavi.ai` showing the blog posts instead of the Framer homepage, even though `vercel.json` has a rewrite rule for `/` to proxy to Framer?

## Summary

**Root Cause**: Vercel serves static files BEFORE applying rewrites. Since Astro builds `src/pages/index.astro` to `dist/index.html`, this static file is served at `/` before the rewrite rule is ever evaluated.

**Key Finding**: This is documented Vercel behavior, not a bug. Static files always take precedence over rewrites.

## Detailed Findings

### 1. The Problem: Static File Priority

Vercel's order of precedence:
1. **Filesystem (static files)** - highest priority
2. Redirects
3. **Rewrites** - lower priority

From Vercel docs: "Precedence is given to the filesystem prior to rewrites being applied."

This means:
- `dist/index.html` exists (built from `src/pages/index.astro`)
- Vercel serves this file at `/`
- The rewrite rule `{ "source": "/", "destination": "https://framer.app/" }` is NEVER evaluated

### 2. Why `/content` Works But `/` Doesn't

- `/content` → No `dist/content/index.html` exists locally → rewrite applies → Framer loads
- `/` → `dist/index.html` exists → static file served → rewrite ignored

### 3. The Offending File

`src/pages/index.astro:1-22` generates blog listing at root:

```astro
---
import Posts from "@/layouts/Posts.astro";
const posts = await getSinglePage("posts");
// ... displays blog posts
---
<Base>
  <Posts posts={currentPosts} />
</Base>
```

This builds to `dist/index.html`, blocking the Framer rewrite.

## Solutions

### Solution A: Delete index.astro (Recommended)

Remove `src/pages/index.astro` so no `index.html` is generated at root.

**Pros:**
- Simplest fix
- Rewrite will work immediately
- No build script changes needed

**Cons:**
- Need to ensure blog is accessible at `/blog` (already exists)

### Solution B: Post-Build Script

Add a build script to delete `dist/index.html` after Astro builds:

```json
{
  "scripts": {
    "build": "astro build && rm -f dist/index.html"
  }
}
```

**Pros:**
- Keeps source file for reference
- More explicit about intent

**Cons:**
- Extra build step
- Could be confusing

### Solution C: Use Redirects (URL Changes)

```json
{
  "redirects": [
    {
      "source": "/",
      "destination": "https://authentic-humor-170672.framer.app/",
      "permanent": false
    }
  ]
}
```

**Pros:**
- Redirects have higher priority than filesystem

**Cons:**
- URL changes to Framer domain (visible to users)
- Not a true proxy - defeats SEO purpose

## Recommendation

**Use Solution A: Delete `src/pages/index.astro`**

Reasoning:
1. The blog is already at `/blog` - no need for root index
2. All root requests should proxy to Framer
3. Simplest and cleanest solution

## Code References

- `src/pages/index.astro:1-22` - Blog listing page that needs removal
- `vercel.json:6` - Rewrite rule that gets bypassed
- `src/pages/blog/index.astro` - Blog listing already exists at `/blog`

## Architecture Insights

Vercel's static-first approach is designed for performance (CDN caching), but creates friction for reverse proxy use cases where you want to proxy the root path to an external service.

For Astro specifically, rewrites to external URLs are not officially supported. The workaround is to ensure no static file exists at the path you want to rewrite.

## Related Research

- `thoughts/shared/research/2026-01-10-url-restructure-blog-tools.md` - Original URL restructure plan

## Open Questions

None - solution is clear.
