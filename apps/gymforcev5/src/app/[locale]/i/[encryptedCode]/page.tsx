"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Title, Text, Button } from "rizzui";
import Table from "@/app/shared/table";

// import { useTheme } from "next-themes";
import { usePDF } from "react-to-pdf";
import { useParams } from "next/navigation";

import { formatDate } from "@core/utils/format-date";
// import { IoMdPersonAdd } from "react-icons/io";
// import { PiArrowCircleLeft } from "react-icons/pi";
import Loading from "@/app/[locale]/loading";
import DateCell from "@core/ui/date-cell";
import { MdOutlineFileDownload } from "react-icons/md";
import AvatarCard from "@core/ui/avatar-card";
// import { getDateFormat } from "../../auth/DateFormat";
import { AxiosPublic } from "../../auth/AxiosPrivate";
import dayjs from "dayjs";

interface MembershipData {
  id: number;
  package_details: {
    name: string;
    num_of_days: number; // Changed from no_of_days
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
  due_date: string | null;
  discounted_amount: string;
  actual_amount: string;
  start_date: string;
  end_date: string;
  sessions_allocated: number;
  // Additional fields from response if needed
}

interface MemberInfo {
  name: string;
  email: string;
  address_street: string;
  address_city: string;
  address_state: string;
  phone: string; // Add this as it's in the response
  member_image: string; // Add this as it's in the response
}

interface GymProfile {
  currency_symbol: string;
  first_name: string;
  gym_id: number; // Changed from string to number based on response
  logo: string;
  gym_name: string;
  email: string;
  ownerSignature: string;
  termsAndCondition: string | null;
  gst_company: string | null;
  gst_number: string | null;
  // }>;
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
  // const [enrollmentFees, setEnrollmentFees] = useState<EnrollmentFee[]>([]);
  const [gymProfile, setGymProfile] = useState<GymProfile | null>(null);
  // const router = useRouter();
  const params = useParams();
  // const searchParams = useSearchParams();
  const encryptedCode = params.encryptedCode as string;
  // const membershipId = (params.invoiceId as string).split("-")[1];
  // const member = searchParams.get("member")?.split("-")[1];
  // const page = searchParams.get("page");
  const [curGym, setCurGym] = useState<string | null>(null);
  const { toPDF, targetRef } = usePDF({
    filename: `invoice_${encryptedCode}.pdf`,
  });

  useEffect(() => {
    if (encryptedCode) {
      fetchData();
    }
  }, [encryptedCode]);

