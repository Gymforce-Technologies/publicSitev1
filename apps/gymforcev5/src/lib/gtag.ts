'use client'
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID!;

export const pageview = (url: string): void => {
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

interface GAEvent {
  action: string;
  category: string;
  label: string;
  value: number;
}

export const event = ({ action, category, label, value }: GAEvent): void => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Add this to make TypeScript recognize gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}