import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FaBookReader } from "react-icons/fa";
import { Button, Drawer, Loader, Select, Title } from "rizzui";

export default function AddTrainer({
  membershipId,
  onUpdate,
  closeModal,
}: {
  membershipId: string;
  onUpdate: () => void;
  closeModal: () => void;
}) {
  const [trainers, setTrainers] = useState<any[] | null>(null);
  const [open, setOpen] = useState(true);
  const [trainer, setTrainer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const getPreReq = async () => {
    const gymId = await retrieveGymId();
    try {
      const resp = await AxiosPrivate.get(
        `/api/member/add-member-prerequisites/?gym_id=${gymId}`
      );
      setTrainers(
        resp.data.trainers.map((trainer: any) => ({
          label: trainer.name,
          value: trainer.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching prerequisites:", error);
    }
  };
  const trainerAdd = async () => {
    try {
      setIsLoading(true);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.patch(
        `/api/add-trainer/${membershipId}/?gym_id=${gymId}`,
        {
          trainer_id: trainer,
        }
      );
      invalidateAll();
      setOpen(false);
      onUpdate();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPreReq();
  }, []);
  return (
    <Drawer
      isOpen={open}
      onClose={() => {
        setOpen(false);
        closeModal();
      }}
      containerClassName="p-6 md:p-8 space-y-6"
    >
      <div className="flex items-center justify-between min-w-full">
        <Title as="h4">Assign Trainer</Title>
        <XIcon
          className="text-primary hover:scale-105 cursor-pointer"
          onClick={() => {
            setOpen(false);
            closeModal();
          }}
        />
      </div>
      {trainers !== null ? (
        <>
          <Select
            label="Trainer *"
            name="trainer"
            options={trainers}
            value={
              trainer !== null
                ? trainers.find((group) => group.value === trainer)?.label || ""
                : ""
            }
            // @ts-ignore
            onChange={(option: Option | null) => {
              console.log(option);
              setTrainer(option?.value);
            }}
            prefix={<FaBookReader className="text-primary" />}
            // labelClassName=""
            // dropdownClassName="dark:bg-gray-800 dark:border-gray-700"
            // optionClassName="dark:[&_div]:text-gray-400/80 dark:[&_div]:hover:text-gray-200 dark:hover:bg-gray-700"
            clearable
            onClear={() => {
              setTrainer(null);
            }}
          />
          <Button
            onClick={trainerAdd}
            className="flex items-center min-w-full justify-center my-4"
          >
            {isLoading ? <Loader variant="threeDot" /> : "Assign"}
          </Button>
        </>
      ) : (
        <div className="flex items-center justify-center min-w-full my-4">
          <Loader size="xl" variant="spinner" />
        </div>
      )}
    </Drawer>
  );
}
