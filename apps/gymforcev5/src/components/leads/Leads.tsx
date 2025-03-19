"use client";

import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  // useRef,
} from "react";
import Table from "@/components/rizzui/table/table";
import HeaderCell from "@/components/rizzui/table/HeaderCell";
import {
  Checkbox,
  Popover,
  Button,
  Title,
  ActionIcon,
  Text,
  Input,
  Tooltip,
  Avatar,
  Badge,
  Loader,
  Drawer,
  Select,
  Announcement,
} from "rizzui";
import { FilterIcon, MoreVertical, Pencil, XIcon } from "lucide-react";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { Category } from "./EditLeads";
// import Delete from "./DeleteLeads";
import { Source, Status } from "./LeadTypes";
// import { RiCheckDoubleLine } from "react-icons/ri";

import Link from "next/link";
import { AiOutlineUserAdd } from "react-icons/ai";
// import FollowUp from "./FollowUp";
import { PiCaretLeftBold, PiCaretRightBold, PiPlus } from "react-icons/pi";
import WidgetCard from "@core/components/cards/widget-card";
import Pagination from "@core/ui/pagination";
import toast from "react-hot-toast";
// import { getAccessToken } from "@/app/[locale]/auth/Acces";
// import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import cn from "@core/utils/class-names";
import DateCell from "@core/ui/date-cell";
import { filterOptions } from "../../app/[locale]/Filter";
// import DropdownAction from "@components/charts/dropdown-action";
import { isStaff } from "@/app/[locale]/auth/Staff";
// import { DatePicker } from "@ui/datepicker";
import dayjs from "dayjs";
import { getCurrentDateRange, validateDateRange } from "@/components/ValidDate";
import { debounce } from "lodash";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import dynamic from "next/dynamic";
import {
  getPageSize,
  pageSizeOptions,
  setPageSize,
} from "@/components/pageSize";
import MetricCard from "@core/components/cards/metric-card";
import {
  FaList,
  FaLock,
  FaUnlockKeyhole,
  FaUserCheck,
  FaUserClock,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa6";
import {
  // formateDateValue,
  getDateFormat,
} from "@/app/[locale]/auth/DateFormat";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import { QRCodeSVG } from "qrcode.react";
import { MdDelete, MdOutlineGridView } from "react-icons/md";
import LeadCardList from "./LeadCardList";
import Image from "next/image";

const LeadConvert = dynamic(() => import("./LeadConvert"), {
  ssr: false, // uses UseRouter
});

const Edit = dynamic(() => import("./EditLeads"), {
  ssr: false,
});
// import Delete from "./DeleteLeads";
const Delete = dynamic(() => import("./DeleteLeads"));
const DeleteAllModal = dynamic(() =>
  import("@/components/DeleteAll").then((comp) => comp.DeleteAllModal)
);
// import { AddLeadFollowup } from "./FollowUp";
const AddLeadFollowup = dynamic(
  () => import("./FollowUp").then((comp) => comp.AddLeadFollowup),
  {
    ssr: false,
  }
);
const DeleteModal = dynamic(() =>
  import("@/components/member-list/Modals").then((comp) => comp.DeleteModal)
);
const RestoreModal = dynamic(() =>
  import("@/components/member-list/Modals").then((comp) => comp.RestoreModal)
);

interface Option {
  label: string;
  value: number;
}

export interface Package extends Option {
  min_price: number;
  max_price: number;
  num_of_days: number;
}
export type Data = {
  id: number;
  LeadId: string;
  name: string;
  phone: string;
  email: string;
  dob: string;
  status: string | null;
  source: string | null;
  category: string | null;
  reminder: string;
  date: string;
  converted: boolean;
  converted_at: string;
  gender: string;
  address_street: string;
  address_city: string;
  address_zip_code: string;
  address_state: string;
  address_country: string;
  visiting_center: string;
  status_id: number | null;
  latest_followup_reminder?: {
    reminder: string;
    status: string;
  } | null;
  source_id: number | null;
  category_id: number | null;
  remarks: string;
  visitor_image?: string | null;
  enquiry_mode?: string;
  localid?: number;
  offer?: number | null;
  offer_details?: any | null;
  offer_id?: number | null;
  offer_price?: number | null;
  package?: number | null;
  package_details?: any | null;
  package_id?: number | null;
  is_closed?: boolean;
};
type Filters = {
  status: string;
  dateRange: string;
  leadName: string;
  startDate: string;
  endDate: string;
  visitingDate: string | null;
};
export interface SortProps {
  sortBy: keyof Data | null;
  sortOrder: "asc" | "desc" | null;
}
const Leads = ({
  category,
  source,
  status,
  contactType,
}: {
  category: Category[];
  source: Source[];
  status: Status[];
  contactType: any;
}) => {
  const [auth, setAuth] = useState<boolean>(true);
  const [order, setOrder] = useState<string>("desc");
  const [column, setColumn] = useState<keyof Data>("id");
  const [data, setData] = useState<Data[]>([]);
  // const [filteredData, setFilteredData] = useState<Data[]>([]);
  const [open, setOpen] = useState(false);
  const [func, setFunc] = useState<"Edit" | "Delete" | "More" | null>(null);
  const [selected, setSelected] = useState(0);
  const [packages, setPackages] = useState<Package[]>([]);
  const [paymentModes, setPaymentModes] = useState<
    { label: string; value: number }[]
  >([]);
  const [sort, setSort] = useState<SortProps>({
    sortBy: null,
    sortOrder: null,
  });
  const params = useSearchParams();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const [view, setView] = useState<"grid" | "table">("table");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: "Active",
    dateRange: filterOptions[0].value,
    leadName: "",
    startDate: "",
    endDate: "",
    visitingDate: null,
  });
  const [dateRangeInfo, setDateRangeInfo] = useState("");
  const [showrestore, setShowRestore] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [pageSizeVal, setPageSizeVal] = useState<number | null>(null);
  const [filterBy, setFilterBy] = useState<string | null>("all");
  const [gymCode, setGymCode] = useState("");
  const [enquiryInfo, setenquiryInfo] = useState([
    {
      title: "Total Enquiries",
      value: 0,
      icon: <FaUsers size={18} />,
      req: "all",
    },
    {
      title: "Non Converted",
      value: 0,
      icon: <FaUserCheck size={18} />,
      req: "not_converted",
    },
    {
      title: "Converted",
      value: 0,
      icon: <FaUserPlus size={18} />,
      req: "converted",
    },
    {
      title: "Interested",
      value: 0,
      icon: <FaUserClock size={18} />,
      req: "interested",
    },
    {
      title: "Conversion Ratio",
      value: 0,
      icon: <FaUserClock size={18} />,
      req: null,
    },
  ]);
  const [staffType, setStaffType] = useState<string>("");
  const [isStaf, setIsStaf] = useState<boolean>(false);
  const [showLinkQR, setShowLinkQR] = useState(false);
  const [access, setAccess] = useState<boolean>(true);
  const [qrCode, setQRCode] = useState<string>("");
  const [qrExpiry, setQrExpiry] = useState<string>("");

  const getData = useCallback(
    async (
      pageNumber: number,
      currentFilters: Filters,
      initialFilter?: string
    ) => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();

        if (currentFilters.status === "Active") {
          queryParams.append("deleted", "false");
          setShowRestore(false);
        } else if (currentFilters.status === "Closed") {
          queryParams.append("closed", "true");
          setShowRestore(false);
        } else {
          queryParams.append("deleted", "true");
          setShowRestore(true);
        }
        if (
          currentFilters.dateRange &&
          // currentFilters.dateRange !== "all" &&
          currentFilters.startDate
        ) {
          queryParams.append("start_date", currentFilters.startDate);
        }
        if (
          currentFilters.dateRange &&
          // currentFilters.dateRange !== "all" &&
          currentFilters.endDate
        ) {
          const currentEndDate = new Date(currentFilters.endDate);
          const nextDate = new Date(currentEndDate);
          nextDate.setDate(nextDate.getDate() + 1);
          const formattedNextDate = nextDate.toISOString().split("T")[0];
          queryParams.append("end_date", formattedNextDate);
        }

        if (currentFilters.leadName) {
          queryParams.append("lead_name", currentFilters.leadName);
        }
        if (currentFilters.visitingDate) {
          queryParams.append("visiting_date", currentFilters.visitingDate);
        }
        if (pageSizeVal) {
          if (pageSizeVal !== 10) {
            queryParams.append("page_size", pageSizeVal.toString());
          }
        } else {
          const PageVal = getPageSize();
          if (PageVal !== "10") {
            queryParams.append("page_size", PageVal.toString());
          }
          setPageSizeVal(parseInt(PageVal));
        }
        queryParams.append("page", pageNumber.toString());
        if (initialFilter) {
          queryParams.append("filter_by", initialFilter);
          setFilterBy(initialFilter);
        } else if (filterBy && filterBy !== "all") {
          queryParams.append("filter_by", filterBy);
        }
        const gymId = await retrieveGymId();
        const resp = await AxiosPrivate.get(
          `api/list-visitors/v2/?gym_id=${gymId}&${queryParams}`,
          {
            id: newID(`visitors-request-${queryParams}-${pageNumber}`),
          }
        );
        const transformedData: Data[] = resp.data.results.visitors.map(
          (item: any, index: number) => ({
            id: index + 1 + (pageNumber - 1) * 10,
            LeadId: item.id,
            name: item.name,
            phone: item.phone,
            dob: item.date_of_birth,
            email: item.email,
            status: item.status?.leadStatusName || "N/A",
            source: item.source?.leadSourceName || "N/A",
            category: item.category?.name ?? "N/A",
            reminder: item.tentative_joining_date,
            date: item.visiting_date,
            converted: item.converted,
            converted_at: item.converted_at,
            gender: item.gender,
            address_street: item.address_street,
            address_city: item.address_city,
            address_zip_code: item.address_zip_code,
            address_state: item.address_state,
            address_country: item.address_country,
            visiting_center: item.visiting_center,
            status_id: item.status?.id ?? null,
            source_id: item.source?.id ?? null,
            category_id: item.category?.id ?? null,
            remarks: item.remarks,
            latest_followup_reminder: item.latest_followup_reminder ?? null,
            visitor_image: item.visitor_image ?? null,
            enquiry_mode: item.enquiry_mode || "",
            localid: item.localid,
            offer: item.offer || null,
            offer_details: item.offer_details || null,
            offer_id: item.offer || null,
            offer_price: item.offer_price || null,
            package: item.package || null,
            package_details: item.package_details || null,
            package_id: item.package_id || null,
            is_closed: item?.is_closed,
          })
        );
        setenquiryInfo((prevState) =>
          prevState.map((item) => {
            let newValue = 0;
            switch (item.title) {
              case "Total Enquiries":
                newValue = resp.data?.results.counts.total_visitors || 0;
                break;
              case "Non Converted":
                newValue =
                  resp.data?.results.counts.non_converted_visitors || 0;
                break;
              case "Converted":
                newValue = resp.data?.results.counts.converted_visitors || 0;
                break;
              case "Interested":
                newValue = resp.data?.results.counts.interested_visitors || 0;
                break;
              case "Conversion Ratio":
                newValue =
                  resp.data?.results?.counts.inquiry_ratio.toFixed(2) || 0;
                break;
            }
            return { ...item, value: newValue };
          })
        );
        console.log(transformedData);
        setTotalLeads(resp.data.count);
        setData(transformedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    [filterBy, pageSizeVal]
  );

  const CloseAll = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.post(
        `/api/visitors/bulk-close-multiple/?gym_id=${gymId}`,
        {
          enquiry_ids: checkedItems,
        }
      );
      invalidateAll();
      refreshData();
      setCheckedItems([]);
      toast.success(`Closed ${checkedItems.length} Enquiry's`);
    } catch (error) {
      console.log(error);
      toast.error("Someting Went Wrong. Retry..");
    }
  };

  const OpenAll = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.post(
        `/api/visitors/bulk-open-multiple/?gym_id=${gymId}`,
        {
          enquiry_ids: checkedItems,
        }
      );
      invalidateAll();
      refreshData();
      setCheckedItems([]);
      toast.success(`Re Opened ${checkedItems.length} Enquiry's`);
    } catch (error) {
      console.log(error);
      toast.error("Someting Went Wrong. Retry..");
    }
  };
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
      // setPermissions(response.data.permissions || {});
      const isEnquiry =
        response.data.permissions["mainEnquiryManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };
  const fetchPackagesAndPaymentModes = useCallback(async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/master-packages/?gym_id=${gymId}`,
        {
          id: newID(`master-packages`),
        }
      );
      const packageData = resp.data.results
        .filter((item: any) => !item.deleted)
        .map((item: any) => ({
          label: `${item.name}`,
          value: item.id,
          min_price: item.min_price,
          max_price: item.max_price,
          num_of_days: item.num_of_days,
        }));
      setPackages(packageData);
      const paymentModesResp = await AxiosPrivate.get(
        `/api/payment-modes/list_favorite/?gym_id=${gymId}`,
        {
          id: newID(`payment-modes`),
        }
      );
      setPaymentModes(
        paymentModesResp.data.map((mode: any) => ({
          label: mode.name,
          value: mode.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching packages and payment modes:", error);
    }
  }, []);

  const setQRCookie = (qrData: { uuid: string; expires_at: string }) => {
    document.cookie = `qrCode=${encodeURIComponent(qrData.uuid)}; expires=${qrData.expires_at}; path=/`;
    document.cookie = `qrExpiry=${qrData.expires_at}; expires=${qrData.expires_at}; path=/`;
  };

  // Function to get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop()?.split(";").shift() || "");
    }
    return null;
  };

  const generateQR = async () => {
    try {
      // Check cookies first
      const savedQR = getCookie("qrCode");
      const savedTime = getCookie("qrExpiry");

      if (savedQR && savedTime) {
        setQRCode(savedQR);
        setQrExpiry(savedTime);
        return;
      }

      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.post(
        `/api/generate-sharable-link/?gym_id=${gymId}`
      );

      if (!resp.data) {
        throw new Error("No QR data received from server");
      }

      // Save to cookies with the new data structure
      setQRCookie(resp.data);

      setQRCode(resp.data.uuid);
      setQrExpiry(resp.data.expires_at);
    } catch (error) {
      console.error("Error generating QR:", error);
      toast.error("Failed to generate QR code");
      setQRCode("");
    }
  };
  useEffect(() => {
    const getProfile = async () => {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      const urlVal =
        resp.data.associated_gyms.filter(
          (item: any) => item.gym_id === parseInt(gymId ?? "0")
        )[0]?.forceId ?? "";
      setGymCode(urlVal);
    };
    getProfile();
  }, []);
  useEffect(() => {
    if (showLinkQR) {
      generateQR();
    }
  }, [showLinkQR]);

  const handleSelectAll = () => {
    if (checkedItems.length === data.length) {
      setCheckedItems([]);
    } else {
      const idVals = data.map((lead) => {
        return parseInt(lead.LeadId);
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

  const handleHeaderSort = (headerKey: keyof Data | null) => {
    setSort((prev) => ({
      sortBy: headerKey,
      sortOrder:
        prev.sortBy !== headerKey || prev.sortBy === null
          ? "asc"
          : prev.sortOrder === "asc"
            ? "desc"
            : "asc",
    }));
  };

  const SortData = (
    data: Data[],
    sortBy: keyof Data | null,
    sortOrder: "asc" | "desc" | null
  ) => {
    if (!sortBy || !sortOrder || !data?.length) return data;

    return [...data].sort((a, b) => {
      const valueA = sortBy ? (a[sortBy] ?? "") : "";
      const valueB = sortBy ? (b[sortBy] ?? "") : "";

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  useEffect(() => {
    // Sort data whenever sort state changes
    const sortedData = SortData(data, sort.sortBy, sort.sortOrder);
    setData(sortedData);
  }, [sort]);

  useEffect(() => {
    const getStatus = async () => {
      const resp = await isStaff();
      console.log("Staff:", resp);
      if (resp) {
        setAuth(!resp);
        await fetchPermissions();
      }
      checkUserAccess().then((status) => {
        console.log(status);
        if (status !== "Restricted") {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      });
    };
    getStatus();
    fetchPackagesAndPaymentModes();
  }, []);

  useEffect(() => {
    const initializeAndFetch = async () => {
      if (params.get("filter")) {
        const filter = params.get("filter");
        const { startDate, endDate, infoText } = getCurrentDateRange(filter!);

        const newFilters = {
          dateRange: filter!,
          memberName: "",
          startDate: startDate,
          endDate: endDate,
          status: "Active",
          leadName: "",
          visitingDate: null,
        };

        setFilters((prev) => ({
          ...newFilters,
        }));

        setDateRangeInfo(infoText);
        await getData(currentPage, newFilters, params.get("status") || "all");
      } else {
        await getData(currentPage, filters);
      }
    };
    initializeAndFetch();
  }, [params, pathname]);

  useEffect(() => {
    setCurrentPage(1);
    const Fetch = async () => {
      getData(1, filters);
    };
    Fetch();
  }, [pageSizeVal, filterBy]);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      getData(1, filters);
    }, 300);

    debouncedSearch();

    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  useEffect(() => {
    const type = sessionStorage.getItem("staffType");
    setStaffType(type?.replace(/"/g, "").toLowerCase() || "");
    const isStaffVal = sessionStorage.getItem("isStaff");
    console.log(isStaffVal);
    setIsStaf(isStaffVal === "true");
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".action-icon-wrapper")) {
        setOpenPopoverId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const refreshData = () => {
    getData(1, filters);
    setCurrentPage(1);
    setCheckedItems([]);
  };

  const getColumns = useCallback(
    (
      order: string,
      column: keyof Data,
      setSelected: React.Dispatch<React.SetStateAction<number>>,
      setFunc: React.Dispatch<
        React.SetStateAction<"Edit" | "Delete" | "More" | null>
      >,
      setOpen: React.Dispatch<React.SetStateAction<boolean>>,
      sort: SortProps,
      handleHeaderSort: (headerKey: keyof Data | null) => void
    ) => [
      {
        title: (
          <Checkbox
            title={"Select All"}
            onChange={handleSelectAll}
            checked={checkedItems.length === data.length}
            className="cursor-pointer"
          />
        ),
        dataIndex: "LeadId",
        key: "LeadId",
        width: 30,
        render: (LeadId: string) => (
          <div className="inline-flex cursor-pointer">
            <Checkbox
              aria-label={"ID"}
              className="cursor-pointer"
              checked={checkedItems.includes(parseInt(LeadId))}
              {...(onChecked && { onChange: () => onChecked(LeadId) })}
            />
          </div>
        ),
      },
      {
        title: (
          <HeaderCell
            title="ID"
            // sortable
            // ascending={order === "asc" && column === "id"}
            className="text-sm font-semibold"
          />
        ),
        dataIndex: "localid",
        key: "localid",
        width: 30,
        render: (localid: any) => <Text>#{localid}</Text>,
      },
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "name",
        key: "name",
        width: 180,
        render: (_: any, row: Data) => (
          <figure className={cn("flex items-center gap-3 ")}>
            <Image
              alt={row.name || "N/A"}
              src={
                row.visitor_image ||
                (row?.gender && row?.gender[0]?.toLowerCase() === "f"
                  ? WomanIcon
                  : ManIcon)
              }
              height={40}
              width={40}
              className="size-10 rounded-full"
            />
            <figcaption className="grid gap-0.5">
              {/* <Link href={`/member_profile/${row.member_id}`}> */}
              <Text className="font-lexend text-sm font-medium text-gray-900  hover:text-primary">
                <Text> {row.name}</Text>
              </Text>
              {/* </Link> */}
              <Text className="text-[13px] text-gray-700 ">{row.phone}</Text>
            </figcaption>
          </figure>
        ),
      },
      {
        title: (
          // <HeaderCell title="Visiting Date" className="text-sm font-semibold" />
          <div
            onClick={() => {
              handleHeaderSort("date");
            }}
          >
            <HeaderCell
              title="Created"
              sortable
              // className="text-sm font-semibold "
              ascending={
                sort.sortBy !== null &&
                sort.sortOrder !== null &&
                sort.sortBy === "date" &&
                sort.sortOrder === "desc"
              }
              className={
                (sort.sortBy === "date" ? "text-primary" : "") +
                " text-sm font-semibold "
              }
              // title="Started"
              iconClassName={
                (sort.sortBy === "date" ? "text-primary" : "") + " size-4"
              }
            />
          </div>
        ),
        // ),
        dataIndex: "date",
        key: "date",
        width: 150,
        render: (date: string) =>
          date ? (
            <DateCell
              date={new Date(date)}
              dateFormat={getDateFormat()}
              timeClassName="hidden"
              className="text-gray-900 "
              dateClassName="text-gray-900 "
            />
          ) : (
            <Text className="font-medium text-center">N/A</Text>
          ),
        // <Text className="font-medium text-gray-900">
        //   {formateDateValue(new Date(date))}
        // </Text>
      },
      {
        title: (
          <HeaderCell title="Category" className="text-sm font-semibold" />
        ),
        dataIndex: "category",
        key: "category",
        width: 125,
        render: (category: string | null) => <Text>{category || "N/A"}</Text>,
      },
      {
        title: <HeaderCell title="Status" className="text-sm font-semibold" />,
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status: string | null, row: Data) => (
          <Text>{row.latest_followup_reminder?.status || "N/A"}</Text>
        ),
      },
      {
        // title: (
        //   <HeaderCell title="Followup Date" className="text-sm font-semibold" />
        // ),
        title: (
          // <HeaderCell title="Visiting Date" className="text-sm font-semibold" />
          <div
            onClick={() => {
              handleHeaderSort("reminder");
            }}
          >
            <HeaderCell
              title="Joining"
              sortable
              // className="text-sm font-semibold "
              ascending={
                sort.sortBy !== null &&
                sort.sortOrder !== null &&
                sort.sortBy === "reminder" &&
                sort.sortOrder === "desc"
              }
              className={
                (sort.sortBy === "reminder" ? "text-primary" : "") +
                " text-sm font-semibold "
              }
              // title="Started"
              iconClassName={
                (sort.sortBy === "reminder" ? "text-primary" : "") + " size-4"
              }
            />
          </div>
        ),
        dataIndex: "reminder",
        key: "reminder",
        width: 150,
        render: (reminder: string, row: any) => (
          <div className="relative">
            <DateCell
              date={new Date(reminder)}
              dateFormat={getDateFormat()}
              timeClassName="hidden"
              className="text-gray-900 "
              dateClassName="text-gray-900 "
            />
            {/* <Text className="font-medium text-gray-900">
              {formateDateValue(new Date(reminder))}
            </Text> */}
            {!row.converted &&
              (row.latest_followup_reminder ? null : new Date(
                  row.reminder
                ).getTime() <
                new Date().getTime() - 86400000 ? (
                <Badge
                  color="danger"
                  variant="flat"
                  className="absolute bottom-5 mx-auto animate-pulse truncate"
                  size="sm"
                >
                  Date Exceeded
                </Badge>
              ) : (
                new Date(reminder).getTime() < new Date().getTime() && (
                  <Badge
                    color="warning"
                    variant="flat"
                    className="absolute bottom-5 mx-auto animate-pulse truncate"
                    size="sm"
                  >
                    Last Day
                  </Badge>
                )
              ))}
          </div>
        ),
      },
      {
        title: (
          <HeaderCell title="Reminder" className="text-sm font-semibold" />
        ),
        dataIndex: "latest_followup_reminder",
        key: "latest_followup_reminder",
        width: 150,
        render: (
          latest_followup_reminder: { reminder: string; status: string } | null
        ) =>
          latest_followup_reminder ? (
            <DateCell
              date={new Date(latest_followup_reminder?.reminder || "")}
              dateFormat={getDateFormat()}
              timeClassName="hidden"
              className="text-gray-900 "
              dateClassName="text-gray-900 "
            />
          ) : (
            <Text className="font-medium text-center">N/A</Text>
          ),
        // <Text className="font-medium text-gray-900">
        //   {formateDateValue(new Date(date))}
        // </Text>
      },
      {
        title: <></>,
        dataIndex: "action",
        key: "action",
        width: 120,
        render: (_: string, row: Data) => (
          <div className="flex items-center gap-3 justify-start">
            <div className={`${showrestore ? "hidden" : ""} `}>
              {row.converted ? (
                <div className="flex items-center">
                  <Badge color="success" renderAsDot />
                  <Text className="ms-1 font-medium text-green-dark text-sm">
                    Converted
                  </Text>
                </div>
              ) : (
                <Tooltip content={"Convert the Leads into User"}>
                  {isStaf && !auth && !access ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        toast.error("You aren't allowed to make changes");
                      }}
                    >
                      Convert
                    </Button>
                  ) : (
                    <LeadConvert
                      lead={row}
                      packages={packages}
                      paymentModes={paymentModes}
                      onConvert={refreshData}
                      isValid={isValid}
                      auth={auth}
                      key={row.LeadId}
                      // Add a key to force proper re-rendering of the component
                    />
                  )}
                </Tooltip>
              )}
            </div>
            {!row.converted && (
              <Popover>
                <Popover.Trigger>
                  <ActionIcon
                    onClick={() => {
                      if (!isValid) {
                        toast.error("Please Subscribe to Proceed Further");
                        if (auth) {
                          router.push("/subscription/plans");
                        }
                        return;
                      }
                      setOpenPopoverId(
                        openPopoverId === row.LeadId ? null : row.LeadId
                      );
                    }}
                    className="action-icon-wrapper "
                    variant="text"
                  >
                    <MoreVertical size="20" className="text-gray-700 " />
                  </ActionIcon>
                </Popover.Trigger>
                <Popover.Content className="">
                  {/* {openPopoverId === row.LeadId && ( */}
                  <div className="flex flex-col justify-start items-start text-gray-900 ">
                    <Button
                      variant="text"
                      disabled={row.converted}
                      onClick={() => {
                        if (isStaf && !auth && !access) {
                          toast.error("You aren't allowed to make changes");
                          return;
                        }
                        setOpen(true);
                        setSelected(findDataIndex(row.LeadId));
                        setFunc("More");
                        setOpenPopoverId(null);
                      }}
                      className={showrestore ? "hidden" : ""}
                    >
                      <PiPlus className="w-4 h-4 mr-2" /> Follow-up
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => {
                        if (isStaf && !auth && !access) {
                          toast.error("You aren't allowed to make changes");
                          return;
                        }
                        setOpen(true);
                        setSelected(findDataIndex(row.LeadId));
                        setFunc("Edit");
                        setOpenPopoverId(null);
                      }}
                      className={showrestore ? "hidden" : ""}
                    >
                      <Pencil className="w-4 h-4 mr-4" /> Edit
                    </Button>
                    {!auth && !access ? (
                      <Button
                        variant="text"
                        onClick={() => {
                          toast.error("You aren't allowed to make changes");
                        }}
                        className="flex hover:text-red-500 flex-row gap-2 items-center justify-start font-medium hover:scale-105 duration-300"
                      >
                        <MdDelete size={20} />
                        <Text>Delete</Text>
                      </Button>
                    ) : (
                      <DeleteModal
                        id={row.LeadId}
                        onUpdate={() => {
                          refreshData();
                        }}
                        // restore={showrestore}
                        type="Visitors"
                      />
                    )}
                    {showrestore && (
                      <RestoreModal
                        id={row.LeadId}
                        onUpdate={() => {
                          refreshData();
                        }}
                        type="Visitors"
                      />
                    )}
                  </div>
                  {/* )} */}
                </Popover.Content>
              </Popover>
            )}
          </div>
        ),
      },
    ],
    [
      packages,
      paymentModes,
      getData,
      openPopoverId,
      refreshData,
      staffType,
      isStaf,
      access,
      auth,
    ]
  );

  const columns = useMemo(
    () =>
      getColumns(
        order,
        column,
        setSelected,
        setFunc,
        setOpen,
        sort,
        handleHeaderSort
      ),
    [order, column, getColumns, sort]
  );
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    getData(pageNumber, filters);
  };
  const findDataIndex = (leadId: string) => {
    return data.findIndex((item) => item.LeadId === leadId);
  };
  const handleFilterChange = (
    key: keyof Filters,
    value: string | Date | null
  ) => {
    if (key === "startDate" || key === "endDate" || key === "visitingDate") {
      const formattedValue =
        value instanceof Date ? dayjs(value).format("YYYY-MM-DD") : value;
      setFilters((prev) => ({ ...prev, [key]: formattedValue }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const applyFilters = () => {
    if (filters.dateRange && filters.startDate && filters.endDate) {
      if (
        !validateDateRange(
          filters.dateRange,
          filters.startDate,
          filters.endDate
        )
      ) {
        toast.error(
          `Invalid date range for ${filters.dateRange} filter. Please adjust your dates.`
        );
        return;
      } else {
        // setFilterInfo(filters.dateRange);
      }
    }
    // Reset visitingDate if dateRange is selected
    if (filters.dateRange !== "" && filters.dateRange !== "all") {
      setFilters((prev) => ({ ...prev, visitingDate: null }));
    }
    refreshData();
    setIsDrawerOpen(false);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    getData(1, { ...filters, leadName: value });
    setCurrentPage(1);
  };

  useEffect(() => {
    if (filters.dateRange) {
      const { startDate, endDate, infoText } = getCurrentDateRange(
        filters.dateRange
      );
      setFilters((prev) => ({ ...prev, startDate, endDate }));
      setDateRangeInfo(infoText);
    } else {
      setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
      setDateRangeInfo("");
    }
  }, [filters.dateRange]);

  useEffect(() => {
    if (filters.dateRange && filters.dateRange !== "all") {
      setFilters((prev) => ({ ...prev, visitingDate: null }));
    }
  }, [filters.dateRange]);

  return (
    <section className="grid grid-cols-1 gap-5 @container @[59rem]:gap-7">
      <div className="relative flex w-full items-center overflow-hidden">
        <Button
          title="Prev"
          variant="text"
          ref={sliderPrevBtn}
          onClick={() => scrollToTheLeft()}
          className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretLeftBold className="h-5 w-5" />
        </Button>
        <div
          className="max-xl:flex items-center p-2 gap-4 xl:grid grid-cols-5 custom-scrollbar-x overflow-x-auto scroll-smooth pr-4 lg:pr-8"
          ref={sliderEl}
        >
          {enquiryInfo.map((metric, index) => (
            <div
              key={index}
              onClick={() => {
                if (filterBy === metric.req || metric.req === null) {
                  return;
                }
                setFilterBy(metric.req);
              }}
              className="group relative"
            >
              <MetricCard
                title={metric.title}
                metric={new Intl.NumberFormat().format(metric.value)}
                className={`relative shadow border-none dark:border-solid transform transition-transform duration-200 ease-in-out delay-50 ${
                  metric.req !== null
                    ? "hover:bg-primary-lighter peer-hover:bg-primary-lighter hover:scale-105 peer-hover:scale-105 cursor-pointer"
                    : ""
                } !p-2 md:!p-4`}
                iconClassName={`text-primary  max-lg:size-[36px]  bg-primary-lighter duration-200 transition-all ${
                  metric.req === filterBy && metric.req !== null
                    ? "text-white bg-primary"
                    : metric.req !== null
                      ? "group-hover:text-white group-hover:bg-primary peer-hover:text-white peer-hover:bg-primary"
                      : ""
                }`}
                titleClassName={`text-nowrap  max-lg:text-xs font-medium max-lg:max-w-[110px] truncate  ${
                  metric.req === filterBy && metric.req !== null
                    ? "text-primary"
                    : metric.req !== null
                      ? "group-hover:text-primary"
                      : ""
                }`}
                icon={metric.icon}
                metricClassName=" max-lg:text-base text-primary text-center "
              />
            </div>
          ))}
        </div>
        <Button
          title="Next"
          variant="text"
          ref={sliderNextBtn}
          onClick={() => scrollToTheRight()}
          className="!absolute -right-1 top-0 z-10 !h-full w-10 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretRightBold className="h-5 w-5" />
        </Button>
      </div>
      <WidgetCard
        className="relative dark:bg-inherit "
        headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
        actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
        title="Enquiry's"
        titleClassName="whitespace-nowrap "
        action={
          <div className="hidden md:flex flex-row w-full justify-end items-center gap-4 ">
            <Popover>
              <Popover.Trigger>
                <Button
                  onClick={() => {
                    setShowLinkQR((prev) => !prev);
                    // if (!qrImage) {
                    generateQR();
                    // }
                  }}
                >
                  Share Link
                </Button>
              </Popover.Trigger>
              <Popover.Content>
                <div className="flex items-center justify-center gap-4 flex-col p-2">
                  {qrCode && gymCode ? (
                    <>
                      <QRCodeSVG
                        value={`https://app.gymforce.in/gym/${gymCode}/registration?uuid=${qrCode}`}
                        className="h-32 w-32 lg:h-40 lg:w-40 shadow border"
                      />
                      <Text className="text-center">
                        {qrExpiry && (
                          <>
                            Expires in:{" "}
                            <span>
                              {60 -
                                Math.floor(
                                  (new Date().getTime() -
                                    new Date(qrExpiry).getTime()) /
                                    1000 /
                                    60
                                )}{" "}
                              minutes
                            </span>
                          </>
                        )}
                      </Text>
                    </>
                  ) : (
                    <div className="flex justify-center items-center h-[200px]">
                      <Loader size="lg" />
                    </div>
                  )}
                </div>
              </Popover.Content>
            </Popover>
            <Input
              type="text"
              placeholder="Search ..."
              value={searchTerm}
              onChange={(e) => {
                handleSearch(e.target.value);
              }}
              clearable
              onClear={() => {
                handleSearch("");
              }}
              className="max-sm:col-span-full placeholder:text-gray-200"
            />
            {isStaf && !access ? (
              <Button
                onClick={() => {
                  toast.error("You aren't allowed to make changes");
                }}
              >
                Add <AiOutlineUserAdd className="mx-1" size={16} />
              </Button>
            ) : (
              <Link href="/leads/new-leads">
                <Button>
                  Add <AiOutlineUserAdd className="mx-1" size={16} />
                </Button>
              </Link>
            )}

            <Button onClick={() => setIsDrawerOpen(true)}>
              Filters <FilterIcon className="ml-2" />
            </Button>
            <div className="flex items-center border rounded-lg bg-gray-50 gap-1.5 p-1.5">
              <Button
                onClick={() => setView("grid")}
                size="sm"
                className={
                  view !== "grid"
                    ? `bg-primary-lighter text-primary hover:text-primary-lighter`
                    : ""
                }
              >
                <MdOutlineGridView size={16} />
              </Button>
              <Button
                onClick={() => setView("table")}
                size="sm"
                className={
                  view !== "table"
                    ? `bg-primary-lighter text-primary hover:text-primary-lighter`
                    : ""
                }
              >
                <FaList size={16} />
              </Button>
            </div>
          </div>
        }
      >
        <div className="grid md:hidden grid-cols-2 justify-start  gap-4 mt-4">
          <Input
            type="text"
            placeholder="Search ..."
            value={searchTerm}
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
            clearable
            onClear={() => {
              handleSearch("");
            }}
            className="max-sm:col-span-full"
          />
          <Link href="/leads/new-leads">
            <Button className="w-full flex items-center justify-center">
              Add <AiOutlineUserAdd className="mx-1" size={16} />
            </Button>
          </Link>
          <Button onClick={() => setIsDrawerOpen(true)}>
            Filters <FilterIcon className="ml-2" />
          </Button>
        </div>
        {isLoading ? (
          <div className=" w-full min-h-40 flex flex-1 justify-center items-center">
            <Loader variant="spinner" size="xl" />
          </div>
        ) : (
          <>
            <div className="max-md:hidden">
              {view === "grid" ? (
                <LeadCardList
                  data={data}
                  setFunc={setFunc}
                  setOpen={setOpen}
                  setSelected={setSelected}
                  packages={packages}
                  paymentModes={paymentModes}
                  refreshData={refreshData}
                  auth={auth}
                  isValid={isValid}
                  openPopoverId={openPopoverId}
                  setOpenPopoverId={setOpenPopoverId}
                  showrestore={showrestore}
                  // isStaff={isStaf}
                  // staffType={staffType}
                  access={access}
                  findDataIndex={findDataIndex}
                />
              ) : (
                <Table
                  variant="minimal"
                  data={data}
                  // @ts-ignore
                  columns={columns}
                  scroll={{ y: 500 }}
                  className="text-sm mt-4 md:mt-6 rounded-sm "
                  rowClassName="!dark:bg-inherit  "
                />
              )}
            </div>
            <div className="md:hidden">
              <LeadCardList
                data={data}
                setFunc={setFunc}
                setOpen={setOpen}
                setSelected={setSelected}
                packages={packages}
                paymentModes={paymentModes}
                refreshData={refreshData}
                auth={auth}
                isValid={isValid}
                openPopoverId={openPopoverId}
                setOpenPopoverId={setOpenPopoverId}
                showrestore={showrestore}
                // isStaff={isStaf}
                // staffType={staffType}
                access={access}
                findDataIndex={findDataIndex}
              />
            </div>
          </>
        )}
      </WidgetCard>
      <div className="flex justify-between mt-4">
        <Select
          value={pageSizeVal}
          // size="sm"
          options={pageSizeOptions}
          placeholder="Items per page"
          className={"w-auto  "}
          onChange={(option: any) => {
            setPageSizeVal(option.value);
            setPageSize(option.value);
          }}
          labelClassName=""
          // dropdownClassName=""
          // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
        ></Select>

        <Pagination
          total={totalLeads}
          current={currentPage}
          onChange={handlePageChange}
          outline={false}
          rounded="md"
          variant="solid"
          color="primary"
          pageSize={pageSizeVal ?? 0}
        />
      </div>
      <div className="!fixed !z-[999] bottom-5 right-5 sm:bottom-10 sm:right-10 ">
        {checkedItems.length > 0 && (
          <div className="flex flex-row gap-4 items-center">
            {filters.status !== "Closed" ? (
              <Button
                onClick={() => CloseAll()}
                className="flex flex-row gap-2 items-center justify-start font-medium duration-300 hover:scale-105"
              >
                <FaLock size={20} />
                <Text>Close Selected ({checkedItems.length})</Text>
              </Button>
            ) : (
              <Button
                onClick={() => OpenAll()}
                className="flex flex-row gap-2 items-center justify-start font-medium duration-300 hover:scale-105"
              >
                <FaUnlockKeyhole size={20} />
                <Text>Re-Open Selected ({checkedItems.length})</Text>
              </Button>
            )}
            {filters.status !== "Deleted" ? (
              <DeleteAllModal
                ids={checkedItems}
                type="Enquiry"
                onUpdate={() => {
                  getData(1, filters);
                  setCheckedItems([]);
                }}
              />
            ) : null}
          </div>
        )}
      </div>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        size="sm"
      >
        <div className="flex flex-col h-full">
          <div className="p-5 flex-grow">
            <div className="flex items-center justify-between mb-5">
              <Title as="h3" className="text-gray-900 ">
                Filters
              </Title>
              <XIcon
                className="h-6 w-6 cursor-pointer text-gray-900 "
                onClick={() => setIsDrawerOpen(false)}
              />
            </div>
            <div className="space-y-4">
              <Select
                name="status"
                label="Status"
                value={filters.status}
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Deleted", value: "Deleted" },
                  { label: "Closed", value: "Closed" },
                ]}
                onChange={(option: any) => {
                  console.log(option);
                  handleFilterChange("status", option.value);
                }}
                labelClassName=""
                // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
              />
              <Select
                label="Range (By Visit Date)"
                options={filterOptions}
                onChange={(option: any) => {
                  // if (option.value === "all") {
                  //   setFilterInfo("all");
                  // }
                  setFilters((prev) => ({
                    ...prev,
                    startDate: "",
                    endDate: "",
                  }));
                  handleFilterChange("dateRange", option.value);
                }}
                value={
                  filterOptions.find((item) => item.value === filters.dateRange)
                    ?.label
                }
                labelClassName="text-gray-900 "
                className="text-gray-700 "
                // dropdownClassName="dark:bg-gray-800"
                // optionClassName="dark:[&_div]:text-gray-400 dark:[&_div]:hover:text-gray-700"
              />
              {dateRangeInfo && (
                <Announcement
                  badgeText={dateRangeInfo}
                  className="dark:bg-inherit"
                />
              )}
              {/* <div className="flex flex-col gap-2">
                <Text>Start Date:</Text>
                <DatePicker
                  placeholderText="Start Date"
                  disabled={
                    filters.dateRange === "" ||
                    filters.dateRange === "daily" ||
                    filters.dateRange === "yesterday"
                  }
                  selected={
                    filters.startDate ? dayjs(filters.startDate).toDate() : null
                  }
                  onChange={(date: any) =>
                    handleFilterChange("startDate", date)
                  }
                  dateFormat="yyyy-MM-dd"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Text>End Date:</Text>
                <DatePicker
                  placeholderText="End Date"
                  disabled={
                    !filters.startDate ||
                    filters.dateRange === "" ||
                    filters.dateRange === "daily" ||
                    filters.dateRange === "yesterday"
                  }
                  selected={
                    filters.endDate ? dayjs(filters.endDate).toDate() : null
                  }
                  onChange={(date: any) => handleFilterChange("endDate", date)}
                  dateFormat="yyyy-MM-dd"
                  minDate={
                    filters.startDate
                      ? dayjs(filters.startDate).toDate()
                      : undefined
                  }
                />
              </div> */}
            </div>
          </div>
          <div className="p-5 mt-auto">
            <Button className="w-full" onClick={applyFilters}>
              Show Results
            </Button>
          </div>
        </div>
      </Drawer>
      {func === "Delete" && (
        <Delete
          id={data[selected]?.LeadId}
          modalState={open}
          setModalState={setOpen}
          getData={refreshData}
        />
      )}
      {func === "Edit" && (
        <Edit
          modalState={open}
          setModalState={setOpen}
          leadVal={data[selected]}
          category={category}
          status={status}
          source={source}
          getData={refreshData}
          contactType={contactType}
        />
      )}
      {func === "More" && (
        <AddLeadFollowup
          modelState={open}
          setModelState={setOpen}
          leadId={data[selected]?.LeadId}
          refresh={refreshData}
        />
      )}
    </section>
  );
};

export default Leads;
