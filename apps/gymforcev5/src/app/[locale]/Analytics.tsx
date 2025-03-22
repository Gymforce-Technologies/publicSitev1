"use client";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";
// import { usePostHog } from "../../hooks/usePostHog";
import * as gtag from "../../lib/gtag";

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // const posthog = usePostHog();

  useEffect(() => {
    const handleRouteChange = (url: string): void => {
      gtag.pageview(url);
      // posthog?.capture("$pageview");
    };

    handleRouteChange(pathname + searchParams.toString());
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_MEASUREMENT_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      {/* <Script
        id="posthog-init"
        strategy="lazyOnload"
        src="/posthog-snippet.js"
      /> */}
      {/* <Script
        id="posthog-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init("${process.env.NEXT_PUBLIC_POSTHOG_KEY}", {api_host: "${process.env.NEXT_PUBLIC_POSTHOG_HOST}"});
          `,
        }}
      /> */}
      <script
        defer
        data-domain="app.gymforce.in"
        src="https://analytics.gymforce.in/js/script.js"
      ></script>
    </>
  );
}
