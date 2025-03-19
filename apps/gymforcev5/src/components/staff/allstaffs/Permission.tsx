"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Text,
  Title,
  Tab,
  RadioGroup,
  AdvancedRadio,
  Drawer,
  Loader,
} from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import { XIcon } from "lucide-react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { FaCircleCheck } from "react-icons/fa6";

const Permissions = ({
  isOpen,
  onClose,
  staff,
}: {
  isOpen: boolean;
  onClose: () => void;
  staff: any;
}) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<any>({});

  useEffect(() => {
    if (isOpen && staff?.user) {
      fetchPermissions();
    }
  }, [isOpen, staff]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `api/staff-permission/${staff.user}/?gym_id=${gymId}`,
        {
          id: newID(`staff-permission-${staff.user}`),
        }
      );
      setPermissions(response.data.permissions || {});
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (key: any, value: any) => {
    setPermissions((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const savePermissions = async () => {
    setLoading(true);
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.patch(
        `api/staff-permission/${staff.user}/?gym_id=${gymId}`,
        {
          permissions: permissions,
        },
        {
          id: newID(`update-staff-permission-${staff.user}`),
        }
      );
      toast.success("Permissions updated successfully");
      invalidateAll();
      onClose();
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format permission key for display
  const formatPermissionName = (key: any) => {
    return key
      .replace(/([A-Z])/g, " $1") // Insert space before capital letters
      .replace(/^dash/, "Dashboard ") // Replace 'dash' prefix
      .replace(/^main/, "") // Remove 'main' prefix
      .trim();
  };

  const renderPermissionOption = (key: any) => {
    const currentValue = permissions[key] || "no_access";
    const options = [
      { value: "no_access", label: "No Access" },
      { value: "read", label: "Read" },
      { value: "all", label: "All" },
    ];

    return (
      <div
        key={key}
        className="grid md:grid-cols-[200px,1fr] gap-2 sm:gap-4 p-2 shadow rounded-lg"
      >
        <Text className="font-medium mb-3">{formatPermissionName(key)}</Text>
        <RadioGroup
          value={currentValue}
          setValue={(value) => handlePermissionChange(key, value)}
          className="grid grid-cols-3"
        >
          {options.map((option) => (
            <AdvancedRadio
              key={option.value}
              value={option.value}
              className={`relative flex items-center justify-center text-center gap-1 rounded-lg transition-all duration-200 ${
                currentValue === option.value
                  ? "border-primary shadow-sm"
                  : "border-gray-200 hover:scale-105"
              }`}
            >
              <div className="flex flex-row items-center gap-1 transition-all duration-200">
                <Text className="text-sm font-medium text-gray-900">
                  {option.label}
                </Text>
                <div
                  className={`flex items-center text-primary ${
                    currentValue === option.value ? "" : "hidden"
                  }`}
                >
                  <FaCircleCheck size={14} />
                </div>
              </div>
            </AdvancedRadio>
          ))}
        </RadioGroup>
      </div>
    );
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <Title as="h4" className="font-semibold">
            Manage Staff Permissions
          </Title>
          <Button
            variant="text"
            onClick={onClose}
            className="p-0 h-auto w-auto"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        {loading && !Object.keys(permissions).length ? (
          <div className="flex justify-center items-center py-4">
            <Loader variant="spinner" size="xl" />
          </div>
        ) : (
          <>
            <Tab>
              <Tab.List>
                <Tab.ListItem>Dashboard Access</Tab.ListItem>
                <Tab.ListItem>Website Access</Tab.ListItem>
              </Tab.List>

              <Tab.Panels>
                <Tab.Panel>
                  <div className="grid custom-scrollbar overflow-y-auto max-h-[70vh] gap-4 p-2 mt-4">
                    {Object.keys(permissions)
                      .filter((key) => key.startsWith("dash"))
                      .map((key) => renderPermissionOption(key))}
                  </div>
                </Tab.Panel>

                <Tab.Panel>
                  <div className="grid custom-scrollbar overflow-y-auto max-h-[70vh] gap-4 p-2 mt-4">
                    {Object.keys(permissions)
                      .filter((key) => key.startsWith("main"))
                      .map((key) => renderPermissionOption(key))}
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab>

            <div className="flex justify-end gap-3 mt-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={savePermissions} className="min-w-40">
                {loading ? (
                  <Loader variant="threeDot" size="sm" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
};

export default Permissions;
