// Import section remains the same, but organize imports by type
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { PiCaretLeftBold, PiCaretRightBold, PiPlusBold } from "react-icons/pi";
import { AdvancedRadio, Badge, Button, Input, RadioGroup, Text } from "rizzui";
import { CircleCheck, XIcon } from "lucide-react";
import { FaCheck, FaCircleCheck, FaUser, FaUsers } from "react-icons/fa6";
import { RiUserVoiceFill } from "react-icons/ri";
import toast from "react-hot-toast";

// Internal imports
import { getMembershipColumns } from "./column";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { retrieveDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import BasicTableWidget from "@/components/controlled-table/basic-table-restructured";
import Pagination from "@core/ui/pagination";
import WidgetCard from "@core/components/cards/widget-card";
import MetricCard from "@core/components/cards/metric-card";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import AddPackage from "./AddPack";
import { isStaff } from "@/app/[locale]/auth/Staff";

export interface SortProps {
  sortBy: keyof any | null;
  sortOrder: "asc" | "desc" | null;
}

export default function MasterMembershipList() {
  // State definitions
  const [modalState, setModalState] = useState(false);
  const [masterData, setMasterData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [demographiInfo, setDemographicInfo] = useState<any>(null);
  const [sort, setSort] = useState<SortProps>({
    sortBy: null,
    sortOrder: null,
  });
  const [centerType, setCenterType] = useState(0);
  const [metricData, setMetricData] = useState<any[]>([]);
  const [packageType, setPackageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useState<boolean>(true);
  const [access, setAccess] = useState<boolean>(false);

  const [packageCounts, setPackageCounts] = useState<any>(null);
  const recordsPerPage = 10;

  // Scrollable slider hook
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

  // API functions
  const fetchMasterPack = async (packageType: string) => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/list-packages/v2/?gym_id=${gymId}${packageType ? `&package_type=${packageType.split(" ")[0]}` : ""}`,
        { id: newID("master-packages-list-" + packageType.split(" ")[0]) }
      );
      setMasterData(resp.data.results.packages);
      setPackageCounts(resp.data.results.package_type_counts);
    } catch (error) {
      console.error("Error fetching master packages:", error);
      toast.error("Something went wrong while fetching master packages");
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await AxiosPrivate.get("/api/profile/", {
        id: newID("user-profile"),
        cache: {
          ttl: 60 * 60 * 1000,
        },
      });
      setCenterType(parseInt(response.data?.center) + 1);
    } catch (error) {
      console.error("Error fetching centers:", error);
    }
  };

  const fetchPackageType = async () => {
    try {
      const center =
        centerType === 1 ? "gym" : centerType === 2 ? "library" : "dance";
      const resp = await AxiosPrivate.get(
        `/api/add-package-prerequisites/?center_type=${center}`,
        { id: newID(`add-package-prerequisites-${center}`) }
      );
      setMetricData(
        resp.data.options.map((item: any) => ({ label: item, value: item }))
      );
    } catch (error) {
      console.error("Error fetching package types:", error);
    }
  };

  // Event handlers
  const handlePackageType = (value: string) => {
    setPackageType((prevPackageType) => {
      const newPackageType =
        prevPackageType.toLowerCase() === value.toLowerCase() ? "" : value;
      // fetchMasterPack(newPackageType);
      return newPackageType;
    });
  };

  const handleHeaderSort = (headerKey: keyof any | null) => {
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Utility functions
  const SortData = (
    data: any[],
    sortBy: keyof any | null,
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

  // Effects
  useEffect(() => {
    if (centerType === 0) {
      fetchCenters();
    }
  }, []);

  useEffect(() => {
    if (centerType) {
      fetchPackageType();
    }
  }, [centerType]);

  useEffect(() => {
    fetchMasterPack(packageType);
  }, [packageType]);

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

  useEffect(() => {
    async function getInfo() {
      try {
        const infoData = await retrieveDemographicInfo();
        setDemographicInfo(infoData);
      } catch (error) {
        console.error("Error fetching demographic info:", error);
      }
    }
    getInfo();
  }, []);

  useEffect(() => {
    // Sort data whenever sort state changes
    const sortedData = SortData(masterData, sort.sortBy, sort.sortOrder);
    setMasterData(sortedData);
  }, [sort]);

  // Memoized values
  const filteredData = useMemo(() => {
    return masterData.filter((item: any) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [masterData, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, recordsPerPage]);

  const totalRecords = filteredData.length;

  const PackageTypeGrid = useCallback(
    () => (
      <div className="relative flex w-full items-center overflow-hidden">
        <Button
          title="Prev"
          variant="text"
          ref={sliderPrevBtn}
          onClick={scrollToTheLeft}
          className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretLeftBold className="h-5 w-5" />
        </Button>

        <div
          className="w-full px-2 py-3 custom-scrollbar-x overflow-x-auto scroll-smooth pr-4 lg:pr-8"
          ref={sliderEl}
        >
          <RadioGroup
            value={packageType}
            setValue={(value: any) => {
              // If clicking the same option, deselect it (set to empty)
              if (value === packageType) {
                setPackageType("");
                fetchMasterPack("");
              } else {
                setPackageType(value);
                fetchMasterPack(value);
              }
            }}
            className="flex items-center gap-3 md:gap-4"
          >
            {metricData.map((metric, index) => (
              <AdvancedRadio
                key={index}
                value={metric.value}
                className={`relative flex items-center gap-2 rounded-lg pt-2  transition-all duration-200 ${
                  packageType === metric.value
                    ? "border-primary shadow-sm"
                    : "border-gray-200 hover:scale-105"
                }`}
              >
                {packageType === metric.value && (
                  <XIcon
                    size={18}
                    className="absolute -top-4 right-2 z-[99999] text-primary cursor-pointer hover:scale-110 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePackageType(metric.value);
                    }}
                  />
                )}
                <div className="flex flex-row items-center gap-2 p-1.5 transition-all duration-200 ">
                  <div
                    className={
                      packageCounts[metric?.value] || 0
                        ? "p-1 px-2.5 text-xs scale-90 bg-primary text-white rounded-full"
                        : "hidden"
                    }
                  >
                    {packageCounts !== null
                      ? packageCounts[metric?.value] ||
                        packageCounts[metric?.value?.toLowerCase()] ||
                        0
                      : ""}
                  </div>
                  <Text className="text-sm font-medium text-gray-900 truncate ">
                    {metric.label}
                  </Text>
                  <div
                    className={`flex items-center text-primary ${packageType === metric.value ? "" : "hidden"}`}
                  >
                    <CircleCheck size={18} className="" />
                  </div>
                </div>
              </AdvancedRadio>
            ))}
          </RadioGroup>
        </div>

        <Button
          title="Next"
          variant="text"
          ref={sliderNextBtn}
          onClick={scrollToTheRight}
          className="!absolute -right-1 top-0 z-10 !h-full w-10 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretRightBold className="h-5 w-5" />
        </Button>
      </div>
    ),
    [packageType, metricData]
  );

  return (
    <section className="grid grid-cols-1 gap-5 @container @[59rem]:gap-7">
      <PackageTypeGrid />

      <WidgetCard
        className="relative"
        headerClassName="flex flex-col sm:flex-row items-start sm:items-center gap-4"
        title="Master Packages"
        titleClassName="text-lg font-semibold whitespace-nowrap"
        action={
          <div className="flex flex-row items-center justify-end gap-4 w-full sm:w-auto">
            <Input
              placeholder="Search ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            {!auth && !access ? (
              <Button
                onClick={() =>
                  toast.error("You aren't allowed to make changes")
                }
              >
                <div className="flex flex-row flex-1 items-center gap-4 p-2 font-semibold">
                  Add
                  <PiPlusBold />
                </div>
              </Button>
            ) : (
              <AddPackage
                open={modalState}
                setOpen={setModalState}
                onPackageAdded={() => fetchMasterPack(packageType)}
              />
            )}
          </div>
        }
      >
        <BasicTableWidget
          //@ts-ignore
          variant="nope"
          data={paginatedData}
          getColumns={useCallback(
            (props: any) =>
              getMembershipColumns({
                ...props,
                demographiInfo,
                onUpdate: fetchMasterPack,
                sort: sort,
                access,
                handleHeaderSort: handleHeaderSort,
                auth,
              }),
            [demographiInfo, fetchMasterPack, sort, auth, access]
          )}
          scroll={{ y: 500 }}
          enableSearch={false}
          isLoading={loading}
          className="mt-4 md:mt-6 rounded-sm [&_.rc-table-thead_tr]:bg-gray-100"
        />
        <div className="flex justify-center sm:justify-end mt-4">
          <Pagination
            total={totalRecords}
            current={currentPage}
            onChange={handlePageChange}
            pageSize={recordsPerPage}
            className="responsive-pagination"
          />
        </div>
      </WidgetCard>
    </section>
  );
}
