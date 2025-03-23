import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { Locale } from "./i18n/routing";

// Function to check if the path should skip internationalization
function shouldSkipInternationalization(path: string): boolean {
  const pwaFiles = [
    "/sw.js",
    "/manifest.json",
    "/swe-worker-development.js",
    "/workbox-",
    "/precache-manifest",
    "icons/icon-192.png",
    "icons/icon-512.png",
    "icons/icon-384.png",
    "/firebase-messaging-sw.js",
  ];

  return pwaFiles.some((file) => path.includes(file));
}

// Function to check if path already has a valid locale
function hasValidLocale(path: string): boolean {
  const pathSegments = path.split("/");
  if (pathSegments.length > 1) {
    const potentialLocale = pathSegments[1];
    return routing.locales.includes(potentialLocale as Locale);
  }
  return false;
}

const intlMiddleware = createMiddleware({
  ...routing,
});

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;

  // Skip for chrome-specific paths
  if (path.indexOf("chrome") > -1) {
    return NextResponse.next();
  }

  // Skip internationalization for PWA files
  if (shouldSkipInternationalization(path)) {
    return NextResponse.next();
  }

  // Handle root path
  if (path === "/" || path === "") {
    const redirectUrl = new URL(`/${routing.defaultLocale}`, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if the path already contains a valid locale
  if (!hasValidLocale(path)) {
    // If no valid locale, add the default locale
    const redirectUrl = new URL(`/${routing.defaultLocale}${path}`, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Apply internationalization middleware
  try {
    return intlMiddleware(req);
  } catch (error) {
    // If there's any issue, redirect to root
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|posthog-snippet.js).*)",
  ],
};
