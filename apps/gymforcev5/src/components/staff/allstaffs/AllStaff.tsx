"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Table from "@/components/rizzui/table/table";
import HeaderCell from "@/components/rizzui/table/HeaderCell";
import {
  Checkbox,
  Badge,
  Button,
  Input,
  Text,
  Avatar,
  Select,
  Loader,
} from "rizzui";
import { Pencil } from "lucide-react";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import { useRouter } from "next/navigation";
import Pagination from "@core/ui/pagination";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { IoMdAdd } from "react-icons/io";
import cn from "@core/utils/class-names";
import Link from "next/link";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";
import toast from "react-hot-toast";
import WidgetCard from "@core/components/cards/widget-card";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import dynamic from "next/dynamic";
import Image from "next/image";

const Login = dynamic(() => import("./Login"));
const DeleteModal = dynamic(() =>
  import("@/components/member-list/Modals").then((mod) => ({
    default: mod.DeleteModal,
  }))
);
const DeleteAllModal = dynamic(() =>
  import("@/components/DeleteAll").then((mod) => ({
    default: mod.DeleteAllModal,
  }))
);
const Permissions = dynamic(() => import("./Permission"));

const RestoreModal = dynamic(() =>
  import("@/components/member-list/Modals").then((mod) => ({
    default: mod.RestoreModal,
  }))
);

export type Data = {
  id: string;
  name: string;
  contact: boolean;
  type: string;
  username: string;
  login: boolean;
  staff_image?: string;
  email: string;
  status: string;
  gender?: string;
  localid: string;
  user: number;
};

