"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Loader, Text, ActionIcon, Badge, Button } from "rizzui";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "../../app/[locale]/auth/AxiosPrivate";
import WidgetCard from "@/components/cards/widget-card";
import Table from "@/components/rizzui/table/table";
import { HeaderCell } from "@/components/table";
import { MdEdit } from "react-icons/md";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
// import dynamic from "next/dynamic";
import { isStaff } from "@/app/[locale]/auth/Staff";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import Link from "next/link";

import { PlusIcon } from "lucide-react";
import dynamic from "next/dynamic";

const BookReturn = dynamic(() => import("./BookReturn"));
const IssueBookModal = dynamic(() => import("./IssueBookModal"));
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

const BooksReturnSection = () => {
  const [issuedBooks, setIssuedBooks] = useState<BookOperation[]>([]);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
  const [selectedOperation, setSelectedOperation] =
    useState<BookOperation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);
  const [demographic, setDemographic] = useState<DemographicInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchBookHistory = async (): Promise<void> => {
    try {
      setLoading(true);
      const centerId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/lf/list-issue-history/?center=${centerId}`,
        {
          id: newID(`books-list-history`),
        }
      );
      setIssuedBooks(response.data.issued_books || []);
    } catch (error) {
      console.error("Error fetching book history:", error);
      toast.error("Something went wrong while fetching book history");
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

  const handleReturnBook = async (operationId: number): Promise<void> => {
    try {
      const centerId = await retrieveGymId();
      await AxiosPrivate.post(`/api/lf/return-book/`, {
        operation_id: operationId,
        center: centerId,
      });
      invalidateAll();
      fetchBookHistory();
      toast.success("Book returned successfully");
      setIsReturnModalOpen(false);
      setSelectedOperation(null);
    } catch (error) {
      console.error("Error returning book:", error);
      toast.error("Something went wrong while returning book");
    }
  };

  const handleCloseReturnModal = () => {
    setIsReturnModalOpen(false);
    setSelectedOperation(null);
  };

  const getColumns = useCallback(
    () => [
      {
        title: <HeaderCell title="ID" className="text-sm font-semibold" />,
        dataIndex: "operation_id",
        key: "operation_id",
        width: 80,
        render: (id: number) => <Text>{id}</Text>,
      },
      {
        title: <HeaderCell title="Member" className="text-sm font-semibold" />,
        dataIndex: "member",
        key: "member",
        width: 150,

        render: (member: BookOperation["member"]) => (
          <div className="grid gap-0.5">
            {/* yk$6372h$e */}
            <Text className="font-lexend text-sm font-medium text-gray-900  hover:text-primary">
              <span className="flex flex-row gap-2 flex-nowrap items-center">
                <Link href={`/member_profile/yk62-${member.id}-71he`}>
                  <Text className="text-nowrap text-clip">{member.name}</Text>
                </Link>
              </span>
            </Text>
            <Text className="text-[13px] dark:text-gray-400">
              {member.contact.includes("+")
                ? member.contact
                : `+${member.contact}`}
            </Text>
          </div>
        ),
      },
      {
        title: <HeaderCell title="Books" className="text-sm font-semibold" />,
        dataIndex: "books",
        key: "books",
        width: 200,
        render: (books: BookOperation["books"]) => (
          <div className="flex flex-row flex-wrap gap-2">
            {books.length > 0 ? (
              books.map((book) => (
                <Text key={book.id} className="text-sm">
                  {book.name}
                </Text>
              ))
            ) : (
              <Text className="text-sm text-gray-500">No books</Text>
            )}
          </div>
        ),
      },
      {
        title: (
          <HeaderCell title="Issued Date" className="text-sm font-semibold" />
        ),
        dataIndex: "issued_on",
        key: "issued_on",
        width: 120,
        render: (date: string) => (
          <Text className="text-gray-900 font-medium">
            {formateDateValue(new Date(date))}
          </Text>
        ),
      },
      {
        title: (
          <HeaderCell title="Due Date" className="text-sm font-semibold" />
        ),
        dataIndex: "return_due",
        key: "return_due",
        width: 120,
        render: (date: string) => (
          <Text className="text-gray-900 font-medium">
            {formateDateValue(new Date(date))}
          </Text>
        ),
      },
      {
        title: <HeaderCell title="Charges" className="text-sm font-semibold" />,
        dataIndex: "charges",
        key: "charges",
        width: 100,
        render: (charges: number) => (
          <Text className="font-medium pl-2">
            {demographic?.currency_symbol || ""}
            {charges}
          </Text>
        ),
      },
      {
        title: <HeaderCell title="Status" className="text-sm font-semibold" />,
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (status: string) => (
          <Badge
            // className={? "bg-amber-500" : "bg-green-500"}
            variant="flat"
            color={status === "Issued" ? "warning" : "success"}
            className="scale-95"
          >
            {status}
          </Badge>
        ),
      },
      {
        title: <></>,
        dataIndex: "operation_id",
        key: "actions",
        width: 80,
        render: (id: number, row: BookOperation) => (
          <div className="flex items-center gap-2 justify-end">
            {row.status !== "Returned" && (
              <Button
                onClick={() => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  setSelectedOperation(row);
                  setIsReturnModalOpen(true);
                }}
                size="sm"
                title="Return Book"
              >
                Return
              </Button>
            )}
            <ActionIcon
              onClick={() => {
                if (!auth && !access) {
                  toast.error("You aren't allowed to make changes");
                  return;
                }
                setIsOpen(true);
                setSelectedOperation(row);
              }}
              variant="text"
            >
              <MdEdit size={20} />
            </ActionIcon>
          </div>
        ),
      },
    ],
    [auth, access, demographic]
  );

  const columns = useMemo(() => getColumns(), [getColumns]);

  useEffect(() => {
    fetchBookHistory();
  }, []);

  return (
    <>
      <WidgetCard
        className="relative dark:bg-inherit"
        headerClassName="items-center"
        title="Book Issue History"
        titleClassName="whitespace-nowrap"
        action={
          <Button
            onClick={() => {
              if (!auth && !access) {
                toast.error("You aren't allowed to make changes");
                return;
              }
              setIsOpen(true);
            }}
            className="flex items-center gap-2 max-sm:scale-90"
          >
            Add Record <PlusIcon size={20} />
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
            data={issuedBooks}
            // @ts-ignore
            columns={columns}
            scroll={{ y: 500, x: "max-content" }}
            className="text-sm mt-4 text-nowrap rounded-sm [&_.rc-table-row:hover]:bg-gray-50"
          />
        )}
      </WidgetCard>

      {isReturnModalOpen && selectedOperation && (
        <BookReturn
          isOpen={isReturnModalOpen}
          onClose={handleCloseReturnModal}
          operation={selectedOperation}
          onSuccess={() => {
            fetchBookHistory();
            handleCloseReturnModal();
          }}
        />
      )}
      {isOpen && (
        <IssueBookModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedOperation(null);
          }}
          editOperation={selectedOperation}
          onSuccess={() => {
            fetchBookHistory();
            setIsOpen(false);
            setSelectedOperation(null);
          }}
          demographic={demographic}
        />
      )}
    </>
  );
};

export default BooksReturnSection;
