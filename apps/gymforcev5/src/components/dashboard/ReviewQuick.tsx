"use client";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import WidgetCard from "@core/components/cards/widget-card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowRight, FaStar } from "react-icons/fa6";
import { Badge, Empty, Loader, Text, Title } from "rizzui";

export default function ReviewQuick() {
  const [feedback, setFeedback] = useState<any[]>([]);

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

  return (
    <WidgetCard
      title="Feedback's"
      titleClassName="text-gray-900 "
      headerClassName="items-center"
      className=""
      action={
        <Link
          href={"/feedback"}
          className={feedback.length > 0 ? "" : "hidden"}
        >
          <div className="flex flex-row gap-1.5 items-center hover:text-primary group">
            <Text>View All</Text>
            <FaArrowRight className="group-hover:animate-pulse" />
          </div>
        </Link>
      }
    >
      {loading ? (
        <div className="w-full flex my-8 items-center justify-center">
          <Loader variant="spinner" />
        </div>
      ) : (
        <div>
          {feedback.length > 0 ? (
            <div className="grid grid-cols-1 mt-4 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar overflow-x-hidden">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className="p-2 px-4 border-b rounded-lg space-y-1 hover:scale-95 transition-transform t"
                >
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center flex-row gap-4">
                      <Title as="h6" className="font-medium">
                        {item.name}
                      </Title>
                      <div>
                        {item.feedback_type === "Member" ? (
                          <Badge color="secondary" variant="flat">
                            Member
                          </Badge>
                        ) : item.feedback_type === "Enquiry" ? (
                          <Badge color="success" variant="flat">
                            Enquiry
                          </Badge>
                        ) : (
                          <Badge color="secondary" variant="flat">
                            Staff
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      color={
                        item.rating >= 4
                          ? "success"
                          : item.rating >= 3
                            ? "warning"
                            : "danger"
                      }
                      className="py-1 px-2"
                    >
                      <div className="flex flex-row gap-1.5 items-center">
                        <FaStar className="text-yellow-500" />
                        {item.rating}
                      </div>
                    </Badge>
                  </div>
                  <div className="max-h-[40px] text-clip">{item.comment}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full flex my-8 items-center justify-center">
              <Empty text="No Reviews ..." />
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
