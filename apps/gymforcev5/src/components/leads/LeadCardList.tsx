import { Button, Empty, Select } from "rizzui";
import { Data, Package } from "./Leads";
import LeadCard from "./LeadCard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoMdArrowDown, IoMdArrowUp } from "react-icons/io";

const LeadCardList = ({
  data,
  setFunc,
  setSelected,
  setOpen,
  packages,
  paymentModes,
  auth,
  refreshData,
  isValid,
  openPopoverId,
  setOpenPopoverId,
  showrestore,
  // isStaff,
  // staffType,
  access,
  findDataIndex,
}: {
  data: Data[];
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  setFunc: React.Dispatch<
    React.SetStateAction<"Edit" | "Delete" | "More" | null>
  >;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  packages: Package[];
  paymentModes: {
    label: string;
    value: number;
  }[];
  refreshData: () => void;
  auth: boolean;
  isValid: boolean;
  openPopoverId: string | null;
  setOpenPopoverId: React.Dispatch<React.SetStateAction<string | null>>;
  showrestore: boolean;
  // isStaff: boolean;
  // staffType: string;
  access: boolean;
  findDataIndex: (leadId: string) => number;
}) => {
  const router = useRouter();
  const sortFields = [
    {
      value: "",
      label: "Select field...",
    },
    {
      value: "reminder",
      label: "Joining",
    },
    {
      value: "date",
      label: "Created",
    },
  ];

  const [sortedData, setSortedData] = useState(data);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
      case "reminder":
        sorted.sort((a, b) => {
          const dateA = new Date(a.reminder || 0);
          const dateB = new Date(b.reminder || 0);
          return newOrder === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        });
        break;
      case "date":
        sorted.sort((a, b) => {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);
          return newOrder === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
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
  return (
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
          {sortedData.map((item, index) => (
            <LeadCard
              key={index}
              data={item}
              setFunc={setFunc}
              setSelected={setSelected}
              setOpen={setOpen}
              auth={auth}
              refreshData={refreshData}
              packages={packages}
              paymentModes={paymentModes}
              isValid={isValid}
              openPopoverId={openPopoverId}
              setOpenPopoverId={setOpenPopoverId}
              showrestore={showrestore}
              // isStaff={isStaff}
              // staffType={staffType}
              access={access}
              findDataIndex={findDataIndex}
            />
          ))}
        </div>
      ) : (
        <Empty text="No Enquiry's " />
      )}
    </div>
  );
};

export default LeadCardList;
