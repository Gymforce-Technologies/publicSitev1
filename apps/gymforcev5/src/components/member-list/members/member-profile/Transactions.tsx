"use client";
import React, { useEffect, useState } from "react";
import {
  ActionIcon,
  Announcement,
  Badge,
  Button,
  Drawer,
  Input,
  Loader,
  Modal,
  Select,
  Text,
  Textarea,
  Title,
  Tooltip,
} from "rizzui";
import WidgetCard from "@/components/cards/widget-card";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import LoaderList from "../LoaderList";
import { toast } from "react-hot-toast";
import { ArrowRight, DollarSign, FileText, XIcon } from "lucide-react";
import Pagination from "@core/ui/pagination";
import Link from "next/link";
import MetricCard from "@core/components/cards/metric-card";
import {
  DemographicInfo,
  getDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import { useScrollableSlider } from "@core/hooks/use-scrollable-slider";
import { IoMdEye } from "react-icons/io";

interface CreatedByInfo {
  id: number;
  name: string;
  email: string;
  user_type: string;
}

interface PaymentMode {
  id: number;
  name: string;
  mark_as_default: boolean;
  is_default: boolean;
  created_by: number | null;
}

interface Transaction {
  id: string;
  localPaymentId: number;
  gym_id: string;
  membership_id: string;
  member_details: {
    id: number;
    name: string;
    phone: string;
  };
  amount: string;
  payment_date: string;
  payment_mode: PaymentMode;
  reference: string | null;
  gym_name: string;
  package_name: string;
  created_by: number;
  created_by_info: CreatedByInfo;
  remarks: string;
}

interface TransInfo {
  count: number;
  amount: number;
}

interface TransactionNew {
  amount: number;
  remarks: string;
  payment_date: string;
  payment_mode_id: number;
  member_id: number;
  gym_id: number;
}

interface TransactionProps {
  id: string;
}

const Transactions: React.FC<TransactionProps> = ({ id }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transInfo, setTransInfo] = useState<TransInfo>({
    count: 0,
    amount: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [demographicInfo, setDemographicInfo] =
    useState<DemographicInfo | null>(null);
  const [paymentModes, setPaymentModes] = useState<
    Array<{ label: string; value: number }>
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [transaction, setTransaction] = useState<TransactionNew>({
    amount: 0,
    remarks: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_mode_id: 0,
    member_id: parseInt(id),
    gym_id: 0,
  });

  const metricData = [
    {
      title: "Total Amount",
      metric: transInfo.amount,
      icon: <DollarSign size={20} />,
    },
    {
      title: "Total Transactions",
      metric: transInfo.count,
      icon: <FileText size={20} />,
    },
  ];
  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();
  const getDemographic = async () => {
    const infoData = await getDemographicInfo();
    setDemographicInfo(infoData);
  };

  const fetchPaymentModes = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/payment-modes/list_favorite/?gym_id=${gymId}`,
        {
          id: newID(`payment-modes`),
        }
      );
      if (resp.status === 200) {
        setPaymentModes(
          resp.data.map((mode: any) => ({
            label: mode.name,
            value: mode.id,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching payment modes:", error);
      toast.error("Failed to fetch payment modes");
    }
  };

  const getTransactions = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/member/${id}/invoices/?gym_id=${gymId}${currentPage ? `&page=${currentPage}` : ""}`,
        { id: newID(`invoices-${id}-${currentPage || 1}`) }
      );
      setTotalPages(resp.data.total_pages);
      setTransactions(resp.data.results);
      setTransInfo({
        count: resp.data.totalRecordCount,
        amount: resp.data.totalAmountCount,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    }
  };

  const handleSubmit = async () => {
    if (!validateTransaction()) return;

    setLoading(true);
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(`/api/create-transaction/?gym_id=${gymId}`, {
        ...transaction,
        gym_id: gymId,
      });
      toast.success("Transaction added successfully!");
      setIsOpen(false);
      invalidateAll();
      await getTransactions();
    } catch (error) {
      toast.error("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  const validateTransaction = () => {
    if (!transaction.amount || transaction.amount <= 0) {
      toast.error("Please enter a valid amount");
      return false;
    }
    if (!transaction.remarks?.trim()) {
      toast.error("Please enter remarks");
      return false;
    }
    if (!transaction.payment_mode_id) {
      toast.error("Please select a payment mode");
      return false;
    }
    return true;
  };

  useEffect(() => {
    getDemographic();
    fetchPaymentModes();
  }, []);

  useEffect(() => {
    getTransactions();
  }, [id, currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `${demographicInfo?.currency_symbol || ""} ${new Intl.NumberFormat().format(amount)}`;
  };

  return (
    <section className="space-y-4">
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
            <MetricCard
              key={index}
              title={metric.title}
              metric={
                index === 0 ? formatCurrency(metric.metric) : metric.metric
              }
              icon={metric.icon}
              className="shadow border-none transform hover:scale-105 transition-all duration-200"
              iconClassName="text-primary duration-200 transition-all group-hover:text-white group-hover:bg-primary"
              titleClassName="text-nowrap font-medium"
              metricClassName="text-primary text-center dark:text-white"
            />
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
        title="Transactions"
        titleClassName="leading-none"
        headerClassName="mb-3 lg:mb-4"
        action={
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="solid"
              onClick={() => setIsOpen(true)}
              size="sm"
              className="scale-105"
            >
              Add Transaction
            </Button>
            <Pagination
              total={totalPages}
              current={currentPage}
              onChange={setCurrentPage}
              variant="solid"
              color="primary"
            />
          </div>
        }
      >
        <div className="flex md:hidden items-center justify-end gap-4 my-2">
          <Button
            variant="solid"
            onClick={() => setIsOpen(true)}
            size="sm"
            className=""
          >
            Add Transaction
          </Button>
          <Pagination
            total={totalPages}
            current={currentPage}
            onChange={setCurrentPage}
            variant="solid"
            color="primary"
          />
        </div>
        {transactions.length > 0 ? (
          <div className="grid gap-3 max-h-[55vh] overflow-y-auto custom-scrollbar">
            {transactions.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-1.5 sm:gap-3 shadow-sm p-2 sm:p-4 rounded-lg"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="size-4 sm:size-5"
                  >
                    <path
                      fill="currentColor"
                      d="M19.924 10.383a1 1 0 0 0-.217-1.09l-5-5-1.414 1.414L16.586 9H4v2h15a1 1 0 0 0 .924-.617zM4.076 13.617a1 1 0 0 0 .217 1.09l5 5 1.414-1.414L7.414 15H20v-2H5a.999.999 0 0 0-.924.617z"
                    />
                  </svg>
                </div>

                <div className="flex flex-col flex-grow mx-2 gap-2">
                  <div className="flex justify-between items-center">
                    <Title
                      as="h6"
                      className="text-sm font-medium text-gray-900"
                    >
                      {item.package_name || `Others : ${item.remarks}`}
                    </Title>
                    <Badge
                      variant="flat"
                      color="success"
                      className="capitalize"
                    >
                      {formatDate(item.payment_date)}
                    </Badge>
                  </div>

                  <Text className="flex flex-row flex-nowrap gap-1">
                    <Text>Amount:</Text>
                    <Text className="text-primary font-semibold">
                      {demographicInfo?.currency_symbol}{" "}
                      {parseFloat(item.amount)}
                    </Text>
                  </Text>

                  <Text className="text-sm">
                    Payment Mode:{" "}
                    <span className="font-medium">
                      {item.payment_mode?.name || "N/A"}
                    </span>
                  </Text>

                  <div className="grid md:grid-cols-2 gap-1.5 md:gap-3">
                    <Text className="text-sm">
                      GYM:{" "}
                      <span className="font-medium text-primary">
                        {item.gym_name}
                      </span>
                    </Text>
                    <Text className="text-sm">
                      Processed by:{" "}
                      <span className="font-medium">
                        {item.created_by_info.name}
                      </span>
                    </Text>
                  </div>

                  {item.package_name && item.reference && (
                    <div className="grid grid-cols-[auto,auto] sm:grid-cols-2 max-sm:gap-2 items-center min-w-full">
                      <Announcement
                        className="flex-wrap font-semibold dark:bg-inherit"
                        badgeText={item.reference.split(" ").slice(2).join(" ")}
                        badgeClassName="text-nowrap"
                      />
                      <div className="max-sm:hidden">
                        <Link
                          href={`/invoice/hy$39-${item.membership_id}-091$u/?member=i9rw-${item.member_details.id}-7y72&page=member_profile`}
                          className={`group text-primary place-self-end ${item.reference.includes("Membership") ? "" : "hidden"}`}
                        >
                          View Invoice
                          <ArrowRight
                            size={18}
                            className="inline-block group-hover:animate-scale-up duration-200"
                          />
                        </Link>
                      </div>
                      <div className="sm:hidden">
                        <Tooltip
                          size="sm"
                          content={"View Invoice"}
                          placement="top"
                          color="invert"
                          // className="dark:bg-gray-800 "
                          // arrowClassName="dark:text-gray-800"
                        >
                          <Link
                            href={`/invoice/hy$39-${item.membership_id}-091$u/?member=i9rw-${item.member_details.id}-7y72&page=member_profile`}
                            className={`group text-primary place-self-end ${item.reference.includes("Membership") ? "" : "hidden"}`}
                          >
                            <ActionIcon
                              as="span"
                              size="sm"
                              variant="outline"
                              aria-label={"View Invoice"}
                              className=" hover:text-primary hover:cursor-pointer"
                            >
                              <IoMdEye className="h-4 w-4 " />
                            </ActionIcon>
                          </Link>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <LoaderList />
        )}
      </WidgetCard>

      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="m-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <Title as="h3">Add Transaction</Title>
            <Button variant="text" onClick={() => setIsOpen(false)}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-5">
            <Input
              label="Amount *"
              type="number"
              value={transaction.amount || ""}
              onChange={(e) =>
                setTransaction({
                  ...transaction,
                  amount: parseFloat(e.target.value),
                })
              }
              prefix={
                <Text className="text-primary">
                  {demographicInfo?.currency_symbol}
                </Text>
              }
            />

            <Textarea
              label="Remarks *"
              placeholder="Enter remarks"
              value={transaction.remarks}
              onChange={(e) =>
                setTransaction({
                  ...transaction,
                  remarks: e.target.value,
                })
              }
            />

            <Select
              label="Payment Mode *"
              options={paymentModes}
              value={paymentModes.find(
                (mode) => mode.value === transaction.payment_mode_id
              )}
              onChange={(option: any) =>
                setTransaction({
                  ...transaction,
                  payment_mode_id: option?.value || 0,
                })
              }
            />

            <Input
              label="Payment Date *"
              type="date"
              value={transaction.payment_date}
              onChange={(e) =>
                setTransaction({
                  ...transaction,
                  payment_date: e.target.value,
                })
              }
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader variant="threeDot" /> : "Add Transaction"}
            </Button>
          </div>
        </div>
      </Drawer>
    </section>
  );
};

export default Transactions;
