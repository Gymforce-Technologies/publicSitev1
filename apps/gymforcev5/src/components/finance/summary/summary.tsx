"use client";
import React, { useEffect, useState } from "react";
import StatCards from "./stat-cards";
import { BiSolidNotepad } from "react-icons/bi";
// import { IoMdCalendar } from "react-icons/io";
import PaymentSummaryTable from "./PaymentTable";
import ExpenseSummaryTable from "./ExpenseTable";
import FilterSidebar from "./FilterSlidebar";
// import { getAccessToken } from "@/app/[locale]/auth/Acces";
// import axios from "axios";
// import { CiFilter } from "react-icons/ci";
import { Button, Text, Title } from "rizzui";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import { FilterIcon } from "lucide-react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { FaCalendar } from "react-icons/fa6";

interface Expense {
  category: string;
  id: string;
  amount: number;
  expense_date: string;
}

interface Payment {
  id: string;
  memberId: string;
  memberLocalId: string;
  memberName: string;
  payment_date: string;
  amount: number;
}

interface DataResponse {
  transactionsList: Payment[];
  expensesList: Expense[];
  totalTransactions: number;
  totalExpenses: number;
  profitOrLoss: number;
}

const SummaryLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>("today");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [summaryData, setSummaryData] = useState<DataResponse | null>(null);
  const [demographiInfo, setDemographicInfo] = useState<any>(null);
  const [headingData, setheadingData] = useState("today");
  const [loading, setLoading] = useState(false);
  const fetchSummaryData = async (
    filter?: string | null,
    startDate?: Date | null,
    endDate?: Date | null
  ) => {
    try {
      // const token = getAccessToken();
      setLoading(true);
      const gymId = await retrieveGymId();
      let url = `/api/finance/summary/?gym_id=${gymId}`;

      // Append query params if filters are provided
      if (filter === "dateRange" && startDate && endDate) {
        const formattedStartDate = startDate.toISOString().split("T")[0];
        const formattedEndDate = endDate.toISOString().split("T")[0];
        url += `&filter=date_range&from=${formattedStartDate}&to=${formattedEndDate}`;
        setheadingData(`${formattedStartDate} To ${formattedEndDate}`);
      } else if (filter) {
        url += `&filter=${filter}`;
        setheadingData(filter);
      }

      const response = await AxiosPrivate.get(url, {
        id: newID(`finance-summary-${filter}`),
      });
      const infoData = await retrieveDemographicInfo();
      console.log(infoData);
      setDemographicInfo(infoData);
      setSummaryData(response.data.results.data);
      console.log(response.data.results.data);
    } catch (error) {
      console.log("Error fetching summary data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleShowResults = () => {
    fetchSummaryData(selectedFilter, startDate, endDate);
    setIsOpen(false); // Close the sidebar after showing results
  };

  return (
    <div>
      <div className="flex flex-col">
        <div className="flex gap-1 items-center mb-3">
          <BiSolidNotepad className="h-6 w-6 text-gray-900 dark:text-gray-200" />
          <Title as="h3" className="dark:text-gray-200">
            Finance Summary
          </Title>
        </div>
        <div className="mb-3 flex items-center justify-between w-full">
          <Text className="text-base font-medium flex gap-1 items-center dark:text-gray-300">
          <FaCalendar />{" "} {headingData[0].toUpperCase()+headingData.slice(1)} 
          </Text>
          <div className="flex gap-2">
            <Button
              className="flex-1 sm:flex-none"
              onClick={() => setIsOpen(true)}
            >
              Filters <FilterIcon className="ml-2" />
            </Button>
          </div>
        </div>
        <StatCards
          payments={summaryData?.totalTransactions || 0}
          expenses={summaryData?.totalExpenses || 0}
          profitOrLoss={summaryData?.profitOrLoss || 0}
          info={demographiInfo}
          className="bg-inherit "
          isLoading={loading}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-1 gap-2 mt-3 w-[100%]">
          <PaymentSummaryTable
            PaymentData={summaryData?.transactionsList || null}
            info={demographiInfo}
            isLoading={loading}
          />
          <ExpenseSummaryTable
            ExpenseData={summaryData?.expensesList || null}
            info={demographiInfo}
            isLoading={loading}
          />
        </div>
        <FilterSidebar
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onFilterChange={handleFilterChange}
          onShowResults={handleShowResults}
          selectedFilter={selectedFilter}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
      </div>
    </div>
  );
};

export default SummaryLayout;
