// hooks/useLock.ts
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
// types/lock.ts
interface LockState {
  isLocked: boolean;
  expiresAt: number | null;
  password: string;
}

export function useLock() {
  const [lockState, setLockState] = useState<LockState>({
    isLocked: false,
    expiresAt: null,
    password: "",
  });
  const router = useRouter();
  useEffect(() => {
    // Check localStorage on mount
    const storedLock = localStorage.getItem("appLock");
    if (storedLock) {
      const parsed = JSON.parse(storedLock);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        // Lock has expired, remove it
        localStorage.removeItem("appLock");
      } else {
        setLockState(parsed);
      }
    }
  }, []);

  const lockApp = (password: string, durationHours = 1) => {
    const newLockState = {
      isLocked: true,
      expiresAt: durationHours ? Date.now() + durationHours * 1000 : null,
      password,
    };
    setLockState(newLockState);
    localStorage.setItem("appLock", JSON.stringify(newLockState));
    window.location.replace("/");
    router.push("/");
  };

  const unlockApp = (password: string) => {
    if (password === lockState.password) {
      toast.success("App unlocked successfully");
      setTimeout(() => {
        localStorage.removeItem("appLock");
        setLockState({ isLocked: false, expiresAt: null, password: "" });
      }, 1000);
      return true;
    }
    return false;
  };

  return { lockState, lockApp, unlockApp };
}
