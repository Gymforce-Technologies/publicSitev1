// EmailResponseModal.jsx
import { Dispatch } from "react";
import { Alert, Badge, Modal, Text } from "rizzui";

export default function EmailResponseModal({
  emailResp,
  setEmailResp,
}: {
  emailResp: any;
  setEmailResp: Dispatch<any>;
}) {
  return (
    <Modal
      isOpen={emailResp !== null}
      onClose={() => {
        setEmailResp(null);
      }}
      containerClassName="py-4"
    >
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <Alert color="success" bar>
          {emailResp?.message}
        </Alert>
        <div className="flex flex-row items-center gap-4">
          <Text>Remaining Daily Limit: </Text>
          <Badge variant="flat">{emailResp?.remaining_daily_credits}</Badge>
        </div>
        {emailResp?.members_without_email?.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            <Text>{`Member's Without Email:`}</Text>
            <div className="grid grid-cols-2 gap-3 pl-4">
              {emailResp.members_without_email.map((item: any) => (
                <div
                  className="flex flex-row gap-2 border rounded-lg p-2.5"
                  key={item.name}
                >
                  <Text className="font-bold text-primary mt-1">
                    #{item.localid}
                  </Text>
                  <div className="flex flex-col gap-1.5">
                    <Text>{item.name}</Text>
                    <Text className="text-xs">{item.phone}</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
