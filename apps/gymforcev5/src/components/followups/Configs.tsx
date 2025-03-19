import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Drawer,
  Title,
  Switch,
  Text,
  Button,
  Input,
  Select,
  Loader,
} from "rizzui";
import { FaBookReader, FaEdit, FaSave } from "react-icons/fa";
import { XIcon } from "lucide-react";
import { IoWarningOutline } from "react-icons/io5";
import { BsArrowRight } from "react-icons/bs";
import { useRouter } from "next/navigation";

interface ConfigItem {
  id: number;
  assigned_staff: number;
  gym: number;
  interval_days: number;
  is_active: boolean;
  purpose: string;
}

interface ConfigFormData {
  purpose: string;
  managed_by_id: number | null;
  interval_days: string;
}

interface EditableConfig extends ConfigItem {
  isEditing: boolean;
  originalIntervalDays: number;
  originalIsActive: boolean;
}

export default function Configs({
  showConfig,
  setShowConfig,
}: {
  showConfig: boolean;
  setShowConfig: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [configs, setConfigs] = useState<EditableConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState<any[] | null>(null);
  const [purposes, setPurposes] = useState<any[] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState<ConfigFormData>({
    purpose: "",
    managed_by_id: null,
    interval_days: "",
  });

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/auto-followups-configs/?gym_id=${gymId}`,
        {
          id: newID(`auto-configs`),
        }
      );
      setConfigs(
        resp.data.map((config: ConfigItem) => ({
          ...config,
          isEditing: false,
          originalIntervalDays: config.interval_days,
          originalIsActive: config.is_active,
        }))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch configurations");
    } finally {
      setLoading(false);
    }
  };

  const renderTrainers = (option: any) => {
    return (
      <div className="grid gap-0.5 shadow">
        <Text fontWeight="semibold">{option.label}</Text>
      </div>
    );
  };

  function renderEmpty() {
    return (
      <div
        className=" w-full flex gap-4 flex-row items-center justify-between mx-4"
        onClick={(e) => e.preventDefault()}
      >
        <Text className="font-semibold text-[13px] text-nowrap">
          {`No Staff's Found`}
        </Text>
        <Button
          variant="text"
          onClick={(e) => {
            e.preventDefault();
            toast.success("Switching to Staff Creation");
            router.push("/staff-section/addstaff");
          }}
          className="text-primary text-xs text-nowrap"
        >
          Add Staff <BsArrowRight size={16} className="ml-1 animate-pulse" />
        </Button>
      </div>
    );
  }

  useEffect(() => {
    fetchConfigs();
  }, []);

  const getPreReq = async () => {
    const gymId = await retrieveGymId();
    try {
      const resp = await AxiosPrivate.get(`/api/staff/?gym_id=${gymId}`, {
        id: newID(`staffs`),
      });
      setTrainers(
        resp.data.map((trainer: any) => ({
          label: trainer.name,
          value: trainer.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching prerequisites:", error);
    }
  };

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/followups-prerequisites/?gym_id=${gymId}`,
          {
            id: newID(`member-followup-prerequities`),
          }
        );
        setPurposes(
          response.data.purposes.map((purp: any) => ({
            label: purp.key,
            value: purp.key,
          }))
        );
      } catch (error) {
        console.error("Error fetching prerequisites:", error);
        toast.error("Something went wrong while loading status options");
      } finally {
        setLoading(false);
      }
    };
    fetchPrerequisites();
    getPreReq();
  }, []);

  const handleUpdateConfig = async (config: EditableConfig) => {
    try {
      await AxiosPrivate.patch(`/api/auto-followups-configs/${config.id}/`, {
        interval_days: config.interval_days,
        is_active: config.is_active,
      });

      setConfigs((prevConfigs) =>
        prevConfigs.map((c) =>
          c.id === config.id
            ? {
                ...c,
                isEditing: false,
                originalIntervalDays: c.interval_days,
                originalIsActive: c.is_active,
              }
            : c
        )
      );

      invalidateAll();
      toast.success("Configuration updated successfully");
    } catch (error) {
      console.error("Error updating config:", error);
      toast.error("Something went wrong while updating config");

      setConfigs((prevConfigs) =>
        prevConfigs.map((c) =>
          c.id === config.id
            ? {
                ...c,
                interval_days: c.originalIntervalDays,
                is_active: c.originalIsActive,
                isEditing: false,
              }
            : c
        )
      );
    }
  };

  const handleConfigChange = (
    configId: number,
    field: "interval_days" | "is_active",
    value: number | boolean
  ) => {
    setConfigs((prevConfigs) =>
      prevConfigs.map((config) =>
        config.id === configId
          ? {
              ...config,
              [field]: value,
              isEditing:
                field === "interval_days"
                  ? true // Always set to editing when interval is being edited
                  : field === "is_active"
                    ? value !== config.originalIsActive || config.isEditing
                    : config.isEditing,
            }
          : config
      )
    );
  };

  const handleInputChange = (
    field: keyof ConfigFormData,
    value: string | number | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addConfig = async () => {
    if (
      !formData.purpose ||
      !formData.managed_by_id ||
      parseInt(formData.interval_days) <= 0
    ) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(`/api/auto-followups-configs/`, {
        purpose: formData.purpose,
        assigned_staff: formData.managed_by_id,
        interval_days: parseInt(formData.interval_days),
        is_active: true,
        gym: gymId,
      });

      fetchConfigs();
      setShowAdd(false);
      invalidateAll();

      setFormData({
        purpose: "",
        managed_by_id: null,
        interval_days: "",
      });

      toast.success("Config added successfully");
    } catch (error) {
      console.error("Error adding config:", error);
      toast.error("Something went wrong while adding config");
    }
  };

  return (
    <Drawer
      isOpen={showConfig}
      onClose={() => setShowConfig(false)}
      containerClassName="p-6 pt-2 md:p-8 overflow-y-auto custom-scrollbar"
    >
      <div className="sm:hidden mb-4 min-w-full flex flex-row-reverse">
        <XIcon onClick={() => setShowConfig(false)} />
      </div>
      <div className="flex items-center justify-between mb-6">
        <Title as="h4" className=" font-semibold max-sm:text-base">
          FollowUp Auto-Configuration
        </Title>
        <Button onClick={() => setShowAdd(true)} className="max-sm:scale-90">
          New
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center my-4 min-w-full">
          <Loader size="xl" variant="spinner" />
        </div>
      ) : (
        <div className="space-y-4">
          {configs.map((config) => (
            <div
              key={config.id}
              className="bg-gray-50 rounded-lg p-4 flex flex-col shadow hover:scale-105 transition-transform duration-150"
            >
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Text className="font-medium">Purpose:</Text>
                  <Text>{config.purpose}</Text>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Text className="font-medium">Assigned Staff:</Text>
                <Text>
                  {
                    trainers?.find(
                      (staff: any) => staff.value === config.assigned_staff
                    )?.label
                  }
                </Text>
              </div>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Text className="font-medium">Interval:</Text>
                    {config.isEditing ? (
                      <Input
                        type="text"
                        value={config.interval_days ? config.interval_days : ""}
                        onChange={(e) =>
                          handleConfigChange(
                            config.id,
                            "interval_days",
                            Number(e.target.value)
                          )
                        }
                        className="w-20"
                      />
                    ) : (
                      <Text>{config.interval_days} day(s)</Text>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Switch
                      checked={config.is_active}
                      onChange={() =>
                        handleConfigChange(
                          config.id,
                          "is_active",
                          !config.is_active
                        )
                      }
                      label={config.is_active ? "Active" : "Inactive"}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 min-w-full justify-end">
                  {!config.isEditing ? (
                    <Button
                      onClick={() =>
                        handleConfigChange(
                          config.id,
                          "interval_days",
                          config.interval_days
                        )
                      }
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <FaEdit size={14} />
                      Edit
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpdateConfig(config)}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <FaSave size={14} />
                      Save
                    </Button>
                  )}
                  {config.isEditing && (
                    <Button
                      onClick={() => {
                        setConfigs((prevConfigs) =>
                          prevConfigs.map((c) =>
                            c.id === config.id ? { ...c, isEditing: false } : c
                          )
                        );
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Drawer
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          containerClassName="p-6 md:p-8"
        >
          <Title as="h4">Add New Config</Title>

          <div className="p-2 py-4 space-y-4">
            {formData.purpose &&
              (() => {
                switch (formData.purpose) {
                  case "Membership Expired":
                  case "Lead Follow-Up":
                  case "PT":
                  case "Membership Renewal":
                  case "Payment Reminder":
                  case "Member Irregular":
                    return (
                      <div className="w-full p-4 bg-primary-lighter dark:bg-gray-100 rounded-lg shadow col-span-full">
                        <div className="grid grid-cols-[5%,auto] gap-2 items-start justify-start capitalize">
                          <IoWarningOutline
                            className="animate-pulse"
                            size={16}
                          />
                          <Text className="text-xs font-medium">
                            {(() => {
                              switch (formData.purpose) {
                                case "Membership Expired":
                                  return `Follow up with members whose memberships ended ${formData.interval_days ? `(${formData.interval_days} days ago)` : ""}`;
                                case "Lead Follow-Up":
                                  return `Send a follow-up to leads created ${formData.interval_days ? `(${formData.interval_days} days ago)` : ""}`;
                                case "PT":
                                  return `Check in with members who want to start PT after ${formData.interval_days ? `(${formData.interval_days} days ago)` : ""} in the Gym`;
                                case "Membership Renewal":
                                  return `Remind members whose memberships are close to expiration ${formData.interval_days ? `(${formData.interval_days} days ago)` : ""}`;
                                case "Payment Reminder":
                                  return `Follow up with members with unpaid dues ${formData.interval_days ? `(${formData.interval_days} days after the due date)` : ""}`;
                                case "Member Irregular":
                                  return `Reach out to members who haven't visited the gym in the past ${formData.interval_days ? `(${formData.interval_days} days)` : ""}`;
                                default:
                                  return "";
                              }
                            })()}
                          </Text>
                        </div>
                      </div>
                    );
                  default:
                    return null;
                }
              })()}
            <Select
              label="Purpose"
              value={formData.purpose}
              options={purposes ?? []}
              onChange={(option: any) =>
                handleInputChange("purpose", option.value)
              }
              clearable
              onClear={() => handleInputChange("purpose", "")}
            />
            <Select
              label="Handled By*"
              options={
                trainers?.length
                  ? trainers
                  : [{ label: "Empty", value: "empty" }]
              }
              value={
                formData.managed_by_id !== null
                  ? trainers?.find(
                      (group) => group.value === formData.managed_by_id
                    )?.label || ""
                  : ""
              }
              onChange={(option: any) =>
                handleInputChange("managed_by_id", option?.value)
              }
              getOptionDisplayValue={(option) =>
                trainers?.length ? renderTrainers(option) : renderEmpty()
              }
              prefix={<FaBookReader className="text-primary" />}
              clearable
              onClear={() => handleInputChange("managed_by_id", null)}
            />
            <Input
              label="Interval (Days)"
              type="text"
              value={formData.interval_days}
              onChange={(e) =>
                handleInputChange("interval_days", e.target.value)
              }
            />
            <Button onClick={addConfig} className="mt-4 w-full">
              Add Configuration
            </Button>
          </div>
        </Drawer>
      )}
    </Drawer>
  );
}
