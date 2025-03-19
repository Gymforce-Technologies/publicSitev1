// components/books/BookSection.tsx
"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Loader, Text, Tooltip, ActionIcon, Button } from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "../../app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import { MdDelete, MdEdit } from "react-icons/md";
import { PlusIcon } from "lucide-react";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { isStaff } from "@/app/[locale]/auth/Staff";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";

const AddBookModal = dynamic(() => import("@/components/lib-books/Add"));
const EditBookModal = dynamic(() => import("@/components/lib-books/Edit"));

interface Book {
  index: number;
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

const BookSection = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [column, setColumn] = useState<keyof Book>("id");
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);
  const [demographic, setDemographic] = useState<DemographicInfo | null>(null);

  const fetchBooks = async (): Promise<void> => {
    try {
      setLoading(true);
      const centerId = await retrieveGymId(); // Assuming this retrieves the center ID
      const response = await AxiosPrivate.get(
        `/api/lf/books/?center=${centerId}`,
        {
          id: newID(`books-list`),
        }
      );
      console.log(response.data);
      const transformedData = response.data.map((item: any, index: number) => ({
        index: index + 1,
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
      setBooks(transformedData);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Something went wrong while fetching books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getStatus = async () => {
      try {
        const resp = await isStaff();
        if (resp) {
          setAuth(!resp);
          await fetchPermissions();
        }
      } catch (error) {
        console.error("Error getting staff status:", error);
      }
    };
    const getInfo = async () => {
      const info = await retrieveDemographicInfo();
      setDemographic(info);
    };
    getStatus();
    getInfo();
  }, []);

  const fetchPermissions = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const userId = resp.data?.user_id;
      const response = await AxiosPrivate.get(
        `api/staff-permission/${userId}/?gym_id=${gymId}`,
        {
          id: newID(`staff-permission-${userId}`),
        }
      );
      const isEnquiry =
        response.data.permissions["libraryManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
    }
  };

  const handleDeleteBook = async (bookId: number): Promise<void> => {
    try {
      const centerId = await retrieveGymId();
      await AxiosPrivate.delete(`/api/lf/books/${bookId}/?center=${centerId}`);
      invalidateAll();
      fetchBooks();
      toast.success("Book deleted successfully");
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Something went wrong while deleting book");
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingBook(null);
  };

  const getColumns = useCallback(
    (column: keyof Book) => [
      {
        title: (
          <HeaderCell title="Serial No" className="text-sm font-semibold" />
        ),
        dataIndex: "serial_number",
        key: "serial_number",
        width: 100,
        render: (serial: string) => <Text>{serial}</Text>,
      },
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "name",
        key: "name",
        width: 150,
        render: (name: string) => (
          <Text className="font-semibold text-gray-900">{name}</Text>
        ),
      },

      {
        title: <HeaderCell title="Author" className="text-sm font-semibold" />,
        dataIndex: "author",
        key: "author",
        width: 150,
        render: (author: string) => <Text>{author}</Text>,
      },
      {
        title: <HeaderCell title="Price" className="text-sm font-semibold" />,
        dataIndex: "price",
        key: "price",
        width: 100,
        render: (price: string) => (
          <Text className="font-medium">
            {demographic?.currency_symbol || ""}
            {price}
          </Text>
        ),
      },
      //   {
      //     title: (
      //       <HeaderCell title="Publisher" className="text-sm font-semibold" />
      //     ),
      //     dataIndex: "publisher",
      //     key: "publisher",
      //     width: 150,
      //     render: (publisher: string) => <Text>{publisher}</Text>,
      //   },

      {
        title: <HeaderCell title="Stock" className="text-sm font-semibold" />,
        dataIndex: "stock",
        key: "stock",
        width: 80,
        render: (stock: number) => <Text>{stock}</Text>,
      },
      {
        title: <HeaderCell title="Issued" className="text-sm font-semibold" />,
        dataIndex: "total_issued",
        key: "total_issued",
        width: 80,
        render: (total: number) => <Text>{total}</Text>,
      },
      {
        title: <></>,
        dataIndex: "id",
        key: "id",
        width: 80,
        render: (id: number, row: Book) => (
          <div className="flex items-center gap-2 justify-end">
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                setIsEditOpen(true);
                setEditingBook(row);
              }}
              variant="text"
            >
              <MdEdit size={20} />
            </ActionIcon>
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                handleDeleteBook(id);
              }}
              variant="text"
            >
              <MdDelete size={20} />
            </ActionIcon>
          </div>
        ),
      },
    ],
    [column, auth, access, books, demographic]
  );

  const columns = useMemo(() => getColumns(column), [column, getColumns]);

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <>
      <WidgetCard
        className="relative dark:bg-inherit"
        headerClassName="items-center"
        title="Books"
        titleClassName="whitespace-nowrap"
        action={
          <Button
            onClick={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 max-sm:scale-90"
          >
            Add Book <PlusIcon size={20} />
          </Button>
        }
      >
        {loading ? (
          <div className="grid h-32 flex-grow place-content-center items-center">
            <Loader size="xl" variant="spinner" />
          </div>
        ) : (
          <Table
            variant="minimal"
            data={books}
            // @ts-ignore
            columns={columns}
            scroll={{ y: 500, x: "max-content" }}
            className="text-sm mt-4 text-nowrap rounded-sm [&_.rc-table-row:hover]:bg-gray-50"
          />
        )}
      </WidgetCard>

      {isCreateModalOpen && (
        <AddBookModal
          isOpen={isCreateModalOpen}
          demographic={demographic}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchBooks}
        />
      )}

      {isEditOpen && editingBook && (
        <EditBookModal
          isOpen={isEditOpen}
          demographic={demographic}
          onClose={handleCloseEdit}
          book={editingBook}
          onSuccess={fetchBooks}
        />
      )}
    </>
  );
};

export default BookSection;
