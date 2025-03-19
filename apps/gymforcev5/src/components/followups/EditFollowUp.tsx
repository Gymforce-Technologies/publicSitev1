import { useEffect, useState } from "react";
import { Button, Drawer, Loader, Select, Text, Textarea, Title } from "rizzui";
import { MemberFollowUp } from "./FollowUps";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import { FaBookReader } from "react-icons/fa";
import { XIcon } from "lucide-react";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { DatePicker } from "@core/ui/datepicker";
import { BsArrowRight } from "react-icons/bs";
import { useRouter } from "next/navigation";
interface FormData {
  status: string;
  comment: string;
  contact_type: string;
  managed_by_id: number | null;
  purpose: string;
  next_followup_reminder: string;
}

const FOLLOW_TYPE_CHOICES = [
  { label: "Text SMS", value: "Text SMS" },
  { label: "Call", value: "Call" },
  { label: "WhatsApp", value: "WhatsApp" },
  { label: "Bulk SMS", value: "Bulk SMS" },
];

const STATUS_CHOICES = [
  { label: "Final", value: "Final" },
  { label: "Interested", value: "Interested" },
  { label: "Rejected", value: "Rejected" },
  { label: "Pending", value: "Pending" },
];

export default function EditFollowUp({
  id,
  refreshData,
  setOpenMemberId,
  data,
}: {
  id: number | null;
  setOpenMemberId: React.Dispatch<React.SetStateAction<number | null>>;
  refreshData: () => void;
  data: MemberFollowUp | null;
}) {
  const initialFormState: FormData = {
    status: "",
    comment: "",
    contact_type: "",
    managed_by_id: null,
    purpose: "",
    next_followup_reminder: "",
  };
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [trainers, setTrainers] = useState<any[] | null>(null);
  const [purposes, setPurposes] = useState<any[] | null>(null);
  const [comments, setComments] = useState<any[] | null>(null);
  const [isCustomComment, setIsCustomComment] = useState(false);
  const [isCustomPurpose, setIsCustomPurpose] = useState(false);
  const router = useRouter();

  const getPreReq = async () => {
    const gymId = await retrieveGymId();
    try {
      const resp = await AxiosPrivate.get(`/api/staff/?gym_id=${gymId}`, {
        id: newID(`staffs`),
      });
      // console.log(resp.data);
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
    const fetchPrerequisites = async () => {
      try {
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/followups-prerequisites/?gym_id=${gymId}`,
          {
            id: newID(`member-followup-prerequities`),
          }
        );
        const listComments = response.data.quick_comments.map(
          (comment: any) => ({
            label: comment.key,
            value: comment.key,
          })
        );
        listComments.unshift({ label: "Custom", value: "custom" });
        const listPurposes = response.data.purposes.map((purpose: any) => ({
          label: purpose.key,
          value: purpose.key,
        }));
        listPurposes.unshift({ label: "Custom", value: "custom" });
        setPurposes(listPurposes);
        setComments(listComments);
      } catch (error) {
        console.error("Error fetching prerequisites:", error);
        toast.error("Something went wrong while loading status options");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrerequisites();
    getPreReq();
  }, []);

  useEffect(() => {
    console.log(data);
    if (data !== null && trainers && purposes && comments) {
      console.log(data);
      console.log(trainers);
      console.log(purposes);
      console.log(comments);
      const isCustomCommentCheck = !comments.find(
        (comment) => comment.value.toLowerCase() === data.comment.toLowerCase()
      );
      // console.log(data.comment);
      // console;
      if (isCustomCommentCheck) {
        handleCommentChange("custom");
      }
      const isCustomPurposeCheck = !purposes.find(
        (purpose) => purpose?.value?.toLowerCase() === data?.purpose?.toLowerCase()
      );
      if (isCustomPurposeCheck) {
        handlePurposeChange("custom");
      }
      setFormData({
        status: data.status || "",
        comment: data.comment || "",
        contact_type: data.contact_type || "",
        managed_by_id: data.managed_by?.id || null,
        purpose: data.purpose || "",
        next_followup_reminder: data.next_followup_reminder || "",
      });
    }
  }, [data, trainers, purposes, comments]);

  const resetForm = () => {
    setFormData(initialFormState);
    setIsCustomComment(false);
  };
  const handlePurposeChange = (value: string) => {
    if (value === "custom") {
      setIsCustomPurpose(true);
      setFormData((prev) => ({ ...prev, purpose: "" }));
    } else {
      setIsCustomPurpose(false);
      handleInputChange("purpose", value);
    }
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
      setIsCustomComment(true);
      setFormData((prev) => ({ ...prev, comment: "" }));
    } else {
      setIsCustomComment(false);
      handleInputChange("comment", value);
    }
  };

  const handleSubmit = async () => {
    if (!formData.status) {
      toast.error("Please select a status");
      return;
    }
    if (!formData.comment) {
      toast.error("Please provide a comment");
      return;
    }

    try {
      setIsSubmitting(true);
      const gymId = await retrieveGymId();

      await AxiosPrivate.patch(`/api/followups/${data?.id}/?gym_id=${gymId}`, {
        comment: formData.comment,
        contact_type: formData.contact_type,
        member_id: data?.member?.id,
        managed_by_id: formData.managed_by_id,
        purpose: formData.purpose,
        status: formData.status,
        next_followup_reminder: formData.next_followup_reminder,
      });

      toast.success("Followup added successfully");
      resetForm();
      setOpenMemberId(null);
      invalidateAll();
      refreshData();
    } catch (error) {
      console.error("Failed to add followup:", error);
      toast.error("Something went wrong while adding followup");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={id !== null}
      onClose={() => {
        setOpenMemberId(null);
      }}
      containerClassName="p-6 pt-3 md:p-8 overflow-y-auto custom-scrollbar"
    >
      <div className="sm:hidden min-w-full flex flex-row-reverse">
        <XIcon onClick={() => setOpenMemberId(null)} />
      </div>
      <div className="m-auto">
        <div className="flex flex-row justify-between items-center">
          <Title as="h3" className="mx-2 ">
            Edit Followup
          </Title>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader size="lg" variant="spinner" />
          </div>
        ) : (
          <div className="flex flex-col mt-4">
            <div>
              <Select
                label="Reason"
                value={isCustomPurpose ? "Custom" : formData.purpose}
                options={purposes ?? []}
                onChange={(option: any) => handlePurposeChange(option.value)}
                className="px-4 py-2 rounded-md "
                clearable
                onClear={() => {
                  setFormData((prev) => ({
                    ...prev,
                    purpose: "",
                  }));
                  setIsCustomPurpose(false);
                }}
              />
              {isCustomPurpose && (
                <Textarea
                  id="custom-comment"
                  label="Custom Reason"
                  labelClassName="text-sm"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  size="sm"
                  className=" px-4 py-2 rounded-md text-sm "
                  placeholder="Enter your Reason here..."
                  textareaClassName="text-sm"
                />
              )}
              <Select
                label="Handled By*"
                name="trainer"
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
                className="px-4 py-2 rounded-md "
                onChange={(option: any) => {
                  handleInputChange("managed_by_id", option?.value);
                }}
                getOptionDisplayValue={(option) =>
                  trainers?.length ? renderTrainers(option) : renderEmpty()
                }
                prefix={<FaBookReader className="text-primary" />}
                clearable
                onClear={() => {
                  setFormData((prev) => ({
                    ...prev,
                    managed_by_id: null,
                  }));
                }}
              />
              <Select
                name="status"
                label="Status"
                options={STATUS_CHOICES.map((stat) => ({
                  label: stat.label,
                  value: stat.value,
                }))}
                value={
                  formData.status
                    ? STATUS_CHOICES.find(
                        (stat) => stat.value === formData.status
                      )?.label
                    : ""
                }
                onChange={(option: any) =>
                  handleInputChange("status", option.value)
                }
                className="px-4 py-2 rounded-md "
              />
            </div>
            <div>
              <Select
                label="Comment"
                options={comments ?? []}
                value={
                  isCustomComment
                    ? "custom"
                    : comments?.find(
                        (comment) =>
                          comment &&
                          comment.value &&
                          comment.value.toLowerCase() ===
                            formData.comment.toLowerCase()
                      )?.value || "custom"
                }
                onChange={(option: any) => handleCommentChange(option.value)}
                className="px-4 py-2 rounded-md "
              />
              {isCustomComment && (
                <Textarea
                  id="custom-comment"
                  label="Custom Comment"
                  labelClassName="text-sm"
                  value={formData.comment}
                  onChange={(e) => handleInputChange("comment", e.target.value)}
                  size="sm"
                  className=" px-4 py-2 rounded-md text-sm "
                  placeholder="Enter your custom comment here..."
                  textareaClassName="text-sm"
                />
              )}
            </div>
            <div className="flex flex-col gap-2 px-4 my-1">
              <Text className="font-medium">Next Reminder</Text>
              <DatePicker
                name="next_followup_reminder"
                value={
                  formData.next_followup_reminder
                    ? formateDateValue(
                        new Date(formData.next_followup_reminder)
                      )
                    : ""
                }
                // value={data.next_followup_reminder}
                onChange={(date: any) =>
                  setFormData((prev) => ({
                    ...prev,
                    next_followup_reminder: formateDateValue(
                      new Date(date.getTime()),
                      "YYYY-MM-DD"
                    ),
                  }))
                }
                placeholderText="Select the Next Reminder Date"
                showMonthDropdown={true}
                showYearDropdown={true}
                scrollableYearDropdown={true}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                className="col-span-full sm:col-span-1"
              />
            </div>
            <Select
              label="Contact Type"
              options={FOLLOW_TYPE_CHOICES}
              value={formData.contact_type}
              onChange={(option: any) =>
                handleInputChange("contact_type", option.value as string)
              }
              className=" px-4 py-2 rounded-md text-sm"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 mt-4 px-4">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              setOpenMemberId(null);
            }}
            className="hover:opacity-80 transition-opacity"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="hover:opacity-80 transition-opacity"
          >
            {isSubmitting ? <Loader variant="threeDot" /> : "Save"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
