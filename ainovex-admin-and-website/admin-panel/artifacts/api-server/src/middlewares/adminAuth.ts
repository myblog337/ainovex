import { clerkClient, getAuth } from "@clerk/express";
import type { Request, RequestHandler } from "express";
import { isAdminEmailAllowed, isSameOriginRequest, isSecureRequest } from "../lib/security-policy";

export type AdminRequest = Request & {
  adminUserId?: string;
  adminEmail?: string;
};

function getForwardedHost(req: Request): string | undefined {
  const value = req.headers["x-forwarded-host"];
  const first = Array.isArray(value) ? value[0] : value;
  return first?.split(",")[0]?.trim() || req.get("host");
}

function getForwardedProtocol(req: Request): string {
  const value = req.headers["x-forwarded-proto"];
  const first = Array.isArray(value) ? value[0] : value;
  return first?.split(",")[0]?.trim() || (req.secure ? "https" : "http");
}

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }

  const allowlist = (process.env.AINOVEX_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.length === 0) {
    res.status(503).json({ error: "AINOVEX admin access is not configured." });
    return;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const primaryEmail = user.emailAddresses.find(
      (address) => address.id === user.primaryEmailAddressId,
    );
    const email = primaryEmail?.emailAddress.trim().toLowerCase();
    const verified = primaryEmail?.verification?.status === "verified";
    if (!isAdminEmailAllowed(email, verified, allowlist)) {
      res.status(403).json({ error: "This account is not an authorized AINOVEX administrator." });
      return;
    }
    const adminRequest = req as AdminRequest;
    adminRequest.adminUserId = userId;
    adminRequest.adminEmail = email;
    next();
  } catch {
    res.status(503).json({ error: "Administrator access could not be verified." });
  }
};

export const requireSameOrigin: RequestHandler = (req, res, next) => {
  const origin = req.get("origin");
  const host = getForwardedHost(req);
  if (!isSameOriginRequest(origin, host, getForwardedProtocol(req))) {
    res.status(403).json({ error: "A same-origin request is required." });
    return;
  }
  next();
};

export const requireSecureRequest: RequestHandler = (req, res, next) => {
  const host = getForwardedHost(req)?.toLowerCase() ?? "";
  if (!isSecureRequest(host, getForwardedProtocol(req))) {
    res.status(400).json({ error: "GitHub credentials may only be used over HTTPS." });
    return;
  }
  next();
};
