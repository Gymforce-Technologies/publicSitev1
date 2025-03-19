// components/books/Edit.tsx
"use client";
import { useState, useEffect } from "react";
import { Button, Input, Title, Textarea, Drawer, Text } from "rizzui";
import toast from "react-hot-toast";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { XIcon } from "lucide-react";
import { DemographicInfo } from "@/app/[locale]/auth/DemographicInfo";

interface Book {
  id: number;
  name: string;
  price: string;
  publisher: string;
  author: string;
  serial_number: string;
  stock: number;
  remarks: string;
}

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  book: Book;
  demographic: DemographicInfo | null;
}

const EditBookModal = ({
  isOpen,
  onClose,
  onSuccess,
  book,
  demographic,
}: EditBookModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    publisher: "",
    author: "",
    serial_number: "",
    stock: 0,
    remarks: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    price: "",
    publisher: "",
    author: "",
    serial_number: "",
    stock: "",
    remarks: "",
  });

  useEffect(() => {
    if (book) {
      setFormData({
        name: book.name,
        price: book.price,
        publisher: book.publisher,
        author: book.author,
        serial_number: book.serial_number,
        stock: book.stock,
        remarks: book.remarks || "",
      });
    }
  }, [book]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      price: "",
      publisher: "",
      author: "",
      serial_number: "",
      stock: "",
      remarks: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
      isValid = false;
    } else if (isNaN(parseFloat(formData.price))) {
      newErrors.price = "Price must be a valid number";
      isValid = false;
    }

    if (!formData.publisher.trim()) {
      newErrors.publisher = "Publisher is required";
      isValid = false;
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author is required";
      isValid = false;
    }

    if (!formData.serial_number.trim()) {
      newErrors.serial_number = "Serial number is required";
      isValid = false;
    }

    if (formData.stock <= 0) {
      newErrors.stock = "Stock must be greater than 0";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const centerId = await retrieveGymId();
      await AxiosPrivate.patch(`/api/lf/books/${book.id}/?center=${centerId}`, {
        name: formData.name,
        price: formData.price,
        publisher: formData.publisher,
        author: formData.author,
        serial_number: formData.serial_number,
        stock: formData.stock,
        remarks: formData.remarks || "",
        center: parseInt(centerId || ""),
      });

      toast.success("Book updated successfully");
      invalidateAll();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong while updating book"
      );
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      price: "",
      publisher: "",
      author: "",
      serial_number: "",
      stock: 0,
      remarks: "",
    });
    setErrors({
      name: "",
      price: "",
      publisher: "",
      author: "",
      serial_number: "",
      stock: "",
      remarks: "",
    });
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar max-h-[90vh] grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between mb-2  col-span-full">
          <Title as="h4" className="text-gray-900">
            Edit Book
          </Title>
          <XIcon onClick={() => handleClose()} className="cursor-pointer" />
        </div>
        <Input
          label="Name"
          placeholder="Enter book name"
          value={formData.name}
          error={errors.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <Input
          label="Price"
          placeholder="Enter price"
          value={formData.price}
          error={errors.price}
          prefix={
            <Text className="text-primary">
              {demographic?.currency_symbol ?? ""}
            </Text>
          }
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />

        <Input
          label="Publisher"
          placeholder="Enter publisher name"
          value={formData.publisher}
          error={errors.publisher}
          onChange={(e) =>
            setFormData({ ...formData, publisher: e.target.value })
          }
        />

        <Input
          label="Author"
          placeholder="Enter author name"
          value={formData.author}
          error={errors.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        />

        <Input
          label="Serial Number"
          placeholder="Enter serial number"
          value={formData.serial_number}
          error={errors.serial_number}
          onChange={(e) =>
            setFormData({ ...formData, serial_number: e.target.value })
          }
        />

        <Input
          type="number"
          label="Stock"
          placeholder="Enter stock quantity"
          value={formData.stock.toString()}
          error={errors.stock}
          onChange={(e) =>
            setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
          }
        />

        <Textarea
          label="Remarks"
          placeholder="Enter remarks"
          value={formData.remarks}
          error={errors.remarks}
          onChange={(e) =>
            setFormData({ ...formData, remarks: e.target.value })
          }
          className="col-span-full"
        />

        <div className="flex justify-end gap-4 mt-6 col-span-full">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Book</Button>
        </div>
      </div>
    </Drawer>
  );
};

export default EditBookModal;
