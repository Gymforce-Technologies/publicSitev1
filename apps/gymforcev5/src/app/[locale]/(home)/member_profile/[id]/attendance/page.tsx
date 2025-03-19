// import Attendance from "../../../members/_components/member-profile/Attendance";

import Attendance from "@/components/member-list/members/member-profile/Attendance";

export default function AttendancePage({params}:{params :{id:string}}){
    const newId=params.id.toString().split("-")[1];

    return(
        <div>
              <Attendance id={newId} />
        </div>
    )
}