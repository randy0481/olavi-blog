import React, { useState, useMemo } from "react";

// =============================================================================
// TYPES
// =============================================================================

type Strategy = "maxVisibility" | "aiOnly" | "traditional";
type Platform = "wordpress" | "shopify" | "ecommerce" | "custom";

interface Crawler {
  userAgent: string;
  name: string;
  company: string;
  category: "search" | "ai";
}

// =============================================================================
// DATA
// =============================================================================

const CRAWLERS: Crawler[] = [
  // Traditional Search Engines
  { userAgent: "Googlebot", name: "Googlebot", company: "Google", category: "search" },
  { userAgent: "Bingbot", name: "Bingbot", company: "Microsoft", category: "search" },
  { userAgent: "Slurp", name: "Slurp", company: "Yahoo", category: "search" },
  { userAgent: "DuckDuckBot", name: "DuckDuckBot", company: "DuckDuckGo", category: "search" },
  { userAgent: "Baiduspider", name: "Baiduspider", company: "Baidu", category: "search" },
  { userAgent: "YandexBot", name: "YandexBot", company: "Yandex", category: "search" },

  // AI Crawlers (citation + training)
  { userAgent: "GPTBot", name: "GPTBot", company: "OpenAI", category: "ai" },
  { userAgent: "ChatGPT-User", name: "ChatGPT-User", company: "OpenAI", category: "ai" },
  { userAgent: "OAI-SearchBot", name: "OAI-SearchBot", company: "OpenAI", category: "ai" },
  { userAgent: "ClaudeBot", name: "ClaudeBot", company: "Anthropic", category: "ai" },
  { userAgent: "anthropic-ai", name: "Anthropic AI", company: "Anthropic", category: "ai" },
  { userAgent: "Claude-Web", name: "Claude-Web", company: "Anthropic", category: "ai" },
  { userAgent: "Google-Extended", name: "Google-Extended", company: "Google", category: "ai" },
  { userAgent: "PerplexityBot", name: "PerplexityBot", company: "Perplexity", category: "ai" },
  { userAgent: "YouBot", name: "YouBot", company: "You.com", category: "ai" },
  { userAgent: "CCBot", name: "CCBot", company: "Common Crawl", category: "ai" },
  { userAgent: "Meta-ExternalAgent", name: "Meta External Agent", company: "Meta", category: "ai" },
  { userAgent: "Bytespider", name: "Bytespider", company: "ByteDance", category: "ai" },
  { userAgent: "Amazonbot", name: "Amazonbot", company: "Amazon", category: "ai" },
  { userAgent: "cohere-ai", name: "Cohere AI", company: "Cohere", category: "ai" },
];

const PLATFORM_DISALLOWS: Record<Platform, string[]> = {
  wordpress: ["/wp-admin/", "/wp-includes/", "/wp-content/plugins/", "/trackback/", "/feed/", "/?s=", "/search/"],
  shopify: ["/admin/", "/cart/", "/checkout/", "/orders/", "/account/", "/*?*variant=", "/collections/*+*", "/search/"],
  ecommerce: ["/cart/", "/checkout/", "/account/", "/wishlist/", "/compare/", "/search/", "/*?*sort=", "/*?*filter="],
  custom: ["/admin/", "/api/", "/private/"],
};

