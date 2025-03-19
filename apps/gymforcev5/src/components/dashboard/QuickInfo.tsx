"use client";

import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import cn from "@core/utils/class-names";
import { IconType } from "react-icons/lib";
import {
  PiUser,
  PiCurrencyCircleDollar,
  PiCalendarCheck,
  PiUsersThree,
  PiClockCounterClockwise,
  PiArrowCounterClockwise,
  PiArrowUpRightBold,
  PiArrowDownRightBold,
  PiChartLineUp,
  PiWallet,
  PiCheckCircleBold,
  PiUserCircleGearBold,
  PiUserCheck,
  PiUserMinus,
} from "react-icons/pi";
import SimpleBar from "simplebar-react";
import { Loader, Text, Title } from "rizzui";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { GymStatsType } from "@/components/dashboard/DashboardSection";
import { FaArrowRight } from "react-icons/fa6";
import Link from "next/link";
// import { RiShareForwardFill } from "react-icons/ri";
// Types
type QuickInfoType = {
  className?: string;
  gymStats: GymStatsType;
  isLoading: boolean;
  hideValues: boolean;
  currentFilter: string;
  permissions: any;
  isStaff: boolean;
};

export type GymStatCardType = {
  icon: IconType;
  title: string;
  amount: number | string | null;
  increased: boolean;
  percentage: number | null;
  iconWrapperFill?: string;
  className?: string;
  link: string;
  permission: {
    name: string;
    access: string;
  };
};

export type StatCardProps = {
  className?: string;
  stat: GymStatCardType;
  filter: string;
  isLoading: boolean;
  hideValues: boolean;
  link: string;
};

