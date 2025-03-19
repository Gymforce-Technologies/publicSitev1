// components/shifts/Edit.tsx
"use client";
import { useState, useEffect } from "react";
import { Modal, Button, Input, Title, Textarea, Drawer } from "rizzui";
// import { AxiosPrivate, newID } from "@/auth/AxiosPrivate";
// import { retrieveGymId } from "@/auth/InfoCookies";
import toast from "react-hot-toast";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { XIcon } from "lucide-react";

interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  description: string;
}

interface EditShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shift: Shift;
}

const EditShiftModal = ({
  isOpen,
  onClose,
  onSuccess,
  shift,
}: EditShiftModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    start_time: "",
    end_time: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    start_time: "",
    end_time: "",
    description: "",
  });

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name,
        start_time: shift.start_time,
        end_time: shift.end_time,
        description: shift.description || "",
      });
    }
  }, [shift]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      start_time: "",
      end_time: "",
      description: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
      isValid = false;
    }

    if (!formData.end_time) {
      newErrors.end_time = "End time is required";
      isValid = false;
    }

    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);

      if (start >= end) {
        newErrors.end_time = "End time must be after start time";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const gymId = await retrieveGymId();
      await AxiosPrivate.put(`/api/shifts/${shift.id}/?gym_id=${gymId}`, {
        gym_id: parseInt(gymId || ""),
        name: formData.name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        description: formData.description || "",
      });

      toast.success("Shift updated successfully");
      invalidateAll();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong while  updating shift"
      );
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      start_time: "",
      end_time: "",
      description: "",
    });
    setErrors({
      name: "",
      start_time: "",
      end_time: "",
      description: "",
    });
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-4 p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <Title as="h3" className="text-gray-900 ">
            Edit Shift
          </Title>
          <XIcon onClick={() => handleClose()} className="cursor-pointer" />
        </div>
        <Input
          label="Name"
          placeholder="Enter shift name"
          value={formData.name}
          error={errors.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className=""
          labelClassName=""
        />

        <Input
          type="time"
          label="Start Time"
          value={formData.start_time}
          error={errors.start_time}
          onChange={(e) =>
            setFormData({ ...formData, start_time: e.target.value })
          }
          className=""
          labelClassName=""
        />

        <Input
          type="time"
          label="End Time"
          value={formData.end_time}
          error={errors.end_time}
          onChange={(e) =>
            setFormData({ ...formData, end_time: e.target.value })
          }
          className=""
          labelClassName=""
        />

        <Textarea
          label="Description"
          placeholder="Enter shift description"
          value={formData.description}
          error={errors.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className=""
          labelClassName=""
        />

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Shift</Button>
        </div>
      </div>
    </Drawer>
  );
};

export default EditShiftModal;