  const fetchData = async () => {
    // const gym_id = 1;
    try {
      const url = process.env.NEXT_PUBLIC_API_URL;
      const newInvoicePublic = await AxiosPublic.get(
        `${url}/api/invoice/${encryptedCode}`
      );
      console.log(newInvoicePublic.data);
      const MembershipDetails: MembershipData = {
        id: newInvoicePublic.data.package_details.id,
        sessions_allocated:
          newInvoicePublic.data.package_details.sessions_allocated,
        package_details: {
          name: newInvoicePublic.data.package_details.name,
          num_of_days: newInvoicePublic.data.package_details.num_of_days,
        },
        actual_amount: newInvoicePublic.data.actual_amount,
        discounted_amount: newInvoicePublic.data.discounted_amount || 0,
        created_at: newInvoicePublic.data.created_at,
        due: newInvoicePublic.data.due,
        due_date: newInvoicePublic.data.due_date,
        end_date: newInvoicePublic.data.end_date,
        start_date: newInvoicePublic.data.start_date,
        enrollment_fee:
          newInvoicePublic.data.enrollment_fee_details?.amount || 0,
        offer_price: newInvoicePublic.data.offer_price,
        paid_amount: newInvoicePublic.data.paid_amount,
        payment_mode_details: {
          name: newInvoicePublic.data.payment_mode_details.name,
        },
        dues_transactions:
          newInvoicePublic.data.dues_transactions &&
          newInvoicePublic.data.dues_transactions.map((item: any) => ({
            amount: item.amount,
            payment_date: item.payment_date,
            payment_mode: item.payment_mode,
          })),
      };
      const MemberInfoResp: MemberInfo = {
        name: newInvoicePublic.data.member_details.name,
        email: newInvoicePublic.data.member_details.email,
        address_city: newInvoicePublic.data.member_details.address_city,
        // address_country:"",
        member_image: newInvoicePublic.data.member_details.member_image,
        phone: newInvoicePublic.data.member_details.phone,
        // newInvoicePublic.data.address_country,
        address_state: newInvoicePublic.data.member_details.address_state,
        address_street: newInvoicePublic.data.member_details.address_street,
        // address_zip_code: "",
      };
      const GymProfileRsp: GymProfile = {
        // city: "City",
        gym_id: newInvoicePublic.data.gym_details.id,
        // name: "GymName",
        // business_contact_number: "717171711",
        gym_name: newInvoicePublic.data.gym_details.name,
        email: newInvoicePublic.data.gym_details.email,
        logo: newInvoicePublic.data.gym_image,
        ownerSignature: newInvoicePublic.data.signature,
        termsAndCondition: newInvoicePublic.data.termsAndCondition,
        // country: "Country",
        currency_symbol: newInvoicePublic.data.currency,
        // email: newInvoicePublic.data.created_by_info.email,
        first_name: newInvoicePublic.data.created_by_info.name,
        gst_company: newInvoicePublic.data.gym_details.gst_company,
        gst_number: newInvoicePublic.data.gym_details.gst_number,
        // last_name: "",
        // state: "Street",
        // street: "Street",
        // zip_code: "ZIP",
      };
      setGymProfile(GymProfileRsp);
      setMemberInfo(MemberInfoResp);
      setMembershipData(MembershipDetails);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  if (!membershipData || !memberInfo || !gymProfile) {
    return <Loading />;
  }

  const gymInfo = {
    name: gymProfile.gym_name,
    // address: `${memberInfo.address_street ? memberInfo.address_street + ", " : ""}${memberInfo.address_city ? memberInfo.address_city + ", " : ""}${memberInfo.address_state ? memberInfo.address_state + ", " : ""}`,
    email: gymProfile.email,
    // phone: gymProfile.business_contact_number,
    logo: gymProfile.logo || "",
    terms_and_conditions: gymProfile.termsAndCondition || "",
    signature_image: gymProfile.ownerSignature || "",
    gst_company: gymProfile.gst_company || "",
    gst_number: gymProfile.gst_number || "",
  };
  const enrollmentFee = membershipData.enrollment_fee;
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
      received_by: gymProfile.first_name,
      session_allocated: membershipData?.sessions_allocated.toString() || "N/A",
    },
  ];

  const subtotal = membershipData.offer_price - enrollmentFee;
  // const amount
  const taxRate = 0.18; // 0% tax rate
  const discounted_amount = parseInt(
    membershipData.discounted_amount ? membershipData.discounted_amount : "0"
  );

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
          // dateFormat={getDateFormat()}
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
          // dateFormat={getDateFormat()}
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
      width: 180,
      render: (amount: string) => (
        <Text className="text-[15px] font-semibold">{amount}</Text>
      ),
    },
    {
      title: "Date",
      dataIndex: "payment_date",
      key: "payment_date",
      width: 120,
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
  ];

