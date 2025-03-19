"use client";

import Link from "next/link";
import { Text, Avatar, Badge, Tooltip, Button } from "rizzui";
import { HeaderCell } from "@/components/table";
import { Membership, SortProps } from "@/components/membership/section/DueList";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";
import { PhoneIcon } from "lucide-react";
// import AvatarCard from '@ui/avatar-card';
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { DemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import getDueBadge from "../../dueBadge";
import cn from "@core/utils/class-names";
import DateCell from "@core/ui/date-cell";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { MdOutlineDateRange } from "react-icons/md";
import Image from "next/image";
const Payment = dynamic(() => import("../due-payment"));
const WaModal = dynamic(() => import("../../wa-template/WaModal"));
const ExtendModal = dynamic(
  () => import("../../member-list/Modals").then((com) => com.ExtendModal),
  {
    ssr: false,
  }
);

type Columns = {
  data: Membership[];
  sortConfig?: any;
  handleSelectAll: () => void;
  checkedItems: string[];
  onDeleteItem: (id: string) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  getdueData: () => void;
  demographiInfo: DemographicInfo;
  checkValidity: () => void;
  extendRefresh: () => void;
  onHeaderSort: (headerKey: keyof Membership | null) => void;
  sort: SortProps;
  auth: boolean;
  access: boolean;
};

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  getdueData,
  demographiInfo,
  checkValidity,
  extendRefresh,
  sort,
  onHeaderSort,
  auth,
  access,
}: Columns) => {
  return [
    // {
    //   title: (
    //     <div className="ps-2">
    //       <Checkbox
    //         title={'Select All'}
    //         onChange={handleSelectAll}
    //         checked={data.length > 0 && checkedItems.length === data.length}
    //         className="cursor-pointer"
    //       />
    //     </div>
    //   ),
    //   dataIndex: 'checked',
    //   key: 'checked',
    //   width: 30,
    //   render: (_: any, row: Membership) => (
    //     <div className="inline-flex ps-2">
    //       <Checkbox
    //         className="cursor-pointer"
    //         checked={checkedItems.includes(row.id)}
    //         {...(onChecked && { onChange: () => onChecked(row.id) })}
    //       />
    //     </div>
    //   ),
    // },
    {
      title: (
        <HeaderCell title="ID" sortable className="text-sm font-semibold" />
      ),
      dataIndex: "localid",
      key: "localid",
      width: 30,
      render: (localid: number) => (
        <Text className="pl-1 sm:pl-2">#{localid}</Text>
      ),
    },
    {
      title: (
        <div
          onClick={() => {
            onHeaderSort("member_name");
          }}
        >
          <HeaderCell
            title="Name"
            sortable
            // className="text-sm font-semibold "
            ascending={
              sort.sortBy !== null &&
              sort.sortOrder !== null &&
              sort.sortBy === "member_name" &&
              sort.sortOrder === "desc"
            }
            className={
              (sort.sortBy === "member_name" ? "text-primary" : "") +
              " text-sm font-semibold pl-1 sm:pl-2"
            }
            // title="Started"
            iconClassName={
              (sort.sortBy === "member_name" ? "text-primary" : "") + " size-4"
            }
          />
        </div>
      ),
      // onHeaderCellClick: () => onHeaderSort("member_name"),
      dataIndex: "member_name",
      key: "member_name",
      width: 200,
      render: (member_name: string, row: Membership) => (
        //   <AvatarCard
        //   src={member_name || ''}
        //   name={member_name || 'N/A'}
        //   description={'-'}//member_email
        // />
        <figure className={cn("flex items-center gap-3 ")}>
          {/* <Avatar
            name={member_name}
            src={
              row.member_image ||
              (row?.gender && row?.gender[0]?.toLowerCase() === "f"
                ? "https://images.gymforce.in/woman-user-circle-icon.png"
                : "https://images.gymforce.in/man-user-circle-icon.png")
            }
          /> */}
          <Image
            alt={member_name}
            src={
              row.member_image ||
              (row?.gender && row?.gender[0]?.toLowerCase() === "f"
                ? WomanIcon
                : ManIcon)
            }
            height={40}
            width={40}
            className="size-10 rounded-full"
          />
          <figcaption className="grid gap-0.5">
            <Link href={`/member_profile/yk62-${row.member_id}-71he`}>
              {/* yk$6372h$e */}
              <Text className="font-lexend text-sm font-medium text-gray-900  hover:text-primary">
                <span className="flex flex-row gap-2 flex-nowrap items-center">
                  <Text className="text-nowrap text-clip"> {member_name}</Text>
                  {row.end_date && new Date(row.end_date) < new Date() ? (
                    <Badge size="sm" color="danger" variant="outline">
                      Expired
                    </Badge>
                  ) : new Date(row.end_date).getTime() - new Date().getTime() <=
                    604800000 ? (
                    <Badge size="sm" color="warning" variant="outline">
                      Expiring{" "}
                      <span className="hidden md:block md:ml-1">soon</span>
                    </Badge>
                  ) : (
                    <Badge size="sm" color="success" variant="outline">
                      Active
                    </Badge>
                  )}
                </span>
              </Text>
            </Link>
            <Text className="text-[13px]">{row.member_phone}</Text>
          </figcaption>
        </figure>
      ),
    },
    {
      title: (
        <HeaderCell className="text-sm font-semibold" title="Membership" />
      ),
      dataIndex: "package_name",
      key: "package_name",
      width: 150,
      render: (package_name: string) => <Text>{package_name}</Text>,
    },
    {
      title: <HeaderCell className="text-sm font-semibold" title="Valid" />,
      dataIndex: "end_date",
      key: "end_date",
      width: 120,
      render: (end_date: string) =>
        `${Math.floor((new Date(end_date).getTime() - new Date().getTime()) / 86400000)} days`,
      // render:(end_date:string) => <Text>{end_date}</Text>
    },
    {
      title: (
        <div
          onClick={() => {
            onHeaderSort("due_date");
          }}
        >
          <HeaderCell
            title="Reminder"
            sortable
            // className="text-sm font-semibold "
            ascending={
              sort.sortBy !== null &&
              sort.sortOrder !== null &&
              sort.sortBy === "due_date" &&
              sort.sortOrder === "desc"
            }
            className={
              (sort.sortBy === "due_date" ? "text-primary" : "") +
              " text-sm font-semibold "
            }
            // title="Started"
            iconClassName={
              (sort.sortBy === "due_date" ? "text-primary" : "") + " size-4"
            }
          />
        </div>
      ),
      // onHeaderCellClick: () => onHeaderSort("due_date"),
      dataIndex: "due_date",
      key: "due_date",
      width: 120,
      render: (date: string) => (
        <DateCell
          date={new Date(date)}
          dateFormat={getDateFormat()}
          timeClassName="hidden"
          dateClassName=""
        />
      ),
    },
    {
      // title: (
      //   <HeaderCell
      //     title="Due"
      //     sortable
      //     className="text-sm font-semibold pl-1"
      //     ascending={
      //       sortConfig?.direction === "asc" && sortConfig?.key === "due"
      //     }
      //   />
      // ),
      title: (
        <div
          onClick={() => {
            onHeaderSort("due");
          }}
        >
          <HeaderCell
            title="Due"
            sortable
            // className="text-sm font-semibold "
            ascending={
              sort.sortBy !== null &&
              sort.sortOrder !== null &&
              sort.sortBy === "due" &&
              sort.sortOrder === "desc"
            }
            className={
              (sort.sortBy === "due" ? "text-primary" : "") +
              " text-sm font-semibold pl-1 sm:pl-2"
            }
            // title="Started"
            iconClassName={
              (sort.sortBy === "due" ? "text-primary" : "") + " size-4"
            }
          />
        </div>
      ),
      // onHeaderCellClick: () => onHeaderSort("due"),
      // onHeaderCell: () => onHeaderCellClick("due"),
      dataIndex: "due",
      key: "due",
      width: 120,
      render: (due: number) => (
        <Text className=" pl-4">
          {getDueBadge({
            dueAmount: due,
            symbol: demographiInfo?.currency_symbol || "",
          })}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Actions" className="opacity-0" />,
      dataIndex: "action",
      key: "action",
      width: 150,
      render: (_: any, row: Membership) => (
        <div className="flex items-center justify-end gap-3  pr-3">
          {row.member_name && row.member_phone ? (
            <div className="flex items-center justify-end gap-3">
              <Link href={`tel:${row.member_phone}`}>
                <PhoneIcon
                  size={20}
                  className="text-gray-700  hover:text-primary hover:scale-110 duration-150"
                />
              </Link>
              {/* <Link href={`https://wa.me/${row.member_phone}?text=Hi ${row.member_name}`} target='_blank'>
              <PiWhatsappLogoBold size={24} className="text-gray-700 dark:text-gray-400  hover:text-primary-dark hover:scale-110 duration-150" />
            </Link> */}
              <WaModal id={row.member_id} number={row.member_phone} />
            </div>
          ) : null}
          {!auth && !access ? (
            <Tooltip content="Payment Update">
              <Button
                onClick={() => {
                  toast.error("You aren't allowed to make changes");
                }}
                size="sm"
              >
                Pay
              </Button>
            </Tooltip>
          ) : (
            <Payment
              member={row}
              getdueData={getdueData}
              checkValidity={checkValidity}
            />
          )}

          {row.due_date &&
            (!auth && !access ? (
              <Tooltip content="Extend Due Date" placement="bottom">
                <Button
                  size="sm"
                  onClick={() => {
                    toast.error("You aren't allowed to make changes");
                  }}
                  className="flex flex-row gap-2 items-center justify-start font-medium "
                >
                  <MdOutlineDateRange size={20} />
                  <Text>Extend</Text>
                </Button>
              </Tooltip>
            ) : (
              <ExtendModal
                membershipId={row.membership_id}
                due_date={row.due_date}
                onUpdate={extendRefresh}
                isDue={false}
              />
            ))}
        </div>
      ),
    },
  ];
};
