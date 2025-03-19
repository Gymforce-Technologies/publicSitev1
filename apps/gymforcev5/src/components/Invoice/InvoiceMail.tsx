import { AxiosPrivate } from "@/app/[locale]/auth/AxiosPrivate";
import axios from "axios";
import toast from "react-hot-toast";
import { RiMailSendFill } from "react-icons/ri";
import { ActionIcon, Tooltip } from "rizzui";

export default function InvoiceMail({
  membershipId,
  isInvoiceList = false,
}: {
  membershipId: string;
  isInvoiceList?: boolean;
}) {
  const sendMail = async () => {
    try {
      const resp = await AxiosPrivate.post("/send-email/", {
        membership_id: membershipId,
        email_type: "invoice",
      });
      console.log(resp);
      toast.success("Invoice sent Successfully");
    } catch {
      toast.error("Something went wrong while sending Invoice");
    }
  };
  return (
    <ActionIcon
      as="span"
      size="sm"
      variant={isInvoiceList ? "outline" : "text"}
      aria-label={"Mail Invoice"}
    >
      <RiMailSendFill
        className={` cursor-pointer hover:scale-105 ${isInvoiceList === true ? "size-5 text-inherit hover:text-primary" : "size-6 text-primary animate-pulse"}  `}
        onClick={sendMail}
      />
    </ActionIcon>
  );
}
