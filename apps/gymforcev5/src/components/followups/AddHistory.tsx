import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { DatePicker } from "@core/ui/datepicker";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BsArrowRight } from "react-icons/bs";
import { FaBookReader, FaUserPlus } from "react-icons/fa";
import {
  Button,
  Drawer,
  Input,
  Loader,
  Select,
  Text,
  Textarea,
  Title,
} from "rizzui";

interface FormData {
  followup: number;
  comment: string;
  status: string;
  next_followup_reminder: string;
  contact_type: string;
  updated_by_id: number;
  outcome: string;
  next_action: string;
}

const STATUS_CHOICES = [
  { label: "Final", value: "Final" },
  { label: "Interested", value: "Interested" },
  { label: "Rejected", value: "Rejected" },
  { label: "Pending", value: "Pending" },
];

const CONTACT_TYPE_CHOICES = [
  { label: "Text SMS", value: "Text SMS" },
  { label: "Call", value: "Call" },
  { label: "WhatsApp", value: "WhatsApp" },
];

const OUTCOME_CHOICES = [
  { label: "Positive", value: "Positive" },
  { label: "Negative", value: "Negative" },
];

export default function AddFollowupHistory({
  id,
  refreshData,
  setOpenMemberId,
  prevContactType,
  prevStatus,
}: {
  id: number;
  refreshData: () => void;
  setOpenMemberId: React.Dispatch<React.SetStateAction<number | null>>;
  prevStatus: string | undefined;
  prevContactType: string | undefined;
}) {
  const initialFormState: FormData = {
    followup: -1,
    comment: "",
    status: "",
    next_followup_reminder: "",
    contact_type: "",
    updated_by_id: -1,
    outcome: "",
    next_action: "",
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[] | null>(null);
  const [isCustomRemarks, setIsCustomRemarks] = useState(false);
  const [isCustomAction, setCustomAction] = useState(false);
  const router = useRouter();
  
  const resetForm = () => {
    setFormData(initialFormState);
    setOpenMemberId(null);
  };

  const handleInputChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCommentChange = (value: string) => {
    if (value === "custom") {
      setIsCustomRemarks(true);
      setFormData((prev) => ({ ...prev, comment: "" }));
    } else {
      setIsCustomRemarks(false);
      handleInputChange("comment", value);
    }
  };

  const handleActionChange = (value: string) => {
    if (value === "custom") {
      setCustomAction(true);
      setFormData((prev) => ({ ...prev, next_action: "" }));
    } else {
      setCustomAction(false);
      handleInputChange("next_action", value);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    const requiredFields: (keyof FormData)[] = [
      "comment",
      "status",
      "contact_type",
      "outcome",
      "next_action",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please provide ${field.replace("_", " ")}`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const gymId = await retrieveGymId();

      await AxiosPrivate.post(`/api/followups/history/?gym_id=${gymId}`, {
        ...formData,
        followup: id,
      });

      toast.success("Followup added successfully");
      invalidateAll();
      resetForm();
      refreshData();
    } catch (error) {
      console.error("Failed to add followup:", error);
      toast.error("Something went wrong while adding followup");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const getPreReq = async () => {
      const gymId = await retrieveGymId();
      try {
        const resp = await AxiosPrivate.get(`/api/staff/?gym_id=${gymId}`, {
          id: newID(`staffs`),
        });
        console.log(resp.data);
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
    if (prevStatus) {
      handleInputChange("status", prevStatus);
    }
    if (prevContactType) {
      handleInputChange("contact_type", prevContactType);
    }
    getPreReq();
  }, []);

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
         {` No Staff's Found`}
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
    const fetchPrerequisites = async () => {
      try {
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/followups-prerequisites/?gym_id=${gymId}`,
          {
            id: newID(`member-followup-prerequities`),
          }
        );
        // setPurposes(
        //   response.data.purposes.map((purp: any) => ({
        //     label: purp.key,
        //     value: purp.key,
        //   }))
        // );
        setComments([
          ...response.data.quick_comments.map((comment: any) => ({
            label: comment.key,
            value: comment.key,
          })),
          { label: "Custom", value: "custom" },
        ]);
      } catch (error) {
        console.error("Error fetching prerequisites:", error);
        toast.error("Something went wrong while loading status options");
        // } finally {
        //   setIsLoading(false);
      }
    };
    fetchPrerequisites();
  }, []);

  return (
    <Drawer
      isOpen={id !== null}
      onClose={resetForm}
      size="lg"
      containerClassName="overflow-y-auto custom-scrollbar"
    >
      <div className="m-auto p-6 md:p-8">
        <div className="flex items-center justify-between min-w-full">
          <Title as="h4" className="mx-2 mb-4">
            Add FollowUp History
          </Title>
          <XIcon onClick={resetForm} />
        </div>

        <div className="grid sm:grid-cols-2 max-sm:h-[80vh] max-sm:pr-1 gap-3 sm:gap-6">
          <Select
            label="Status"
            options={STATUS_CHOICES}
            value={formData.status}
            onChange={(option: any) =>
              handleInputChange("status", option.value)
            }
            placeholder="Select Status"
          />

          <Select
            label="Contact Type"
            options={CONTACT_TYPE_CHOICES}
            value={formData.contact_type}
            onChange={(option: any) =>
              handleInputChange("contact_type", option.value)
            }
            placeholder="Select Contact Type"
          />

          <Select
            label="Outcome"
            options={OUTCOME_CHOICES}
            value={formData.outcome}
            onChange={(option: any) =>
              handleInputChange("outcome", option.value)
            }
            placeholder="Select Outcome"
          />
          <div className="flex flex-col gap-1">
            <Text>Reminder</Text>
            <DatePicker
              name="start_date"
              value={
                formData.next_followup_reminder
                  ? formateDateValue(new Date(formData.next_followup_reminder))
                  : ""
              }
              // value={occasionalHoliday.end_date}
              onChange={(date: any) => {
                handleInputChange(
                  "next_followup_reminder",
                  formateDateValue(new Date(date), "YYYY-MM-DD")
                );
              }}
              placeholderText="Select the Start Date"
              showMonthDropdown={true}
              showYearDropdown={true}
              scrollableYearDropdown={true}
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
              className="w-full"
            />
          </div>
          {/* <Textarea
            label="Remarks"
            value={formData.comment}
            onChange={(e) => handleInputChange("comment", e.target.value)}
            placeholder="Info"
          /> */}
          <div className="flex flex-col gap-2 ">
            <Select
              label="Remarks"
              name="comment"
              // value={formData.comment}
              options={comments ?? []}
              value={
                isCustomRemarks
                  ? "custom"
                  : comments?.find(
                      (comment) => comment.value === formData.comment
                    )?.value || ""
              }
              onChange={(option: any) => handleCommentChange(option.value)}
            />
            {isCustomRemarks && (
              <Textarea
                id="custom-comment"
                // labelClassName="text-sm"
                placeholder="Enter custom remarks"
                value={formData.comment}
                onChange={(e) => handleInputChange("comment", e.target.value)}
              />
            )}
          </div>
          <div className="flex flex-col gap-2 ">
            <Select
              label="Next Action"
              // value={formData.next_action}
              options={comments ?? []}
              name="next_action"
              onChange={(option: any) => handleActionChange(option.value)}
              value={
                isCustomAction
                  ? "custom"
                  : comments?.find(
                      (comment) => comment.value === formData.next_action
                    )?.value || ""
              }
            />
            {isCustomAction && (
              <Textarea
                id="custom-comment"
                // labelClassName="text-sm"
                placeholder="Enter custom Action"
                value={formData.next_action}
                onChange={(e) =>
                  handleInputChange("next_action", e.target.value)
                }
              />
            )}
          </div>

          <Select
            label="Handled By*"
            name="trainer"
            options={
              trainers?.length ? trainers : [{ label: "Empty", value: "empty" }]
            }
            value={
              formData.updated_by_id !== -1
                ? trainers.find(
                    (group) => group.value === formData.updated_by_id
                  )?.label || ""
                : ""
            }
            onChange={(option: any) => {
              handleInputChange("updated_by_id", option?.value);
            }}
            getOptionDisplayValue={(option) =>
              trainers?.length ? renderTrainers(option) : renderEmpty()
            }
            prefix={<FaBookReader className="text-primary" />}
            clearable
            onClear={() => {
              setFormData((prev) => ({
                ...prev,
                updated_by_id: -1,
              }));
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader variant="threeDot" /> : "Save"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
