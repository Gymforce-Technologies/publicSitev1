import React from "react";
// import Image from 'next/image';
import { Avatar, Badge, Button, Text, Title } from "rizzui";
import { Calendar, XIcon } from "lucide-react";
import getDueBadge from "@/components/dueBadge";

interface Details {
  id: string;
  name: string;
  contact?: any;
  phone?: any;
  image: string | null;
  type: string;
}

interface Data {
  type: string;
  data: Details;
}

interface ShowFetchDetailsProps {
  profiles: Data[];
  onSelect: (profile: any) => void;
  onClose: () => void;
}

const ShowFetchDetails: React.FC<ShowFetchDetailsProps> = ({
  profiles,
  onSelect,
  onClose,
}) => {
  return (
    <div className="flex flex-col gap-y-6 p-8 rounded-lg shadow-md ">
      <div className="flex justify-between items-center">
        <Title as="h3" className="">
          Select a Profile
        </Title>
        <XIcon
          onClick={onClose}
          className="size-6 cursor-pointer hover:text-primary"
        />
      </div>
      <div className="min-h-96 h-96 overflow-x-hidden overflow-y-auto custom-scrollbar">
        {profiles?.map((item: any, index) => (
          <div
            className="group relative p-4 flex flex-col border cursor-pointer border-gray-300  mb-4 rounded-lg shadow-md transition-transform duration-500 ease-out hover:shadow-lg hover:scale-[1.02]"
            onClick={() => {
              onSelect(item);
            }}
            key={index}
          >
            {/* Member Header */}
            <div className="flex justify-between items-center">
              <div>
                {/* yk$6372h$e */}
                <figure className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0">
                    <Avatar
                      name={item.data.name}
                      src={item.data.image || "/placeholder-avatar.jpg"}
                      className="w-12 h-12"
                    />
                  </div>
                  <figcaption className="flex-1 grid gap-0.5">
                    <Text className="font-lexend text-sm font-medium text-gray-900  hover:text-primary truncate">
                      {item.data.name}
                    </Text>
                    <Text className="text-[13px] text-gray-500">
                      {item.data.phone || item.data.contact}
                    </Text>
                  </figcaption>
                </figure>
              </div>

              {item.type == "member" ? (
                <div className="flex justify-between gap-5">
                  <Badge variant="outline">
                    {item.data.membership_details?.name}
                  </Badge>
                  {item.latest_end_date &&
                  new Date(item.data.membership_details.latest_end_date) <
                    new Date() ? (
                    <Badge size="sm" color="danger" variant="outline">
                      Expired
                    </Badge>
                  ) : new Date(item.latest_end_date).getTime() -
                      new Date().getTime() <=
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
                  <div>
                    <Text className="font-lexend text-sm font-medium text-gray-900  hover:text-primary px-2">
                      {item.type}
                    </Text>
                  </div>
                </div>
              ) : (
                <div>
                  <Text className="font-lexend text-sm font-medium text-gray-900  hover:text-primary px-2">
                    {item.type}
                  </Text>
                </div>
              )}
            </div>

            {/* Hidden Section on Hover */}
            {item.type == "member" && (
              <div className="group-hover:flex hidden  flex-col gap-1  mt-3">
                {/* Membership End Date */}
                <div className="flex items-center justify-between p-3 bg-gray-50  rounded-md">
                  <Text className="text-sm text-gray-500 ">
                    Membership End Date
                  </Text>
                  <div className="flex gap-5">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <Text>
                        {
                          item?.data.membership_details
                            ?.latest_membership_end_date
                        }
                      </Text>
                    </div>
                    {/* {item.total_due==0 && (
                      
  
                        <Button variant="outline" size="sm" onClick={()=>{
                            onclose()
                            setFunc('Renew')
                            setSelectedData(item)
                        }}>
                        Renew
                        </Button>
                       
                      )} */}
                  </div>
                </div>

                {/* Due Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50  rounded-md">
                  <Text className="text-sm text-gray-500 ">Dues Status</Text>
                  <div className="flex gap-10 items-center">
                    <Text>
                      {getDueBadge({
                        dueAmount: item.data.total_due,
                        symbol: "₹",
                      })}
                    </Text>
                    {/* {item.total_due>0 && (
                      // <Button size="sm" onClick={()=>{
                      //   onclose()
                      //   setFunc('Pay')
                      //   setSelectedData(item)
                      // }}>Pay Dues</Button>
                      )} */}
                  </div>
                </div>

                {/* Invoice Date */}
                {/* <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <Text className="text-sm text-gray-500 dark:text-gray-300">
                        Invoice Date
                      </Text>
                      <div className="flex gap-2 items-center">
  
                      <div className="flex items-center ">
                        <Calendar className="h-4 w-4 mr-1" />
                        <Text>{item.data.membership_details.latest_transaction_date}</Text>
                      </div>
                      <Button variant="outline" size="sm">
                        Create Invoice
                      </Button>
                        </div>
  
                    </div> */}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="min-w-full flex items-center justify-center">
        <Button onClick={onClose} className="">
          Close
        </Button>
      </div>
    </div>
  );
};

export default ShowFetchDetails;