const getColumns = (
  order: string,
  column: keyof Data,
  onEditClick: (row: Data) => void,
  onPermissionClick: (row: Data) => void,
  onLoginClick: (row: Data) => void,
  fetchStaff: () => Promise<void>,
  showRestore: boolean,
  checkValidity: () => void,
  totalCount: number,
  handleSelectAll: () => void,
  onChecked: (id: string) => void,
  checkedItems: number[]
) => [
  {
    title: (
      <Checkbox
        title={"Select All"}
        onChange={handleSelectAll}
        checked={checkedItems.length === totalCount}
        className="cursor-pointer"
      />
    ),
    dataIndex: "id",
    key: "id",
    width: 30,
    render: (id: string) => (
      <div className="inline-flex cursor-pointer">
        <Checkbox
          aria-label={"ID"}
          className="cursor-pointer"
          checked={checkedItems.includes(parseInt(id))}
          {...(onChecked && { onChange: () => onChecked(id) })}
        />
      </div>
    ),
  },
  {
    title: <HeaderCell title="ID" className="text-sm font-semibold " />,
    // onHeaderCell: () => onHeaderClick("id"),
    dataIndex: "localid",
    key: "localid",
    width: 30,
    render: (id: any) => <Text>#{id}</Text>,
  },
  {
    title: <HeaderCell title="Name" className="text-sm font-semibold " />,
    dataIndex: "name",
    key: "name",
    width: 200,
    render: (_: string, row: Data) => (
      <figure className={cn("flex items-center gap-3 ")}>
        {/* <Avatar
          name={row.name}
          src={
            row.staff_image !== null
              ? row.staff_image
              : row?.gender && row?.gender[0]?.toLowerCase() === "f"
                ? "https://images.gymforce.in/woman-user-circle-icon.png"
                : "https://images.gymforce.in/man-user-circle-icon.png"
          }
        /> */}
        <Image
          alt={row.name}
          src={
            row?.staff_image ||
            (row?.gender && row?.gender[0]?.toLowerCase() === "f")
              ? WomanIcon
              : ManIcon
          }
          height={40}
          width={40}
          className="size-10 rounded-full"
        />
        <figcaption className="grid gap-0.5">
          <Link href={`/staff-section/staff-profile/st63-${row.id}-72fk`}>
            <Text className="font-lexend text-sm font-medium text-gray-900  hover:text-primary">
              <span className="flex flex-row gap-2 flex-nowrap items-center">
                <Text className="font-lexend text-sm font-medium text-gray-900  hover:text-primary">
                  {" "}
                  {row.name}
                </Text>
                {/* {row.status !== "Active" ? (
                  <Badge size="sm" color="danger" variant="outline">
                    InActive
                  </Badge>
                ) : (
                  <Badge size="sm" color="success" variant="outline">
                    Active
                  </Badge>
                )} */}
              </span>
            </Text>
          </Link>
          <Text className="text-[13px] text-gray-500">{row.email}</Text>
        </figcaption>
      </figure>
    ),
  },
  {
    title: <HeaderCell title="Contact" className="text-sm font-semibold " />,
    dataIndex: "contact",
    key: "contact",
    width: 150,
    render: (contact: number) => (
      <Text className="font-lexend text-sm font-medium text-gray-900  ">
        +{contact}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="Gender" className="text-sm font-semibold " />,
    dataIndex: "gender",
    key: "gender",
    width: 100,
    render: (gender: string) => (
      <Text className="font-lexend text-sm font-medium text-gray-900  ">
        {gender === "M" ? "Male" : "Female"}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="Type" className="text-sm font-semibold " />,
    dataIndex: "staffType",
    key: "staffType",
    width: 120,
    render: (staffType: any) => (
      <Text className="font-lexend text-sm font-medium text-gray-900  ">
        {staffType.staffTypeName}
      </Text>
    ),
  },
  {
    title: <HeaderCell title="Status" className="text-sm font-semibold " />,
    dataIndex: "status",
    key: "status",
    width: 100,
    render: (status: string) =>
      status === "Active" ? (
        <Badge color="success" variant="flat">
          Active
        </Badge>
      ) : (
        <Badge color="danger" variant="flat">
          Inactive
        </Badge>
      ),
  },
  {
    title: <></>,
    dataIndex: "action",
    key: "action",
    width: 200,
    render: (_: string, row: any) => (
      <div className="flex items-center gap-2.5 justify-end">
        {row.login_created ? (
          <div className={`flex items-center ${showRestore ? "hidden" : ""}`}>
            <Button
              className="flex flex-nowrap gap-1"
              size="sm"
              onClick={() => {
                onPermissionClick(row);
              }}
            >
              Permissions
            </Button>
          </div>
        ) : (
          <Button
            className={` flex flex-nowrap gap-1 ${showRestore ? "hidden" : ""}`}
            size="sm"
            onClick={() => {
              checkValidity();
              onLoginClick(row);
            }}
          >
            <IoMdAdd /> <span>Login</span>
          </Button>
        )}
        <button
          type="button"
          className={`hover:text-primary rounded-md p-1 ${showRestore ? "hidden" : ""}`}
          onClick={() => {
            checkValidity();
            onEditClick(row);
          }}
        >
          <Pencil className="size-4  hover:scale-105 duration-300" />
        </button>
        {showRestore ? (
          <RestoreModal
            id={row.id}
            onUpdate={() => {
              fetchStaff(); // Optionally refetch data to reflect changes
            }}
            type="Staff"
          />
        ) : (
          <DeleteModal
            id={row.id}
            onUpdate={() => {
              fetchStaff();
            }}
            type="Staff"
            // restore={showRestore}
          />
        )}
      </div>
    ),
  },
];

const AllStaff: React.FC = () => {
  const [order, setOrder] = useState<string>("desc");
  const [column, setColumn] = useState<keyof Data>("id");
  const [data, setData] = useState<Data[]>([]);
  const [searchInput, setSearchInput] = useState("");
  // const [selectedStaff, setSelectedStaff] = useState<Data | null>(null);
  // const [deleting, setDeleting] = useState(false);
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedLoginStaff, setSelectedLoginStaff] = useState<Data | null>(
    null
  );
  const [isPermissionOpen, setIsPermissionOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [staffTypes, setStaffTypes] = useState<any[]>([]);
  const [showRestore, setShowRestore] = useState(false);
  const [status, setStatus] = useState("Active");
  const [isValid, setIsValid] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  // const [staffType, setStaffType] = useState<string | null>(null);

  const fetchStaff = useCallback(
    async (statusVal = status) => {
      try {
        setLoading(true);
        if (statusVal === "Active") {
          setShowRestore(false);
        } else {
          setShowRestore(true);
        }
        const gymId = await retrieveGymId();
        const URL = `/api/staff/?deleted=${statusVal !== "Active"}&gym_id=${gymId}&page=${currentPage}`;
        const res = await AxiosPrivate(URL, {
          id: newID(`allstaff-request-${statusVal}-${currentPage}`),
        });
        const ProcessedData = res.data.map((staff: any, index: number) => {
          return { ...staff, ind: index + 1 - (currentPage - 1) * 10 };
        });
        setData(ProcessedData);
        console.log(ProcessedData);
        setTotalCount(ProcessedData.length);
      } catch (error) {
        console.error("Error fetching staff data:", error);
      } finally {
        setLoading(false);
      }
    },
    [status, currentPage]
  );

  const getStatus = async () => {
    checkUserAccess().then((status) => {
      console.log(status);
      if (status !== "Restricted") {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    });
  };
  useEffect(() => {
    getStatus();
    fetchStaff(status);
  }, [fetchStaff]);
  const onLoginClick = (row: Data) => {
    setSelectedLoginStaff(row);
    setIsLoginModalOpen(true);
  };
  const onPermissionClick = (row: Data) => {
    setSelectedLoginStaff(row);
    setIsPermissionOpen(true);
  };

  const onEditClick = (row: Data) => {
    router.push(`/staff-section/editstaff/st63-${row.id}-72fk`);
  };

  const handStaffdStaff = () => {
    router.push(`/staff-section/addstaff`);
  };
  const checkValidity = useCallback(() => {
    if (isValid) {
      toast.error("Please Subscribe to Proceed Further");
      router.push("/subscription/plans");
      return;
    }
  }, []);

  useEffect(() => {
    const fetchStaffTypes = async () => {
      try {
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/staff/add-staff-prerequisites/?gym_id=${gymId as string}`,
          {
            id: newID("staff-prerequest"),
          }
        );
        setStaffTypes(
          response.data.data.staffTypesList.map((type: any) => ({
            label: type.staffTypeName,
            value: type.id.toString(),
          }))
        );
      } catch (error) {
        console.error("Error fetching staff types:", error);
      }
    };
    fetchStaffTypes();
  }, []);

  // const handleEditSave = () => {
  //   setIsEditModalOpen(false);
  //   setSelectedStaff(null);
  //   fetchStaff(); // Optionally refetch data to reflect changes
  // };
  const handleSelectAll = () => {
    if (checkedItems.length === data.length) {
      setCheckedItems([]);
    } else {
      const idVals = data.map((Staff) => {
        return parseInt(Staff.id);
      });
      setCheckedItems(idVals);
    }
  };

  const onChecked = (id: string) => {
    if (!checkedItems.includes(parseInt(id))) {
      const val = [...checkedItems, parseInt(id)];
      setCheckedItems(val);
    } else {
      const val = checkedItems.filter((item) => item !== parseInt(id));
      setCheckedItems(val);
    }
  };

  const columns: any = React.useMemo(
    () =>
      getColumns(
        order,
        column,
        onEditClick,
        onPermissionClick,
        onLoginClick,
        fetchStaff,
        showRestore,
        checkValidity,
        totalCount,
        handleSelectAll,
        onChecked,
        checkedItems
      ),
    [
      order,
      column,
      onEditClick,
      onLoginClick,
      fetchStaff,
      showRestore,
      checkValidity,
      totalCount,
      onPermissionClick,
    ]
  );

  const filteredData = useMemo(() => {
    return data.filter((staff) =>
      staff.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [data, searchInput]);

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalRecords = filteredData.length;
  // const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchStaff();
  };

  return (
    <WidgetCard
      headerClassName="mb-6 items-start flex-col @[57rem]:flex-row @[57rem]:items-center "
      actionClassName="w-full ps-0 items-center"
      title="All Staff"
      className="dark:bg-inherit  border-gray-400 "
      titleClassName="text-gray-900 "
      action={
        <div className="flex justify-end flex-wrap items-end gap-4  max-md:py-2">
          {/* <Select
            options={staffTypes}
            label="Type"
            value={staffType ?? ""}
            onChange={(option: any) => setStaffType(option.label)}
            clearable
            onClear={() => setStaffType(null)}
            className={"md:max-w-40  max-md:w-full"}
            labelClassName=""
            // dropdownClassName="dark:bg-gray-800 "
            // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          /> */}
          <Input
            type="text"
            value={searchInput}
            placeholder="Search by staff name"
            onChange={(e) => setSearchInput(e.target.value)}
            onClear={() => setSearchInput("")}
            clearable
            className="max-md:w-full"
          />
          <Select
            name="status"
            label="Status"
            value={status}
            options={[
              { label: "Active", value: "Active" },
              { label: "Deleted", value: "Deleted" },
            ]}
            onChange={(option: any) => {
              console.log(option);
              setStatus(option.value);
              fetchStaff(option.value);
            }}
            className="max-w-40 "
            labelClassName=""
            // dropdownClassName="dark:bg-gray-800 "
            // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          />
          <Button onClick={handStaffdStaff} className="max-w-32 ">
            Add Staff
          </Button>
        </div>
      }
    >
      <div className="mt-3">
        {loading ? (
          <div className="grid h-32 flex-grow place-content-center items-center">
            <Loader size="xl" variant="spinner" />
          </div>
        ) : (
          <Table
            //@ts-ignore
            variant="none"
            data={currentRecords}
            columns={columns}
            scroll={{ y: 500 }}
            className="mt-4 rounded-sm text-nowrap [&_.rc-table-row:hover]:bg-gray-100/75 [&_.rc-table-thead_tr]:bg-gray-100 "
          />
        )}
      </div>
      {isLoginModalOpen && selectedLoginStaff && (
        <Login
          isOpen={isLoginModalOpen}
          onClose={() => {
            setIsLoginModalOpen(false);
            setSelectedLoginStaff(null);
            fetchStaff(); // Refetch data to reflect changes
          }}
          staff={selectedLoginStaff}
        />
      )}
      {isPermissionOpen && selectedLoginStaff && (
        <Permissions
          isOpen={isPermissionOpen}
          onClose={() => {
            setIsPermissionOpen(false);
            setSelectedLoginStaff(null);
            fetchStaff(); // Refetch data to reflect changes
          }}
          staff={selectedLoginStaff}
        />
      )}
      <div className="flex justify-end mt-4">
        <Pagination
          total={totalRecords}
          current={currentPage}
          onChange={handlePageChange}
          pageSize={recordsPerPage}
        />
      </div>
      <div className="!fixed !z-[999] bottom-5 right-5 sm:bottom-10 sm:right-10 ">
        {checkedItems.length > 0 && (
          <DeleteAllModal
            ids={checkedItems}
            type="Staff"
            onUpdate={() => {
              fetchStaff(status);
              setCheckedItems([]);
            }}
          />
        )}
      </div>
    </WidgetCard>
  );
};

export default AllStaff;
