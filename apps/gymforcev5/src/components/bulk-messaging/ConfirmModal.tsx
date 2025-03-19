import { Alert, Button, Loader, Modal } from "rizzui";

export default function ConfirmModal({
  showConfirm,
  changeConfirm,
  subLoading,
  newTemplate,
  memberIds,
  waTemplate,
  handleBulkEmailFinal,
  handleBulkWAFinal,
}: {
  showConfirm: "email" | "wa" | null;
  changeConfirm: (type: "email" | "wa" | null) => void;
  subLoading: boolean;
  newTemplate: {
    subject: string;
    content: string;
    member_type: string;
  };
  waTemplate: {
    content: string;
    member_type: string;
    schedule_time: string;
  };
  memberIds: any[];
  handleBulkEmailFinal: () => Promise<void>;
  handleBulkWAFinal: () => Promise<void>;
}) {
  return (
    <Modal
      isOpen={showConfirm !== null}
      onClose={() => {
        changeConfirm(null);
      }}
      containerClassName="p-4 md:py-8"
    >
      <div className="flex flex-col gap-6 p-4 ">
        <Alert color="info" bar className="capitalize">
          Are you sure you want to send
          {showConfirm === "email"
            ? ` Email to ${newTemplate.member_type === "selected" && memberIds.length ? memberIds.length : newTemplate.member_type} Member(s)`
            : `WhatsApp Message to ${waTemplate.member_type === "selected" && memberIds.length ? memberIds.length : waTemplate.member_type} Member(s)`}
          ?
        </Alert>
        <div className="flex flex-row items-center gap-4 justify-end">
          <Button
            onClick={async () => {
              if (showConfirm === "email") {
                await handleBulkEmailFinal();
              } else {
                await handleBulkWAFinal();
              }
              changeConfirm(null);
            }}
          >
            {subLoading ? <Loader variant="threeDot" /> : "Yes"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              changeConfirm(null);
            }}
          >
            No
          </Button>
        </div>
      </div>
    </Modal>
  );
}
