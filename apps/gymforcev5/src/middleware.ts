import { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const publicPages = [
  "/auth/sign-in-1",
  "/auth/sign-up-1",
  "/auth/otp-1",
  "/auth/forgot-password-1",
  "/appointment",
  "/analytics",
];

const intlMiddleware = createMiddleware({
  ...routing,
});

export default function middleware(req: NextRequest) {
  // const publicPathnameRegex = RegExp(
  //   `^(/(${routing.locales.join("|")}))?(${publicPages
  //     .flatMap((p) => (p === "/" ? ["", "/"] : p))
  //     .join("|")})/?$`,
  //   "i"
  // );
  // const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
