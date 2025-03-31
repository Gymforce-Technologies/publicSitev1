"use client";

import { AxiosPublic } from "@/app/[locale]/auth/AxiosPrivate";
import { COUNTRY_MAPPINGS } from "@/app/[locale]/auth/Countries";
import Loading from "@/app/[locale]/loading";
import FeedbackModal from "@/components/public-page/FeedBack";
// import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArrowRight,
  FaFacebook,
  FaIdBadge,
  FaInstagram,
  FaSquarePhone,
} from "react-icons/fa6";
import { MdFeedback } from "react-icons/md";
import {
  AdvancedRadio,
  Avatar,
  Button,
  Input,
  Text,
  Title,
  Tooltip,
} from "rizzui";
import { setMemberToken } from "./Member";
import PublicHeader from "./PublicHeader";

export default function PublicLoginSection() {
  const { code } = useParams();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gymId, setGymId] = useState<any>(null);
  const [typeVal, setTypeVal] = useState<"phone" | "id">("phone");
  const [value, setValue] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    let data;
    if (typeVal === "phone") {
      const code = COUNTRY_MAPPINGS[initialData.country].std_code;
      data = {
        phone: `${code}${value}`,
      };
    } else {
      data = {
        localid: value,
      };
    }
    try {
      const resp = await AxiosPublic.post(
        `/center/verify-member/${gymId}/`,
        {
          ...data,
        }
      ).then((resp) => {
        console.log(resp);
        setMemberToken(resp.data.token);
        toast.success("Logged In successfully");
        setLoading(true);
        router.push(`/${code}/member`);
      });
    } catch (error) {
      console.error("Error verifying member:", error);
      toast.error("Failed to verify member");
    }
  };

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const resp = await AxiosPublic.get(
          `/center/initial/${code}/`,
          {
            id: `Gym-${code}`,
          }
        );
        setInitialData(resp.data);
        setGymId(resp.data.id);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching gym data:", error);
        setLoading(false);
        toast.error("Failed to load gym data");
      }
    };

    getInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {loading || !initialData ? (
        <Loading />
      ) : (
        <>
          {/* Header Section */}
          <div className="bg-primary text-gray-100 py-3 md:py-6 sticky top-0 z-[99999]">
            <PublicHeader
              initialData={initialData}
              setIsModalOpen={setIsModalOpen}
            />
          </div>
        </>
      )}
      <div className="grid gap-8 lg:gap-10 grid-cols-1 min-w-full h-full justify-center items-center py-10 lg:py-12">
        <Title as="h2" className="text-center">
          Login
        </Title>
        {/* <Input name="" /> */}
        <div className="flex items-center justify-center">
          <div className=" border p-6 lg:p-10 rounded-xl shadow grid grid-cols-1 gap-5 md:gap-[30px] min-w-[90%] md:min-w-[500px]">
            <div className="grid grid-cols-1 gap-3">
              <Title as="h5" className="font-semibold mb-[-2]">
                Select Login Type
              </Title>
              <div className="flex flex-row gap-6 items-center ">
                <AdvancedRadio
                  value={typeVal}
                  onClick={() => setTypeVal("phone")}
                  contentClassName="flex flex-row items-center gap-2 p-2"
                  alignment="center"
                  checked={typeVal === "phone"}
                  size="sm"
                >
                  <FaSquarePhone size={18} />
                  <Text>Phone</Text>
                </AdvancedRadio>
                <AdvancedRadio
                  value={typeVal}
                  alignment="center"
                  checked={typeVal === "id"}
                  onClick={() => setTypeVal("id")}
                  contentClassName="flex flex-row items-center gap-2 p-2"
                  size="sm"
                >
                  <FaIdBadge size={18} />
                  <Text>Member ID</Text>
                </AdvancedRadio>
              </div>
            </div>
            <Input
              type={typeVal === "phone" ? "tel" : "text"}
              placeholder={
                typeVal === "phone"
                  ? "Enter your phone number"
                  : "Enter your member ID"
              }
              size="lg"
              labelClassName="text-[15px] font-medium"
              label={typeVal === "phone" ? "Phone" : "Member ID"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button
              onClick={() => handleSubmit()}
              disabled={value.length === 0}
            >
              <div className="flex flex-row gap-4 items-center ">
                <Text className="font-medium">
                  Login to {initialData?.name || "GymForce Gym"}
                </Text>
                <FaArrowRight />
              </div>
            </Button>
          </div>
        </div>
      </div>
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        gymId={gymId}
      />
    </div>
  );
}
