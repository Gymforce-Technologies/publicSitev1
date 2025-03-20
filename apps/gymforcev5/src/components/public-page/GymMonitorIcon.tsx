// components/GymMonitor.tsx
import { useState, useEffect } from "react";
import { FaUsers } from "react-icons/fa";
import Link from "next/link";
// import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { Tooltip } from "rizzui";

interface Member {
  id: string;
  name: string;
}

export function GymMonitorIcon() {
  const [members, setMembers] = useState<Map<string, Member>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [id, setId] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState(false);
  useEffect(() => {
    const getProfile = async () => {
      const gymId = '1';
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const urlVal =
        resp.data.associated_gyms.filter(
          (item: any) => item.gym_id === parseInt(gymId ?? "0")
        )[0]?.forceId ?? "";
      setId(urlVal);
      const iaAvailable =
        resp.data.associated_gyms.filter(
          (item: any) => item.gym_id === parseInt(gymId ?? "0")
        )[0]?.biometric_integration === "Available" || false;
    };
    setIsAvailable(isAvailable);
    getProfile();
  }, []);

  useEffect(() => {
    if (id) {
      const URL = process.env.NEXT_PUBLIC_URL || "https://apiv2.gymforce.in";
      const ws = new WebSocket(
        `${URL.replace("https", "wss")}/ws/gym-monitor/${id}/`
      );

      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(() => {
          if (id) {
            const newWs = new WebSocket(
              `${URL.replace("https", "wss")}/ws/gym-monitor/${id}/`
            );
            ws.onopen = () => setIsConnected(true);
          }
        }, 5000);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMembers((prev) => {
          const newMap = new Map(prev);
          switch (data.type) {
            case "initial_state":
              return new Map(data.members.map((m: Member) => [m.id, m]));
            case "checkin":
              newMap.set(data.member.id, data.member);
              break;
            case "checkout":
              newMap.delete(data.member_id);
              break;
          }
          return newMap;
        });
      };

      return () => ws.close();
    }
  }, [id]);

  return (
    <Link href="/gym-monitor">
      <Tooltip content={" Live Gym Crowd"}>
        <div className="relative">
          <FaUsers className={`h-6 w-6 `} />
          <span className="absolute animate-blink -top-1.5 -right-1.5 bg-primary text-white rounded-full px-1.5 text-xs">
            {members.size}
          </span>
        </div>
      </Tooltip>
    </Link>
  );
}
