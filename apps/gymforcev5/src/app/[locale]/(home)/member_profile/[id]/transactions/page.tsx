// import Transactions from "../../../members/_components/member-profile/Transactions";

import Transactions from "@/components/member-list/members/member-profile/Transactions";

export default function TransactionPage({params}:{params :{id:string}}){
    const newId=params.id.toString().split("-")[1];

    return(
        <div>
              <Transactions id={newId} />
        </div>
    )
}