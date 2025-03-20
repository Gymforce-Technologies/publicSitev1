import createNextIntlPlugin from "next-intl/plugin";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/[locale]/offline", // Use a dynamic path with [locale] placeholder
  },
  disable: process.env.NODE_ENV === "development",
});

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GOOGLE_MAP_API_KEY: "https://backend.gymforce.in",
    NEXTAUTH_SECRET: "SAMPLE-SECRET-KEY", // Use actual secret
    NEXTAUTH_URL: "https://backend.gymforce.in",
    NEXT_PUBLIC_API_URL: "https://backend.gymforce.in",
    GOOGLE_CLIENT_ID: "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",
    GOOGLE_CLIENT_SECRET:
      "ID306143765702-ujm2k2l7ums1q5juptlvb005cm06bs7i.apps.googleusercontent.com",
    NEXT_PUBLIC_ENCRYPTION_KEY: "SAMPLE-SECRET-KEY",
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    // NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/api/portraits/**",
      },
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "buildupfitness.in",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
        pathname: "/redqteam.com/isomorphic-furyroad/public/**",
      },
      {
        protocol: "https",
        hostname: "isomorphic-furyroad.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "isomorphic-furyroad.vercel.app",
      },
      {
        protocol: "https",
        hostname: "images.gymforce.in",
      },
      {
        protocol: "https",
        hostname: "media.gymforce.in",
      },
      {
        protocol: "https",
        hostname: "files.gymforce.in",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
  transpilePackages: ["core"],
};

export default withPWA(withNextIntl(nextConfig));
