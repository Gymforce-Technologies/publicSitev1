import { retrieveDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import { isStaff } from "@/app/[locale]/auth/Staff";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
// import AddMembership from "@/app/[locale]/(home)/members/_components/member-profile/AddMembership";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
// import { EditModal } from "s";
const TransferMembership = dynamic(
  () => import("@/components/membership/Transfermembership")
);
const UpgradeMembership = dynamic(
  () => import("@/components/membership/UpgradeMembership")
);
const FreezeMembership = dynamic(
  () => import("@/components/membership/FreezeMembership")
);
const AddonMembership = dynamic(
  () => import("@/components/membership/AddonMembership")
);
const CancelMembership = dynamic(
  () => import("@/components/membership/CancelMembership")
);
const UnfreezeMembership = dynamic(
  () => import("@/components/membership/UnfreezeMembership")
);
const ExtendModal = dynamic(() =>
  import("../Modals").then((com) => com.ExtendModal)
);
const EditModal = dynamic(
  () => import("../Modals").then((com) => com.EditModal),
  {
    ssr: false,
  }
);
const PaymentModal = dynamic(() =>
  import("../Modals").then((com) => com.PaymentModal)
);
const RenewModal = dynamic(
  () => import("../Modals").then((com) => com.RenewModal),
  {
    ssr: false,
  }
);
// import AddMembership from "./members/member-profile/AddMembership";
const AddMembership = dynamic(
  () => import("../members/member-profile/AddMembership")
);
import MemberCard from "./MemberCard";
import { Button, Empty, Loader, Select } from "rizzui";
import { IoMdArrowDown, IoMdArrowUp } from "react-icons/io";

export default function MembersCardList({
  data,
  fetchMemberData,
  pageNumber,
  isLoading,
  restore,
  checkedItems,
  setCheckedItems,
  access,
}: {
  data: any[];
  fetchMemberData: (pageNumber: number) => Promise<void>;
  pageNumber: number;
  isLoading: boolean;
  restore: boolean;
  //   onHeaderSort: (headerKey: keyof Member | null) => void;
  checkedItems: number[];
  setCheckedItems: Dispatch<SetStateAction<number[]>>;
  access: boolean;
}) {
  // const [pageSize, setPageSize] = useState(10);
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
  // const [expandedRow, setExpandedRow] = useState<any>(null); // New state for row expansion
  const [isValid, setIsValid] = useState(false);
  const [auth, setAuth] = useState<boolean>(true);
  const router = useRouter();
  const [staffType, setStaffType] = useState<string>("");
  const [isStaf, setIsStaf] = useState<boolean>(false);
  const [addMembership, setAddMembership] = useState(false);
  const sortFields = [
    {
      value: "",
      label: "Select field...",
    },
    {
      value: "name",
      label: "Name",
    },
    {
      value: "gender",
      label: "Gender",
    },
    {
      value: "due",
      label: "Due Amount",
    },
  ];
  const [sortedData, setSortedData] = useState(data);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Update the sorting function
  const handleSort = (field: string | null, order?: "asc" | "desc") => {
    const newOrder = order || sortOrder;
    setSortField(field || "");
    setSortOrder(newOrder);

    if (!field) {
      setSortedData([...data]);
      return;
    }

    let sorted = [...data];

    switch (field) {
      case "name":
        sorted.sort((a, b) =>
          newOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
        break;
      case "gender":
        sorted.sort((a, b) =>
          newOrder === "asc"
            ? a.gender.localeCompare(b.gender)
            : b.gender.localeCompare(a.gender)
        );
        break;
      case "due":
        sorted.sort((a, b) =>
          newOrder === "asc"
            ? (a.due || 0) - (b.due || 0)
            : (b.due || 0) - (a.due || 0)
        );
        break;
      default:
        sorted = [...data];
    }
    setSortedData(sorted);
  };

  useEffect(() => {
    setSortedData(data);
    if (sortField) {
      handleSort(sortField, sortOrder);
    }
  }, [data]);

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
      setAuth(!resp);
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
  const closeModal = () => {
    setFunc(null);
    setOpenPopoverId(null);
    setSelectedRow(null);
  };

  return (
    <>
      {isLoading ? (
        <div className="min-w-full flex items-center justify-center my-8">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : (
        <div>
          {data.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6 md:gap-8 p-1.5 sm:p-6 md:p-8 lg:grid-cols-3 w-full">
              <div className="col-span-full min-w-full flex items-end gap-2 justify-end ">
                <Select
                  label="Sort by"
                  labelClassName="font-medium text-gray-700 capitalize"
                  className="max-w-[200px]"
                  value={
                    sortField
                      ? sortFields.find((field) => field.value === sortField)
                      : sortFields[0]
                  }
                  onChange={(option: any) => handleSort(option.value)}
                  options={sortFields}
                />

                {sortField && (
                  <div className="flex gap-2">
                    <Button
                      variant={sortOrder === "asc" ? "solid" : "flat"}
                      onClick={() => handleSort(sortField, "asc")}
                      size="sm"
                      className="scale-x-95"
                    >
                      <IoMdArrowUp size={16} />
                    </Button>
                    <Button
                      variant={sortOrder === "desc" ? "solid" : "flat"}
                      onClick={() => handleSort(sortField, "desc")}
                      size="sm"
                      className="scale-x-95"
                    >
                      <IoMdArrowDown size={16} />
                    </Button>
                  </div>
                )}
              </div>
              {sortedData.map((member) => (
                <MemberCard
                  key={member.id}
                  data={member}
                  auth={auth}
                  demographiInfo={demographiInfo}
                  fetchMemberData={fetchMemberData}
                  func={func}
                  isStaf={isStaf}
                  access={access}
                  pageNumber={pageNumber}
                  restore={restore}
                  setFunc={setFunc}
                  setSelectedRow={setSelectedRow}
                  setOpenPopoverId={setOpenPopoverId}
                  isValid={isValid}
                  staffType={staffType}
                  openPopoverId={openPopoverId}
                  router={router}
                  setAddMembership={setAddMembership}
                  // checkedItems={checkedItems}
                  // handleSelectAll={handleSelectAll}
                />
              ))}
            </div>
          ) : (
            <Empty text="No member's data " />
          )}
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
          {func === "Upgrade" && selectedRow && (
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
          )}
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
      )}
    </>
  );
}
