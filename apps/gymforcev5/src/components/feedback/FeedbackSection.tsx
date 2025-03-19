"use client";
import WidgetCard from "@core/components/cards/widget-card";
import { useCallback, useEffect, useMemo, useState } from "react";
import Table from "@/components/rizzui/table/table";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { Badge, Loader, Text } from "rizzui";
import { HeaderCell } from "@/components/table";
import { formateDateValue } from "@/app/[locale]/auth/DateFormat";
import { MdStar } from "react-icons/md";

export default function FeedbackSection() {
  const [feedback, setFeedback] = useState([]);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const gymId = await retrieveGymId();
        const resp = await AxiosPrivate.get(
          `/api/list-feedbacks/v2/?gym_id=${gymId}`,
          {
            id: newID("feedback-list"),
          }
        );
        setFeedback(resp.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    fetchFeedback();
  }, []);

  const getColumns = useCallback(
    () => [
      {
        title: (
          <HeaderCell title="S.No" className="text-sm font-semibold mx-auto" />
        ),
        dataIndex: "id",
        key: "id",
        width: 100,
        render: (index: number) => (
          <Text className="pl-2 font-semibold">{index}</Text>
        ),
      },
      {
        title: <HeaderCell title="Name" className="text-sm font-semibold" />,
        dataIndex: "name",
        key: "name",
        width: 200,
        render: (name: string, row: any) => (
          <div>
            <Text className="text-sm font-semibold capitalize text-clip">
              {name}
            </Text>
            <Text className="text-sm">
              {row.phone.startsWith("+") ? row.phone : `+${row.phone}`}
            </Text>
          </div>
        ),
      },
      {
        title: <HeaderCell title="Date" className="text-sm font-semibold" />,
        dataIndex: "created_at",
        key: "created_at",
        width: 120,
        render: (date: string) => (
          <Text className="text-sm">{formateDateValue(new Date(date))}</Text>
        ),
      },
      {
        title: <HeaderCell title="Type" className="text-sm font-semibold" />,
        dataIndex: "feedback_type",
        key: "feedback_type",
        width: 120,
        render: (type: string) =>
          type === "Member" ? (
            <Badge color="secondary" variant="flat">
              Member
            </Badge>
          ) : type === "Enquiry" ? (
            <Badge color="success" variant="flat">
              Enquiry
            </Badge>
          ) : (
            <Badge color="secondary" variant="flat">
              Staff
            </Badge>
          ),
      },
      {
        title: <HeaderCell title="Rating" className="text-sm font-semibold" />,
        dataIndex: "rating",
        key: "rating",
        width: 150,
        render: (rating: number) => (
          <div className="flex gap-1">
            {[...Array(5)].map((_, index) => (
              <MdStar
                key={index}
                size={16}
                className={
                  index >= rating
                    ? "text-gray-200"
                    : rating >= 4
                      ? "text-yellow-400"
                      : rating >= 3
                        ? "text-orange-400"
                        : "text-red-400"
                }
              />
            ))}
          </div>
        ),
      },
      {
        title: <HeaderCell title="Comment" className="text-sm font-semibold" />,
        dataIndex: "comment",
        key: "comment",
        width: 300,
        render: (comment: string) => <Text className="text-sm">{comment}</Text>,
      },
    ],
    []
  );

  const columns = useMemo(() => getColumns(), [getColumns]);
  return (
    <WidgetCard
      className="relative dark:bg-inherit "
      headerClassName="items-start flex-row items-center @[57rem]:flex-row @[57rem]:items-center"
      actionClassName="grow @[57rem]:ps-11 ps-0 items-center w-full @[42rem]:w-full @[57rem]:w-auto"
      title="Feedback"
      titleClassName="whitespace-nowrap "
    >
      {loading ? (
        <div className="grid h-32 flex-grow place-content-center items-center">
          <Loader size="xl" variant="spinner" />:
        </div>
      ) : (
        <Table
          variant="minimal"
          data={feedback}
          // @ts-ignore
          columns={columns}
          scroll={{ y: 500 }}
          className="text-sm mt-4 text-nowrap md:mt-6 rounded-sm [&_.rc-table-row:hover]:bg-gray-100 "
          // rowClassName="!dark:bg-inherit "
        />
      )}
    </WidgetCard>
  );
}
