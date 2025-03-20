"use client";
import { AxiosPublic } from "@/app/[locale]/auth/AxiosPrivate";
import { useState } from "react";
import {
  Button,
  Input,
  Radio,
  RadioGroup,
  Select,
  Text,
  Textarea,
  Title,
} from "rizzui";
import { getMemberToken } from "./Member";
import toast from "react-hot-toast";

export default function PublicMemberFeedbackSection() {
  const [formData, setFormData] = useState({
    comment: "",
    rating: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = getMemberToken();
    try {
      const response = await AxiosPublic.post(
        `https://backend.gymforce.in/center/member-feedback/`,
        {
          ...formData,
          rating: formData.rating.toString(),
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            auth: token,
          },
        }
      );

      // Success handling
      toast.success(response.data.message);
    } catch (error) {
      // Error handling
      console.error("Feedback submission failed", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="max-w-3xl p-4 md:p-8">
      <Title as="h3" className="pb-4">
        Feedback
      </Title>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 px-2">
          {/* Rating RadioGroup */}
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Text className="font-medium">Rating</Text>
              <Text className="text-[13px]">( Rate us Out of 5)</Text>
            </div>
            <RadioGroup
              value={formData.rating}
              //@ts-ignore
              setValue={(value: string) =>
                setFormData((prev) => ({
                  ...prev,
                  rating: value,
                }))
              }
              className="flex gap-4 px-4 py-1"
            >
              {[1, 2, 3, 4, 5].map((rating) => (
                <Radio
                  key={rating}
                  label={`${rating}`}
                  value={rating.toString()}
                />
              ))}
            </RadioGroup>
          </div>
          {/* Comment Textarea */}
          <Textarea
            label="Comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            required
            className="w-full"
            placeholder="Explain Your Experience with Us here...."
            rows={4}
          />
        </div>

        <Button type="submit" isLoading={isSubmitting} className="mt-4">
          Submit Feedback
        </Button>
      </form>
    </div>
  );
}
