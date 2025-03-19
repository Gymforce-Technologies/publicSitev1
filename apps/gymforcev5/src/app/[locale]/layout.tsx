import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import GlobalDrawer from "@/app/shared/drawer-views/container";
import GlobalModal from "@/app/shared/modal-views/container";
import { JotaiProvider, ThemeProvider } from "@/app/shared/theme-provider";
import { siteConfig } from "@/config/site.config";
import { inter, lexendDeca } from "@/app/fonts";
import cn from "@core/utils/class-names";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import AuthProvider from "../shared/auth-provider";
import { getServerSession } from "next-auth";
import auth from "@/auth.ts";
import { dir } from "@/i18n/direction";
import Analytics from "./Analytics";
import { Metadata } from "next";
import { PWAProvider } from "@/hooks/usePWA";
import { FirebaseProvider } from "@/components/FireBaseProvider";
import pick from "lodash/pick";

const NextProgress = dynamic(() => import("@core/components/next-progress"), {
  ssr: false,
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: siteConfig.title,
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getServerSession(auth);
  const messages = await getMessages();

  return (
    <html lang={locale} dir={dir(locale)} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        suppressHydrationWarning
        className={cn(inter.variable, lexendDeca.variable, "font-inter")}
      >
        <AuthProvider session={session}>
          <FirebaseProvider>
            <NextIntlClientProvider
              locale={locale}
              messages={pick(messages, "Error")}
            >
              <ThemeProvider>
                <PWAProvider>
                  <Analytics />
                  <NextProgress />
                  <JotaiProvider>
                    {children}
                    <Toaster />
                    <GlobalDrawer />
                    <GlobalModal />
                  </JotaiProvider>
                </PWAProvider>
              </ThemeProvider>
            </NextIntlClientProvider>
          </FirebaseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
