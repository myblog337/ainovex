export function isAdminEmailAllowed(
  email: string | undefined,
  verified: boolean,
  allowlist: string[],
): boolean {
  if (!email || !verified) return false;
  const normalizedEmail = email.trim().toLowerCase();
  return allowlist.some((entry) => entry.trim().toLowerCase() === normalizedEmail);
}

export function isSameOriginRequest(
  origin: string | undefined,
  host: string | undefined,
  protocol: string,
): boolean {
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    return (
      parsed.host.toLowerCase() === host.toLowerCase() &&
      parsed.protocol === `${protocol}:`
    );
  } catch {
    return false;
  }
}

export function isSecureRequest(host: string, protocol: string): boolean {
  const normalizedHost = host.toLowerCase();
  const localHost =
    normalizedHost === "localhost" ||
    normalizedHost.startsWith("localhost:") ||
    normalizedHost === "127.0.0.1" ||
    normalizedHost.startsWith("127.0.0.1:");
  return localHost || protocol === "https";
}

export function isValidGitHubCredentials(username: string, token: string): boolean {
  return (
    /^[A-Za-z\d](?:[A-Za-z\d-]{0,38})$/.test(username) &&
    token.length > 0 &&
    token.length <= 500 &&
    !/\s/.test(token)
  );
}

export function isAllowedRepositoryPath(path: string): boolean {
  return (
    path === "content/categories.json" ||
    path === "site.config.mjs" ||
    /^content\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(path)
  );
}

export function articleRepositoryPath(slug: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Invalid article slug");
  }
  return `content/articles/${slug}.md`;
}
