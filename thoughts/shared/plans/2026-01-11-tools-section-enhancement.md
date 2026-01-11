# Tools Section Enhancement Implementation Plan

## Overview

Enhance the `/tools` section to follow the same patterns as `/blog`, making it easy to add new tools quickly. We'll create reusable layout components and add pagination while preserving the existing React component registry pattern.

## Current State Analysis

**What exists:**
- Content collection schema in `src/content.config.ts:72-84` with: title, meta_title, description, image, category, featured, draft, component
- Basic index page at `src/pages/tools/index.astro` (inline grid layout)
- Single tool page at `src/pages/tools/[slug].astro` (inline layout with component registry)
- Example tool component at `src/layouts/tools/ExampleTool.tsx`
- One draft example at `src/content/tools/example-tool.md`

**What's missing:**
- Reusable `Tools.astro` layout (like `Posts.astro`)
- Reusable `ToolSingle.astro` layout (like `PostSingle.astro`)
- Pagination for tools listing
- Pagination page route (`/tools/page/[slug].astro`)

## Desired End State

After implementation:
1. Adding a new tool requires only:
   - Create markdown file in `src/content/tools/`
   - Create React component in `src/layouts/tools/`
   - Add component to registry (one line)
2. Tools index shows paginated grid with proper cards
3. Single tool pages have consistent, polished layout
4. Pagination works exactly like blog (`/tools`, `/tools/page/2`, etc.)

**Verification:**
- `npm run build` completes without errors
- `/tools` shows tool cards in grid
- `/tools/page/2` works when enough tools exist
- Individual tool pages render correctly with interactive components

## What We're NOT Doing

- No category pages (`/tools/categories/[category]`)
- No tags system
- No date field or date-based sorting
- No similar tools component
- No share buttons
- No author system for tools

## Implementation Approach

1. Create reusable layouts first (modeled on blog equivalents)
2. Update page files to use new layouts
3. Add pagination route
4. Keep component registry pattern intact

---

## Phase 1: Create Tools Listing Layout

### Overview
Create `Tools.astro` - a reusable component for displaying tool cards in a grid, similar to `Posts.astro`.

### Changes Required:

#### 1. Create Tools.astro Layout
**File**: `src/layouts/Tools.astro` (new file)

```astro
---
import config from "@/config/config.json";
import { humanize } from "@/lib/utils/textConverter";
import { Image } from "astro:assets";
import type { CollectionEntry } from "astro:content";

type Props = {
  tools: CollectionEntry<"tools">[];
  className?: string;
};

const { summary_length } = config.settings;
const { className, tools } = Astro.props;

// Sort: featured first, then alphabetically by title
const sortedTools = [...tools].sort((a, b) => {
  if (a.data.featured && !b.data.featured) return -1;
  if (!a.data.featured && b.data.featured) return 1;
  return a.data.title.localeCompare(b.data.title);
});
---

<div
  class={`row gy-5 gx-4 ${className} ${sortedTools.length === 1 ? "justify-center" : ""}`}
>
  {
    sortedTools.map((tool) => (
      <div class="col-12 sm:col-6 lg:col-4">
        <a
          href={`/tools/${tool.id.replace(/\.(md|mdx)$/, "")}`}
          class="block h-full rounded-lg border border-border hover:border-primary transition duration-300 overflow-hidden group"
        >
          {tool.data.image && (
            <div class="overflow-hidden">
              <Image
                class="group-hover:scale-[1.03] transition duration-300 w-full"
                src={tool.data.image}
                alt={tool.data.title}
                width={445}
                height={230}
              />
            </div>
          )}
          <div class="p-6">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xs font-medium px-2 py-1 rounded bg-theme-light text-text">
                {humanize(tool.data.category)}
              </span>
              {tool.data.featured && (
                <span class="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                  Featured
                </span>
              )}
            </div>
            <h3 class="h4 mb-2 group-hover:text-primary transition duration-300">
              {tool.data.title}
            </h3>
            <p class="text-text text-sm mb-4">
              {tool.data.description.slice(0, summary_length)}
              {tool.data.description.length > summary_length && "..."}
            </p>
            <span class="inline-block text-primary font-medium text-sm">
              Try it free →
            </span>
          </div>
        </a>
      </div>
    ))
  }
</div>
```

### Success Criteria:

#### Automated Verification:
- [x] File exists at `src/layouts/Tools.astro`
- [x] No TypeScript errors: `npm run build` passes
- [x] Imports resolve correctly

#### Manual Verification:
- [ ] Layout renders tool cards correctly when used

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the layout looks correct before proceeding to the next phase.

---

## Phase 2: Create Tool Single Layout

### Overview
Create `ToolSingle.astro` - a reusable component for individual tool pages, similar to `PostSingle.astro` but preserving the React component integration.

