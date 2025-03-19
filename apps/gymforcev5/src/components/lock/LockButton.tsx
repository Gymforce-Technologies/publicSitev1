// components/LockButton.tsx
import { AxiosPrivate } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "rizzui";

interface LockButtonProps {
  onLock: (password: string, duration: number) => void;
}

const DURATION_OPTIONS = [
  { label: "15 mins", value: "0.25 " },
  { label: "30 mins", value: "0.5 " },
  { label: "1 Hour", value: "1" },
  { label: "2 Hours", value: "2" },
];

interface LockState {
  lock_enabled: boolean;
  last_updated: string | null;
  duration: number;
  pin?: string | null;
}

export function LockButton({ onLock }: LockButtonProps) {
  const [lock, setLock] = useState<LockState>({
    lock_enabled: false,
    last_updated: null,
    duration: 15,
  });

  const getLock = async (): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(`/api/lockScreen/?gym_id=${gymId}`, {
        id: "lockScreen-settings",
      });

      setLock({
        lock_enabled: resp.data.lock_enabled,
        duration: resp.data.duration / 60,
        last_updated: resp.data.last_updated,
        pin: resp.data.pin,
      });
      // setIsFirst(!resp.data.last_updated && resp.data.lock_enabled);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch lock settings");
    }
  };

  useEffect(() => {
    getLock();
  }, []);

  const handleLock = () => {
    onLock(lock?.pin || "", lock?.duration);
  };

  return lock.lock_enabled ? (
    <div className="border-t border-gray-300 px-6 py-3">
      <Button
        color="primary"
        onClick={() => handleLock()}
        className="h-auto bg-none group-hover:text-primary-dark w-full justify-start p-0 font-medium text-gray-700 outline-none focus-visible:ring-0"
        variant="text"
      >
        Lock App
      </Button>
    </div>
  ) : null;
}
