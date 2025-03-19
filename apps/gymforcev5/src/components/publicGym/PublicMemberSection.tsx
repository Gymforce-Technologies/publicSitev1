"use client";
import { AxiosPublic } from "@/app/[locale]/auth/AxiosPrivate";
import Loading from "@/app/[locale]/loading";
import { formatDate } from "@core/utils/format-date";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { Avatar, Badge, Text, Title, Tooltip } from "rizzui";
import WomanIcon from "@public/webp/woman-user-icon.webp";
import ManIcon from "@public/webp/man-user-icon.webp";

export default function PublicMemberSection() {
  const [data, setData] = useState<any>(null);
  // const [currentMembership, setCurrentMembership] = useState<any>(null);
  const [trainer, setTrainer] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const getBasic = async () => {
      try {
        const getToken = localStorage.getItem("member_token");
        const resp = await AxiosPublic.get(
          `https://apiv2.gymforce.in/center/basic-details/?auth=${getToken}`,
          {
            id: `Member-Details-${getToken}`,
          }
        );
        let newData = resp.data.data;
        newData = setData({
          ...newData,
          batch_id: newData.batch?.id || null,
          category_id: newData.category?.id || null,
          end_date: newData.membership_details[0]?.end_date,
        });
        const currentMembership = newData.membership_details.filter(
          (membership: any) => membership.status === "active"
        );
        // setCurrentMembership(currentMembership[0]);
        if (currentMembership) {
          setTrainer(currentMembership[0]?.trainer_details || null);
        }
        setImagePreview(newData.member_image);
      } catch (error) {
        console.log(error);
      }
    };
    getBasic();
  }, []);

  if (!data) {
    return <Loading />;
  }

  return (
    <div className="p-4 md:p-8 pt-2 md:pt-4 overflow-y-auto space-y-4 flex flex-col h-full">
      <div className="w-full flex flex-col md:flex-row items-center gap-8 bg-primary-lighter/50 dark:bg-gray-200 p-6 rounded-xl shadow-md shadow-primary-lighter dark:shadow-gray-300 relative">
        <div className="flex flex-col">
          <span className="scale-75 place-self-end">
            {/* {data?.membership_details[0].status !== "active" ? ( */}
            {data?.membership_details[0]?.status === "active" ? (
              <Badge color="success" variant="flat">
                Active
              </Badge>
            ) : data?.membership_details[0]?.status === "expired" ? (
              <Badge color="danger" variant="flat">
                Expired
              </Badge>
            ) : data?.membership_details[0]?.status === "cancelled" ? (
              <Badge color="danger" variant="flat">
                Cancelled
              </Badge>
            ) : data?.membership_details[0]?.status === "upcoming" ? (
              <Badge color="warning" variant="flat">
                Expiring soon
              </Badge>
            ) : null}
          </span>
          <div className="relative">
            {/* <Avatar
              name={data.name || "Name"}
              src={
                imagePreview ||
                data.member_image ||
                (data?.gender && data.gender[0]?.toLowerCase() === "f"
                  ? "https://images.gymforce.in/woman-user-circle-icon.png"
                  : "https://images.gymforce.in/man-user-circle-icon.png")
              }
              color="info"
              rounded="lg"
              customSize="300px"
              className="w-[150px] h-[150px] object-cover bg-primary-lighter/50 rounded-full shadow-lg ring-[6px] ring-primary/40"
            /> */}
            <Image
              alt={data.name || "Name"}
              src={
                imagePreview ||
                data.member_image ||
                (data?.gender && data.gender[0]?.toLowerCase() === "f"
                  ? WomanIcon
                  : ManIcon)
              }
              width={150}
              height={150}
              className="w-[150px] h-[150px] object-cover bg-primary-lighter/50 rounded-full shadow-lg ring-[6px] ring-primary/40"
            />
          </div>
        </div>
        <div className="flex flex-col space-y-4 text-center md:text-left">
          <Title as="h6" className="text-xl font-bold text-primary">
            {data.name}
          </Title>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-600 ">Contact:</span>
              <div>
                {data.phone ? (
                  <Link
                    href={`tel:${data.phone}`}
                    className="text-primary  hover:underline transition-colors duration-200"
                  >
                    {data.phone}
                  </Link>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-600 ">Age:</span>
              <span>{data.age || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-600 ">Started:</span>
              <span>
                {data.joining_date ? (
                  <Text className="font-semibold">
                    {formatDate(data.joining_date)}
                  </Text>
                ) : (
                  "N/A"
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col self-start  md:self-end p-4 md:p-8 gap-2"></div>
        <div className="absolute bottom-8 right-8 flex items-center">
          <MdLocationOn className="text-primary" size={20} />
          <Text className="pl-1 font-medium text-gray-600  text-base">
            {(() => {
              const address = data;
              if (!address) return "N/A";
              const components = [
                address.address_street,
                address.address_city,
                address.address_state,
                address.address_country,
              ].filter(Boolean);
              return components.length > 0
                ? components.join(", ") + "."
                : "N/A";
            })()}
          </Text>
        </div>
        {/* <div className="absolute top-8 right-8 z-10">
          <Tooltip content="Points" placement="bottom">
            <div>
              <Badge
                variant="flat"
                className="flex flex-row items-center gap-1.5 cursor-pointer scale-95"
                onClick={() =>
                  // router.push(`/member_profile/${params.id}/points`)
                }
              >
                <RiCopperCoinFill className="text-primary" size={20} />
                <Text className="text-primary font-semibold text-[15px]">
                  {points || 0}
                </Text>
              </Badge>
            </div>
          </Tooltip>
        </div> */}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:*:text-base py-4 md:py-6 lg:py-8 max-w-3xl">
        <div className="flex flex-row gap-45 items-center">
          <div className="flex items-center gap-2">
            <FaChalkboardTeacher size={24} />

            <Text className="font-semibold">Trainer :</Text>
          </div>
          <Text className="text-primary">{trainer?.name || "N/A"}</Text>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <Text className="font-semibold">Batch : </Text>
          <Text className="text-primary">{data?.batch?.name || "N/A"}</Text>
        </div>
      </div>
    </div>
  );
}
