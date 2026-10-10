import { parse, stringify } from "yaml";
import type { ArticleData, CategoryData, SiteConfigData } from "@workspace/db";

const articleFields = new Set([
  "title",
  "slug",
  "description",
  "category",
  "author",
  "date",
  "updated",
  "featured",
  "cornerstone",
  "primaryKeyword",
  "related",
  "faq",
  "image",
  "imageAlt",
]);

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid article front matter");
  }
  return value as Record<string, unknown>;
}

function asText(value: unknown, fallback = ""): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return typeof value === "string" ? value : fallback;
}

function asDate(value: unknown): string {
  const text = asText(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(`${text}T00:00:00Z`))) {
    throw new Error("Article date must use YYYY-MM-DD");
  }
  return text;
}

export function parseArticleMarkdown(markdown: string, expectedSlug: string): ArticleData {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const frontmatter = /^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)([\s\S]*)$/.exec(normalized);
  if (!frontmatter) throw new Error("Article is missing YAML front matter");
  const metadata = asRecord(parse(frontmatter[1] ?? ""));
  const slug = asText(metadata.slug);
  if (slug !== expectedSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Article slug does not match its allowed filename");
  }
  const related = metadata.related === undefined
    ? []
    : Array.isArray(metadata.related) && metadata.related.every((item) => typeof item === "string")
      ? metadata.related
      : (() => { throw new Error("Article related field must be a list of slugs"); })();
  const updatedText = metadata.updated == null ? null : asDate(metadata.updated);
  const title = asText(metadata.title);
  const description = asText(metadata.description);
  const category = asText(metadata.category);
  if (!title || !description || !category) throw new Error("Article title, description, and category are required");

  return {
    title,
    description,
    category,
    author: asText(metadata.author, "editorial"),
    date: asDate(metadata.date),
    updated: updatedText,
    featured: metadata.featured === true,
    cornerstone: metadata.cornerstone === true,
    primaryKeyword: asText(metadata.primaryKeyword),
    related,
    faq: metadata.faq === true,
    image: asText(metadata.image),
    imageAlt: asText(metadata.imageAlt),
    body: (frontmatter[2] ?? "").replace(/^\n+/, ""),
    extraFrontmatter: Object.fromEntries(
      Object.entries(metadata).filter(([key]) => !articleFields.has(key)),
    ),
  };
}

export function serializeArticleMarkdown(slug: string, article: ArticleData): string {
  const frontmatter = {
    ...article.extraFrontmatter,
    title: article.title,
    slug,
    description: article.description,
    category: article.category,
    author: article.author,
    date: article.date,
    ...(article.updated ? { updated: article.updated } : {}),
    featured: article.featured,
    cornerstone: article.cornerstone,
    primaryKeyword: article.primaryKeyword,
    related: article.related,
    faq: article.faq,
    ...(article.image ? { image: article.image } : {}),
    ...(article.imageAlt ? { imageAlt: article.imageAlt } : {}),
  };
  return `---\n${stringify(frontmatter).trimEnd()}\n---\n\n${article.body.replace(/^\n+/, "").replace(/\s*$/, "")}\n`;
}

export type CategoryEntry = CategoryData & { slug: string; [key: string]: unknown };

export function parseCategoryFile(contents: string): CategoryEntry[] {
  const value: unknown = JSON.parse(contents);
  if (!Array.isArray(value)) throw new Error("The remote category file is not a JSON list");
  return value.map((entry) => {
    const item = asRecord(entry);
    if (
      typeof item.slug !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) ||
      typeof item.name !== "string" ||
      typeof item.intro !== "string"
    ) {
      throw new Error("The remote category file contains an invalid entry");
    }
    return item as CategoryEntry;
  });
}

export function serializeCategoryFile(categories: CategoryEntry[]): string {
  return `${JSON.stringify(categories, null, 2)}\n`;
}

function skipString(source: string, start: number, quote: string): number {
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === "\\") {
      index += 1;
    } else if (source[index] === quote) {
      return index + 1;
    }
  }
  throw new Error("Unterminated string in site.config.mjs");
}

function skipTrivia(source: string, initialIndex: number): number {
  let index = initialIndex;
  while (index < source.length) {
    if (/\s/.test(source[index] ?? "")) {
      index += 1;
    } else if (source.startsWith("//", index)) {
      const end = source.indexOf("\n", index + 2);
      index = end === -1 ? source.length : end + 1;
    } else if (source.startsWith("/*", index)) {
      const end = source.indexOf("*/", index + 2);
      if (end === -1) throw new Error("Unterminated comment in site.config.mjs");
      index = end + 2;
    } else {
      break;
    }
  }
  return index;
}

