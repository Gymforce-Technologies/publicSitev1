'use client';
import { useEffect, useState } from 'react';

export function usePostHog(): any | null {
  const [posthog, setPosthog] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      import('posthog-js').then(({ default: posthog }) => {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          capture_pageview: false,
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing();
          },
        });
        setPosthog(posthog);
      });
    }
  }, []);
  
  return posthog;
}