### Changes Required:

#### 1. Create ToolSingle.astro Layout
**File**: `src/layouts/ToolSingle.astro` (new file)

```astro
---
import { humanize } from "@/lib/utils/textConverter";
import { Image } from "astro:assets";
import type { CollectionEntry } from "astro:content";

type Props = {
  tool: CollectionEntry<"tools">;
  ToolComponent?: any;
  Content: any;
};

const { tool, ToolComponent, Content } = Astro.props;
const { title, description, image, category, featured } = tool.data;
---

<section class="section">
  <div class="container">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="flex items-center justify-center gap-2 mb-4">
        <span class="text-sm font-medium px-3 py-1 rounded-full bg-theme-light text-text">
          {humanize(category)}
        </span>
        {featured && (
          <span class="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
            Featured
          </span>
        )}
      </div>
      <h1 class="h2 mb-4">{title}</h1>
      <p class="text-lg text-text max-w-2xl mx-auto">{description}</p>
    </div>

    <!-- Featured Image -->
    {image && (
      <div class="mb-8 rounded-lg overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={1000}
          height={500}
          class="w-full"
        />
      </div>
    )}

    <!-- Interactive Tool Component -->
    {ToolComponent && (
      <div class="mb-12">
        <ToolComponent client:load />
      </div>
    )}

    <!-- Markdown Content -->
    <div class="prose max-w-none mb-12">
      <Content />
    </div>

    <!-- Back Link -->
    <div class="text-center border-t border-border pt-8">
      <a
        href="/tools"
        class="inline-flex items-center text-primary hover:opacity-70 transition duration-300"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to all tools
      </a>
    </div>
  </div>
</section>
```

### Success Criteria:

#### Automated Verification:
- [x] File exists at `src/layouts/ToolSingle.astro`
- [x] No TypeScript errors: `npm run build` passes

#### Manual Verification:
- [ ] Single tool pages render with proper header, component, and content

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to the next phase.

---

## Phase 3: Update Tools Index Page

### Overview
Update `src/pages/tools/index.astro` to use the new `Tools.astro` layout and add pagination.

### Changes Required:

#### 1. Update Index Page
**File**: `src/pages/tools/index.astro`

Replace entire file with:

```astro
---
import config from "@/config/config.json";
import Base from "@/layouts/Base.astro";
import Pagination from "@/layouts/components/Pagination.astro";
import Tools from "@/layouts/Tools.astro";
import { getSinglePage } from "@/lib/contentParser.astro";

const allTools = await getSinglePage("tools");
const publishedTools = allTools.filter((tool) => !tool.data.draft);
const totalPages = Math.ceil(publishedTools.length / config.settings.pagination);
const currentTools = publishedTools.slice(0, config.settings.pagination);
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
        <>
          <Tools tools={currentTools} className="mb-16" />
          <Pagination section="tools" currentPage={1} totalPages={totalPages} />
        </>
      ) : (
        <div class="text-center py-12">
          <p class="text-text text-lg">Tools coming soon! Check back later.</p>
        </div>
      )}
    </div>
  </section>
</Base>
```

### Success Criteria:

#### Automated Verification:
- [x] `npm run build` passes
- [x] No linting errors

#### Manual Verification:
- [ ] Tools index page displays tool cards in grid
- [ ] Pagination appears when more than 8 tools exist

**Implementation Note**: After completing this phase, pause for manual verification.

---

## Phase 4: Update Single Tool Page

### Overview
Update `src/pages/tools/[slug].astro` to use the new `ToolSingle.astro` layout.

### Changes Required:

#### 1. Update Single Tool Page
**File**: `src/pages/tools/[slug].astro`

Replace entire file with:

```astro
---
import Base from "@/layouts/Base.astro";
import ToolSingle from "@/layouts/ToolSingle.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import { render } from "astro:content";

// Component registry - add new tool components here
const toolComponents: Record<string, any> = {
  ExampleTool: (await import("@/layouts/tools/ExampleTool")).default,
};

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

const ToolComponent = toolComponents[component];
---

<Base
  title={meta_title || title}
  description={description}
  image={image}
>
  <ToolSingle tool={tool} ToolComponent={ToolComponent} Content={Content} />
</Base>
```

### Success Criteria:

#### Automated Verification:
- [x] `npm run build` passes
- [x] No TypeScript errors

#### Manual Verification:
- [ ] Individual tool pages render correctly
- [ ] Interactive React component works (try ExampleTool)
- [ ] Markdown content displays below component

**Implementation Note**: After completing this phase, pause for manual verification.

---

## Phase 5: Add Pagination Route

### Overview
Create the pagination page route for `/tools/page/[slug]` to handle pages 2, 3, etc.

