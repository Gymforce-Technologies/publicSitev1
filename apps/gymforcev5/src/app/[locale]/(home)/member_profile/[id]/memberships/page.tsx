'use client';
import { useEffect, useState } from "react";
// import Membership from "../../../members/_components/member-profile/Membership";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";
import Membership from "@/components/member-list/members/member-profile/Membership";

export default function Memberships({params}:{params :{id:string}}){
    const newId=params.id.toString().split("-")[1];
    const [isValid, setIsValid] = useState(false);
    
    useEffect(()=>{
        const getStatus=async()=>{
          checkUserAccess().then((status) => {
            console.log(status);
            if (status !== "Restricted") {
              setIsValid(true);
            } else {
              setIsValid(false);
            }
          });}
        getStatus();
    },[]);

    return(
        <div>
            <Membership id={newId} isValid={isValid} />
        </div>
    )
}