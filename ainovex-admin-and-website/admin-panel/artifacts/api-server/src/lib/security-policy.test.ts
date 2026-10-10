import assert from "node:assert/strict";
import test from "node:test";
import {
  articleRepositoryPath,
  isAdminEmailAllowed,
  isAllowedRepositoryPath,
  isSameOriginRequest,
  isSecureRequest,
  isValidGitHubCredentials,
} from "./security-policy";

test("administrator allowlist requires a verified matching email", () => {
  const allowed = ["editor@example.test"];
  assert.equal(isAdminEmailAllowed("Editor@example.test", true, allowed), true);
  assert.equal(isAdminEmailAllowed("editor@example.test", false, allowed), false);
  assert.equal(isAdminEmailAllowed("someone-else@example.com", true, allowed), false);
  assert.equal(isAdminEmailAllowed(undefined, true, allowed), false);
});

test("write requests require an exact origin host and scheme", () => {
  assert.equal(isSameOriginRequest("https://admin.example", "admin.example", "https"), true);
  assert.equal(isSameOriginRequest("https://evil.example", "admin.example", "https"), false);
  assert.equal(isSameOriginRequest("http://admin.example", "admin.example", "https"), false);
  assert.equal(isSameOriginRequest("not a url", "admin.example", "https"), false);
  assert.equal(isSameOriginRequest(undefined, "admin.example", "https"), false);
});

test("GitHub credential transport requires HTTPS outside local development", () => {
  assert.equal(isSecureRequest("admin.example", "https"), true);
  assert.equal(isSecureRequest("admin.example", "http"), false);
  assert.equal(isSecureRequest("localhost:3000", "http"), true);
});

test("per-operation GitHub credentials are validated without accepting whitespace", () => {
  assert.equal(isValidGitHubCredentials("ainovex-owner", "github_pat_example"), true);
  assert.equal(isValidGitHubCredentials("invalid/name", "github_pat_example"), false);
  assert.equal(isValidGitHubCredentials("ainovex-owner", "token with spaces"), false);
  assert.equal(isValidGitHubCredentials("ainovex-owner", ""), false);
});

test("publishing paths are restricted to the documented AINOVEX files", () => {
  assert.equal(articleRepositoryPath("best-free-ai-tools-2026"), "content/articles/best-free-ai-tools-2026.md");
  assert.equal(isAllowedRepositoryPath("content/categories.json"), true);
  assert.equal(isAllowedRepositoryPath("site.config.mjs"), true);
  assert.equal(isAllowedRepositoryPath("content/articles/a-valid-slug.md"), true);
  assert.equal(isAllowedRepositoryPath("content/articles/../site.config.mjs"), false);
  assert.equal(isAllowedRepositoryPath("content/articles/%2e%2e%2fsite.config.mjs"), false);
  assert.equal(isAllowedRepositoryPath("public/anything.png"), false);
  assert.throws(() => articleRepositoryPath("../site.config.mjs"));
});
