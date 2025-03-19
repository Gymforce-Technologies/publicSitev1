'use client';
// import { AxiosPrivate, invalidateAll, newID } from "@/app/[lang]/auth/AxiosPrivate";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { addListener, launch, setDetectDelay } from 'devtools-detector';

export function useDevToolsProtection(): void {
  const router = useRouter();
  useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    if (process.env.NODE_ENV !== 'production' || baseUrl.includes('frontendv5production.gymforce.in')) {
      console.log(baseUrl)
      return;
    }

    let devToolsTimeout: NodeJS.Timeout | null = null;

    const protect = (isOpen: boolean): void => {
      if (isOpen) {
        router.push('/access_denied?error=dev-tools');
      }
    };

    addListener(protect);
    setDetectDelay(1000);

    // Initialize the detection
    launch();

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.altKey && e.key === 'I')
      ) {
        e.preventDefault();
        console.log('Attempt to open DevTools blocked');
      }
    };

    const handleContextMenu = (e: MouseEvent): void => {
      e.preventDefault();
      console.log('Right-click blocked');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
}