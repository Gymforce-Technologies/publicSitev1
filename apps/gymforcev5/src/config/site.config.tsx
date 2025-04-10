import { Metadata } from "next";
import logoImg from "@public/svg/Live_Logo.png";
import { LAYOUT_OPTIONS } from "@/config/enums";
import logoIconImg from "@public/favicon.svg";
import { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";

enum MODE {
  DARK = "dark",
  LIGHT = "light",
}

export const siteConfig = {
  title: "Gymforce - Ultimate Gym Management Solution",
  description: `Experience the ultimate gym management solution with Gymforce. Our AI-powered platform simplifies billing, enrollment, member management, and marketing, helping you grow your gym effortlessly. Start your free trial today—no credit card required—and discover how Gymforce can transform your business. Stay updated by subscribing to our newsletter and enjoy continuous support from our dedicated team.`,
  logo: logoImg,
  icon: logoIconImg,
  mode: MODE.LIGHT,
  layout: LAYOUT_OPTIONS.HYDROGEN,
  favicon: logoIconImg,
};

export const metaObject = (
  title?: string,
  openGraph?: OpenGraph,
  description: string = siteConfig.description
): Metadata => {
  return {
    title: title ? `${title} - Grow Your Gym with Gymforce` : siteConfig.title,
    description,
    openGraph: openGraph ?? {
      title: title ? `${title} - Grow Your Gym with Gymforce` : title,
      description,
      url: "https://app.gymforce.in/",
      siteName: "Grow Your Gym with Gymforce", // https://developers.google.com/search/docs/appearance/site-names
      images: {
        url: logoImg.src,
        width: 1200,
        height: 630,
      },
      locale: "en_US",
      type: "website",
    },
    icons: {
      icon: logoIconImg.src,
      apple: logoIconImg.src,
      shortcut: logoIconImg.src,
    },
  };
};