### Changes Required:

#### 1. Create Pagination Page
**File**: `src/pages/tools/page/[slug].astro` (new file, create `page/` directory)

```astro
---
import config from "@/config/config.json";
import Base from "@/layouts/Base.astro";
import Pagination from "@/layouts/components/Pagination.astro";
import Tools from "@/layouts/Tools.astro";
import { getSinglePage } from "@/lib/contentParser.astro";

const allTools = await getSinglePage("tools");
const publishedTools = allTools.filter((tool) => !tool.data.draft);
const totalPages = Math.ceil(publishedTools.length / config.settings.pagination);

export async function getStaticPaths() {
  const tools = await getSinglePage("tools");
  const publishedTools = tools.filter((tool) => !tool.data.draft);
  const totalPages = Math.ceil(publishedTools.length / config.settings.pagination);
  const paths = [];

  // Generate paths for pages 2 through N (page 1 is handled by index.astro)
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
const currentPage = slug && !isNaN(Number(slug)) ? Number(slug) : 1;
const indexOfLastTool = currentPage * config.settings.pagination;
const indexOfFirstTool = indexOfLastTool - config.settings.pagination;
const currentTools = publishedTools.slice(indexOfFirstTool, indexOfLastTool);
---

<Base
  title={`Free Marketing Tools - Page ${currentPage} | Olavi`}
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

      <Tools tools={currentTools} className="mb-16" />
      <Pagination section="tools" currentPage={currentPage} totalPages={totalPages} />
    </div>
  </section>
</Base>
```

### Success Criteria:

#### Automated Verification:
- [x] Directory exists: `src/pages/tools/page/`
- [x] File exists: `src/pages/tools/page/[slug].astro`
- [x] `npm run build` passes

#### Manual Verification:
- [ ] With 9+ published tools, `/tools/page/2` shows tools 9-16
- [ ] Pagination links work correctly between pages

**Implementation Note**: After completing this phase, pause for manual verification.

---

## Phase 6: Final Verification & Documentation

### Overview
Verify the complete implementation and update documentation.

### Changes Required:

#### 1. Unpublish Example Tool (set draft: false for testing)
**File**: `src/content/tools/example-tool.md`

Temporarily change `draft: true` to `draft: false` for testing.

#### 2. Verify Build
Run:
```bash
npm run build
npm run preview
```

### Success Criteria:

#### Automated Verification:
- [x] `npm run build` completes without errors
- [ ] `npm run preview` starts successfully

#### Manual Verification:
- [ ] Navigate to `/tools` - see tool cards in grid
- [ ] Click a tool card - see single tool page with component
- [ ] Interactive component works (form submission)
- [ ] "Back to all tools" link works
- [ ] Category badge displays correctly
- [ ] Featured badge displays for featured tools

---

## Testing Strategy

### Unit Tests:
No unit tests required for Astro layouts.

### Integration Tests:
Verify via `npm run build` - Astro validates all routes at build time.

### Manual Testing Steps:
1. Start dev server: `npm run dev`
2. Visit `/tools` - verify grid layout
3. Click a tool - verify single page layout
4. Test interactive component
5. Navigate back to tools
6. If enough tools exist, test pagination

## Performance Considerations

- Images optimized via Astro's `<Image>` component with explicit dimensions
- Static site generation - no runtime performance concerns
- Pagination limits tools per page (8) to keep page size small

## How to Add a New Tool (After Implementation)

1. **Create markdown file**: `src/content/tools/your-tool-slug.md`
```yaml
---
title: "Your Tool Name"
meta_title: "Your Tool Name | Olavi"
description: "Brief description for SEO and card display"
image: "/images/tools/your-tool-image.jpg"
category: "seo"
featured: false
draft: false
component: "YourToolComponent"
---

Additional content about the tool goes here...
```

2. **Create React component**: `src/layouts/tools/YourToolComponent.tsx`

3. **Register component** in `src/pages/tools/[slug].astro`:
   - Add import at top: `import YourToolComponent from "@/layouts/tools/YourToolComponent";`
   - Add conditional render in the template:
```astro
<Fragment slot="tool-component">
  {component === "ExampleTool" && <ExampleTool client:load />}
  {component === "YourToolComponent" && <YourToolComponent client:load />}
</Fragment>
```

4. **Add image** (optional): `public/images/tools/your-tool-image.jpg`

5. **Run dev server**: `npm run dev` - tool appears automatically

## References

- Research document: `thoughts/shared/research/2026-01-11-blog-and-tools-routing-system.md`
- Blog Posts layout: `src/layouts/Posts.astro`
- Blog index: `src/pages/blog/index.astro`
- Pagination component: `src/layouts/components/Pagination.astro`
- Content config: `src/content.config.ts:72-84`