  return (
    <div className="flex flex-col justify-center items-center my-4 max-sm:mx-2 ">
      <div className="flex flex-row justify-between items-center w-full my-4 max-w-4xl max-sm:px-4">
        <AvatarCard
          name={memberInfo.name}
          src={memberInfo.member_image}
          description="Invoice Details"
          className="sm:scale-125"
        />
        <Button
          // size="sm"
          variant="solid"
          color="primary"
          onClick={() => toPDF()}
          className="flex flex-row  items-center gap-2 self-end"
          // prefix={}
        >
          <MdOutlineFileDownload size={20} />
          <Text className="max-sm:hidden">Download PDF</Text>
        </Button>
        {/* </div> */}
      </div>
      <div className="">
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
          discount={discounted_amount ?? 0}
          className=""
        />
      </div>

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
              className="mb-10 [&_.rc-table-thead_tr_th]:pb-6 "
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
          discount={discounted_amount ?? 0}
          className="border-none"
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
  isPDF = false,
}: {
  TableComponent: any;
  dueTableComponent: any;
  membershipData: MembershipData;
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
          <Title as="h6" className={` text-gray-900 `}>
            INV-#{gymProfile.gym_id}
            {formatDate(new Date(membershipData.created_at), "YYYYMMDD")}-
            {membershipData.id}
          </Title>
          <Text className={`mt-1 text-gray-700 font-medium`}>
            {gymInfo?.gst_number || ""},
          </Text>
          <Text className={` text-gray-700 font-medium`}>
            {gymInfo?.gst_company || ""}.
          </Text>{" "}
        </div>
      </div>

      {/* Invoice Details */}
      <div
        className={`mb-8 grid gap-6 ${isPDF ? "grid-cols-3" : " sm:grid-cols-2 lg:grid-cols-3"}`}
      >
        {/* Pay To */}
        <div className={isPDF ? "" : "*:max-sm:text-sm"}>
          <Title as="h6" className={`mb-2 font-semibold text-gray-900 `}>
            Pay To
          </Title>
          <Text
            className={`mb-1 text-sm font-semibold uppercase text-gray-900 `}
          >
            {gymInfo.name}
          </Text>
          {/* <Text className="mb-1 whitespace-pre-line text-gray-700 ">
            {gymInfo.address}
          </Text> */}
          <Text className={`mb-4 text-gray-700 `}>{gymInfo.email}</Text>
          <Text className={`text-sm font-semibold text-gray-900 `}>
            Invoice Date
          </Text>
          <Text className={`text-gray-700 `}>
            {/* {new Date(membershipData.created_at).toLocaleDateString()} */}
            <DateCell
              date={new Date(membershipData.created_at)}
              timeClassName="hidden"
              // dateFormat={getDateFormat()}
            />
          </Text>
        </div>

        {/* Invoice To */}
        <div className={isPDF ? "" : "*:max-sm:text-sm"}>
          <Title as="h6" className={`mb-2 font-semibold text-gray-900 `}>
            Invoice To
          </Title>
          <Text
            className={`mb-1 text-sm font-semibold uppercase text-gray-900 `}
          >
            {memberInfo.name}
          </Text>
          <Text className={`mb-4 text-gray-700 `}>{memberInfo.email}</Text>
          <Text className={`text-gray-700  font-semibold`}>
            Membership:{" "}
            <Text as="span">{membershipData.package_details.name}</Text>
          </Text>
        </div>

        {/* QR Code */}
        <div className={`flex justify-end  ${isPDF ? "" : "max-sm:hidden "}`}>
          <QRCodeSVG
            value={`https://gymforce.in/invoice/${membershipData.id}`}
            className="h-28 w-28 lg:h-32 lg:w-32"
          />
        </div>
      </div>
      <div
        className={
          isPDF ? "" : "max-lg:max-w-[90vw] overflow-x-scroll custom-scrollbar "
        }
      >
        {TableComponent}
      </div>
      {/* {dueTableComponent} */}
      {/* <div className={isPDF?"":"max-lg:max-w-[90vw] overflow-x-scroll custom-scrollbar "}>{dueTableComponent}</div> */}

      {/* Payment Details and Totals */}
      <div className="flex flex-col gap-6 border-t border-muted pb-4 pt-6">
        <div
          className={`grid  gap-6 ${isPDF ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
        >
          <div
            className={`flex flex-row justify-between items-start pt-0 rounded-lg ${isPDF ? "p-4" : "p-2 sm:p-4 "}  `}
          >
            <div className="space-y-3">
              <Title
                as="h6"
                className={`font-semibold text-gray-900 ${!isPDF ? "  max-sm:text-sm " : ""}`}
              >
                Payment Details
              </Title>
              <div
                className={`flex items-center ${isPDF ? "gap-8" : "gap-4 sm:gap-8"}`}
              >
                <div className="space-y-2">
                  <Text
                    className={`flex items-center font-semibold text-gray-700 ${!isPDF ? " max-sm:text-xs  sm:justify-between " : ""}`}
                  >
                    Payment Mode :
                    <Text
                      as="span"
                      className={`pl-1 font-semibold text-gray-700 `}
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
                      className={`pl-1  text-center font-bold text-green-400`}
                    >
                      {gymProfile.currency_symbol}
                      {paidAmount}
                    </Text>
                  </div>
                </div>
                {due > 0 && membershipData.due_date && (
                  <div className="ml-4 space-y-2">
                    <Text className={`text-xs font-semibold text-gray-700 `}>
                      Due Date:{" "}
                      <Text as="span" className={`font-medium text-gray-900 `}>
                        <DateCell
                          date={new Date(membershipData.due_date)}
                          timeClassName="hidden"
                          // dateFormat={getDateFormat()}
                          className="inline-block"
                        />
                      </Text>
                    </Text>
                    <div
                      className={`flex text-sm font-semibold  w-full ring-1 ring-red-200 rounded px-3 py-4  text-nowrap bg-red-600/10 text-red-400 ${isPDF ? "pb-8" : "max-sm:p-4 max-sm:text-[13px]"}`}
                    >
                      <Text className={isPDF ? "" : "max-sm:font-medium"}>
                        Balance Amount:{" "}
                      </Text>
                      <Text
                        as="span"
                        className={`pl-1  text-center font-bold text-red-400 `}
                      >
                        {gymProfile.currency_symbol}
                        {due}
                      </Text>
                    </div>
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
              className={`flex items-center justify-between border-b border-muted pb-1.5 text-gray-700  lg:pb-3`}
            >
              Subtotal:{" "}
              <Text as="span" className={`font-semibold text-gray-900 `}>
                {gymProfile.currency_symbol}
                {subtotal.toFixed(2)}
              </Text>
            </Text>
            <Text
              className={`flex items-center justify-between border-b border-muted pb-1.5 text-gray-700  lg:pb-3`}
            >
              Enrollment Fee:{" "}
              <Text as="span" className={`font-semibold text-gray-900 `}>
                {" + " + gymProfile.currency_symbol}
                {enrollmentFee.toFixed(2)}
              </Text>
            </Text>
            <Text
              className={`flex items-center justify-between border-b border-muted pb-1.5 text-gray-700   lg:pb-3`}
            >
              Discount :{" "}
              <Text as="span" className={`font-semibold text-gray-900 `}>
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
                    className={`font-medium text-sm text-gray-900 `}
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
                    className={`font-medium  text-sm text-gray-900 `}
                  >
                    {gymProfile.currency_symbol}
                    {(tax / 2).toFixed(2)}
                  </Text>
                </Text>
                <Text
                  className={`flex items-center justify-between text-gray-700 ${!isPDF ? "  pb-1" : ""} lg:pb-3`}
                >
                  Total Tax ({(taxRate * 100).toFixed(0)}%):{" "}
                  <Text as="span" className={`font-semibold text-gray-900 `}>
                    {" + " + gymProfile.currency_symbol}
                    {tax.toFixed(2)}
                  </Text>
                </Text>
              </div>
            )}
            <Text
              className={`flex items-center justify-between text-base font-semibold text-gray-900 `}
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
          <Title as="h6" className={`mb-2 text-gray-900 `}>
            Terms & Conditions
          </Title>
          {gymInfo.terms_and_conditions && (
            <Text className={`text-gray-700  max-w-md`}>
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
              <Text className={`text-sm text-gray-700 `}>
                {gymProfile.first_name}
              </Text>
              <Text className={`font-medium text-gray-900 `}>Gym Owner</Text>
            </div>
          </div>
          <Text className={`font-medium text-gray-900 `}>Member Signature</Text>
        </div>
      </div>
    </div>
  );
}
