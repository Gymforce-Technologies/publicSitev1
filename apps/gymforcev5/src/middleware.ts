import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  ...routing,
});

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  if (path.indexOf("chrome") > -1) {
    return NextResponse.next();
  }
  // For all other requests
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
