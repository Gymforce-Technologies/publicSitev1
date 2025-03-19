import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { Locale } from "./i18n/routing";

const publicPages = [
  "/auth/sign-up-wg6ixcnunl5",
  "/auth/sign-in",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/i/.*",
  "/gym/.*",
];

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

const intlMiddleware = createMiddleware({
  ...routing,
});

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  const token = req.cookies.get("refreshToken")?.value;

  // Skip for chrome-specific paths
  if (path.indexOf("chrome") > -1) {
    return NextResponse.next();
  }

  // Skip internationalization for PWA files
  if (shouldSkipInternationalization(path)) {
    return NextResponse.next();
  }

  // Create regex for public pages with locale prefix
  const publicPathnameRegex = RegExp(
    `^(/(${[...routing.locales].join("|")}))?(${publicPages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?$`,
    "i"
  );

  const isPublicPage = publicPathnameRegex.test(path);

  // Handle root path
  if (path === "/" || path === "") {
    const lang = routing.defaultLocale;
    const redirectUrl = new URL(
      token ? `/${lang}/dashboard` : `/${lang}/auth/sign-in`,
      req.url
    );
    return NextResponse.redirect(redirectUrl);
  }

  // For public pages, just apply the intl middleware
  if (isPublicPage) {
    return intlMiddleware(req);
  }

  // For protected routes, check authentication
  if (!token) {
    const pathLocale = path.split("/")[1];
    const isValidLocale = (locale: string): locale is Locale =>
      routing.locales.includes(locale as Locale);

    const locale = isValidLocale(pathLocale)
      ? pathLocale
      : routing.defaultLocale;

    return NextResponse.redirect(new URL(`/${locale}/auth/sign-in`, req.url));
  }

  // Apply intl middleware for authenticated routes
  return intlMiddleware(req);
}
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|posthog-snippet.js).*)",
  ],
};
