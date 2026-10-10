import assert from "node:assert/strict";
import test from "node:test";
import {
  parseArticleMarkdown,
  parseCategoryFile,
  serializeArticleMarkdown,
  serializeCategoryFile,
  updateSiteConfigSource,
} from "./content-format";
import type { SiteConfigData } from "@workspace/db";

test("article Markdown round-trips supported fields and preserves unknown frontmatter", () => {
  const markdown = [
    "---",
    "title: Example guide",
    "slug: example-guide",
    "description: A test article",
    "category: free-ai-tools",
    "author: editorial",
    "date: 2026-10-08",
    "updated: 2026-10-09",
    "related: [another-guide]",
    "faq: true",
    "providerMetadata:",
    "  checkedBy: editorial",
    "---",
    "",
    "Body text stays readable.",
    "",
  ].join("\n");
  const parsed = parseArticleMarkdown(markdown, "example-guide");
  assert.equal(parsed.title, "Example guide");
  assert.equal(parsed.date, "2026-10-08");
  assert.deepEqual(parsed.related, ["another-guide"]);
  assert.deepEqual(parsed.extraFrontmatter, { providerMetadata: { checkedBy: "editorial" } });

  const serialized = serializeArticleMarkdown("example-guide", parsed);
  const roundTrip = parseArticleMarkdown(serialized, "example-guide");
  assert.deepEqual(roundTrip, parsed);
  assert.match(serialized, /providerMetadata:/);
  assert.match(serialized, /Body text stays readable\./);
});

test("article filenames cannot disagree with slugs or use traversal", () => {
  const markdown = "---\ntitle: X\nslug: other\n description: bad\n---\n";
  assert.throws(() => parseArticleMarkdown(markdown, "example-guide"));
});

test("category updates preserve unknown entry fields", () => {
  const entries = parseCategoryFile('[{"slug":"tools","name":"Tools","intro":"Intro","custom":"preserve"}]');
  const output = serializeCategoryFile(entries.map((entry) =>
    entry.slug === "tools" ? { ...entry, name: "AI tools" } : entry,
  ));
  assert.match(output, /"custom": "preserve"/);
  assert.match(output, /"name": "AI tools"/);
});

test("site configuration edits preserve unrelated keys and change only the requested section", () => {
  const source = `// Keep the default config structure.
export default {
  siteUrl: 'https://old.example', // public URL
  name: 'AINOVEX',
  tagline: 'Old tagline',
  email: 'contact@example.test',
  launched: false,
  ogImage: '/old.png',
  authors: { editorial: { name: 'Editorial', type: 'Person' } },
  analytics: { provider: 'google-analytics', measurementId: '' },
  adsense: { client: '', slot: '' },
  images: { widths: [480, 768, 1200] },
};`;
  const config: SiteConfigData = {
    siteUrl: "https://new.example",
    name: "AINOVEX",
    tagline: "A new tagline",
    launched: true,
    ogImage: "/new.png",
    analyticsProvider: "google-analytics",
    analyticsMeasurementId: "G-ABC1234567",
    adsenseClient: "ca-pub-123",
    adsenseSlot: "987654",
  };

  const siteUpdate = updateSiteConfigSource(source, config, "site");
  assert.match(siteUpdate, /siteUrl: "https:\/\/new\.example"/);
  assert.match(siteUpdate, /email: 'contact@example\.test'/);
  assert.match(siteUpdate, /authors: \{ editorial: \{ name: 'Editorial', type: 'Person' \} \}/);
  assert.match(siteUpdate, /widths: \[480, 768, 1200\]/);
  assert.match(siteUpdate, /measurementId: "G-ABC1234567"/);
  assert.match(siteUpdate, /adsense: \{ client: '', slot: '' \}/);

  const adsUpdate = updateSiteConfigSource(source, config, "ads");
  assert.match(adsUpdate, /adsense: \{ client: "ca-pub-123", slot: "987654" \}/);
  assert.match(adsUpdate, /siteUrl: 'https:\/\/old\.example'/);
  assert.match(adsUpdate, /measurementId: ''/);
});
