import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { isStaff } from "@/app/[locale]/auth/Staff";
import DeletePopover from "@core/components/delete-popover";
import toast from "react-hot-toast";

const DeletePop = ({
  id,
  onUpdate,
}: {
  id: string;
  onUpdate: () => Promise<void>;
}) => {
  // const router = useRouter();

  return (
    <DeletePopover
      title={`Delete the membership`}
      description={`Are you sure you want to delete this Package?`}
      onDelete={async () => {
        const staff = await isStaff();
        if (staff) {
          return toast.error("You are not Authorized");
        }
        try {
          const gymId = await retrieveGymId();
          const resp = await AxiosPrivate.delete(
            `/api/master-packages/${id}/?gym_id=${gymId}`
          ).then(() => {
            invalidateAll();
            onUpdate();
          });
          toast.success("Deleted Successfully ...");
        } catch (error) {
          console.log(error);
        }
      }}
    />
  );
};
export default DeletePop;
