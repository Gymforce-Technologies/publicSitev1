// components/LockProvider.tsx
import { useLock } from "@/hooks/useLock";
import { ReactNode } from "react";
import { LockScreen } from "./LockScreen";

interface LockProviderProps {
  children: ReactNode;
}

export function LockProvider({ children }: LockProviderProps) {
  const { lockState, unlockApp } = useLock();

  if (lockState.isLocked) {
    return <LockScreen onUnlock={unlockApp} />;
  }

  return <>{children}</>;
}
