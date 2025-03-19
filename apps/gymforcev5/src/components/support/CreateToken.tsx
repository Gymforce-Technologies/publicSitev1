"use client";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Button, Input, Loader, Radio, Text, Textarea, Title } from "rizzui";
// interface Issue {
//   type: "ISSUE" | "FEEDBACK";
//   heading: String;
//   subject: String;
//   description: String;
// }
const issueOptions = [
  {
    value: "Payment Related Issues",
    label: "Payment Related Issues",
  },
  {
    value: "Billing Related Issues",
    label: "Billing Related Issues",
  },
  {
    value: "Member And Memberships Related Issues",
    label: "Member And Memberships Related Issues",
  },
  {
    value: "Biometric Related Issues",
    label: "Biometric Related Issues",
  },
  {
    value: "SMS And Email Related Issues",
    label: "SMS And Email Related Issues",
  },
  {
    value: "Assigning Work Related Issues",
    label: "Assigning Work Related Issues",
  },
  {
    value: "Something Else",
    label: "Something Else",
  },
];

const CreateToken = () => {
  const [formData, setFormData] = useState({
    type: "ISSUE",
    heading: "",
    subject: "",
    description: "",
  });
  const [errors, setErrors] = useState({
    heading: "",
    subject: "",
    description: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleChange = async (e: any) => {
    const { name, value } = e.target;
    if (name == "type") {
      setFormData({
        type: value,
        heading: "",
        subject: "",
        description: "",
      });
      setErrors({
        heading: "",
        subject: "",
        description: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const validateForm = () => {
    let newErrors = { heading: "", subject: "", description: "" };
    if (formData.type === "ISSUE" && !formData.heading) {
      newErrors.heading = "Please select an issue type.";
    }
    if (formData.type === "FEEDBACK" && !formData.subject) {
      newErrors.subject = "Please provide a subject for your feedback.";
    }
    if (!formData.description) {
      newErrors.description = "Please describe your request.";
    }

    setErrors(newErrors);

    // Return true if there are no errors
    return (!newErrors.heading || !newErrors.subject) && !newErrors.description;
  };
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Fill the all fileds");
      return;
    }

    try {
      setLoading(true);
      const data =
        formData.type == "ISSUE"
          ? {
              type: formData.type,
              heading: formData.heading,
              description: formData.description,
            }
          : {
              type: formData.type,
              heading: formData.subject,
              description: formData.description,
            };
      console.log(data);
      const gym_id = await retrieveGymId();
      const response: any = await AxiosPrivate.post(
        `api/issues/create/?gym_id=${gym_id}`,
        data
      );
      setFormData({
        type: data.type,
        heading: "",
        subject: "",
        description: "",
      });
      if (data.type == "ISSUE") {
        toast.success(
          "Your Issue was recorded and sent to the team. Your Issues will be resolved within 24 hours or you will receive a call from Gymfore Team.Thank you for being a Valuable Customer",
          {
            duration: 5000,
          }
        );
      } else {
        toast.success("Thank you for providing valuable feedback!");
      }
      invalidateAll();
      console.log(response);
      const ticketId = response?.data?.data?.id;
      router.push(`/support/view-ticket/${ticketId}`);
    } catch (error) {
      console.error("Error submitting ticket", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="">
      <Title as="h3" className="">
        Create Ticket
      </Title>
      <Title
        as="h5"
        className="p-6 bg-primary rounded-md mt-3  text-white"
      >
        Ticket Information
      </Title>
      <div className="p-4">
        <div>
          <Title as="h6" className="">
            Choose Ticket Type
          </Title>
          <div>
            <Radio
              className="m-2"
              label="Error/BugIsuue"
              value="ISSUE"
              name="type"
              onChange={handleChange}
              checked={formData.type === "ISSUE"}
            />
            <Radio
              className="m-2"
              label="New Feature Requirement"
              value="FEEDBACK"
              name="type"
              onChange={handleChange}
              checked={formData.type === "FEEDBACK"}
            />
          </div>
        </div>
        <div>
          {formData.type == "ISSUE" && (
            <div className="flex flex-col gap-5 mt-5">
              <div>
                <Title as="h6" className="">
                  Please Indicate What Your Request Related To
                </Title>
                <div>
                  {issueOptions.map((option) => (
                    <Radio
                      key={option.value}
                      className="m-2"
                      label={option.label}
                      value={option.value}
                      name="heading"
                      onChange={handleChange}
                      checked={formData.heading == option.value}
                    />
                  ))}
                  {errors.heading && (
                    <Text className="text-red-500">{errors.heading}</Text>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-5 mt-5">
            {formData.type == "FEEDBACK" && (
              <div>
                <Title as="h6" className="">
                  Please Enter Subject Of Your Request
                </Title>

                <Input
                  placeholder="Subject"
                  className="py-3"
                  name="subject"
                  onChange={handleChange}
                  value={formData.subject}
                />
                {errors.subject && (
                  <Text className="text-red-500">{errors.subject}</Text>
                )}
              </div>
            )}
            <div>
              <Title as="h6" className="">
                Please describe your request as much details as you can
              </Title>
              <Textarea
                placeholder="Write your description"
                className="py-3"
                name="description"
                onChange={handleChange}
                value={formData.description}
              />
              {errors.description && (
                <Text className="text-red-500">{errors.description}</Text>
              )}
            </div>
            <div className="flex justify-center w-full">
              <Button className="" onClick={handleSubmit}>
                {loading ? <Loader variant="threeDot" /> : "Submit Ticket"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateToken;
