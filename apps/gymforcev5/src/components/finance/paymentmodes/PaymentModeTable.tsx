"use client";

import { getColumns } from "./columns";
// import { transactions } from "@/data/transaction-history";
import WidgetCard from "@/components/cards/widget-card";
import { useCallback, useState, useMemo } from "react";
import { useTable } from "@core/hooks/use-table";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { Button, Input, Loader, Modal, Text, Title } from "rizzui";
// import { dummyPayments } from "@/data/paymentsmodesdata";
import { getAccessToken } from "@/app/[locale]/auth/Acces";
import axios from "axios";
import { useEffect } from "react";
// import { useTheme } from "next-themes";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import Table from "@/components/rizzui/table/table";
import toast from "react-hot-toast";
import Pagination from "@/components/pagination";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";

import dynamic from "next/dynamic";
import { isStaff } from "@/app/[locale]/auth/Staff";

// import AddModal from "./components/model";
const AddModal = dynamic(() => import("./model"));

// import EditModal from "./components/Editmodel";
const EditModal = dynamic(() => import("./Editmodel"));

const filterState = {
  date: [null, null],
  status: "",
};
export default function PaymentModesTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [paymentsModes, setPaymentModes] = useState([]);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
  const [pageSize] = useState(10); // Fixed page size of 10
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredPaymentModes, setFilteredPaymentModes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const onDeleteItem = useCallback((id: string) => {
    handleDelete(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const openModal = () => {
    setIsOpen(!isOpen);
    FetchPaymentModes(currentPage);
  };
  const closeModal = () => {
    setIsOpen(false);
  };
  const openEditModal = (paymentMode: any) => {
    setSelectedPaymentMode(paymentMode);
    setIsEditOpen(true);
  };
  const closeEditModal = () => {
    setIsEditOpen(false);
  };
  const FetchPaymentModes = async (page: number = 1) => {
    try {
      setLoading(true);
      console.log("fetch");
      // const token = getAccessToken();
      const gymId = await retrieveGymId();
      const URL = `api/payment-modes/?gym_id=${gymId}&page=${page}`;
      const response = await AxiosPrivate.get(URL, {
        id: newID(`paymentmode-request-${page}`),
      });
      console.log(response.data.results);
      setPaymentModes(response.data.results);
      setFilteredPaymentModes(response.data.results);
      setTotalItems(response.data.count);
    } catch (error) {
      console.error("Error fetching the transactions:", error);
    } finally {
      setLoading(false);
    }
  };
  const DeletePamentMode = async (data: any) => {
    try {
      setDeleteLoading(true);
      const token = await getAccessToken();
      const gymId = await retrieveGymId();
      const URL = `${process.env.NEXT_PUBLIC_URL}/api/payment-modes/${data.id}/?gym_id=${gymId}`;
      await axios
        .delete(URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
        .then(() => invalidateAll());
      toast.success("PaymentMode Deleted");
      FetchPaymentModes(currentPage);
    } catch (error) {
      toast.error("Something went wrong while Deleting");
      console.error("Error fetching the transactions:", error);
    } finally {
      setDeleteLoading(false);
      setDeleteModal(false);
    }
  };
  useEffect(() => {
    FetchPaymentModes();
  }, []);

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
    getStatus();
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
        response.data.permissions["mainConfigManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };

  const handleFavoriteUpdate = async (
    paymentId: number,
    status: boolean,
    name: string
  ): Promise<void> => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(
        `/api/payment-modes/${paymentId}/mark_favorite/?gym_id=${gymId}&is_favorite=${!status}`,
        {
          gym_id: gymId?.toString(),
        }
      );
      invalidateAll();
      // setTemplates(prevTemplates =>
      //   prevTemplates.map(template =>
      //     template.id === paymentId
      //       ? { ...template, is_favorite: !status }
      //       : template
      //   )
      // );
      // if (filter === "favorites" && status) {
      //   setTemplates(prevTemplates => prevTemplates.filter(template => template.id !== paymentId));
      // }
      FetchPaymentModes();
      if (status) {
        toast.error(name + " Payment Mode was Disabled ");
      } else {
        toast.success(name + " Payment Mode was Enabled");
      }
    } catch (error) {
      console.error("Error enabling:", error);
    }
  };

  const {
    isLoading,
    isFiltered,
    tableData,

    handlePaginate,
    filters,
    updateFilter,

    sortConfig,
    handleSort,
    selectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    handleDelete,
    handleReset,
  } = useTable(paymentsModes, pageSize, filterState);

  const columns = useMemo(
    () =>
      getColumns({
        data: paymentsModes,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onDeleteItem: (data: any) => {
          setSelectedPaymentMode(data);
          setDeleteModal(true);
        },
        access,
        auth,
        onChecked: handleRowSelect,
        handleSelectAll,
        handleDelete: (data: any) => {
          setSelectedPaymentMode(data);
          setDeleteModal(true);
        },
        handleUpdate: (data: any) => {
          openEditModal(data);
        },
        handleFavoriteUpdate,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedRowKeys,
      onHeaderCellClick,
      sortConfig.key,
      sortConfig.direction,
      onDeleteItem,
      handleRowSelect,
      handleSelectAll,
      access,
      auth,
    ]
  );
  const handlePageChange = async (page: number) => {
    FetchPaymentModes(page);
    setCurrentPage(page);
  };

  const handleSearch = useCallback(
    (searchValue: string) => {
      setSearchTerm(searchValue);

      const filterPatmentModes = paymentsModes.filter((patmentmode: any) =>
        patmentmode.name.includes(searchValue.toLowerCase())
      );
      setFilteredPaymentModes(filterPatmentModes);
    },
    [searchTerm, paymentsModes]
  );

  // const { visibleColumns } = useColumn(columns);
  return (
    <div className="flex flex-col gap-3">
      <div>
        <WidgetCard
          title="Payment Modes"
          className="dark:bg-inherit border-gray-400"
          titleClassName="text-gray-900 "
          headerClassName="mb-6 items-start flex-col @[57rem]:flex-row @[57rem]:items-center"
          actionClassName="w-full ps-0 items-center"
          action={
            <div className=" mt-4 flex w-full items-center justify-end  gap-3  @[35rem]:flex-row @[57rem]:mt-0">
              <Input
                type="search"
                inputClassName="h-9"
                placeholder="Search for payment modes..."
                value={searchTerm}
                onClear={() => handleSearch("")}
                onChange={(event) => handleSearch(event.target.value)}
                clearable
                prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
              />
              <Button
                onClick={() => {
                  if (!auth && !access) {
                    toast.error("You aren't allowed to make changes");
                    return;
                  }
                  setIsOpen(true);
                }}
              >
                Add
              </Button>

              <AddModal
                isOpen={isOpen}
                title="Add Payment"
                onSave={() => {
                  openModal();
                }}
                onCancel={closeModal}
              />
            </div>
          }
        >
          {loading ? (
            <div className="w-full flex justify-center">
              <Loader variant="spinner" size="xl" />
            </div>
          ) : (
            <>
              <Table
                data={filteredPaymentModes}
                // @ts-ignore
                variant="minimal"
                striped
                columns={columns}
                scroll={{ y: 500 }}
                className="text-sm mt-4 text-nowrap md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100 "
                rowClassName="!dark:bg-inherit  "
              />
              <div className="flex justify-end mt-4">
                <Pagination
                  total={totalItems}
                  current={currentPage}
                  onChange={handlePageChange}
                  pageSize={pageSize}
                />
              </div>
            </>
          )}

          {isEditOpen && selectedPaymentMode && (
            <EditModal
              isOpen={isEditOpen}
              title="Edit Payment"
              initialValue={selectedPaymentMode}
              onSave={() => {
                setIsEditOpen(false);
                FetchPaymentModes(currentPage);
              }}
              onCancel={closeEditModal}
            />
          )}
        </WidgetCard>
      </div>
      <Modal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedPaymentMode(null);
        }}
      >
        <div className=" p-6 rounded-lg shadow-lg  w-full bg-inherit  ">
          <Title as="h3" className="text-gray-900 ">
            Delete Confirmation
          </Title>
          <Text className="text-gray-900 ">
            Are you sure you want to delete this PaymentMode?
          </Text>
          <div className="flex justify-end gap-3 mt-3">
            <Button
              onClick={() => {
                setDeleteModal(false);
                setSelectedPaymentMode(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                DeletePamentMode(selectedPaymentMode);
              }}
            >
              {deleteLoading ? <Loader variant="threeDot" /> : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