function StatCard({
  className,
  stat,
  filter,
  isLoading,
  hideValues,
  link,
}: StatCardProps) {
  const { icon: Icon, title, amount, increased, percentage } = stat;
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Check sessionStorage for animation status
    const hasBeenAnimated =
      sessionStorage.getItem("statCardAnimated") === "true";

    if (hasBeenAnimated) {
      setHasAnimated(true);
    }
  }, []);
  useEffect(() => {
    const FetchDemograpicInfo = async () => {
      try {
        const geoinfo = await getDemographicInfo();
        setDemographicInfo(geoinfo);
        // console.log("info", geoinfo);
      } catch (error) {
        console.log(error);
      }
    };
    FetchDemograpicInfo();
  }, []);

  useEffect(() => {
    // Set sessionStorage if animation should be marked as completed
    if (hasAnimated) {
      sessionStorage.setItem("statCardAnimated", "true");
    }
  }, [hasAnimated]);

  const getFilter = () => {
    switch (filter) {
      case "daily":
        return "Day";
      case "weekly":
        return "Week";
      case "monthly":
        return "Month";
      case "yearly":
        return "Year";
      default:
        return "";
    }
  };

  return (
    <div
      className={cn(
        `w-full rounded-lg border border-gray-400 text-gray-700 group scale-95 ${stat.link ? " hover:scale-100  cursor-pointer" : ""}  relative transition-colors duration-200`,
        className
      )}
    >
      {stat.link ? (
        <Link href={stat.link}>
          <div className="p-2 md:p-4">
            <div className="mb-1 xs:mb-2 sm:mb-4 flex items-start gap-1.5 xs:gap-3 md:gap-5">
              <span className="flex rounded-lg transition-colors duration-200 bg-primary p-1.5 sm:p-2 mt-1">
                <Icon
                  className="h-auto w-5 xs:w-6 text-white"
                  strokeWidth={4}
                />
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Text className=" text-[13px] xs:text-sm font-medium truncate max-w-[30vw] xs:max-w-36 xl:max-w-40">
                    {title}
                  </Text>
                  <FaArrowRight className="opacity-0 group-hover:opacity-100 text-primary font-bold size-4 group-hover:animate-pulse" />
                </div>
                <Title
                  as="h4"
                  className="text-base max-sm:mx-4 md:text-xl font-medium sm:font-semibold text-gray-900"
                >
                  {hideValues ? (
                    <Text className="text-gray-400">*** </Text>
                  ) : amount !== null || !isLoading ? (
                    typeof amount === "number" ? (
                      <CountUp
                        end={amount}
                        duration={5}
                        start={hasAnimated ? amount : 0}
                        onEnd={() => setHasAnimated(true)}
                      />
                    ) : demographiInfo ? (
                      demographiInfo?.currency_symbol +
                      " " +
                      new Intl.NumberFormat().format(parseInt(amount ?? "0"))
                    ) : (
                      new Intl.NumberFormat().format(parseInt(amount ?? "0"))
                    )
                  ) : (
                    <Loader />
                  )}
                </Title>
              </div>
              {/* <div className="space-y-2">
      <p className="font-medium transition-colors duration-200">{title}</p>

      <p className="text-[22px] font-bold 2xl:text-[20px] 3xl:text-3xl transition-colors duration-200"></p>
    </div> */}
            </div>
            {percentage !== null && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 transition-colors duration-200">
                  <span className="flex rounded-full transition-colors duration-200">
                    {increased ? (
                      <PiArrowUpRightBold className="h-auto w-4 text-green-400" />
                    ) : (
                      <PiArrowDownRightBold className="h-auto w-4 text-red-400" />
                    )}
                  </span>
                  <span
                    className={`font-medium max-sm:text-xs sm:font-semibold leading-none ${increased ? "text-green-400" : "text-red-400"}`}
                  >
                    {increased ? "+" : ""}
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <span className="max-sm:hidden truncate leading-none transition-colors duration-200">
                  {increased ? "Increased" : "Decreased"}
                  {getFilter() === "Week" || getFilter() === "Day"
                    ? ` last ${getFilter()}`
                    : ""}
                </span>
              </div>
            )}
          </div>
        </Link>
      ) : (
        <div className="p-2 md:p-4">
          <div className="mb-1 xs:mb-2 sm:mb-4 flex items-start gap-1.5 xs:gap-3 md:gap-5">
            <span className="flex rounded-lg transition-colors duration-200 bg-primary p-1.5 sm:p-2 mt-1">
              <Icon className="h-auto w-5 xs:w-6 text-white" strokeWidth={4} />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Text className=" text-[13px] xs:text-sm font-medium truncate max-w-[30vw] xs:max-w-36 xl:max-w-40">
                  {title}
                </Text>
              </div>
              <Title
                as="h4"
                className="text-base max-sm:mx-4 md:text-xl font-medium sm:font-semibold text-gray-900"
              >
                {hideValues ? (
                  <Text className="text-gray-400">*** </Text>
                ) : amount !== null || !isLoading ? (
                  typeof amount === "number" ? (
                    <CountUp
                      end={amount}
                      duration={5}
                      start={hasAnimated ? amount : 0}
                      onEnd={() => setHasAnimated(true)}
                    />
                  ) : demographiInfo ? (
                    demographiInfo?.currency_symbol +
                    " " +
                    new Intl.NumberFormat().format(parseInt(amount ?? "0"))
                  ) : (
                    new Intl.NumberFormat().format(parseInt(amount ?? "0"))
                  )
                ) : (
                  <Loader />
                )}
              </Title>
            </div>
            {/* <div className="space-y-2">
      <p className="font-medium transition-colors duration-200">{title}</p>

      <p className="text-[22px] font-bold 2xl:text-[20px] 3xl:text-3xl transition-colors duration-200"></p>
    </div> */}
          </div>
          {percentage !== null && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 transition-colors duration-200">
                <span className="flex rounded-full transition-colors duration-200">
                  {increased ? (
                    <PiArrowUpRightBold className="h-auto w-4 text-green-400" />
                  ) : (
                    <PiArrowDownRightBold className="h-auto w-4 text-red-400" />
                  )}
                </span>
                <span
                  className={`font-medium max-sm:text-xs sm:font-semibold leading-none ${increased ? "text-green-400" : "text-red-400"}`}
                >
                  {increased ? "+" : ""}
                  {percentage.toFixed(0)}%
                </span>
              </div>
              <span className="max-sm:hidden truncate leading-none transition-colors duration-200">
                {increased ? "Increased" : "Decreased"}
                {getFilter() === "Week" || getFilter() === "Day"
                  ? ` last ${getFilter()}`
                  : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// QuickInfo Component
export default function QuickInfo({
  className,
  gymStats,
  isLoading,
  hideValues,
  currentFilter,
  permissions,
  isStaff,
}: QuickInfoType) {
  const gymStatCards: GymStatCardType[] = [
    {
      title: "Active Memberships",
      amount: gymStats.active_memberships.value,
      increased: gymStats.active_memberships.percentage_change
        ? gymStats.active_memberships.percentage_change > 0
        : false,
      percentage: gymStats.active_memberships.percentage_change,
      icon: PiUser,
      link: `membership/list?status=active&filter=${currentFilter}`,
      permission: {
        name: "dashActiveMemberships",
        // access: permissions["dashActiveMemberships"] ?? "no_access",
        access:
          permissions !== null
            ? permissions["dashActiveMemberships"]
            : "no_access",
      },
    },
    {
      title: "Pending Balance",
      // amount: gymStats.pending_balance.value,
      amount: gymStats.pending_balance.value
        ? gymStats.pending_balance.value.toString()
        : gymStats.pending_balance.value,
      increased: gymStats.pending_balance.percentage_change
        ? gymStats.pending_balance.percentage_change > 0
        : false,
      percentage: gymStats.pending_balance.percentage_change,
      icon: PiCurrencyCircleDollar,
      link: `membership/due-list?filter=${currentFilter}`,
      permission: {
        name: "dashPendingBalance",
        // access: "no_access",
        // access: permissions["dashPendingBalance"] ?? "no_access",
        access:
          permissions !== null
            ? permissions["dashPendingBalance"]
            : "no_access",
      },
    },
    {
      title: "Total Collection",
      // amount: gymStats.total_collection.value,
      amount: gymStats.total_collection.value
        ? gymStats.total_collection.value.toString()
        : gymStats.total_collection.value,
      increased: gymStats.total_collection.percentage_change
        ? gymStats.total_collection.percentage_change > 0
        : false,
      percentage: gymStats.total_collection.percentage_change,
      icon: PiCalendarCheck,
      link: `finance/allinvoices?filter=${currentFilter}`,
      permission: {
        name: "dashTotalCollection",
        // access: permissions["dashTotalCollection"] ?? "no_access",
        access:
          permissions !== null
            ? permissions["dashTotalCollection"]
            : "no_access",
      },
    },
    {
      title: "Members Present Daily",
      amount: gymStats.member_present.value,
      increased: gymStats.member_present.percentage_change
        ? gymStats.member_present.percentage_change > 0
        : false,
      percentage: gymStats.member_present.percentage_change,
      icon: PiUsersThree,
      link: `attendance/?filter=${currentFilter}&status=active`,
      permission: {
        name: "dashMmeberPresentDaily",
        // access: permissions["dashMmeberPresentDaily"] ?? "no_access",
        access:
          permissions !== null
            ? permissions["dashMmeberPresentDaily"]
            : "no_access",
      },
    },
    {
      title: "Membership Expiries",
      amount: gymStats.plan_expiries.value,
      increased: gymStats.plan_expiries.percentage_change
        ? gymStats.plan_expiries.percentage_change > 0
        : false,
      percentage: gymStats.plan_expiries.percentage_change,
      icon: PiClockCounterClockwise,
      link: `membership/upcomming-expiry?filter=${currentFilter}`,
      permission: {
        name: "dashMembershipExpiries",
        // access: permissions["dashMembershipExpiries"] ?? "no_access",
        access:
          permissions !== null
            ? permissions["dashMembershipExpiries"]
            : "no_access",
      },
    },
    {
      title: "Active Members",
      amount: gymStats.active_members.value,
      increased: gymStats.active_members.percentage_change
        ? gymStats.active_members.percentage_change > 0
        : false,
      percentage: gymStats.active_members.percentage_change,
      icon: PiUserCheck,
      link: `members/?status=active&filter=${currentFilter}`,
      permission: {
        name: "dashActiveMembers",
        // access: permissions["dashActiveMembers"] ?? "no_access",
        access:
          permissions !== null ? permissions["dashActiveMembers"] : "no_access",
      },
    },
    {
      title: "InActive Members",
      amount: gymStats.inactive_members.value,
      increased: gymStats.inactive_members.percentage_change
        ? gymStats.inactive_members.percentage_change > 0
        : false,
      percentage: gymStats.inactive_members.percentage_change,
      icon: PiUserMinus,
      link: `membership/expired/?filter=${currentFilter}`,
      permission: {
        name: "dashInactiveMembers",
        // access: permissions["dashInactiveMembers"] ?? "no_access",
        access:
          permissions !== null
            ? permissions["dashInactiveMembers"]
            : "no_access",
      },
    },
    {
      title: "Total Expenses",
      // amount: gymStats.total_expenses.value,
      amount: gymStats.total_expenses.value
        ? gymStats.total_expenses.value.toString()
        : gymStats.total_expenses.value,
      increased: gymStats.total_expenses.percentage_change
        ? gymStats.total_expenses.percentage_change > 0
        : false,
      percentage: gymStats.total_expenses.percentage_change,
      icon: PiWallet,
      link: `expenses/?filter=${currentFilter}`,
      permission: {
        name: "dashTotalExpense",
        // access: permissions["dashTotalExpense"] ?? "no_access",
        access:
          permissions !== null ? permissions["dashTotalExpense"] : "no_access",
      },
    },
    {
      title: "Membership Renewed",
      amount: gymStats.renewals.value,
      increased: gymStats.renewals.percentage_change
        ? gymStats.renewals.percentage_change > 0
        : false,
      percentage: gymStats.renewals.percentage_change,
      icon: PiArrowCounterClockwise,
      // link: `membership/?filter=${currentFilter}&status=renewal`,
      link: `membership/list?status=renewed&filter=${currentFilter}`,
      permission: {
        name: "dashMembershipRenewals",
        // access: permissions["dashMembershipRenewals"] ?? "no_access",
        access:
          permissions !== null
            ? permissions["dashMembershipRenewals"]
            : "no_access",
      },
    },
    {
      title: "Profit/Loss",
      amount: gymStats.profit_or_loss.value
        ? gymStats.profit_or_loss.value.toString()
        : gymStats.profit_or_loss.value,
      increased: gymStats.profit_or_loss.percentage_change
        ? gymStats.profit_or_loss.percentage_change > 0
        : false,
      percentage: gymStats.profit_or_loss.percentage_change,
      icon: PiChartLineUp,
      link: "",
      permission: {
        name: "dashProfitAndLoss",
        // access: permissions["dashProfitAndLoss"] ?? "no_access",
        access:
          permissions !== null ? permissions["dashProfitAndLoss"] : "no_access",
      },
    },
    {
      title: "Total Enquiry's",
      amount: gymStats.new_enquiries.value,
      increased: gymStats.new_enquiries.percentage_change
        ? gymStats.new_enquiries.percentage_change > 0
        : false,
      percentage: gymStats.new_enquiries.percentage_change,
      icon: PiUserCircleGearBold,
      link: `leads/?filter=${currentFilter}`,
      permission: {
        name: "dashTotalEnquiries",
        // access: permissions["dashTotalEnquiries"] ?? "no_access",
        access:
          permissions !== null
            ? permissions["dashTotalEnquiries"]
            : "no_access",
      },
    },
    {
      title: "Enquiry's Converted",
      amount: gymStats.converted_enquiries.value,
      increased: gymStats.converted_enquiries.percentage_change
        ? gymStats.converted_enquiries.percentage_change > 0
        : false,
      percentage: gymStats.converted_enquiries.percentage_change,
      icon: PiCheckCircleBold,
      link: `leads/?filter=${currentFilter}&status=converted`,
      permission: {
        name: "dashEquiryConverted",
        access:
          permissions !== null
            ? permissions["dashEquiryConverted"]
            : "no_access",
      },
    },
  ];

  return (
    <div className={className}>
      <SimpleBar className="">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {gymStatCards.map((stat, index) => (
            <StatCard
              key={`stat-card-${index}`}
              stat={stat}
              filter={gymStats.filter_type}
              className={
                isStaff && stat?.permission?.access === "no_access"
                  ? "hidden"
                  : "w-full"
              }
              isLoading={isLoading}
              hideValues={hideValues}
              link={stat.link}
            />
          ))}
        </div>
      </SimpleBar>
    </div>
  );
}
