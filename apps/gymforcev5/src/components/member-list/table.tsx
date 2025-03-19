import React, {
  useState,
  useEffect,
  useMemo,
  // useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import dynamic from "next/dynamic";
import { useTable } from "@core/hooks/use-table";
import { useColumn } from "@core/hooks/use-column";
// import { PiCaretDownBold, PiCaretUpBold } from "react-icons/pi";
import ControlledTable from "@/components/controlled-table";
import { getColumns } from "./columns";
import cn from "@core/utils/class-names";
// import ExpandedOrderRow from "./expanded-row";
import { retrieveDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import {
  checkUserAccess,
  // isUserOnTrial,
  // isUserSubscribed,
  // retrieveUserSubscriptionInfo,
} from "@/app/[locale]/auth/Trail";
import { useRouter } from "next/navigation";
import { isStaff } from "@/app/[locale]/auth/Staff";
import { Member, SortProps } from "@/components/member-list/MemberListSection";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
// import { ExtendModal, EditModal, PaymentModal, RenewModal } from "./Modals";

const TransferMembership = dynamic(
  () => import("@/components/membership/Transfermembership"),
  {
    ssr: false,
  }
);
const UpgradeMembership = dynamic(
  () => import("@/components/membership/UpgradeMembership"),
  {
    ssr: false,
  }
);
const FreezeMembership = dynamic(
  () => import("@/components/membership/FreezeMembership")
);
const AddonMembership = dynamic(
  () => import("@/components/membership/AddonMembership"),
  {
    ssr: false,
  }
);
const CancelMembership = dynamic(
  () => import("@/components/membership/CancelMembership")
);
const UnfreezeMembership = dynamic(
  () => import("@/components/membership/UnfreezeMembership")
);

const ExtendModal = dynamic(() =>
  import("./Modals").then((com) => com.ExtendModal)
);
const EditModal = dynamic(
  () => import("./Modals").then((com) => com.EditModal),
  {
    ssr: false,
  }
);
const PaymentModal = dynamic(() =>
  import("./Modals").then((com) => com.PaymentModal)
);
const RenewModal = dynamic(
  () => import("./Modals").then((com) => com.RenewModal),
  {
    ssr: false,
  }
);
// import AddMembership from "./members/member-profile/AddMembership";
const AddMembership = dynamic(
  () => import("./members/member-profile/AddMembership")
);
const filterState = {
  price: ["", ""],
  createdAt: [null, null],
  updatedAt: [null, null],
  status: "",
};

interface OrderTableProps {
  data: any[];
  variant?: "modern" | "minimal" | "classic" | "elegant" | "retro";
  className?: string;
  fetchMemberData: (pageNumber: number) => Promise<void>;
  pageNumber: number;
  isLoading: boolean;
  restore: boolean;
  onHeaderSort: (headerKey: keyof Member | null) => void;
  sort: SortProps;
  checkedItems: number[];
  setCheckedItems: Dispatch<SetStateAction<number[]>>;
}

// function CustomExpandIcon(props: any) {
//   return (
//     <ActionIcon
//       size="sm"
//       variant="outline"
//       rounded="full"
//       // className="absolute min-w-full py-4 mb-8 overflow-hidden"
//       onClick={(e) => {
//         props.onExpand(props.record, e);
//       }}
//       // onMouseEnter={(e) => {
//       //   props.onExpand(props.record, e);
//       // }}
//       // onMouseLeave={(e) => props.onExpand(props.record, e)}
//     >
//       {props.expanded ? (
//         <PiCaretUpBold className="h-3.5 w-3.5 " />
//       ) : (
//         <PiCaretDownBold className="h-3.5 w-3.5 " />
//       )}
//     </ActionIcon>
//   );
// }
const OrderTable: React.FC<OrderTableProps> = ({
  data,
  variant = "modern",
  className,
  fetchMemberData,
  pageNumber,
  isLoading,
  restore,
  onHeaderSort,
  sort,
  checkedItems,
  setCheckedItems,
}) => {
  const [pageSize, setPageSize] = useState(10);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [demographiInfo, setDemographicInfo] = useState<any>(null);
  const [func, setFunc] = useState<
    | "Edit"
    | "Pay"
    | "Renew"
    | "Restore"
    | "Extend"
    | "Upgrade"
    | "Freeze"
    | "UnFreeze"
    | "Cancel"
    | "Transfer"
    | "Addon"
    | null
  >(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [access, setAccess] = useState<boolean>(true);
  const [isValid, setIsValid] = useState(false);
  const [auth, setAuth] = useState<boolean>(true);
  const router = useRouter();
  const [staffType, setStaffType] = useState<string>("");
  const [isStaf, setIsStaf] = useState<boolean>(false);
  const [addMembership, setAddMembership] = useState(false);

  const onHeaderCellClick = (value: string) => ({
    onClick: () => handleSort(value),
  });

  const handleSelectAll = () => {
    if (checkedItems.length === data.length) {
      setCheckedItems([]);
    } else {
      const idVals = data.map((member) => {
        return parseInt(member.member_id);
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

  useEffect(() => {
    const getInfo = async () => {
      const infoData = await retrieveDemographicInfo();
      setDemographicInfo(infoData);
      const resp = await isStaff();
      if (resp) {
        setAuth(!resp);
        await fetchPermissions();
      }
      checkUserAccess().then((status) => {
        if (status !== "Restricted") {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      });
    };
    getInfo();
  }, []);
  useEffect(() => {
    const type = sessionStorage.getItem("staffType");
    setStaffType(type?.replace(/"/g, "").toLowerCase() || "");
    const isStaffVal = sessionStorage.getItem("isStaff");
    console.log(isStaffVal);
    setIsStaf(isStaffVal === "true");
  }, []);

  const { currentPage, totalItems, handlePaginate, sortConfig, handleSort } =
    useTable(data, pageSize, filterState);
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
        response.data.permissions["mainMemberManagement"] === "all";
      setAccess(isEnquiry);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
      // } finally {
    }
  };

  const columns = useMemo(
    () =>
      getColumns({
        sortConfig,
        onHeaderCellClick,
        openPopoverId,
        setOpenPopoverId,
        demographiInfo,
        func,
        setFunc,
        pageNumber,
        fetchMemberData,
        setSelectedRow,
        restore,
        isValid,
        router,
        checkedItems,
        handleSelectAll,
        onChecked,
        totalItems: data.length,
        auth: auth,
        onHeaderSort,
        sort,
        // staffType,
        isStaf,
        setAddMembership,
        access,
      }),
    [
      sortConfig,
      onHeaderCellClick,
      openPopoverId,
      demographiInfo,
      func,
      pageNumber,
      fetchMemberData,
      restore,
      isValid,
      router,
      sort,
      // staffType,
      isStaf,
      setAddMembership,
      access,
    ]
  );

  const { visibleColumns } = useColumn(columns);

  const closeModal = () => {
    setFunc(null);
    setOpenPopoverId(null);
    setSelectedRow(null);
  };

  return (
    <div className={cn(className)}>
      <ControlledTable
        variant={variant}
        isLoading={isLoading}
        showLoadingText={true}
        data={data}
        // sticky={true}
        scroll={{ y: 500 }}
        // @ts-ignore
        columns={visibleColumns}
        // expandable={{
        //   expandIcon: (props: any) => {
        //     return (
        //       <CustomExpandIcon
        //         {...props}
        //         expanded={props.record === expandedRow} // Only show expand icon if the row is hovered
        //       />
        //     );
        //   },
        //   expandedRowRender: (record: any) => (
        //     <ExpandedOrderRow record={record} demographiInfo={demographiInfo} />
        //   ),
        //   // Removed onRow here, handle hover behavior directly via event listeners below
        //   defaultExpandAllRows: false, // Disable default expand all
        // }}
        paginatorOptions={{
          pageSize,
          setPageSize,
          total: totalItems,
          current: currentPage,
          onChange: handlePaginate,
        }}
        className="rounded-md text-sm shadow-sm [&_.rc-table-row:hover]:bg-gray-100 [&_.rc-table-thead]:bg-gray-100"
      />
      {func === "Edit" && selectedRow && (
        <EditModal
          onUpdate={() => {
            fetchMemberData(pageNumber);
            closeModal();
          }}
          member={selectedRow.member_id}
          func={func}
        />
      )}
      {func === "Pay" && selectedRow && (
        <PaymentModal
          onUpdate={() => {
            fetchMemberData(pageNumber);
            closeModal();
          }}
          membershipid={selectedRow.membership_id}
          func={func}
        />
      )}
      {func === "Renew" && selectedRow && (
        <RenewModal
          onUpdate={() => {
            fetchMemberData(pageNumber);
            closeModal();
          }}
          membershipId={selectedRow.membership_id}
          package_name={selectedRow.membership}
          func={func}
          end_date={selectedRow.exp_date}
          member_id={selectedRow.member_id}
        />
      )}
      {func === "Extend" && selectedRow && (
        <ExtendModal
          onUpdate={() => {
            fetchMemberData(pageNumber);
            closeModal();
          }}
          membershipId={selectedRow.membership_id}
          due_date={selectedRow.due_date}
        />
      )}
      {/* {func === "Upgrade" && selectedRow && (
        <UpgradeMembership
          membershipId={selectedRow.membership_id}
          onUpdate={() => {
            fetchMemberData(pageNumber);
            closeModal();
          }}
          closeModal={closeModal}
          package_type={selectedRow.latest_membership_package_id}
          paid_amount={selectedRow?.paid_amount}
          end_date={selectedRow?.exp_date}
          member_image={selectedRow?.member_image}
          member_name={selectedRow?.name}
          member_id={selectedRow.member_id}
        />
      )}
      {func === "Freeze" && selectedRow && (
        <FreezeMembership
          membershipId={selectedRow.membership_id}
          onUpdate={() => {
            fetchMemberData(pageNumber);
            closeModal();
          }}
          closeModal={closeModal}
        />
      )}
      {func === "UnFreeze" && selectedRow && (
        <UnfreezeMembership
          membershipId={selectedRow.membership_id}
          onUpdate={() => {
            fetchMemberData(pageNumber);
            closeModal();
          }}
          closeModal={closeModal}
        />
      )} */}
      {func === "Cancel" && selectedRow && (
        <CancelMembership
          membershipId={selectedRow.membership_id}
          onUpdate={() => {
            fetchMemberData(pageNumber);
            closeModal();
          }}
          closeModal={closeModal}
        />
      )}
      {func === "Addon" && selectedRow && (
        <AddonMembership
          membershipId={selectedRow?.membership_id}
          onUpdate={() => {
            fetchMemberData(pageNumber);
            closeModal();
          }}
          closeModal={closeModal}
        />
      )}
      {func === "Transfer" && selectedRow && (
        <TransferMembership
          membershipId={selectedRow.membership_id}
          onUpdate={() => {
            fetchMemberData(pageNumber);
            closeModal();
          }}
          closeModal={closeModal}
          end_date={selectedRow?.exp_date}
          member_image={selectedRow?.member_image}
          member_name={selectedRow?.name}
        />
      )}
      <AddMembership
        m_id={selectedRow?.member_id}
        open={addMembership}
        setOpen={setAddMembership}
        onSuccess={() => {
          setAddMembership(false);
          fetchMemberData(1);
        }}
      />
    </div>
  );
};

export default OrderTable;
