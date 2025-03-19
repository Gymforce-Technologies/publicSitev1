import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { isStaff } from "@/app/[locale]/auth/Staff";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import { TbInfoTriangle } from "react-icons/tb";
import { Button, Loader, Modal, Text, Title } from "rizzui";

interface DeleteAllModalProps {
  ids: number[];
  onUpdate: () => void;
  type: "Member" | "Enquiry" | "Expense" | "Staff";
}

export const DeleteAllModal: React.FC<DeleteAllModalProps> = ({
  ids,
  onUpdate,
  type,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lockDelete, setLockDelete] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();
  const [staffType, setStaffType] = useState<string>("");
  const [isStaff, setIsStaff] = useState<boolean>(false);

  useEffect(() => {
    const getStatus = async () => {
      checkUserAccess().then((status) => {
        setIsValid(status !== "Restricted");
      });
    };
    getStatus();
  }, []);

  useEffect(() => {
    const type = sessionStorage.getItem("staffType");
    setStaffType(type?.replace(/"/g, "").toLowerCase() || "");
    const isStaffVal = sessionStorage.getItem("isStaff");
    console.log(isStaffVal);
    setIsStaff(isStaffVal === "true");
  }, []);

  const getEndpointAndPayload = (
    type: "Member" | "Enquiry" | "Expense" | "Staff",
    ids: number[],
    gymId: string
  ) => {
    const endpoints = {
      Member: `/api/member/soft-delete-multiple/?gym_id=${gymId}`,
      Enquiry: `/api/visitors/soft-delete-multiple/?gym_id=${gymId}`,
      Expense: `api/delete-expense/soft-delete-multiple/?gym_id=${gymId}`,
      Staff: `/api/staff/soft-delete-multiple/?gym_id=${gymId}`,
    };

    const payloads = {
      Member: { member_ids: ids },
      Enquiry: { enquiry_ids: ids },
      Expense: { expense_ids: ids },
      Staff: { staff_ids: ids },
    };

    return {
      endpoint: endpoints[type],
      payload: payloads[type],
    };
  };

  const handleDelete = async () => {
    if (ids.length === 0) {
      toast.error("No items selected for deletion");
      return;
    }

    try {
      setLockDelete(true);
      const gymId = await retrieveGymId();
      const { endpoint, payload } = getEndpointAndPayload(
        type,
        ids,
        gymId ?? ""
      );

      await AxiosPrivate.post(endpoint, payload).then(() => invalidateAll());
      toast.success(`Selected ${type}s deleted successfully`);
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error(`Something went wrong while deleting selected ${type}s`);
    } finally {
      setLockDelete(false);
    }
  };

  return (
    <>
      <Button
        // variant="flat"
        onClick={() => {
          if (
            isStaff &&
            staffType &&
            staffType !== "admin" &&
            staffType !== "manager"
          ) {
            toast.error("You are not Authorized");
            return;
          }
          if (!isValid) {
            toast.error("Please Subscribe to Proceed Further");
            router.push("/subscription/plans");
            return;
          }
          if (ids.length === 0) {
            toast.error("Please select items to delete");
            return;
          }
          setIsOpen(true);
        }}
        className="flex flex-row gap-2 items-center justify-start font-medium duration-300 hover:scale-105 "
        color="danger"
      >
        <MdDelete size={20} />
        <Text>Delete Selected ({ids.length})</Text>
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        containerClassName="dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="m-auto p-6 md:p-8">
          <div className="flex flex-row justify-between items-center">
            <Title as="h3" className="my-3 dark:text-gray-200">
              Delete Selected {type}s
            </Title>
            <XIcon
              className="h-6 w-6 cursor-pointer dark:text-gray-200"
              onClick={() => setIsOpen(false)}
            />
          </div>
          <p className="font-medium mb-4 dark:text-gray-400">
            Are you sure you want to Delete {ids.length} selected {type}(s)?
          </p>
          <div className="flex flex-row gap-2 flex-nowrap items-center transition-all duration-200 dark:text-gray-300">
            <TbInfoTriangle size={20} className="peer" />
            <Text className="text-xs">You can restore them when needed</Text>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="solid"
              onClick={handleDelete}
              disabled={lockDelete}
            >
              {lockDelete ? (
                <Loader variant="threeDot" />
              ) : (
                `Delete ${ids.length} ${type}(s)`
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
