"use client";
import React, { useState } from "react";
import {
  Loader,
  Text,
  Button,
  Modal,
  Title,
  Drawer,
  Announcement,
} from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
} from "../../app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import { DatePicker } from "@core/ui/datepicker";
import { MultiSelect } from "rizzui";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";

interface BookOperation {
  operation_id: number;
  member: {
    id: number | null;
    name: string;
    email: string | null;
    contact: string;
    address: string | null;
  };
  books: {
    id: number;
    name: string;
  }[];
  issued_on: string;
  return_due: string;
  charges: number;
  status: "Issued" | "Returned";
}

const BookReturn = ({
  isOpen,
  onClose,
  operation,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  operation: BookOperation;
  onSuccess: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedBooks, setSelectedBooks] = useState<string[]>(
    operation.books.map((book) => book.id.toString())
  );

  const handleReturnBook = async () => {
    try {
      setLoading(true);
      const centerId = await retrieveGymId();
      await AxiosPrivate.patch(
        `/api/lf/book/issue-return/?center=${centerId}`,
        {
          operation_id: operation.operation_id,
          return_date: new Date(returnDate).toISOString().split("T")[0],
          returned_books: selectedBooks,
        }
      );
      invalidateAll();
      toast.success("Books returned successfully");
      onSuccess();
    } catch (error) {
      console.error("Error returning books:", error);
      toast.error("Failed to return books");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div className="p-5 lg:p-8 custom-scrollbar overflowy-auto max-h-[98vh]">
        <Title as="h3" className="mb-6">
          Return Books
        </Title>

        <div className="space-y-4">
          <div>
            <Text className="font-medium mb-2">Return Date</Text>
            <DatePicker
              value={formateDateValue(new Date(returnDate), "YYYY-MM-DD")}
              onChange={(date: Date | null) =>
                setReturnDate(
                  formateDateValue(new Date(date!.getTime()), "YYYY-MM-DD")
                )
              }
              className="w-full"
            />
          </div>

          <div className="sap">
            <Announcement
              className="font-medium mb-2"
              badgeText={operation.member.name}
            >
              Select Books to Return
            </Announcement>
            <MultiSelect
              value={selectedBooks}
              options={operation.books.map((book) => ({
                label: book.name,
                value: book.id.toString(),
              }))}
              onChange={setSelectedBooks}
              label="Select Books"
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose} className="h-10">
              Cancel
            </Button>
            <Button
              onClick={handleReturnBook}
              disabled={selectedBooks.length === 0}
              className="h-10"
            >
              {loading ? <Loader variant="threeDot" /> : "Confirm Return"}
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
export default BookReturn;
