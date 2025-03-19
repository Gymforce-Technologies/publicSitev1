import { Empty } from "rizzui";
import { FollowUpType, MemberFollowUp } from "./FollowUps";
import FollowUpCard from "./FollowUpCard";

const FollowUpCardList = ({
  followUpType,
  followUp,
  memberFollowUp,
  onViewHistory,
  onEdit,
  onAdd,
  onConvert,
  isValid,
  auth,
  packages,
  paymentModes,
  refreshData,
  access,
}: {
  followUpType: "Enq" | "Member";
  followUp: FollowUpType[];
  memberFollowUp: MemberFollowUp[] | null;
  onViewHistory: (id: number) => void;
  onEdit: (id: number) => void;
  onAdd: (id: number, data?: FollowUpType | MemberFollowUp) => void;
  onConvert?: (lead: any) => void;
  isValid: boolean;
  auth: boolean;
  packages?: any[];
  paymentModes?: any[];
  refreshData: () => void;
  access: boolean;
}) => {
  const data = followUpType === "Enq" ? followUp : memberFollowUp || [];

  return (
    <div>
      {data.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-6 md:gap-8  p-1.5 sm:p-6 md:p-8 lg:grid-cols-3 w-full">
          {data.map((item) => (
            <FollowUpCard
              key={item.id}
              data={item}
              type={followUpType}
              onViewHistory={onViewHistory}
              onEdit={onEdit}
              onAdd={onAdd}
              onConvert={onConvert}
              isValid={isValid}
              auth={auth}
              packages={packages}
              paymentModes={paymentModes}
              refreshData={refreshData}
              access={access}
            />
          ))}
        </div>
      ) : (
        <Empty
          text={
            followUpType === "Enq" ? "No Enquiries" : "No Member Follow-ups"
          }
        />
      )}
    </div>
  );
};

export default FollowUpCardList;
