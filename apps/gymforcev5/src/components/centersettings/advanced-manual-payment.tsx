import { Modal, Title, Text, Button, Select, Bold, Progressbar } from "rizzui";
import { XIcon } from "lucide-react";
import { TbInfoTriangle } from "react-icons/tb";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface ManualPaymentModalProps {
  manualPaymentModes: any;
  manualPaymentType: string;
  setManualPaymentType: React.Dispatch<React.SetStateAction<string>>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
  paymentScreenshot: File | null;
  handleManualPayment: () => void;
  onClose: () => void;
}

const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
  manualPaymentModes,
  manualPaymentType,
  setManualPaymentType,
  handleFileChange,
  imagePreview,
  paymentScreenshot,
  handleManualPayment,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaymentMethodChange = (value: string) => {
    setManualPaymentType(value);
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal isOpen onClose={onClose}>
      <div className="flex flex-col gap-3 p-5 xl:p-7">
        <div className="flex flex-row justify-between">
          <Title as="h3">Manual Payment</Title>
          <XIcon onClick={onClose} className="h-6 w-6 hover:cursor-pointer" />
        </div>
        <div className="flex flex-col gap-3">
          <Title as="h5">Select Payment Method</Title>
          <Select
            value={
              manualPaymentType &&
              manualPaymentType.charAt(0).toUpperCase() +
                manualPaymentType.slice(1)
            }
            onChange={(value: { lable: string; value: string }) => {
              handlePaymentMethodChange(value.value);
              console.log(value);
            }}
            options={Object.keys(manualPaymentModes[0]).map((mode) => ({
              label: mode.charAt(0).toUpperCase() + mode.slice(1),
              value: mode,
            }))}
            // labelClassName="dark:text-gray-200"
            // dropdownClassName="dark:bg-gray-800 dark:border-gray-700" 
            // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
          />
        </div>
        <div className="flex flex-col gap-3">
          {manualPaymentType &&
            renderPaymentDetails(
              manualPaymentType,
              manualPaymentModes,
              onClose
            )}
          <div className="flex flex-col gap-3">
            <div className="flex flex-row gap-4 flex-nowrap items-center">
              <TbInfoTriangle size={24} className="animate-pulse" />
              <Text className="font-medium">
                Transfer the amount to the above details and then submit the
                proof as Image
              </Text>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div className="flex flex-col md:flex-row justify-between flex-nowrap md:items-center gap-4">
              <Text as="strong">Proof of Payment (Screenshot / Image):</Text>
              <Button onClick={openFileInput}>
                {imagePreview ? "Change" : "Upload"} Screenshot
              </Button>
            </div>
            {imagePreview && (
              <div className="mt-2 w-full flex justify-center items-center">
                <Image
                  alt="Payment Screenshot Preview"
                  src={imagePreview}
                  width={350}
                  height={450}
                  className="aspect-auto object-contain rounded-md max-sm:size-40"
                />
              </div>
            )}
          </div>
          <div className="flex flex-row gap-10 justify-evenly">
            <Button onClick={handleManualPayment} disabled={!paymentScreenshot}>
              Submit Payment
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const renderPaymentDetails = (
  manualPaymentType: string,
  manualPaymentModes: any,
  onClose: () => void
) => {
  const currentPaymentMode = manualPaymentModes[0];
  const paymentMethodDetails = currentPaymentMode[manualPaymentType];

  if (!paymentMethodDetails) {
    return null; // or return some default or error message
  }

  switch (manualPaymentType) {
    case "bank":
      return (
        <div className="flex flex-col gap-3">
          <Title as="h5">Bank Details</Title>
          <div className="grid grid-cols-2 max-w-sm gap-4 md:gap-6">
            <Bold>Account Number:</Bold>
            <Text>{paymentMethodDetails.bank_account_number}</Text>
            <Bold>IFSC Code:</Bold>
            <Text>{paymentMethodDetails.ifsc_code}</Text>
            <Bold>Bank Name:</Bold>
            <Text>{paymentMethodDetails.bank_name}</Text>
            <Bold>Account Holder:</Bold>
            <Text>{paymentMethodDetails.account_holder_name}</Text>
          </div>
        </div>
      );
    case "upi":
      return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <Title as="h5">UPI Details</Title>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-row gap-4 text-lg">
              <Bold>ID:</Bold>
              <Text className="font-medium">{paymentMethodDetails.upi_id}</Text>
            </div>
            <Image
              alt="UPI QR Code"
              src={paymentMethodDetails.upi_qr_code_image}
              width={150}
              height={150}
              className="aspect-square object-contain rounded-md size-36"
            />
            <Text className="font-medium my-1">
              Scan the QR code to pay via UPI
            </Text>
            <CountdownTimer
              duration={900}
              onExpire={() => {
                toast.error("Expired ...");
                onClose();
              }}
            />
          </div>
        </div>
      );
    case "crypto":
      return (
        <div className="flex flex-col gap-4 md:gap-6">
          <Title as="h5">Crypto Details</Title>
          <div className="grid grid-cols-2 max-w-sm gap-3">
            <Bold>Crypto Address:</Bold>
            <Text>{paymentMethodDetails.crypto_address}</Text>
            <Bold>Crypto Network:</Bold>
            <Text>{paymentMethodDetails.crypto_network}</Text>
            <Bold>Crypto Currency:</Bold>
            <Text>{paymentMethodDetails.crypto_currency}</Text>
          </div>
        </div>
      );
    case "paypal":
      return (
        <div className="flex flex-col gap-4 md:gap-6">
          <Title as="h5">PayPal Details</Title>
          <div className="flex flex-row flex-nowrap max-w-sm gap-6 md:gap-8">
            <Bold>Email:</Bold>
            <Text>{paymentMethodDetails.email}</Text>
          </div>
        </div>
      );
    default:
      return null;
  }
};

interface CountdownTimerProps {
  duration: number;
  onExpire: () => void;
}

interface CountdownTimerProps {
  duration: number;
  onExpire: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  duration,
  onExpire,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    if (timeLeft === 0) {
      clearInterval(interval);
      onExpire();
    }

    return () => clearInterval(interval);
  }, [timeLeft, onExpire]);

  const formattedTimeLeft = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-3 mt-1 items-center">
      <Progressbar
        value={(timeLeft / duration) * 100}
        size="md"
        color="info"
        className=" w-40 max-w-sm"
      />
      <Text className="font-medium text-lg">{formattedTimeLeft}</Text>
    </div>
  );
};

export default ManualPaymentModal;
