// PTCardList.tsx
import { Button, Empty, Select } from "rizzui";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { IoMdArrowDown, IoMdArrowUp } from "react-icons/io";
import PTCard from "./PTCard";
import { MangeData } from "../MembershipList";

interface PTCardListProps {
  data: MangeData[];
  demographicInfo?: any;
  showManage: boolean;
  showApprove: boolean;
  isStaf: boolean;
  onAction: Dispatch<
    SetStateAction<"close" | "add" | "view" | "approve" | "history" | null>
  >;
  setAddSession: Dispatch<any>;
  setEndSession: Dispatch<any>;
  setSelected: Dispatch<SetStateAction<MangeData | null>>;
  auth: boolean;
  access: boolean;
}

const PTCardList = ({
  data = [],
  demographicInfo,
  showManage,
  showApprove,
  isStaf,
  onAction,
  setAddSession,
  setEndSession,
  setSelected,
  access,
  auth,
}: PTCardListProps) => {
  const [sortedData, setSortedData] = useState<any[]>(data);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortFields = [
    { value: "", label: "Select field..." },
    { value: "member_name", label: "Name" },
    { value: "sessions", label: "Sessions" },
    { value: "offer_price_amount", label: "Price" },
    { value: "latest_session_details", label: "Last Session" },
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
      case "sessions":
        sorted.sort((a, b) => {
          const sessionsA = parseInt(a.sessions.split("|")[0]);
          const sessionsB = parseInt(b.sessions.split("|")[0]);
          return newOrder === "asc"
            ? sessionsA - sessionsB
            : sessionsB - sessionsA;
        });
        break;
      case "offer_price_amount":
        sorted.sort((a, b) => {
          return newOrder === "asc"
            ? a.offer_price_amount - b.offer_price_amount
            : b.offer_price_amount - a.offer_price_amount;
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
  }, [data, sortField, sortOrder]);

  if (!data || data.length === 0) {
    return <Empty text="No PT Sessions Found" />;
  }

  return (
    <div className="grid sm:grid-cols-2 gap-6 md:gap-8 p-1.5 sm:p-6 md:p-8 lg:grid-cols-3 w-full">
      <div className="col-span-full min-w-full flex items-end gap-2 justify-end">
        <Select
          label="Sort by"
          labelClassName="font-medium text-gray-700 capitalize"
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

      {sortedData.map((item, index) => (
        <PTCard
          key={item.membership_id || index}
          data={item}
          demographicInfo={demographicInfo}
          showManage={showManage}
          showApprove={showApprove}
          isStaf={isStaf}
          onAction={onAction}
          setAddSession={setAddSession}
          setEndSession={setEndSession}
          setSelected={setSelected}
          auth={auth}
          access={access}
        />
      ))}
    </div>
  );
};

export default PTCardList;
