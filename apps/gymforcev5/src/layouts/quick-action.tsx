"use client";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
// import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { routes } from "@/config/routes";
import Link from "next/link";
import React, { useState, ReactElement, useEffect } from "react";
import toast from "react-hot-toast";
import { BsPersonFillAdd } from "react-icons/bs";
import {
  FaEnvelopesBulk,
  FaRegCalendarCheck,
  FaUsersViewfinder,
} from "react-icons/fa6";
import { IoMdPersonAdd } from "react-icons/io";
import { MdEdit, MdFormatListBulletedAdd } from "react-icons/md";
import { Popover, Text, Button, Checkbox } from "rizzui";

interface QuickActDropdownProps {
  children: ReactElement;
}

interface LinkItem {
  title: string;
  status: boolean;
  url: string;
  icon: ReactElement;
}

export default function QuickDropdown({ children }: QuickActDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalActions, setOriginalActions] = useState<
    Record<string, boolean>
  >({});

  const defaultLinks: LinkItem[] = [
    {
      title: "Create Member",
      status: true,
      url: routes.members.new,
      icon: <IoMdPersonAdd className="size-5" />,
    },
    {
      title: "Create Enquiry",
      status: true,
      url: routes.leads.leadsAdd,
      icon: <BsPersonFillAdd className="size-5" />,
    },
    {
      title: "Create Followup",
      status: true,
      url: routes.leads.followupTypes,
      icon: <FaUsersViewfinder className="size-5" />,
    },
    {
      title: "Create Expense",
      status: true,
      url: routes.expenses.concat("/?action=create"),
      icon: (
        <svg
          id="Layer_1"
          version="1.1"
          viewBox="0 0 30 30"
          xmlSpace="preserve"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          fill="currentColor"
        >
          <path
            className="st1"
            d="M25,22v4c0,0.6-0.4,1-1,1H6c-0.6,0-1-0.4-1-1V13c0-0.6,0.4-1,1-1h18c0.6,0,1,0.4,1,1v4h-4.5c-1.4,0-2.5,1.1-2.5,2.5c0,1.4,1.1,2.5,2.5,2.5H25z M20.5,18.5c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1S21.1,18.5,20.5,18.5z M18.5,2C17.1,2,16,3.1,16,4.5S17.1,7,18.5,7S21,5.9,21,4.5S19.9,2,18.5,2z M14.7,10C14.9,9.6,15,9.2,15,8.7c0-1.7-1.3-3-3-3s-3,1.3-3,3C9,9.2,9.1,9.6,9.3,10H14.7z"
          />
        </svg>
      ),
    },
    {
      title: "Product Purchase",
      status: true,
      url: routes.eCommerce.createOrder,
      icon: <MdFormatListBulletedAdd className="size-5" />,
    },
    {
      title: "Mark Attendance",
      status: true,
      url: routes.attendance,
      icon: <FaRegCalendarCheck className="size-5" />,
    },
    {
      title: "Bulk Marketing",
      status: true,
      url: routes.bulkMessage,
      icon: <FaEnvelopesBulk className="size-5" />,
    },
  ];

  const [links, setLinks] = useState<LinkItem[]>(defaultLinks);

  useEffect(() => {
    getLinksInfo();
  }, []);

  const getLinksInfo = async () => {
    try {
      const gymId = 1;
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });

      const actions = resp.data.quick_actions;
      setOriginalActions(actions);
      const updatedLinks = defaultLinks.map((link) => ({
        ...link,
        status: actions[link.title] ?? false,
      }));

      setLinks(updatedLinks);
    } catch (error) {
      console.error("Error fetching quick actions config:", error);
    }
  };

  const handleCheckboxChange = (title: string, checked: boolean) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.title === title ? { ...link, status: checked } : link
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const gymId = 1;
      const payload = {
        actions: links.reduce(
          (acc, link) => ({
            ...acc,
            [link.title]: link.status,
          }),
          {}
        ),
      };

      await AxiosPrivate.post(
        `/api/quick-actions-config/?gym_id=${gymId}`,
        payload,
        {
          id: newID("update-links-stats"),
        }
      );
      invalidateAll();
      setOriginalActions(payload.actions);
      getLinksInfo();
      setHasChanges(false);
      setIsManageMode(false);
      toast.success(`Quick Actions Updated Successfully`);
    } catch (error) {
      console.error("Error updating quick actions config:", error);
    }
  };

  const handleReset = () => {
    const resetLinks = defaultLinks.map((link) => ({
      ...link,
      status: originalActions[link.title] ?? false,
    }));
    setLinks(resetLinks);
    setHasChanges(false);
  };

  return (
    <>
      <Popover
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        shadow="sm"
        placement="bottom-end"
        arrowClassName="text-gray-400"
      >
        <Popover.Trigger>
          {/* {React.cloneElement(children, {
            onClick: () => setIsOpen(!isOpen),
          })} */}
          <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
        </Popover.Trigger>
        <Popover.Content className="z-[9999] p-0 [&>svg]:hidden sm:[&>svg]:inline-flex">
          <div className="p-3 rounded-lg shadow">
            <div className="flex justify-between mb-2 w-full">
              <Button
                variant="text"
                onClick={() => setIsManageMode(!isManageMode)}
                size="sm"
                className={isManageMode ? "self-end scale-105" : "scale-105"}
              >
                {isManageMode ? (
                  "Close"
                ) : (
                  <div className="flex items-center gap-1">
                    Manage <MdEdit />
                  </div>
                )}
              </Button>
              {isManageMode && hasChanges && (
                <div className="flex gap-2">
                  <Button variant="text" onClick={handleReset} size="sm">
                    Reset
                  </Button>
                  <Button variant="solid" onClick={handleSave} size="sm">
                    Save
                  </Button>
                </div>
              )}
            </div>

            {links.map((item) =>
              isManageMode ? (
                <div key={item.title} className="flex items-center gap-2 p-2">
                  <Checkbox
                    checked={item.status}
                    onChange={(e) =>
                      handleCheckboxChange(item.title, e.target.checked)
                    }
                  />
                  <div className="size-5">{item.icon}</div>
                  <Text>{item.title}</Text>
                </div>
              ) : (
                item.status && (
                  <Link href={item.url} key={item.url}>
                    <Button
                      className="flex items-center gap-2 hover:scale-105 duration-200"
                      variant="text"
                      rounded="none"
                    >
                      <div className="size-5">{item.icon}</div>
                      <Text>{item.title}</Text>
                    </Button>
                  </Link>
                )
              )
            )}
          </div>
        </Popover.Content>
      </Popover>
    </>
  );
}
