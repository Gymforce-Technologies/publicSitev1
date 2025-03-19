"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
// import { QRCodeSVG } from "qrcode.react";
import { Title, Text, Button, Tooltip, ActionIcon } from "rizzui";
import Table from "@/app/shared/table";
// import LogoMain from "@/../public/svg/icon/gymforce-icon-black.svg";
// import LogoMainText from "@/../public/svg/gymforce-text/gymforce-text-black.svg";
// import LogoMainDark from "@/../public/svg/icon/gymforce-icon-white.svg";
// import LogoMainTextDark from "@/../public/svg/gymforce-text/gymforce-text-white.svg";
// import { useTheme } from "next-themes";
import { usePDF } from "react-to-pdf";
import {
  useParams,
  // usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { formatDate } from "@core/utils/format-date";
import { IoMdPersonAdd } from "react-icons/io";
import { PiArrowCircleLeft } from "react-icons/pi";
import Loading from "@/app/[locale]/loading";
import DateCell from "@core/ui/date-cell";
// import InvoiceMail from "@/components/Invoice/InvoiceMail";
import getDueBadge from "@/components/dueBadge";
import WidgetCard from "@/components/cards/widget-card";
import { RiMailSendFill } from "react-icons/ri";
import toast from "react-hot-toast";
// import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getDateFormat } from "@/app/[locale]/auth/DateFormat";
import dayjs from "dayjs";

interface MembershipData {
  id: number;
  package_details: {
    name: string;
    num_of_days: number;
  };
  offer_price: number;
  paid_amount: number;
  due: number;
  created_at: string;
  payment_mode_details: {
    name: string;
  };
  dues_transactions: Array<{
    amount: number;
    payment_date: string;
    due_date?: string | null;
    payment_mode_details: any;
  }> | null;
  enrollment_fee: number;
  due_date: string;
  discounted_amount: string;
  actual_amount: string;
  start_date: string;
  end_date: string;
  sessions_allocated: string;
}

interface MemberInfo {
  name: string;
  email: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip_code: string;
  address_country: string;
}

interface EnrollmentFee {
  id: number;
  amount: string;
}

interface GymProfile {
  email: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  associated_gyms: Array<{
    gym_id: string;
    name: string;
    business_contact_number: string;
    logo: string;
    ownerSignature: string;
    termsAndCondition: string | null;
    gst_company: string | null;
    gst_number: string | null;
  }>;
  currency_symbol: string;
  first_name: string;
  last_name: string;
}

interface InvoiceItem {
  id: string;
  plan: string;
  duration: string;
  price: number;
  total: number;
  start_date: string;
  end_date: string;
  received_by: string;
  session_allocated: string;
}

export default function InvoiceDetails() {
  const [membershipData, setMembershipData] = useState<MembershipData | null>(
    null
  );
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [enrollmentFees, setEnrollmentFees] = useState<EnrollmentFee[]>([]);
  const [gymProfile, setGymProfile] = useState<GymProfile | null>(null);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const membershipId = (params.invoiceId as string).split("-")[1];
  const member = searchParams.get("member")?.split("-")[1];
  const page = searchParams.get("page");
  const [curGym, setCurGym] = useState<string | null>(null);
  const { toPDF, targetRef } = usePDF({ filename: `invoice_${member}.pdf` });
  const [gymId, setGymId] = useState("");
  useEffect(() => {
    if (member) {
      fetchData();
    }
  }, [member]);

  const fetchData = async () => {
    const gym_id = await retrieveGymId();
    if (gym_id) {
      setGymId(gym_id);
    }
    try {
      const [membershipRes, memberInfoRes, enrollmentFeesRes, profileRes] =
        await Promise.all([
          AxiosPrivate.get(
            `/api/get-membership/${membershipId}/?gym_id=${gymId}`,
            {
              id: newID(`membership-${membershipId}`),
            }
          ),
          AxiosPrivate.get(`/api/member/${member}/basic/?gym_id=${gym_id}`, {
            id: newID(`member-profile-${member}`),
          }),
          AxiosPrivate.get(`/api/enrollment-fees/?gym_id=${gym_id}`, {
            id: newID("enrollment-fees-all"),
          }),
          AxiosPrivate.get(`/api/profile`),
        ]);
      console.log(membershipRes);
      console.log(memberInfoRes);
      console.log(enrollmentFeesRes);
      console.log(profileRes);
      setCurGym(gym_id);
      setMembershipData(membershipRes.data);
      setMemberInfo(memberInfoRes.data.data);
      setEnrollmentFees(enrollmentFeesRes.data);
      setGymProfile(profileRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // const sendMail = async () => {
  //   try {
  //     // Trigger PDF generation
  //     const pdfBlob = await new Promise<Blob>((resolve) => {
  //       const { toPDF } = usePDF({ filename: `invoice_${member}.pdf` });
  //       const blob = toPDF();
  //       resolve(blob);
  //     });

  //     // Create a FormData object to send the PDF
  //     const formData = new FormData();
  //     formData.append("membership_id", membershipId);
  //     formData.append("email_type", "invoice");

  //     // Append the PDF blob to the form data
  //     formData.append("invoice_pdf", pdfBlob, `invoice_${member}.pdf`);

  //     const resp = await AxiosPrivate.post("/send-email/", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     console.log(resp);
  //     toast.success("Invoice sent Successfully");
  //   } catch (error) {
  //     console.error("Error sending invoice:", error);
  //     toast.error("Something went wrong while sending Invoice");
  //   }
  // };

  const sendMail = async () => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      // Get the target element
      const input = targetRef.current;
      if (!input) {
        toast.error("Could not find PDF content");
        return;
      }

      // Use html2pdf.js method to add HTML content to PDF
      doc.html(input, {
        callback: async function (doc) {
          // Convert PDF to Blob
          const pdfBlob = new Blob([doc.output("arraybuffer")], {
            type: "application/pdf",
          });

          // Create FormData
          const formData = new FormData();
          formData.append("membership_id", membershipId);
          formData.append("email_type", "invoice");
          // formData.append("pdf_file", pdfBlob, `invoice_${member}.pdf`);

          try {
            const resp = await AxiosPrivate.post("/send-email/", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            console.log(resp);
            toast.success("Invoice sent Successfully");
          } catch (error) {
            console.error("Error sending invoice:", error);
            toast.error("Something went wrong while sending Invoice");
          }
        },
        x: 10,
        y: 10,
        width: 590, // Adjust based on your PDF page size
        windowWidth: 794, // Adjust based on your content width
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  if (!membershipData || !memberInfo || !gymProfile) {
    return <Loading />;
  }

  const gymInfo = {
    name: curGym
      ? gymProfile.associated_gyms.find(
          (gym) => gym.gym_id.toString() === curGym
        )?.name
      : gymProfile.associated_gyms[0].name,
    address: `${memberInfo.address_street ? memberInfo.address_street + ", " : ""}${memberInfo.address_city ? memberInfo.address_city + ", " : ""}${memberInfo.address_state ? memberInfo.address_state + ", " : ""}${memberInfo.address_zip_code ? memberInfo.address_zip_code + ", " : ""}${gymProfile.country}`,
    email: gymProfile.email,
    phone: curGym
      ? gymProfile.associated_gyms.find(
          (gym) => gym.gym_id.toString() === curGym
        )?.business_contact_number
      : gymProfile.associated_gyms[0].business_contact_number,
    logo: curGym
      ? gymProfile.associated_gyms.find(
          (gym) => gym.gym_id.toString() === curGym
        )?.logo || ""
      : gymProfile.associated_gyms[0].logo || "",
    terms_and_conditions: curGym
      ? gymProfile.associated_gyms.find(
          (gym) => gym.gym_id.toString() === curGym
        )?.termsAndCondition || ""
      : gymProfile.associated_gyms[0].termsAndCondition || "",
    signature_image: curGym
      ? gymProfile.associated_gyms.find(
          (gym) => gym.gym_id.toString() === curGym
        )?.ownerSignature || ""
      : gymProfile.associated_gyms[0].ownerSignature || "",
    gst_company: curGym
      ? gymProfile.associated_gyms.find(
          (gym) => gym.gym_id.toString() === curGym
        )?.gst_company || ""
      : gymProfile.associated_gyms[0].gst_company || "",
    gst_number: curGym
      ? gymProfile.associated_gyms.find(
          (gym) => gym.gym_id.toString() === curGym
        )?.gst_number || ""
      : gymProfile.associated_gyms[0].gst_number || "",
  };
  
  const enrollmentFee = parseFloat(
    enrollmentFees.find((fee) => fee.id === membershipData.enrollment_fee)
      ?.amount || "0"
  );

  const invoiceItems: InvoiceItem[] = [
    {
      id: "1",
      plan: membershipData.package_details.name,
      duration: `${dayjs(new Date(membershipData.end_date))
        .diff(dayjs(new Date(membershipData.start_date)), "days")
        .toString()} days`,
      price: membershipData.offer_price - enrollmentFee,
      total: membershipData.offer_price - enrollmentFee,
      end_date: membershipData.end_date,
      start_date: membershipData.start_date,
      received_by: gymProfile.first_name + " " + gymProfile?.last_name || "",
      session_allocated: membershipData?.sessions_allocated || "N/A",
    },
  ];

  const subtotal = membershipData.offer_price - enrollmentFee;
  // const amount
  const taxRate = 0.18; // 0% tax rate
  const discounted_amount = parseInt(membershipData.discounted_amount);

  const tax = (subtotal - discounted_amount + enrollmentFee) * taxRate;
  const total = parseInt(membershipData.actual_amount);
  const paidAmount = membershipData.paid_amount;
  const due = membershipData.due;

  const columns = [
    {
      title: "Plan Name",
      dataIndex: "plan",
      key: "plan",
      width: 180,
      render: (plan: string) => (
        <Text className="text-[15px] font-semibold">{plan}</Text>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 120,
    },
    {
      title: "Sessions",
      dataIndex: "session_allocated",
      key: "session_allocated",
      width: 120,
      render: (session_allocated: string) => (
        <Text className="pl-2">{session_allocated}</Text>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      width: 150,
      render: (start_date: string) => (
        <DateCell
          date={new Date(start_date)}
          timeClassName="hidden"
          dateFormat={getDateFormat()}
        />
      ),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      width: 150,
      render: (end_date: string) => (
        <DateCell
          date={new Date(end_date)}
          timeClassName="hidden"
          dateFormat={getDateFormat()}
        />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (value: number) => (
        <Text className="font-medium">
          {gymProfile.currency_symbol + " "}
          {value}
        </Text>
      ),
    },
    {
      title: "Received by",
      dataIndex: "received_by",
      key: "treceived_byotal",
      width: 180,
      render: (received_by: string) => (
        <Text className="font-medium">{received_by}</Text>
      ),
    },
  ];

  const duecolumns = [
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 100,
      render: (amount: string) => (
        <Text className="text-[15px] font-semibold">
          {gymProfile.currency_symbol} {amount}
        </Text>
      ),
    },
    {
      title: "Date",
      dataIndex: "payment_date",
      key: "payment_date",
      width: 120,
      render: (payment_date: string) => (
        <DateCell
          date={new Date(payment_date)}
          timeClassName="hidden"
          dateFormat={getDateFormat()}
        />
      ),
    },
    {
      title: "Payment Mode",
      dataIndex: "payment_mode_details",
      key: "payment_mode_details",
      width: 120,
      render: (payment_mode_details: any) => (
        <Text className="pl-2">{payment_mode_details?.name}</Text>
      ),
    },
    {
      title: "New Due Date",
      dataIndex: "due_date",
      key: "due_date",
      width: 120,
      render: (due_date: string | null) =>
        due_date ? (
          <DateCell
            date={new Date(due_date)}
            timeClassName="hidden"
            dateFormat={getDateFormat()}
          />
        ) : (
          getDueBadge({ dueAmount: due, symbol: gymProfile.currency_symbol })
        ),
    },
    {
      title: "Remaining Due",
      dataIndex: "due_amount",
      key: "due_amount",
      width: 100,
      render: (due_amount: string | null) =>
        due_amount !== null
          ? getDueBadge({
              dueAmount: parseInt(due_amount) > 0 ? parseInt(due_amount) : 0,
              symbol: gymProfile.currency_symbol,
            })
          : "",
    },
  ];

  return (
    <div className="flex flex-1 flex-col sm:grid">
      <div className="flex flex-row justify-between items-center mt-4 mb-6 w-full px-4">
        <Button
          variant="outline"
          onClick={() => {
            router.back();
          }}
          className="flex flex-row gap-2"
        >
          {page !== "new_member" ? (
            <PiArrowCircleLeft size={20} />
          ) : (
            <IoMdPersonAdd />
          )}
          {page !== "new_member" ? "Back" : "Add New Member "}
        </Button>
        <div className="flex flex-row items-center gap-4 sm:gap-8 text-primary">
          <Tooltip content="Send Invoice" placement="bottom">
            <ActionIcon
              as="span"
              size="sm"
              variant={"text"}
              aria-label={"Mail Invoice"}
            >
              <RiMailSendFill
                className={` cursor-pointer hover:scale-105 size-6 text-primary animate-pulse`}
                onClick={sendMail}
              />
            </ActionIcon>
          </Tooltip>
          <Button
            size="sm"
            variant="solid"
            color="primary"
            onClick={() => toPDF()}
          >
            Download PDF
          </Button>
        </div>
      </div>

      <InvoiceContent
        TableComponent={
          <Table
            data={invoiceItems}
            columns={columns}
            variant="minimal"
            rowKey={(record) => record.id}
            scroll={{ x: 1000 }}
            className="mb-8"
          />
        }
        dueTableComponent={
          membershipData.dues_transactions?.length ? (
            <Table
              data={membershipData.dues_transactions || []}
              columns={duecolumns}
              variant="minimal"
              rowKey={(record) => record.id}
              scroll={{ x: 1000 }}
              className="mb-8 "
            />
          ) : null
        }
        membershipData={membershipData}
        memberInfo={memberInfo}
        gymProfile={gymProfile}
        gymInfo={gymInfo}
        subtotal={subtotal}
        taxRate={taxRate}
        tax={tax}
        enrollmentFee={enrollmentFee}
        total={total}
        paidAmount={paidAmount}
        due={due}
        discount={discounted_amount}
        className=""
        gym_id={gymId}
      />
      <div
        ref={targetRef}
        // style={{ position: "absolute", left: "", top: 0 }}
        className="absolute left-[-9999px] top-0 p-10"
      >
        <InvoiceContent
          TableComponent={
            <Table
              data={invoiceItems}
              columns={columns}
              variant="minimal"
              rowKey={(record) => record.id}
              scroll={{ x: 1000 }}
              className={`mb-10 [&_.rc-table-thead_tr_th]:pb-6`}
            />
          }
          dueTableComponent={
            membershipData.dues_transactions?.length ? (
              <Table
                data={membershipData.dues_transactions || []}
                columns={duecolumns}
                variant="minimal"
                rowKey={(record) => record.id}
                scroll={{ x: 1000 }}
                className={`mb-10 [&_.rc-table-thead_tr_th]:pb-6 `}
              />
            ) : null
          }
          isPDF
          membershipData={membershipData}
          memberInfo={memberInfo}
          gymProfile={gymProfile}
          gymInfo={gymInfo}
          subtotal={subtotal}
          taxRate={taxRate}
          tax={tax}
          enrollmentFee={enrollmentFee}
          total={total}
          paidAmount={paidAmount}
          due={due}
          discount={discounted_amount}
          className="border-none"
          gym_id={gymId}
        />
      </div>
    </div>
  );
}

function InvoiceContent({
  TableComponent,
  membershipData,
  memberInfo,
  gymProfile,
  gymInfo,
  subtotal,
  taxRate,
  tax,
  enrollmentFee,
  total,
  paidAmount,
  due,
  className,
  dueTableComponent,
  discount,
  gym_id,
  isPDF = false,
}: {
  TableComponent: any;
  membershipData: MembershipData;
  dueTableComponent: any;
  memberInfo: MemberInfo;
  gymProfile: GymProfile;
  gymInfo: any;
  subtotal: number;
  taxRate: number;
  tax: number;
  enrollmentFee: number;
  total: number;
  paidAmount: number;
  due: number;
  className: string;
  discount: number;
  isPDF?: boolean;
  gym_id?: string;
}) {
  return (
    <div
      className={`w-full rounded-xl border border-muted p-4 text-sm sm:p-8 lg:p-10 2xl:p-12 print-container ${className}`}
    >
      {/* Logo and Invoice Number */}
      <div className="mb-8 flex items-start justify-between md:mb-12">
        {gymInfo.logo ? (
          <Image
            src={gymInfo.logo}
            alt={gymInfo.name}
            className={`object-fill size-[125px] ${isPDF ? "" : "size-20 md:size-[125px] rounded"}`}
            width={125}
            height={125}
          />
        ) : (
          <Title as="h3">{gymInfo.name}</Title>
        )}
        <div
          className={`mb-4 md:mb-0 space-y-2 ${isPDF ? "" : " *:max-sm:text-sm"}`}
        >
          <Title as="h6" className="text-green-500">
            PAID
          </Title>
          <Title as="h6" className={`text-gray-900`}>
            INV-#{gym_id ?? ""}
            {formatDate(new Date(membershipData.created_at), "YYYYMMDD")}-
            {membershipData.id}
          </Title>
          <Text className={`mt-1 text-gray-700 font-medium`}>
            {gymInfo?.gst_number || ""},
          </Text>
          <Text className={` text-gray-700 font-medium`}>
            {gymInfo?.gst_company || ""}.
          </Text>
        </div>
      </div>

      {/* Invoice Details */}
      <div
        className={`mb-8 grid gap-6 ${isPDF ? "grid-cols-3" : " sm:grid-cols-2 lg:grid-cols-3"}`}
      >
        {" "}
        {/* Pay To */}
        <div>
          <Title
            as="h6"
            className={`mb-2 font-semibold text-gray-900 ${!isPDF ? " *:max-sm:text-sm" : ""}`}
          >
            Pay To
          </Title>
          <Text
            className={`mb-1 text-sm font-semibold uppercase text-gray-900`}
          >
            {gymInfo.name}
          </Text>
          <Text className={`mb-4 text-gray-700`}>{gymInfo.address}</Text>
          <Text className="mb-4 text-gray-700 ">{gymInfo.email}</Text>
          <Text className={`text-sm font-semibold text-gray-900`}>
            Invoice Date
          </Text>
          <Text className={`text-gray-700`}>
            {/* {new Date(membershipData.created_at).toLocaleDateString()} */}
            <DateCell
              date={new Date(membershipData.created_at)}
              timeClassName="hidden"
              dateFormat={getDateFormat()}
            />
          </Text>
        </div>
        {/* Invoice To */}
        <div className={isPDF ? "" : "*:max-sm:text-sm"}>
          <Title as="h6" className={`mb-2 font-semibold text-gray-900`}>
            Invoice To
          </Title>
          <Text
            className={`mb-1 text-sm font-semibold uppercase text-gray-900`}
          >
            {memberInfo.name}
          </Text>
          <Text className={`mb-1 whitespace-pre-line text-gray-700`}>
            {memberInfo.address_street ? memberInfo.address_street + ", " : ""}
            {memberInfo.address_city ? memberInfo.address_city + ", " : ""}
            {memberInfo.address_state ? memberInfo.address_state + ", " : ""}
            {memberInfo.address_zip_code
              ? memberInfo.address_zip_code + ", "
              : " "}
            {gymProfile.country}.
          </Text>
          <Text className={`mb-4 text-gray-700`}>{memberInfo.email}</Text>
          <Text className={`text-gray-700 font-semibold`}>
            Membership:{" "}
            <Text as="span">{membershipData.package_details.name}</Text>
          </Text>
        </div>
        {/* QR Code */}
        {/* <div className={`flex justify-end  ${isPDF ? "" : "max-sm:hidden "}`}>
          <QRCodeSVG
            value={`https://gymforce.in/invoice/${membershipData.id}`}
            className="h-28 w-28 lg:h-32 lg:w-32"
          />
        </div> */}
      </div>
      <div
        className={
          isPDF ? "" : "max-lg:max-w-[90vw] overflow-x-scroll custom-scrollbar "
        }
      >
        {TableComponent}
      </div>
      {dueTableComponent !== null ? (
        <WidgetCard
          title="Due Transactions"
          className={
            isPDF
              ? ""
              : "max-lg:max-w-[90vw] overflow-x-scroll custom-scrollbar !pb-4 "
          }
        >
          <div className="pt-2">{dueTableComponent}</div>
        </WidgetCard>
      ) : null}

      {/* Payment Details and Totals */}

      <div className="flex flex-col gap-6 border-t border-muted pb-4 pt-6">
        <div
          className={`grid  gap-6 ${isPDF ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
        >
          <div
            className={`flex flex-row justify-between items-start pt-0 rounded-lg ${isPDF ? "p-4" : "p-2 sm:p-4 "}  `}
          >
            <div className="space-y-3">
              <Title as="h6" className={`font-semibold text-gray-900`}>
                Payment Details
              </Title>
              <div
                className={`flex items-center ${isPDF ? "gap-8" : "gap-4 sm:gap-8"}`}
              >
                {" "}
                <div className="space-y-2">
                  <Text
                    className={`flex items-center font-semibold text-gray-700 ${!isPDF ? " max-sm:text-xs  sm:justify-between " : ""}`}
                  >
                    Payment Mode :
                    <Text
                      as="span"
                      className={`pl-1 font-semibold text-gray-700`}
                    >
                      {" " + membershipData.payment_mode_details?.name || ""}
                    </Text>
                  </Text>
                  <div
                    className={`flex items-center font-semibold ring-1 ring-green-200 rounded px-2 py-4 max-sm:p-4 max-sm:text-[13px] text-nowrap bg-green-600/10 text-green-400 ${isPDF ? "pb-8" : " max-sm:p-4 max-sm:text-[13px]"}`}
                  >
                    <Text className={isPDF ? "" : "max-sm:font-medium"}>
                      Amount Paid:
                    </Text>
                    <Text
                      as="span"
                      className={`pl-1 text-center font-bold text-green-400`}
                    >
                      {gymProfile.currency_symbol}
                      {paidAmount}
                    </Text>
                  </div>
                </div>
                {due > 0 && (
                  <div className="ml-4 space-y-2">
                    <Text className={`text-xs font-semibold text-gray-700`}>
                      Due Date:{" "}
                      <Text as="span" className={`font-medium text-gray-900`}>
                        <DateCell
                          date={new Date(membershipData.due_date)}
                          timeClassName="hidden"
                          dateFormat={getDateFormat()}
                          className="inline-block"
                        />
                      </Text>
                    </Text>
                    <Text
                      className={`flex text-sm font-semibold w-full ring-1 ring-red-200 rounded px-3 py-4 text-nowrap bg-red-600/10 text-red-400 ${isPDF ? "pb-8" : ""}`}
                    >
                      Balance Amount:{" "}
                      <Text
                        as="span"
                        className={`pl-1 text-center font-bold text-red-400 `}
                      >
                        {gymProfile.currency_symbol}
                        {due}
                      </Text>
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className={
              isPDF
                ? "space-y-1.5 w-full max-w-sm justify-self-end"
                : "space-y-4 sm:space-y-1.5 w-full max-w-sm px-2 sm:justify-self-end"
            }
          >
            <Text
              className={`flex items-center justify-between border-b border-muted pb-1.5 text-gray-700 lg:pb-3`}
            >
              Subtotal:{" "}
              <Text as="span" className={`font-semibold text-gray-900`}>
                {gymProfile.currency_symbol}
                {subtotal.toFixed(2)}
              </Text>
            </Text>
            <Text
              className={`flex items-center justify-between border-b border-muted pb-1.5 text-gray-700 lg:pb-3`}
            >
              Enrollment Fee:{" "}
              <Text as="span" className={`font-semibold text-gray-900`}>
                {" + " + gymProfile.currency_symbol}
                {enrollmentFee.toFixed(2)}
              </Text>
            </Text>
            <Text
              className={`flex items-center justify-between border-b border-muted pb-1.5 text-gray-700  lg:pb-3`}
            >
              Discount :{" "}
              <Text as="span" className={`font-semibold text-gray-900`}>
                {" - " + gymProfile.currency_symbol}
                {discount.toFixed(2)}
              </Text>
            </Text>
            {!(total === subtotal + enrollmentFee - discount) && (
              <div className="grid border-b border-muted pb-1.5 min-w-full">
                <Text
                  className={`flex text-sm items-center justify-between text-gray-700 ${!isPDF ? " pb-2 lg:pb-3" : "pb-1.5"} `}
                >
                  CGST ({((taxRate / 2) * 100).toFixed(0)}%):{" "}
                  <Text
                    as="span"
                    className={`font-medium text-sm text-gray-900`}
                  >
                    {gymProfile.currency_symbol}
                    {(tax / 2).toFixed(2)}
                  </Text>
                </Text>
                <Text
                  className={`flex text-sm items-center justify-between text-gray-700 ${!isPDF ? "  pb-2" : ""} lg:pb-3`}
                >
                  SGST ({((taxRate / 2) * 100).toFixed(0)}%):{" "}
                  <Text
                    as="span"
                    className={`font-medium  text-sm text-gray-900`}
                  >
                    {gymProfile.currency_symbol}
                    {(tax / 2).toFixed(2)}
                  </Text>
                </Text>
                <Text
                  className={`flex items-center justify-between text-gray-700 ${!isPDF ? "  pb-1" : ""} lg:pb-3`}
                >
                  Total Tax ({(taxRate * 100).toFixed(0)}%):{" "}
                  <Text as="span" className={`font-semibold text-gray-900`}>
                    {" + " + gymProfile.currency_symbol}
                    {tax.toFixed(2)}
                  </Text>
                </Text>
              </div>
            )}
            <Text
              className={`flex items-center justify-between text-base font-semibold text-gray-900`}
            >
              Grand Total:{" "}
              <Text as="span" className="font-bold">
                {gymProfile.currency_symbol}
                {total.toFixed(2)}
              </Text>
            </Text>
          </div>
        </div>
      </div>

      {/* Terms & Conditions and Signature */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Title as="h6" className={`mb-2 text-gray-900`}>
            Terms & Conditions
          </Title>
          {gymInfo.terms_and_conditions && (
            <Text className={`text-gray-700 max-w-md`}>
              {gymInfo.terms_and_conditions}
            </Text>
          )}
        </div>
        <div className=" flex items-end justify-between gap-10 justify-self-end min-w-[384px]">
          <div className="space-y-3">
            {gymInfo.signature_image && (
              <Image
                src={gymInfo.signature_image}
                alt="Signature"
                width={150}
                height={50}
              />
            )}
            <div className="mt-2 space-y-1">
              <Text className={`text-sm text-gray-700`}>
                {gymProfile.first_name + " " + gymProfile?.last_name || ""}
              </Text>
              <Text className={`font-medium text-gray-900`}>Gym Owner</Text>
            </div>
          </div>
          <Text className={`font-medium text-gray-900`}>Member Signature</Text>
        </div>
      </div>
    </div>
  );
}
