"use client";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
// import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
// import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { FaClock, FaUser } from "react-icons/fa6";
import { RiMessage3Fill } from "react-icons/ri";
// import { IoMdCheckmarkCircle, IoMdTime } from "react-icons/io";
// import { RiMessage3Fill  } from "react-icons/tb";

import { Badge, Loader, Text, Title } from "rizzui";
interface TicketData {
  id: string;
  createdTime: string;
  resolvedTime: string | null;
  type: string;
  heading: string;
  description: string;
  status: string;
  createdBy: string;
}
const ViewTicket = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const date = new Date().toISOString().split("T")[0];
  const fetchTicketData = async () => {
    try {
      setLoading(true);
      const gymId = await retrieveGymId();
      const response: any = await AxiosPrivate.get(
        `api/issues/${id}/?gym_id=${gymId}`,
        {
          id: newID(`ticket-${id}`),
        }
      );
      console.log(response.data);
      const data = response.data;
      setTicketData({
        id: `Request ${data.unique_id.split("-")[0]}/${id}`,
        type: data.type,
        heading: data.heading,
        description: data.description,
        status: data.status,
        createdTime: data.time_fields[0].split("T")[0],
        resolvedTime: data.time_fields[1]
          ? data.time_fields[1].split("T")[0]
          : null,

        createdBy: `Ticket Raised By ${data?.added_by_info?.user_type}`,
      });
    } catch (error) {
      console.error("Error submitting ticket", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTicketData();
  }, []);
  return (
    <div className="">
      <Title as="h3" className="">
        TimeLine
      </Title>
      {loading ? (
        <div className="w-full flex justify-center">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : (
        <div className="space-y-6  p-6 pl-10 mt-4">
          <div className="flex items-start flex-col border-l-2 border-black  relative pt-2 w-full">
            <div className="flex items-start flex-col relative pt-2 w-full">
              <div className="absolute  -top-6 -left-10 flex gap-3">
                <Badge className="bg-primary  ">
                  {ticketData?.createdTime}
                </Badge>
                <Badge variant="flat">{ticketData?.id}</Badge>
              </div>

              <div className="w-full">
                <div className="flex flex-col items-center absolute -left-4 mt-5">
                  <div className="rounded-full bg-primary text-white p-2 shadow-lg">
                    <FaUser />
                  </div>
                </div>

                {/* Step Content */}
                <div className="ml-6 w-full  rounded-lg mt-6 ">
                  <div className="p-4 mt-2 shadow-lg w-full border-gray- flex justify-between">
                    <Text className="text-gray-600  mt-1 font-semibold">
                      {ticketData?.createdBy}
                    </Text>
                  </div>
                </div>
              </div>
              <div className="pb-4 w-full">
                <div className="flex flex-col items-center absolute -left-4 mt-5">
                  <div className="rounded-full bg-blue-400 text-white p-2 shadow-lg">
                    <RiMessage3Fill />
                  </div>
                </div>

                <div className="ml-6 w-full pb-8 mt-6 ">
                  <div className="p-4 mt-2 shadow-lg w-full  rounded-lg">
                    <Text className="text-gray-600  mt- font-semibold">
                      {ticketData?.heading}
                    </Text>

                    <div className="mt-2 border-t-gray-800 flex flex-col gap-3">
                      {ticketData?.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {!ticketData?.resolvedTime ? (
              <>
                <div className="flex items-start flex-col relative pt-2 w-full">
                  <div className="absolute  -top-6 -left-10 flex gap-3">
                    <Badge className="bg-primary  ">{date}</Badge>
                    <Badge variant="outline">{ticketData?.status}</Badge>
                  </div>
                  <div className="pb-4 w-full">
                    <div className="flex flex-col items-center absolute -left-4 mt-5">
                      <div className="rounded-full bg-blue-400 text-white p-2 shadow-lg">
                        <RiMessage3Fill />
                      </div>
                    </div>

                    <div className="ml-6 w-full pb-8 mt-6">
                      <div className="p-4 mt-2 shadow-lg w-full  rounded-lg">
                        <Text className="text-gray-600 mt-1 font-semibold ">
                          Support Team
                        </Text>

                        <div className="mt-2 border-t-gray-800 flex flex-col gap-3">
                          <Text>
                            Your request is being processed. Our team will get
                            back to you shortly
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex flex-col items-center absolute -bottom-6 -left-4 mt-5">
                    <div className="rounded-full bg-primary text-white p-2 shadow-lg">
                      <FaClock />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start flex-col relative pt-2 w-full">
                  <div className="absolute  -top-6 -left-11 flex gap-3">
                    <Badge className="bg-primary  ">
                      {ticketData?.resolvedTime}
                    </Badge>
                    <Badge variant="outline">{ticketData?.status}</Badge>
                  </div>
                  <div className="pb-4 w-full">
                    <div className="flex flex-col items-center absolute -left-4 mt-5">
                      <div className="rounded-full bg-blue-400 text-white p-2 shadow-lg">
                        <RiMessage3Fill />
                      </div>
                    </div>

                    <div className="ml-6 w-full pb-8 mt-6">
                      <div className="p-4 mt-2 shadow-lg w-full  rounded-lg">
                        {/* <h3 className="font-semibold text-gray-700">{step.title}</h3> */}
                        <Text className="text-gray-600 mt-1 font-semibold ">
                          Support Team
                        </Text>

                        <div className="mt-2 border-t-gray-800 flex flex-col gap-3">
                          <Text>
                            Your ticket has been solved. Thank you for your
                            patience.
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex flex-col items-center absolute -bottom-6 -left-11 mt-5">
                    <div className="rounded-full bg-primary text-white p-2 shadow-lg">
                      <Text className="font-semibold">Completed</Text>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTicket;
