import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Drawer, Input, Loader, Modal, Text, Title } from "rizzui";
import toast from "react-hot-toast";
import {
  DemographicInfo,
  retrieveDemographicInfo,
} from "@/app/[locale]/auth/DemographicInfo";

interface EnrollmentFee {
  id: number;
  name: string;
  amount: number;
}

export default function Edit({
  setIsEditOpen,
  fetchEnrollmentFees,
  enrollmentFee,
  setEnrollmentFee,
}: {
  setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchEnrollmentFees: () => Promise<void>;
  enrollmentFee: EnrollmentFee | null;
  setEnrollmentFee: React.Dispatch<React.SetStateAction<EnrollmentFee | null>>;
}) {
  const [editedEnrollmentFee, setEditedEnrollmentFee] = useState<EnrollmentFee>(
    {
      id: 0,
      name: "",
      amount: 0,
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [demographiInfo, setDemographiInfo] = useState<DemographicInfo | null>(
    null
  );
  useEffect(() => {
    if (enrollmentFee) {
      setEditedEnrollmentFee(enrollmentFee);
    }
  }, [enrollmentFee]);

  useEffect(() => {
    const getPreReq = async () => {
      const resp = await retrieveDemographicInfo();
      setDemographiInfo(resp);
    };
    getPreReq();
  }, []);

  const handleEditEnrollmentFee = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.put(
        `/api/enrollment-fees/${editedEnrollmentFee.id}/?gym_id=${gymId}`,
        {
          name: editedEnrollmentFee.name,
          amount: editedEnrollmentFee.amount,
        }
      );
      setIsEditOpen(false);
      invalidateAll();
      fetchEnrollmentFees();
      setEnrollmentFee(null);
      toast.success("Updated Successfully");
    } catch (error) {
      console.error("Error editing enrollment fee:", error);
      toast.error("Something went wrong while updating enrollment fee");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={true}
      onClose={() => setIsEditOpen(false)}
      size="sm"
      // containerClassName="dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex flex-col justify-between h-full">
        <div className="grid grid-cols-1 gap-3 p-4 md:p-6 ">
          <div className="flex items-center justify-between mb-2">
            <Title as="h3" className="text-gray-900 ">
              Edit Enrollment
            </Title>
            <XIcon
              onClick={() => setIsEditOpen(false)}
              className="cursor-pointer"
            />
          </div>
          <Input
            label="Name"
            value={editedEnrollmentFee.name}
            onChange={(e) =>
              setEditedEnrollmentFee((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            className="w-full"
            placeholder="Enter enrollment fee name"
            labelClassName=""
          />
          <Input
            label="Amount"
            type="number"
            value={editedEnrollmentFee.amount}
            onChange={(e) =>
              setEditedEnrollmentFee((prev) => ({
                ...prev,
                amount: parseInt(e.target.value),
              }))
            }
            className="w-full"
            placeholder="Enter enrollment fee amount"
            labelClassName=""
            prefix={
              <Text className="text-primary">
                {demographiInfo?.currency_symbol}
              </Text>
            }
          />
        </div>
        <div className="flex justify-center items-center p-6">
          <Button onClick={handleEditEnrollmentFee} className="w-full">
            {isLoading ? <Loader variant="threeDot" /> : "Update"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
