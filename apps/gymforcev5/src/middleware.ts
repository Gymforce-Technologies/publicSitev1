import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  ...routing,
});

export default function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();

  // Handle the app.gymforce.in domain
  if (host.includes("app.gymforce.in") || host.includes("localhost")) {
    const name = url.searchParams.get("name");

    if (name) {
      // Create the new URL with subdomain format
      // Keep the full pathname to preserve all path segments
      const newHost = `www.${name}.gymforce.in`;
      const newUrl = new URL(`https://${newHost}${url.pathname}`);

      // Copy any other query parameters except 'name'
      url.searchParams.forEach((value, key) => {
        if (key !== "name") {
          newUrl.searchParams.set(key, value);
        }
      });

      return NextResponse.redirect(newUrl);
    }
  }

  // Handle requests to the custom subdomain
  const subdomainMatch = host.match(/^(?:www\.)?([^.]+)\.gymforce\.in/);
  if (subdomainMatch) {
    const gymName = subdomainMatch[1];

    // Extract code from the path
    const pathParts = url.pathname.split("/").filter(Boolean);
    const code = pathParts.length > 0 ? pathParts[0] : null;

    if (gymName && code) {
      // Make gym name and code available to the application
      url.searchParams.set("gymName", gymName);
      url.searchParams.set("gymCode", code);

      return NextResponse.rewrite(url);
    }
  }

  // For all other requests
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
