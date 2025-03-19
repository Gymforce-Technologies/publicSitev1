"use client";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { useState, useEffect } from "react";
import { Badge, Button, Empty, Loader, Text, Title } from "rizzui";
import { formateDateValue } from "../../app/[locale]/auth/DateFormat";
import Image from "next/image";
import WidgetCard from "@core/components/cards/widget-card";
import dayjs from "dayjs";
import Link from "next/link";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";

interface Member {
  id: string;
  name: string;
  plan: string;
  gender: string;
  status?: string;
  phone: string;
  checkin_time: string;
  checkout_time?: string | null;
  validity: string;
  image?: string;
}

export default function GymMonitorSection() {
  const [members, setMembers] = useState<Map<string, Member>>(new Map());
  const [id, setId] = useState<string>("");
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [showAllMembers, setShowAllMembers] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const getProfile = async () => {
      const gymId = await retrieveGymId();
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
    };
    getProfile();
  }, []);

  useEffect(() => {
    if (id) {
      const URL = process.env.NEXT_PUBLIC_URL || "https://apiv2.gymforce.in";
      const ws = new WebSocket(
        `${URL.replace("https", "wss")}/ws/gym-monitor/${id}/`
      );
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMembers((prev) => {
          const newMap = new Map(prev);
          switch (data.type) {
            case "initial_state":
              return new Map(data.members.map((m: Member) => [m.id, m]));
            case "checkin":
              newMap.set(data.member.id, data.member);
              refresh();
              break;
            case "checkout":
              newMap.delete(data.member_id);
              refresh();
              break;
          }
          return newMap;
        });
      };

      return () => ws.close();
    }
  }, [id]);

  const fetchAllMembers = async () => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const date = dayjs().format("YYYY-MM-DD");
      const url = `/api/attendance/daily/?gym_id=${gymId}&date=${date}`;
      const resp = await AxiosPrivate.get(url, {
        id: newID(`memberAttendance-${gymId}-${date}`),
      });

      const transformedMembers = resp.data.records[0].members.map(
        (member: any) => ({
          id: member.member_id.toString(),
          name: member.member_name,
          phone: member.member_phone,
          checkin_time: member.checkin_time,
          checkout_time: member.checkout_time,
          status: member?.status || "",
          plan: member?.plan || "Default Plan",
          gender: member?.gender || "male",
          validity: member?.validity || dayjs().add(30, "days").toISOString(),
          image: member?.member_image || "",
        })
      );

      setAllMembers(transformedMembers);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showAllMembers) {
      fetchAllMembers();
    }
  }, [showAllMembers]);

  const refresh = () => {
    invalidateAll();
    fetchAllMembers();
  };

  const renderMemberCard = (member: Member) => (
    <div
      key={member.id}
      className="flex m-1 flex-col items-center p-4 transition-colors duration-300 transform border cursor-pointer rounded-xl hover:border-transparent group hover:bg-primary/90 dark:border-gray-700 dark:hover:border-transparent"
    >
      <div className="relative">
        <Image
          src={
            member.image ||
            (member.gender[0]?.toLowerCase() === "female" ? WomanIcon : ManIcon)
          }
          width={100}
          height={100}
          className="object-cover w-[100px] h-[100px] rounded-full ring-4 ring-gray-300 group-hover:ring-white"
          alt={member.name}
        />
        {member.status ? (
          <div className="absolute top-1 left-full">
            <Badge
              variant="flat"
              size="sm"
              className="capitalize"
              color={member.status === "active" ? "success" : "secondary"}
            >
              {member.status}
            </Badge>
          </div>
        ) : null}
      </div>
      <Link href={`/member_profile/yk62-${member.id}-71he`}>
        <Title className="mt-4 text-2xl font-semibold text-gray-700 hover:text-primary dark:hover:text-primary-lighter capitalize dark:text-white group-hover:text-white">
          {member.name}
        </Title>
      </Link>
      <Text className="mt-2 font-semibold text-gray-400 capitalize group-hover:text-gray-200">
        {member.plan}
      </Text>

      <div className="my-4 px-4 space-y-2 w-full">
        <div className="flex items-center justify-start text-gray-600 group-hover:text-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          <Text className="text-sm font-medium">{member.phone}</Text>
        </div>

        <div className="flex items-center justify-start text-gray-600 group-hover:text-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <Text className="text-sm font-medium">
            In:{" "}
            {new Date(member.checkin_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </div>

        <div className="flex items-center justify-start text-gray-600 group-hover:text-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <Text className="text-sm font-medium">
            Out:{" "}
            {member.checkout_time ? (
              new Date(member.checkout_time)?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            ) : (
              <Badge variant="flat" color="secondary">
                Pending
              </Badge>
            )}
          </Text>
        </div>

        <div className="flex items-center justify-start text-gray-600 group-hover:text-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          <Text className="text-sm font-medium">
            Expires: {formateDateValue(new Date(member.validity))}
          </Text>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      className="relative dark:bg-inherit"
      headerClassName="items-center"
      title="Gym Member's Monitor"
      titleClassName="whitespace-nowrap"
      action={
        <div className="hidden md:flex items-center gap-8 justify-end min-w-full">
          <Button
            size="sm"
            variant={showAllMembers ? "flat" : "solid"}
            onClick={() => {
              setShowAllMembers(false);
              // refresh();
            }}
            className={showAllMembers ? "bg-primary-lighter text-primary" : ""}
          >
            Active Members
          </Button>
          <Button
            size="sm"
            variant={!showAllMembers ? "flat" : "solid"}
            onClick={() => {
              setShowAllMembers(true);
              // refresh();
            }}
            className={!showAllMembers ? "bg-primary-lighter text-primary" : ""}
          >
            All Members
          </Button>
        </div>
      }
    >
      <div className="flex md:hidden my-2 items-center gap-8 justify-end min-w-full">
        <Button
          size="sm"
          variant={showAllMembers ? "flat" : "solid"}
          onClick={() => {
            setShowAllMembers(false);
            // refresh();
          }}
          className={showAllMembers ? "bg-primary-lighter text-primary" : ""}
        >
          Active Members
        </Button>
        <Button
          size="sm"
          variant={!showAllMembers ? "flat" : "solid"}
          onClick={() => {
            setShowAllMembers(true);
            // refresh();
          }}
          className={!showAllMembers ? "bg-primary-lighter text-primary" : ""}
        >
          All Members
        </Button>
      </div>
      {(showAllMembers ? allMembers : Array.from(members.values())).length ===
      0 ? (
        <div className="min-w-full flex my-8 items-center justify-center">
          <Empty
            text={
              showAllMembers ? "No Members Today..." : "No Active Members..."
            }
          />
        </div>
      ) : loading ? (
        <div className="min-w-full flex my-8 items-center justify-center">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
          {(showAllMembers ? allMembers : Array.from(members.values())).map(
            renderMemberCard
          )}
        </div>
      )}
    </WidgetCard>
  );
}
