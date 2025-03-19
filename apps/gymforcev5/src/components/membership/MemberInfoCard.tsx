"use client";

// import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Title, Text } from "rizzui";
import cn from "@core/utils/class-names";
import Image from "next/image";
import DateCell from "@core/ui/date-cell";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
// import { DemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
// import { useState } from "react";
// import HourGlassIcon from '@components/icons/hour-glass';
// import WeighingScale from '@components/icons/weighing-scale';

type Value = {
  name: string;
  value: string;
  color: string;
};
export default function MemberInfo({
  className,
  data,
  member_name,
  member_image,
  symbol,
}: {
  className?: string;
  data: Value[];
  member_name: string;
  member_image?: string;
  symbol?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 border-0 p-0 ", className)}>
      <div className="grid items-start rounded-lg border border-muted p-4 lg:px-6  grid-cols-[40%,60%] my-2">
        <Title as="h3" className="col-span-full mb-2 text-base font-semibold">
          Membership Changes
        </Title>
        <div className=" w-full flex flex-col items-center justify-center gap-1 h-full">
          {/* <div className="mx-auto h-24 w-24"> */}
          {/* <Avatar name={member_name} size="xl" src={member_image} /> */}
          {/* </div> */}
          <Image
            alt={member_name}
            src={
              member_image ||
              "https://images.gymforce.in/man-user-circle-icon.png"
            }
            width={96}
            height={96}
            className="rounded-full object-cover size-24"
          />
          <p className="mt-4 text-center font-semibold text-gray-800">
            {member_name}
          </p>
        </div>
        <div className="">
          {data.map((item, index) => (
            <div
              key={index}
              className="mb-2 flex max-md:flex-col md:items-center justify-between  pb-1 last:mb-0 "
            >
              <div className="flex items-center justify-start">
                <span
                  className="me-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <Title
                  as="h6"
                  className=" text-sm font-normal text-nowrap text-start"
                >
                  {item.name}
                </Title>
              </div>
              <span className="text-center my-0.5">
                {item.name.includes("Date") ? (
                  <DateCell
                    date={new Date(item.value)}
                    timeClassName="hidden"
                    dateFormat={getDateFormat()}
                  />
                ) : (
                  <Text as="span">
                    {(index === 0 || index === 1) && symbol ? symbol : ""}{" "}
                    {item.value}
                  </Text>
                )}
              </span>
            </div>
          ))}
          {/* <div className="mb-4 flex items-center justify-between border-b border-muted pb-4 last:mb-0 last:border-0 last:pb-0">
            <div className="flex items-center justify-start">
              <span
                className="me-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: 'red' }}
              />
              <Title as="h5" className=" text-sm font-medium">
                Total Fleet:
              </Title>
            </div>
            <Text as="span">73</Text>
          </div> */}
        </div>
      </div>
    </div>
  );
}
