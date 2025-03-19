'use client'
import { useEffect, useState } from "react";
// import Attachments from "../../../members/_components/member-profile/Attachments";
import { checkUserAccess } from "@/app/[locale]/auth/Trail";
import Attachments from "@/components/member-list/members/member-profile/Attachments";

export default function AttachmentsPage({params}:{params :{id:string}}){
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
            <Attachments id={newId} isValid={isValid}/>
        </div>
    )
}