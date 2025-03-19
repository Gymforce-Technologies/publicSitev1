"use client";
import WidgetCard from "@/components/cards/widget-card";
import BillingSettingsView from "../centersettings/billing-settings";
import { FaCalendar, FaCalendarCheck } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { AxiosPrivate } from "@/app/[locale]/auth/AxiosPrivate";
import MetricCard from "@core/components/cards/metric-card";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { Button } from "rizzui";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";

interface MetricItem {
  title: string;
  metric: number | string;
  icon: React.ReactNode;
}
export default function PlanSubSection() {
  const [metricData, setMetricData] = useState<MetricItem[]>([
    {
      title: "Valid Days",
      metric: 0,
      icon: <FaCalendarCheck size={20} />,
    },
    {
      title: "Subscription Ends on",
      metric: 0,
      icon: <FaCalendar size={20} />,
    },
  ]);
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  useEffect(() => {
    const getData = async () => {
      try {
        const profileData = await AxiosPrivate.get("/api/profile");
        console.log(profileData.data);
        setMetricData((prev) => [
          {
            ...prev[0],
            metric: profileData.data?.subscription_valid_days || 0,
          },
          {
            ...prev[1],
            metric: new Date(
              profileData.data?.subscription_end_date?.split("T")[0]
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          },
        ]);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    getData();
  }, []);
  return (
    <div className="space-y-6">
      <div className="relative flex w-full items-center overflow-hidden">
        <Button
          title="Prev"
          variant="text"
          ref={sliderPrevBtn}
          onClick={() => scrollToTheLeft()}
          className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretLeftBold className="h-5 w-5" />
        </Button>
        <div
          className="max-xl:flex items-center p-2 gap-4 xl:grid grid-cols-5 custom-scrollbar-x overflow-x-auto scroll-smooth pr-4 lg:pr-8"
          ref={sliderEl}
        >
          {metricData.map((metric, index) => (
            <div key={index} className={"relative group pointer-events-none"}>
              <MetricCard
                title={metric.title}
                metric={metric.metric}
                className={`relative shadow border-none dark:border-solid transform transition-transform duration-200 ease-in-out delay-50 hover:bg-primary-lighter peer-hover:bg-primary-lighter hover:scale-105 peer-hover:scale-105 cursor-pointer !p-2 md:!p-4`}
                iconClassName={`text-primary bg-primary-lighter duration-200 transition-all text-white bg-primary group-hover:text-white group-hover:bg-primary peer-hover:text-white peer-hover:bg-primary`}
                titleClassName={`text-nowrap max-lg:text-xs font-medium max-lg:max-w-[110px] truncate`}
                icon={metric.icon}
                metricClassName="text-primary text-sm text-start pl-2 "
              />
            </div>
          ))}
        </div>
        <Button
          title="Next"
          variant="text"
          ref={sliderNextBtn}
          onClick={() => scrollToTheRight()}
          className="!absolute -right-1 top-0 z-10 !h-full w-10 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 xl:hidden"
        >
          <PiCaretRightBold className="h-5 w-5" />
        </Button>
      </div>

      <WidgetCard
        className="relative "
        headerClassName="items-center"
        title="Subscription Plans"
        titleClassName="whitespace-nowrap"
      >
        <BillingSettingsView isRegister={false} type="product" />
      </WidgetCard>
    </div>
  );
}
