"use client";

import { Membership } from "@/components/membership/section/DueList";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import DateCell from "@core/ui/date-cell";
import dayjs from "dayjs";
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Button,
  Input,
  Modal,
  Text,
  Title,
  Select,
  Tooltip,
  Loader,
  Drawer,
} from "rizzui";

interface PaymentMode {
  label: string;
  value: number;
}

export default function Payment({
  member,
  getdueData,
  checkValidity,
}: {
  member: Membership;
  getdueData: () => void;
  checkValidity: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [demographiInfo, setDemographicInfo] = useState<DemographicInfo | null>(
    null
  );
  const [paymentDetails, setPaymentDetails] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentModeId: null as number | null,
    newDueDate: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);

  const fetchPaymentModes = useCallback(async () => {
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/payment-modes/list_favorite/?gym_id=${gymId}`,
        {
          id: newID(`payment-modes`),
        }
      );
      setPaymentModes(
        response.data.map((mode: any) => ({
          label: mode.name,
          value: mode.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching payment modes:", error);
    }
  }, []);

  useEffect(() => {
    fetchPaymentModes();

    const today = dayjs();
    const currentDueDate = member?.due_date ? dayjs(member.due_date) : today;
    const nextDueDate = today.isAfter(currentDueDate)
      ? today.add(1, "day")
      : currentDueDate.add(1, "day");

    setPaymentDetails((prev) => ({
      ...prev,
      amount: member?.due.toString() || "",
      newDueDate: nextDueDate.format("YYYY-MM-DD"),
    }));
  }, [fetchPaymentModes, member]);

  useEffect(() => {
    async function getInfo() {
      const infoData = await retrieveDemographicInfo();
      // console.log(infoData);
      setDemographicInfo(infoData);
    }
    getInfo();
  }, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));

    if (name === "amount") {
      validateAmount(value);
    }
  };

  const validateAmount = (value: string) => {
    if (value === "" || isNaN(parseFloat(value))) {
      setErrorMessage("");
    } else if (parseFloat(value) > member.due) {
      setErrorMessage("Amount cannot exceed the due amount");
    } else if (parseFloat(value) < 0) {
      setErrorMessage("Amount cannot be negative");
    } else {
      setErrorMessage("");
    }
  };

  const handleSelectChange = (option: PaymentMode | null) => {
    setPaymentDetails((prev) => ({
      ...prev,
      paymentModeId: option?.value || null,
    }));
  };

  const initiatePayment = async () => {
    try {
      const newData = {
        // ...member,
        amount: parseInt(paymentDetails.amount),
        paid_amount: member.paid_amount + parseInt(paymentDetails.amount),
        payment_date: paymentDetails.date,
        payment_mode: paymentDetails.paymentModeId,
        due_date:
          parseFloat(paymentDetails.amount) < member.due
            ? paymentDetails.newDueDate
            : member.due_date,
      };
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.patch(
        `/api/memberships/${member.membership_id}/pay/?gym_id=${gymId}`,
        newData
      ).then(() => {
        invalidateAll();
        getdueData();
        toast.success("Payment successful");
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Something went wrong while making payment");
    }
  };

  const isPaymentValid = () => {
    const { amount, date, paymentModeId, newDueDate } = paymentDetails;
    const amountFloat = parseFloat(amount);
    return (
      amount &&
      amountFloat > 0 &&
      amountFloat <= member.due &&
      date &&
      paymentModeId !== null &&
      (amountFloat >= member.due || newDueDate)
    );
  };

  return (
    <>
      <Tooltip content="Payment Update">
        <Button
          onClick={() => {
            checkValidity();
            setIsOpen(true);
          }}
          size="sm"
        >
          Pay
        </Button>
      </Tooltip>
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        containerClassName=""
      >
        <div className="m-auto p-6 md:p-8 relative h-full">
          {member !== null ? (
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4 ">
                  <Title as="h3" className="">
                    Payment
                  </Title>
                  <Button variant="text" onClick={() => setIsOpen(false)}>
                    <XIcon className="size-6 " />
                  </Button>
                </div>
                <div className="grid gap-4 items-center ">
                  <Text className="font-bold ">
                    Due Amount:{" "}
                    <span className="text-primary font-bold text-lg ml-2 mt-1">
                      {demographiInfo?.currency_symbol}
                      {member?.due}
                    </span>
                  </Text>
                  <Text className="font-bold ">
                    Current Due Date:{" "}
                    <span
                      className={`ml-2 ${new Date().getTime() > new Date(member?.due_date || "").getTime() ? "text-red-400" : "text-green-400"} font-bold`}
                    >
                      {/* {member?.due_date} */}
                      <DateCell
                        date={
                          member?.due_date
                            ? new Date(member?.due_date)
                            : new Date()
                        }
                        timeClassName="hidden"
                        dateFormat={getDateFormat()}
                        className="inline-block"
                        dateClassName=""
                      />
                    </span>
                  </Text>
                  <Input
                    label="Amount"
                    name="amount"
                    placeholder="Enter amount"
                    value={paymentDetails.amount}
                    onChange={handleInputChange}
                    labelClassName=""
                    prefix={
                      <Text className=" font-bold text-primary">
                        {demographiInfo?.currency_symbol}
                      </Text>
                    }
                  />
                  {errorMessage && (
                    <Text className="text-red-500">{errorMessage}</Text>
                  )}
                  <Input
                    type="date"
                    label="Payment Date"
                    name="date"
                    value={paymentDetails.date}
                    onChange={handleInputChange}
                    labelClassName=""
                  />
                  <Select
                    label="Payment Mode *"
                    options={paymentModes}
                    //@ts-ignore
                    value={paymentModes.find(
                      (mode) => mode.value === paymentDetails.paymentModeId
                    )}
                    onChange={handleSelectChange}
                    // labelClassName=""
                    // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                    // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200
                  />
                  {parseFloat(paymentDetails.amount) < member?.due && (
                    <Input
                      type="date"
                      label="Next Due Date"
                      name="newDueDate"
                      value={paymentDetails.newDueDate}
                      onChange={handleInputChange}
                      labelClassName=""
                    />
                  )}
                </div>
              </div>
              <Button
                onClick={initiatePayment}
                className="mt-4 w-full"
                disabled={!isPaymentValid()}
              >
                Confirm Payment
              </Button>
            </div>
          ) : (
            <Loader className="mx-auto" size="xl" />
          )}
        </div>
      </Drawer>
    </>
  );
}
