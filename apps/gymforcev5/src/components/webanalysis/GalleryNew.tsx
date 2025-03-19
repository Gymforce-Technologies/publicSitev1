"use client";
import { useState, useRef } from "react";
import { Button, Drawer, Input, Title, Tooltip } from "rizzui";
import { AxiosPrivate, invalidateAll, newID } from "../../app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";

interface FormDataType {
  title: string;
  description: string;
  image: File | null;
  image_type: string;
  preview: string | null;
}

const NewGallery = ({
  isOpen,
  setIsOpen,
  onSuccess,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSuccess: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    description: "",
    image: null,
    image_type: "",
    preview: null,
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        image: file,
        preview: previewUrl,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gymId = await retrieveGymId();
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      formDataToSend.append("gym", gymId ?? "");
      formDataToSend.append("image_type", formData.image_type);

      await AxiosPrivate.post(
        `/api/list-create-gallery/?gym_id=${gymId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          id: newID("create-gallery"),
        }
      );

      setIsOpen(false);
      invalidateAll();
      onSuccess();
      // Clean up preview URL
      if (formData.preview) {
        URL.revokeObjectURL(formData.preview);
      }
      setFormData({
        title: "",
        description: "",
        image: null,
        image_type: "",
        preview: null,
      });
    } catch (error) {
      console.error("Error creating gallery image:", error);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setFormData({
          title: "",
          description: "",
          image: null,
          image_type: "",
          preview: null,
        });
      }}
      size="md"
      containerClassName="overflow-y-auto custom-scrollbar"
    >
      <div className="p-8">
        <Title as="h4" className="mb-6">
          Add Gallery Image
        </Title>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <Tooltip content="The Image Size Should be Less that 1MB" placement="bottom">
              <Button
                type="button"
                // variant="outline"
                onClick={handleImageClick}
                className="w-full"
              >
                Choose Image
              </Button>
            </Tooltip>
            <div className="min-w-full flex items-center justify-center">
              {formData.preview && (
                <div className="mt-4">
                  <img
                    src={formData.preview}
                    alt="Preview"
                    className="max-w-full h-[200px] object-contain rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
          <Input
            label="Title"
            placeholder="Enter Title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            required
          />

          <Input
            label="Description"
            placeholder="Enter Description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            required
          />

          <Input
            label="Image Type"
            value={formData.image_type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, image_type: e.target.value }))
            }
          />

          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setFormData({
                  title: "",
                  description: "",
                  image: null,
                  image_type: "",
                  preview: null,
                });
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Add Image</Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default NewGallery;
