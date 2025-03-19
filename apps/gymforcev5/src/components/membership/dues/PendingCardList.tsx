// PendingCardList.tsx
import { Button, Empty, Select } from "rizzui";
import { useState, useEffect } from "react";
import { IoMdArrowDown, IoMdArrowUp } from "react-icons/io";
import { Membership } from "@/components/membership/section/DueList";
import PendingCard from "./PendingCard";

interface PendingCardListProps {
  data?: Membership[];
  getdueData: () => void;
  demographiInfo?: any;
  checkValidity: () => void;
  extendRefresh: () => void;
  auth: boolean;
  access: boolean;
}

const PendingCardList = ({
  data = [],
  getdueData,
  demographiInfo,
  checkValidity,
  extendRefresh,
  auth,
  access,
}: PendingCardListProps) => {
  const [sortedData, setSortedData] = useState<Membership[]>(data);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortFields = [
    {
      value: "",
      label: "Select field...",
    },
    {
      value: "member_name",
      label: "Name",
    },
    {
      value: "due_date",
      label: "Reminder",
    },
    {
      value: "due",
      label: "Due Amount",
    },
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
      case "due_date":
        sorted.sort((a, b) => {
          const dateA = a.due_date ? new Date(a.due_date) : new Date();
          const dateB = b.due_date ? new Date(b.due_date) : new Date();
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
  }, [data, sortField, sortOrder]);

  if (!data || data.length === 0) {
    return <Empty text="No Pending Payments" />;
  }

  return (
    <div className="grid sm:grid-cols-2 gap-6 md:gap-8 p-1.5 sm:p-6 md:p-8 lg:grid-cols-3 w-full">
      <div className="col-span-full min-w-full flex items-end gap-2 justify-end">
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
      {sortedData.map((item, index) => (
        <PendingCard
          key={item.member_id || index}
          data={item}
          getdueData={getdueData}
          demographiInfo={demographiInfo}
          checkValidity={checkValidity}
          extendRefresh={extendRefresh}
          auth={auth}
          access={access}
        />
      ))}
    </div>
  );
};

export default PendingCardList;
