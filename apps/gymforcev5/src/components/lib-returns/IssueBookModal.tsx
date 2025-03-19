"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Loader,
  Text,
  Button,
  Input,
  Badge,
  Avatar,
  Modal,
  Title,
  Empty,
  Textarea,
  MultiSelect,
  Drawer,
} from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "../../app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import { DemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { XIcon } from "lucide-react";
import { DatePicker } from "@core/ui/datepicker";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";

interface Book {
  id: number;
  name: string;
  price: string;
  publisher: string;
  author: string;
  serial_number: string;
  stock: number;
  remarks: string;
  added_on: string;
  center: number;
  user: number;
  total_issued: number;
}

interface Member {
  id: number;
  name: string;
  phone: string;
  email?: string;
  image?: string;
  membership_details?: {
    name: string;
    latest_membership_end_date: string;
  };
}

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

const IssueBookModal = ({
  isOpen,
  onClose,
  onSuccess,
  editOperation = null,
  demographic,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editOperation?: BookOperation | null;
  demographic: DemographicInfo | null;
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: editOperation?.member?.name || "",
    contact: editOperation?.member?.contact || "",
    books: editOperation?.books?.map((book) => book.id) || [],
    remarks: "",
    return_due: editOperation?.return_due
      ? formateDateValue(new Date(editOperation.return_due), "YYYY-MM-DD")
      : formateDateValue(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          "YYYY-MM-DD"
        ), // Default to 7 days from now
    issued_on: editOperation?.issued_on
      ? formateDateValue(new Date(editOperation.issued_on), "YYYY-MM-DD")
      : formateDateValue(new Date(), "YYYY-MM-DD"),
    charges: editOperation?.charges.toString() || "0",
    operation_id: editOperation?.operation_id || null,
  });

  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [searchText, setSearchText] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [memberSearchLoading, setMemberSearchLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;
  const observerRef = useRef(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const fetchAvailableBooks = async () => {
    try {
      setBooksLoading(true);
      const centerId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/lf/books/?center=${centerId}`,
        {
          id: newID(`available-books-list`),
        }
      );

      const transformedData = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        publisher: item.publisher,
        author: item.author,
        serial_number: item.serial_number,
        stock: item.stock,
        remarks: item.remarks,
        added_on: item.added_on,
        center: item.center,
        user: item.user,
        total_issued: item.total_issued,
      }));

      setAvailableBooks(transformedData);
    } catch (error) {
      console.error("Error fetching available books:", error);
      toast.error("Failed to load available books");
    } finally {
      setBooksLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableBooks();
    if (editOperation) {
      setCurrentMember({
        id: editOperation.member.id || 0,
        name: editOperation.member.name,
        phone: editOperation.member.contact,
        email: editOperation.member.email || "",
        membership_details: undefined,
      });
    }
    // Focus the search input when not editing
    if (!editOperation && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editOperation]);

  const handleSearchInputChange = (input: string) => {
    setSearchText(input);
    setOffset(0);
    setMemberList([]);
    setHasMore(true);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      handleSearch(input, false, true);
    }, 1000);

    setTimeoutId(newTimeoutId);
  };

  const handleSearch = async (
    searchInput: string,
    isLoadMore: boolean,
    load = false
  ) => {
    try {
      if (load) {
        setMemberSearchLoading(true);
      }
      if (!isLoadMore || load) {
        setOffset(0);
      }
      // Use the current offset state value directly
      const currentOffset = isLoadMore ? offset : 0;
      const gymid = await retrieveGymId();

      const response = await AxiosPrivate.post(
        `/api/member_search/v2/?gym_id=${gymid}`,
        {
          filterString: searchInput,
          limit: LIMIT,
          offset: currentOffset,
        }
      );

      const newMembers = response.data.data.memberList;
      const totalCount = response.data.data.totalCount;

      // Use functional updates to ensure we have the latest state
      setMemberList((prevList) =>
        isLoadMore ? [...prevList, ...newMembers] : newMembers
      );

      // Calculate if there are more items to load
      const newTotalCount = isLoadMore
        ? memberList.length + newMembers.length
        : newMembers.length;

      setHasMore(newTotalCount < totalCount);

      // Update offset only after data is loaded
      setOffset(isLoadMore ? currentOffset + LIMIT : LIMIT);
    } catch (error) {
      console.error(error);
    } finally {
      setMemberSearchLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          handleSearch(searchText, true);
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, memberSearchLoading, searchText, memberList.length]);

  const handleSelect = (data: Member) => {
    setCurrentMember(data);
    setFormData((prev) => ({
      ...prev,
      name: data.name,
      contact: data.phone,
    }));
    setSearchText("");
    setMemberList([]);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.books || formData.books.length === 0) {
        toast.error("Please select at least one book");
        return;
      }

      if (!formData.name || !formData.contact) {
        toast.error("Member name and contact are required");
        return;
      }

      setLoading(true);
      const centerId = await retrieveGymId();

      // Data structure for API
      const apiData = {
        name: formData.name,
        contact: formData.contact,
        books: formData.books,
        remarks: formData.remarks,
        return_due: formData.return_due,
        issued_on: formData.issued_on,
        charges: formData.charges,
      };

      if (editOperation) {
        // const books = editOperation.books.map((book) => {
        //   if (!formData.books.includes(book.id)) {
        //     return { id: book.id, name: book.name };
        //   }
        // });
        await AxiosPrivate.patch(
          `/api/lf/book/issue-return/?center=${centerId}`,
          {
            operation_id: editOperation.operation_id,
            ...apiData,
          }
        );
        toast.success("Book issue updated successfully");
      } else {
        // Create new operation
        await AxiosPrivate.post(
          `/api/lf/book/issue-return/?center=${centerId}`,
          apiData
        );
        toast.success("Books issued successfully");
      }

      invalidateAll();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error issuing/updating book:", error);
      toast.error("Failed to process book issue");
    } finally {
      setLoading(false);
    }
  };

  const bookOptions = availableBooks
    .filter(
      (book) =>
        book.stock > book.total_issued ||
        editOperation?.books?.some((eb) => eb.id === book.id)
    )
    .map((book) => ({
      value: book.id.toString(),
      label: `${book.name} (${book.serial_number})`,
    }));

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div className="p-5 lg:p-8 custom-scrollbar overflow-y-auto max-h-[98vh]">
        <Title as="h3" className="mb-6">
          {editOperation ? "Edit Book Issue" : "Issue New Books"}
        </Title>

        <div className="grid gap-6">
          {/* Member selection or display */}
          {!editOperation ? (
            <div>
              <Text className="font-medium mb-2">Select Member</Text>
              <div className="relative">
                <Input
                  value={searchText}
                  ref={inputRef}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  placeholder={
                    currentMember === null
                      ? "Search members by name or contact"
                      : "Clear selected member to search"
                  }
                  onFocus={() => {
                    searchText.length === 0
                      ? setTimeout(() => handleSearch("", false, true), 300)
                      : "";
                  }}
                  prefix={
                    <PiMagnifyingGlassBold
                      className="text-gray-600"
                      size={20}
                    />
                  }
                  disabled={currentMember !== null}
                  suffix={
                    searchText && (
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => {
                          setSearchText("");
                          setMemberList([]);
                          setCurrentMember(null);
                        }}
                      >
                        <XIcon />
                      </Button>
                    )
                  }
                />

                {currentMember === null && (
                  <div className="absolute top-full left-0 z-[999] flex w-full border-2 transition-all duration-200 custom-scrollbar shadow rounded-lg p-4 py-8 mt-4 gap-2 flex-col items-stretch bg-gray-50 max-h-[25vh] overflow-y-auto custom-scrollbar">
                    {memberSearchLoading && memberList.length === 0 ? (
                      <div className="flex justify-center items-center w-full my-4">
                        <Loader variant="spinner" size="xl" />
                      </div>
                    ) : memberList.length ? (
                      memberList.map((item, index) => {
                        const isSecondToLast = index === memberList.length - 2;
                        return (
                          <div
                            ref={isSecondToLast ? observerRef : null}
                            className="flex relative items-center gap-4 p-2 md:p-4 rounded cursor-pointer hover:bg-gray-100 hover:scale-y-105 group border border-gray-200"
                            key={index}
                            onClick={() => handleSelect(item)}
                          >
                            <Avatar
                              name={item.name}
                              src={item.image || "/placeholder-avatar.jpg"}
                              className="text-white"
                            />
                            <div className="flex flex-col">
                              <Text className="font-medium text-gray-900 group-hover:text-gray-900">
                                {item.name}
                              </Text>
                              <Text className="text-gray-500">
                                {item.phone}
                              </Text>
                            </div>
                            {item.membership_details && (
                              <div className="flex items-center ml-auto">
                                <Badge
                                  variant="outline"
                                  className="max-sm:scale-90 text-nowrap"
                                >
                                  {item.membership_details?.name || "N/A"}
                                </Badge>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="my-4">
                        <Empty text="No Members Found" />
                      </div>
                    )}
                    {memberSearchLoading && memberList.length > 0 && (
                      <div className="flex justify-center items-center py-4">
                        <Loader variant="spinner" size="xl" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <Text className="font-medium mb-2">Member</Text>
              <div className="flex items-center gap-3 p-3 border rounded-md bg-gray-50">
                <Avatar
                  name={formData.name}
                  src={currentMember?.image || "/placeholder-avatar.jpg"}
                  className="text-white"
                />
                <div className="flex flex-col">
                  <Text className="font-medium text-gray-900">
                    {formData.name}
                  </Text>
                  <Text className="text-gray-500">{formData.contact}</Text>
                </div>
              </div>
            </div>
          )}

          {/* Selected Member Card */}
          {!editOperation && currentMember && (
            <div className="p-4 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <Title as="h6" className="font-semibold">
                  Selected Member
                </Title>
                <XIcon
                  onClick={() => {
                    setCurrentMember(null);
                    setFormData((prev) => ({
                      ...prev,
                      name: "",
                      contact: "",
                    }));
                    setSearchText("");
                    setTimeout(() => handleSearch("", false, true), 300);
                  }}
                  size={20}
                  className="hover:text-primary cursor-pointer hover:scale-105"
                />
              </div>

              <div className="flex items-center gap-3">
                <Avatar
                  name={currentMember.name}
                  size="lg"
                  src={currentMember.image}
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {currentMember.name}
                  </p>
                  <p className="text-gray-600">{currentMember.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Book selection */}
          <div>
            <Text className="font-medium mb-2">Select Books</Text>
            {booksLoading ? (
              <div className="flex justify-center items-center py-4">
                <Loader variant="spinner" size="lg" />
              </div>
            ) : (
              <MultiSelect
                options={bookOptions}
                value={formData.books.map((id) => id.toString())}
                onChange={(value: any[]) => {
                  setFormData((prev) => ({ ...prev, books: value }));
                }}
                placeholder="Select books to issue"
                className="w-full"
              />
            )}
            {availableBooks.length === 0 && !booksLoading && (
              <Text className="text-sm mt-2 text-red-500">
                No books available for issue
              </Text>
            )}
          </div>

          {/* Issue and Return dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text className="font-medium mb-2">Issue Date</Text>
              <DatePicker
                value={formateDateValue(
                  new Date(formData.issued_on),
                  "YYYY-MM-DD"
                )}
                onChange={(date: Date | null) =>
                  handleFormChange(
                    "issued_on",
                    formateDateValue(new Date(date!), "YYYY-MM-DD")
                  )
                }
                className="w-full"
              />
            </div>
            <div>
              <Text className="font-medium mb-2">Return Due Date</Text>
              <DatePicker
                value={formateDateValue(
                  new Date(formData.return_due),
                  "YYYY-MM-DD"
                )}
                onChange={(date: Date | null) =>
                  handleFormChange(
                    "return_due",
                    formateDateValue(new Date(date!), "YYYY-MM-DD")
                  )
                }
                className="w-full"
              />
            </div>
          </div>

          {/* Charges and remarks */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Text className="font-medium mb-2">Charges</Text>
              <Input
                type="number"
                value={formData.charges}
                onChange={(e) => handleFormChange("charges", e.target.value)}
                placeholder="Enter charges amount"
                prefix={demographic?.currency_symbol || ""}
              />
            </div>
            <div>
              <Text className="font-medium mb-2">Remarks</Text>
              <Textarea
                value={formData.remarks}
                onChange={(e) => handleFormChange("remarks", e.target.value)}
                placeholder="Add any additional notes"
                className="w-full"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              // loading={loading}
              disabled={
                formData.books.length === 0 ||
                !formData.name ||
                !formData.contact
              }
            >
              {loading ? (
                <Loader variant="threeDot" />
              ) : editOperation ? (
                "Update Issue"
              ) : (
                "Issue Books"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default IssueBookModal;
