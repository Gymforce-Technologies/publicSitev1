"use client";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import MetricCard from "@core/components/cards/metric-card";
import WidgetCard from "@core/components/cards/widget-card";
import { useEffect, useState } from "react";
import { MdPendingActions } from "react-icons/md";
import { PiMoneyBold } from "react-icons/pi";
import { Loader, Text, Title } from "rizzui";

interface EarningsData {
  total_earned: number;
  pending_sessions: { count: number };
  category_breakdown: Array<{
    incentive_type: string;
    total: number;
  }>;
}

export default function EarningsSection({
  params,
}: {
  params: { id: string };
}) {
  const newId = (params.id as string).split("-")[1];
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const colorGenerator = (index: number) => {
    return `hsl(${(index * 50) % 360}, 70%, 60%)`;
  };
  const [demographic, setDemographic] = useState<DemographicInfo | null>(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const gymId = await retrieveGymId();
        const resp = await AxiosPrivate.get(
          `/api/staff/${newId}/earnings/?gym_id=${gymId}`,
          {
            id: newID(`staff-earnings-${newId}`),
          }
        );
        setEarningsData(resp.data);
      } catch (error) {
        console.error("Failed to fetch earnings", error);
      }
    };
    fetchEarnings();
  }, [newId]);

  useEffect(() => {
    const getPreq = async () => {
      const demoInfo = await getDemographicInfo();
      setDemographic(demoInfo);
    };
    getPreq();
  }, []);

  return (
    <WidgetCard
      title="Earnings"
      titleClassName="leading-none"
      headerClassName="mb-3 lg:mb-4"
      className="max-w-2xl"
    >
      {earningsData ? (
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-2 ms:gap-4 justify-around pb-4 *:text-nowrap">
            <MetricCard
              title={"Total Earned"}
              metric={
                (demographic?.currency_symbol || "") + earningsData.total_earned
              }
              icon={<PiMoneyBold size={28} className="text-primary" />}
              className="!p-1.5 sm:!p-3 border-none hover:scale-105 duration-150"
              iconClassName="bg-transparent size-8"
            />
            <MetricCard
              title={"Pending Sessions"}
              metric={earningsData.pending_sessions.count}
              icon={<MdPendingActions size={28} className="text-primary" />}
              className="!p-1.5 sm:!p-3 border-none hover:scale-105 duration-150"
              iconClassName="bg-transparent size-8"
              titleClassName="text-nowrap truncate"
            />
          </div>

          <div className="flex flex-col min-w-full mx-8">
            {earningsData.category_breakdown.map((item, index) => (
              <div
                key={index}
                className="mb-2 max-w-80 flex gap-6 items-center justify-between border-b border-muted pb-4 last:mb-0 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-start">
                  <span
                    className="me-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: colorGenerator(index) }}
                  />
                  <Title as="h5" className="text-sm font-medium capitalize">
                    {item.incentive_type.split("_").join(" ")}
                  </Title>
                </div>
                <Text as="span" className="font-medium">
                  {demographic?.currency_symbol || ""}
                  {item.total.toLocaleString()}
                </Text>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center my-4">
          <Loader variant="spinner" size="xl" />
        </div>
      )}
    </WidgetCard>
  );
}
