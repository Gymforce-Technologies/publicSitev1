// MembershipCardList.tsx
import { useState, useEffect } from "react";
import { Button, Empty, Select } from "rizzui";
import { IoMdArrowDown, IoMdArrowUp } from "react-icons/io";
import MembershipCardView from "./MembershipCardView";
import { Membership } from "@/components/membership/section/Memberships";

interface MembershipCardListProps {
  data?: Membership[];
  demographicInfo: any;
  handleAction: (
    action:
      | "Pay"
      | "Renew"
      | "Extend"
      | "Upgrade"
      | "Freeze"
      | "UnFreeze"
      | "Cancel"
      | "Addon"
      | "Transfer"
      | "addTrainer",
    membershipId: string
  ) => void;
  checkValidity: () => void;
  auth: boolean;
  access: boolean;
}

const MembershipCardList = ({
  data = [],
  demographicInfo,
  handleAction,
  checkValidity,
  auth,
  access,
}: MembershipCardListProps) => {
  const [sortedData, setSortedData] = useState<Membership[]>(data);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortFields = [
    { value: "", label: "Select field..." },
    { value: "member_name", label: "Name" },
    { value: "start_date", label: "Start Date" },
    { value: "due", label: "Due Amount" },
  ];

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
      case "member_name":
        sorted.sort((a, b) => {
          return newOrder === "asc"
            ? a.member_name.localeCompare(b.member_name)
            : b.member_name.localeCompare(a.member_name);
        });
        break;
      case "start_date":
        sorted.sort((a, b) => {
          const dateA = new Date(a.start_date);
          const dateB = new Date(b.start_date);
          return newOrder === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        });
        break;
      case "due":
        sorted.sort((a, b) => {
          return newOrder === "asc" ? a.due - b.due : b.due - a.due;
        });
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

  if (!data || data.length === 0) {
    return <Empty text="No Memberships Found" />;
  }

  return (
    <div className="grid gap-6 p-1.5 sm:p-6">
      <div className="flex items-center justify-end gap-2">
        <Select
          label="Sort by"
          labelClassName="font-medium text-gray-700"
          className="max-w-[200px]"
          value={sortFields.find((field) => field.value === sortField)}
          onChange={(option: any) => handleSort(option.value)}
          options={sortFields}
        />
        {sortField && (
          <div className="flex gap-2">
            <Button
              variant={sortOrder === "asc" ? "solid" : "flat"}
              onClick={() => handleSort(sortField, "asc")}
              size="sm"
            >
              <IoMdArrowUp size={16} />
            </Button>
            <Button
              variant={sortOrder === "desc" ? "solid" : "flat"}
              onClick={() => handleSort(sortField, "desc")}
              size="sm"
            >
              <IoMdArrowDown size={16} />
            </Button>
          </div>
        )}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedData.map((item) => (
          <MembershipCardView
            key={item.membership_id}
            data={item}
            demographicInfo={demographicInfo}
            handleAction={handleAction}
            checkValidity={checkValidity}
            auth={auth}
            access={access}
          />
        ))}
      </div>
    </div>
  );
};

export default MembershipCardList;
