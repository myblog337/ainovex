import React from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  // Escape "<" so a value containing "</script>" can never break out of the tag.
  const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
};
