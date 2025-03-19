import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { Modal, Button, Title } from "rizzui";

export default function Delete({
  modalState,
  setModalState,
  id,
  getData,
}: {
  modalState: boolean;
  setModalState: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  getData: () => void;
}) {
  async function deleteLead() {
    console.log(id);
    const gymId = await retrieveGymId();
    const resp = await AxiosPrivate.delete(
      `/api/delete-visitor/${id}/?gym_id=${gymId}`
    ).then(async () => {
      invalidateAll();
      getData();
    });
  }
  return (
    <Modal isOpen={modalState} onClose={() => setModalState(false)}>
      <div className="m-auto p-6 md:p-8">
        <Title as="h4">Are you sure to delete ?</Title>
        <div className="col-span-2 grid grid-cols-2 gap-5 mt-6 md:mt-8">
          <Button
            type="reset"
            size="md"
            variant="outline"
            onClick={() => setModalState(false)}
          >
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
