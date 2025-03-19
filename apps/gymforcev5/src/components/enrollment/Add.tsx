import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { DemographicInfo, retrieveDemographicInfo } from "@/app/[locale]/auth/DemographicInfo";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button, Drawer, Input, Loader, Modal, Text, Title } from "rizzui";

interface NewEnrollmentFee {
  name: string;
  amount: number;
}

export default function Add({
  setIsCreateModalOpen,
  fetchEnrollmentFees,
}: {
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchEnrollmentFees: () => Promise<void>;
}) {
  const [newEnrollmentFee, setNewEnrollmentFee] = useState<NewEnrollmentFee>({
    name: "",
    amount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [demographiInfo, setDemographiInfo] = useState<DemographicInfo|null>(null);

  const handleCreateEnrollmentFee = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      await AxiosPrivate.post(`/api/enrollment-fees/?gym_id=${gymId}`, newEnrollmentFee);
      setIsCreateModalOpen(false);
      setNewEnrollmentFee({ name: "", amount: 0 });
      invalidateAll();
      fetchEnrollmentFees();
      toast.success("New Enrollment Fee Added Successfully")
    } catch (error) {
      console.error("Error creating enrollment fee:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(()=>{
    const getPreReq=async()=>{
      const resp= await retrieveDemographicInfo();
      setDemographiInfo(resp);
    }
    getPreReq();
  },[])
  return (
    <Drawer
      isOpen={true}
      onClose={() => setIsCreateModalOpen(false)}
      size="sm"
      // containerClassName="dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="flex flex-col justify-between h-full">

      <div className="grid grid-cols-1 gap-3 p-4 md:p-6 ">
        <div className="flex items-center justify-between mb-2">
          <Title as="h3" className="text-gray-900">
            Add Enrollment Fee
          </Title>
          <XIcon onClick={() => setIsCreateModalOpen(false)} className="cursor-pointer" />
        </div>
        <Input
          label="Name"
          value={newEnrollmentFee.name}
          onChange={(e) => setNewEnrollmentFee((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full"
          placeholder="Enter the Name"
          labelClassName=""
        />
        <Input
          label="Amount"
          type="number"
          value={newEnrollmentFee.amount===0?"":newEnrollmentFee.amount}
          onChange={(e) => setNewEnrollmentFee((prev) => ({ ...prev, amount: parseInt(e.target.value) }))}
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
          <Button
            onClick={handleCreateEnrollmentFee}
            className="w-full"
          >
            {isLoading ? <Loader variant="threeDot"/> : 'Create'}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}