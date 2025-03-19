import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import toast from "react-hot-toast";
import { Modal, Button, Title } from "rizzui";

export default function Delete({
  modalState,
  setModalState,
  id,
}: {
  modalState: boolean;
  setModalState: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
}) {
  async function deleteLead() {
    try {
      console.log(id);
      const gymId = await retrieveGymId();
      const resp = await AxiosPrivate.delete(
        `/api/member/${id}/soft-delete/?gym_id=${gymId}`
      ).then(() => invalidateAll());
      toast.remove("Deleted Successfully ...");
      // console.log(resp);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Modal isOpen={modalState} onClose={() => setModalState(false)}>
      <div className="m-auto px-7 pt-6 pb-8">
        <Title>Are you sure to delete ?</Title>
        <div className="col-span-2 grid grid-cols-2 gap-5 mt-10">
          <Button type="reset" size="md" onClick={() => setModalState(false)}>
            No
          </Button>
          <Button
            type="submit"
            size="md"
            onClick={async () => {
              await deleteLead();
              setModalState(false);
            }}
          >
            Yes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
