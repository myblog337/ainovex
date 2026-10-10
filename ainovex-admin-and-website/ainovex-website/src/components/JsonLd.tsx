import React from "react";
import { SITE_CONFIG } from "@/src/config/site";

interface WebSiteSchemaProps {
  type: "website";
}

interface ArticleSchemaProps {
  type: "article";
  title: string;
  description: string;
  url: string;
  published: string;
  updated?: string;
  image?: string;
  authorName?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsSchemaProps {
  type: "breadcrumbs";
  items: BreadcrumbItem[];
}

type JsonLdProps = WebSiteSchemaProps | ArticleSchemaProps | BreadcrumbsSchemaProps;

export const JsonLd: React.FC<JsonLdProps> = (props) => {
  let schemaData: Record<string, unknown>;

  if (props.type === "website") {
    schemaData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      description: SITE_CONFIG.description,
      publisher: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        logo: `${SITE_CONFIG.url}/favicon.svg`,
      },
    };
  } else if (props.type === "article") {
    const fullImage = props.image
      ? props.image.startsWith("http")
        ? props.image
        : `${SITE_CONFIG.url}${props.image.startsWith("/") ? "" : "/"}${props.image}`
      : `${SITE_CONFIG.url}/og-image.png`;

    schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: props.title,
      description: props.description,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": props.url,
      },
      url: props.url,
      datePublished: props.published,
      dateModified: props.updated || props.published,
      image: fullImage,
      author: {
        "@type": "Person",
        name: props.authorName || SITE_CONFIG.author.name,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_CONFIG.url}/favicon.svg`,
        },
      },
    };
  } else {
    schemaData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: props.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};