function matchingBrace(source: string, openIndex: number): number {
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    if (character === "'" || character === '"' || character === "`") {
      index = skipString(source, index, character) - 1;
    } else if (source.startsWith("//", index)) {
      const end = source.indexOf("\n", index + 2);
      index = end === -1 ? source.length : end;
    } else if (source.startsWith("/*", index)) {
      const end = source.indexOf("*/", index + 2);
      if (end === -1) throw new Error("Unterminated comment in site.config.mjs");
      index = end + 1;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  throw new Error("Unbalanced object in site.config.mjs");
}

function objectPropertyRange(source: string, objectOpen: number, key: string): { start: number; end: number } {
  const objectClose = matchingBrace(source, objectOpen);
  let index = objectOpen + 1;
  while (index < objectClose) {
    index = skipTrivia(source, index);
    if (source[index] === ",") {
      index += 1;
      continue;
    }
    if (index >= objectClose) break;

    const propertyStart = index;
    let propertyName = "";
    if (source[index] === "'" || source[index] === '"') {
      const quotedEnd = skipString(source, index, source[index] ?? "");
      propertyName = source.slice(index + 1, quotedEnd - 1);
      index = quotedEnd;
    } else {
      const name = /^[A-Za-z_$][\w$]*/.exec(source.slice(index));
      if (!name) {
        index += 1;
        continue;
      }
      propertyName = name[0];
      index += propertyName.length;
    }

    const afterName = skipTrivia(source, index);
    if (source[afterName] !== ":") {
      index = afterName + 1;
      continue;
    }
    let valueStart = skipTrivia(source, afterName + 1);
    let cursor = valueStart;
    const nesting: string[] = [];
    while (cursor < objectClose) {
      const character = source[cursor];
      if (character === "'" || character === '"' || character === "`") {
        cursor = skipString(source, cursor, character);
        continue;
      }
      if (source.startsWith("//", cursor)) {
        const lineEnd = source.indexOf("\n", cursor + 2);
        cursor = lineEnd === -1 ? objectClose : lineEnd;
        continue;
      }
      if (source.startsWith("/*", cursor)) {
        const commentEnd = source.indexOf("*/", cursor + 2);
        if (commentEnd === -1) throw new Error("Unterminated comment in site.config.mjs");
        cursor = commentEnd + 2;
        continue;
      }
      if (character === "{" || character === "[" || character === "(") {
        nesting.push(character);
        cursor += 1;
        continue;
      }
      if (character === "}" || character === "]" || character === ")") {
        if (nesting.length > 0) {
          nesting.pop();
          cursor += 1;
          continue;
        }
        break;
      }
      if (character === "," && nesting.length === 0) break;
      cursor += 1;
    }
    let valueEnd = cursor;
    while (valueEnd > valueStart && /\s/.test(source[valueEnd - 1] ?? "")) valueEnd -= 1;
    if (propertyName === key) return { start: valueStart, end: valueEnd };
    index = cursor < objectClose && source[cursor] === "," ? cursor + 1 : objectClose;
    if (propertyStart >= objectClose) break;
  }
  throw new Error(`Expected site.config.mjs field "${key}" was not found`);
}

function rootObjectOpen(source: string): number {
  const match = /export\s+default\s*\{/.exec(source);
  if (!match) throw new Error("site.config.mjs must export a default object");
  return source.indexOf("{", match.index);
}

function replaceProperty(source: string, objectOpen: number, key: string, literal: string): string {
  const range = objectPropertyRange(source, objectOpen, key);
  return `${source.slice(0, range.start)}${literal}${source.slice(range.end)}`;
}

function replaceChild(source: string, parentKey: string, childKey: string, literal: string): string {
  const rootOpen = rootObjectOpen(source);
  const parent = objectPropertyRange(source, rootOpen, parentKey);
  let parentOpen = parent.start;
  while (parentOpen < parent.end && /\s/.test(source[parentOpen] ?? "")) parentOpen += 1;
  if (source[parentOpen] !== "{") throw new Error(`site.config.mjs field "${parentKey}" must be an object`);
  const child = objectPropertyRange(source, parentOpen, childKey);
  return `${source.slice(0, child.start)}${literal}${source.slice(child.end)}`;
}

export function updateSiteConfigSource(
  source: string,
  config: SiteConfigData,
  section: "site" | "ads",
): string {
  if (section === "ads") {
    let updated = replaceChild(source, "adsense", "client", JSON.stringify(config.adsenseClient));
    updated = replaceChild(updated, "adsense", "slot", JSON.stringify(config.adsenseSlot));
    return updated;
  }

  let updated = source;
  const topLevelValues: Array<[string, string]> = [
    ["siteUrl", JSON.stringify(config.siteUrl)],
    ["name", JSON.stringify(config.name)],
    ["tagline", JSON.stringify(config.tagline)],
    ["launched", String(config.launched)],
    ["ogImage", JSON.stringify(config.ogImage)],
  ];
  for (const [key, value] of topLevelValues) {
    updated = replaceProperty(updated, rootObjectOpen(updated), key, value);
  }
  updated = replaceChild(updated, "analytics", "provider", JSON.stringify(config.analyticsProvider));
  updated = replaceChild(updated, "analytics", "measurementId", JSON.stringify(config.analyticsMeasurementId));
  return updated;
}
