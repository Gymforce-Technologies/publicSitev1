import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import { retrieveDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import DateCell from "@core/ui/date-cell";
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Button,
  Drawer,
  Input,
  Loader,
  Modal,
  Select,
  Text,
  Title,
} from "rizzui";

export const PaymentModal: React.FC<{
  isOpen: boolean;
  membershipid: string;
  onUpdate: () => void;
}> = ({ membershipid, onUpdate, isOpen }) => {
  const [lock, setLock] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [paymentInput, setPaymentInput] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentModeId: null as number | null,
    newDueDate: new Date().toISOString().split("T")[0],
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [demographiInfo, setDemographicInfo] = useState<any>(null);
  useEffect(() => {
    async function getInfo() {
      const infoData = await retrieveDemographicInfo();
      console.log(infoData);
      setDemographicInfo(infoData);
    }
    getInfo();
  }, []);
  const getData = async () => {
    try {
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.get(
        `/api/get-membership/${membershipid}/?gym_id=${gymId}/`,
        {
          id: newID(`membership-${membershipid}`),
        }
      );
      console.log("membership");
      console.log(resp);
      const transformedData = {
        created_at: resp.data.created_at,
        due: resp.data.due,
        due_date: resp.data.due_date,
        end_date: resp.data.end_date,
        gym_id: resp.data.gym_details.id,
        gym_name: resp.data.gym_details.name,
        id: resp.data.id,
        member_id: resp.data.member_details.id,
        member_name: resp.data.member_details.name,
        member_phone: resp.data.member_details.phone,
        membership_id: resp.data.id,
        offer_price: resp.data.offer_price,
        package_id: resp.data.package_details.id,
        package_name: resp.data.package_details.name,
        paid_amount: resp.data.paid_amount,
        start_date: resp.data.start_date,
      };
      setPaymentInput((prev: any) => ({
        ...prev,
        amount: transformedData.due.toString(),
      }));
      setPaymentDetails(transformedData);
      console.log(transformedData);
    } catch (error) {
      console.error("Error fetching membership details:", error);
    }
  };

  const fetchPaymentModes = useCallback(async () => {
    try {
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.get(
        `/api/payment-modes/list_favorite/?gym_id=${gymId}`,
        {
          id: newID(`payment-modes`),
        }
      );
      console.log("PaymentModes");

      console.log(response);
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
    getData();
    fetchPaymentModes();
  }, [fetchPaymentModes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInput((prev) => ({ ...prev, [name]: value }));

    if (name === "amount") {
      validateAmount(value);
    }
  };

  const validateAmount = (value: string) => {
    if (value === "" || isNaN(parseFloat(value))) {
      setErrorMessage("");
    } else if (parseFloat(value) > paymentDetails.due) {
      setErrorMessage("Amount cannot exceed the due amount");
    } else if (parseFloat(value) < 0) {
      setErrorMessage("Amount cannot be negative");
    } else {
      setErrorMessage("");
    }
  };

  const handleSelectChange = (option: any) => {
    setPaymentInput((prev) => ({
      ...prev,
      paymentModeId: option?.value || null,
    }));
  };

  const initiatePayment = async () => {
    try {
      setLock(true);
      const newData = {
        amount: parseInt(paymentInput.amount),
        paid_amount: paymentDetails.paid_amount + parseInt(paymentInput.amount),
        payment_date: paymentInput.date,
        payment_mode: paymentInput.paymentModeId,
        due_date:
          parseFloat(paymentInput.amount) < paymentDetails.due
            ? paymentInput.newDueDate
            : paymentDetails.due_date,
      };
      const gymId = await retrieveGymId();
      const response = await AxiosPrivate.patch(
        `/api/memberships/${paymentDetails.membership_id}/pay/?gym_id=${gymId}`,
        newData
      );
      if (response.status === 200) {
        invalidateAll();
        getData();
        toast.success("Payment successful");
      }
      onUpdate();
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Something went wrong. payment unsuccessful");
    }
    setLock(false);
  };

  const isPaymentValid = () => {
    const { amount, date, paymentModeId, newDueDate } = paymentInput;
    const amountFloat = parseFloat(amount);
    return (
      amount &&
      amountFloat > 0 &&
      amountFloat <= paymentDetails.due &&
      date &&
      paymentModeId !== null &&
      (amountFloat >= paymentDetails.due || newDueDate)
    );
  };

  return (
    <div>
      <Drawer
        isOpen={isOpen}
        onClose={() => onUpdate()}
        // containerClassName="dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="m-auto p-6 md:p-8 h-full">
          {paymentDetails !== null ? (
            <>
              <div className="flex items-center justify-between mb-4 ">
                <Title as="h3" className="">
                  Payment
                </Title>
                <Button variant="text" onClick={() => onUpdate()}>
                  <XIcon className="size-6 " />
                </Button>
              </div>
              <div className="flex flex-col justify-between h-full">
                <div className="grid gap-4 items-center ">
                  <Text className="font-bold ">
                    Due Amount:{" "}
                    <span className="text-primary font-bold text-lg ml-2 mt-1">
                      {" "}
                      {demographiInfo?.currency_symbol}
                      {paymentDetails?.due}
                    </span>
                  </Text>
                  <Text className="font-bold ">
                    Current Due Date:{" "}
                    <span
                      className={`ml-2 ${new Date().getTime() > new Date(paymentDetails?.due_date || "").getTime() ? "text-red-400" : "text-green-400"}`}
                    >
                      <DateCell
                        date={paymentDetails?.due_date}
                        timeClassName="hidden"
                        dateFormat={getDateFormat()}
                        className="inline-block"
                      />
                    </span>
                  </Text>
                  <Input
                    label="Amount"
                    name="amount"
                    placeholder="Enter amount"
                    value={paymentInput.amount}
                    onChange={handleInputChange}
                    labelClassName=""
                  />
                  {errorMessage && (
                    <Text className="text-red-500">{errorMessage}</Text>
                  )}
                  <Input
                    type="date"
                    label="Payment Date"
                    name="date"
                    value={paymentInput.date}
                    onChange={handleInputChange}
                    labelClassName=""
                  />
                  <Select
                    label="Payment Mode *"
                    options={paymentModes}
                    //@ts-ignore
                    value={paymentModes.find(
                      (mode) => mode.value === paymentInput.paymentModeId
                    )}
                    onChange={handleSelectChange}
                    // labelClassName=""
                    // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
                    // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
                  />
                  {parseFloat(paymentInput.amount) < paymentDetails?.due && (
                    <Input
                      type="date"
                      label="Next Due Date"
                      name="newDueDate"
                      value={paymentInput.newDueDate}
                      onChange={handleInputChange}
                      labelClassName=""
                    />
                  )}
                </div>
                <div className="w-full mb-10">
                  <Button
                    onClick={initiatePayment}
                    className="mt- w-full"
                    disabled={!isPaymentValid() || lock}
                  >
                    {lock ? <Loader variant="threeDot" /> : "Confirm Payment"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Loader className="mx-auto" variant="spinner" size="xl" />
          )}
        </div>
      </Drawer>
    </div>
  );
};
