import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Button,
  Input,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Text,
  Textarea,
  Title,
} from "rizzui";

interface FeedbackModalProps {
  gymId: number;
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  gymId,
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    feedback_type: "Member",
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

  const handleRatingChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      rating: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `https://backend.gymforce.in/center/new-feedback/${gymId}/`,
        {
          ...formData,
          rating: formData.rating.toString(),
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // Success handling
      toast.success(response.data.message);
      onClose();
    } catch (error) {
      // Error handling
      console.error("Feedback submission failed", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      containerClassName="p-8"
      className="z-[9999999]"
    >
      <Title as="h3" className="pb-4">
        Feedback
      </Title>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 px-2">
          {/* Name Input */}
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full"
          />

          {/* Phone Input */}
          <Input
            type="tel"
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full"
          />

          {/* Feedback Type Select */}
          <Select
            label="Feedback Type"
            name="feedback_type"
            value={formData.feedback_type}
            onChange={(option: any) =>
              setFormData((prev) => ({
                ...prev,
                feedback_type: option.value ?? "",
              }))
            }
            options={[
              { value: "Member", label: "Member" },
              { value: "Enquiry", label: "Enquiry" },
              { value: "Staff", label: "Staff" },
            ]}
          />

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
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Submit Feedback
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FeedbackModal;