const STRATEGY_DESCRIPTIONS: Record<Strategy, string> = {
  maxVisibility: "Allow all crawlers. Maximum visibility in both traditional search engines and AI responses.",
  aiOnly: "Allow only AI crawlers. Focus on AI search visibility (ChatGPT, Perplexity, Claude) while blocking traditional search engines.",
  traditional: "Allow only traditional search engines. Block all AI crawlers for maximum content protection.",
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function RobotsTxtGenerator() {
  const [strategy, setStrategy] = useState<Strategy>("maxVisibility");
  const [platform, setPlatform] = useState<Platform>("custom");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate robots.txt output
  const robotsTxtOutput = useMemo(() => {
    const lines: string[] = [];


    // Traditional Search Engines
    lines.push("# ======================");
    lines.push("# TRADITIONAL SEARCH ENGINES");
    lines.push("# ======================");
    CRAWLERS.filter(c => c.category === "search").forEach(c => {
      lines.push(`User-agent: ${c.userAgent}`);
    });
    if (strategy === "aiOnly") {
      lines.push("Disallow: /");
      lines.push("# Blocked: AI-only visibility strategy");
    } else {
      lines.push("Allow: /");
    }
    lines.push("");

    // AI Crawlers
    lines.push("# ======================");
    lines.push("# AI CRAWLERS");
    lines.push("# ======================");
    CRAWLERS.filter(c => c.category === "ai").forEach(c => {
      lines.push(`User-agent: ${c.userAgent}`);
    });
    if (strategy === "traditional") {
      lines.push("Disallow: /");
      lines.push("# Blocked: Traditional SEO only strategy");
    } else {
      lines.push("Allow: /");
    }
    lines.push("");

    // Default rules for all other crawlers
    lines.push("# ======================");
    lines.push("# ALL OTHER CRAWLERS");
    lines.push("# ======================");
    lines.push("User-agent: *");
    if (strategy === "aiOnly") {
      lines.push("Disallow: /");
    } else {
      lines.push("Allow: /");
    }

    // Platform-specific disallows
    const disallows = PLATFORM_DISALLOWS[platform];
    if (disallows.length > 0 && strategy !== "aiOnly") {
      lines.push("");
      lines.push(`# ${platform.charAt(0).toUpperCase() + platform.slice(1)} specific rules`);
      disallows.forEach(path => {
        lines.push(`Disallow: ${path}`);
      });
    }
    lines.push("");

    // Sitemap (only if provided)
    if (sitemapUrl.trim()) {
      lines.push("# ======================");
      lines.push("# SITEMAP");
      lines.push("# ======================");
      lines.push(`Sitemap: ${sitemapUrl.trim()}`);
      lines.push("");
    }

    // Credit
    lines.push("# Generated by Olavi - https://olavi.ai/tools/robots-txt-generator");

    return lines.join("\n");
  }, [strategy, platform, sitemapUrl]);

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(robotsTxtOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Download file
  const downloadFile = () => {
    const blob = new Blob([robotsTxtOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "robots.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Strategy Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Visibility Strategy
            </label>
            <div className="space-y-2">
              {(["maxVisibility", "aiOnly", "traditional"] as Strategy[]).map((s) => (
                <label
                  key={s}
                  className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                    strategy === s
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="strategy"
                    value={s}
                    checked={strategy === s}
                    onChange={(e) => setStrategy(e.target.value as Strategy)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium">
                      {s === "maxVisibility" && "Maximum Visibility (Recommended)"}
                      {s === "aiOnly" && "AI Visibility Only"}
                      {s === "traditional" && "Traditional SEO Only"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {STRATEGY_DESCRIPTIONS[s]}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Platform Template
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="form-input w-full"
            >
              <option value="custom">Custom / General</option>
              <option value="wordpress">WordPress</option>
              <option value="shopify">Shopify</option>
              <option value="ecommerce">eCommerce (General)</option>
            </select>
          </div>

          {/* Sitemap URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Sitemap URL (optional)
            </label>
            <input
              type="url"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              placeholder="https://example.com/sitemap.xml"
              className="form-input w-full"
            />
          </div>
        </div>

        {/* Right Column - Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              Generated robots.txt
            </label>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="text-sm px-3 py-1 rounded border border-border hover:border-primary transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadFile}
                className="text-sm px-3 py-1 rounded border border-border hover:border-primary transition-colors"
              >
                Download
              </button>
            </div>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm h-96 overflow-y-auto">
            <code>{robotsTxtOutput}</code>
          </pre>
        </div>
      </div>

      {/* Upload Instructions */}
      <div className="mt-8 p-4 bg-theme-light rounded-lg border border-border">
        <h3 className="font-medium mb-2">How to use your robots.txt file</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-text">
          <li>Click "Download" or "Copy" to get your generated file</li>
          <li>Upload the file to the root directory of your website</li>
          <li>Verify it's accessible at: <code className="bg-white px-1 rounded">https://yourdomain.com/robots.txt</code></li>
          <li>Test with Google Search Console's robots.txt tester</li>
        </ol>
      </div>
    </div>
  );
}
