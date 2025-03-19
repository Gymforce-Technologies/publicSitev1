'use client'
import Leads from "../../../../components/leads/Leads";
import { Source, Status } from "../../../../components/leads/LeadTypes";
import { useEffect, useState } from "react";
import { AxiosPrivate, newID } from "@/app/[locale]/auth/AxiosPrivate";
import { retrieveGymId } from "../../auth/InfoCookies";
import { Category } from "../../../../components/leads/EditLeads";

const LeadsPage=()=>{
    const [category,setCategory]=useState<Category[]>([])
    const [source,setSource]=useState<Source[]>([])
    const [status,setStatus]=useState<Status[]>([])
    const [contactType, setContactType] = useState([]);

    useEffect(() => {
        async function getData() {
          try {
            const gymId = await retrieveGymId();
            const resp = await AxiosPrivate.get(`/api/visitors/add-visitor-prerequisites/?gym_id=${gymId}`,{
              id:newID('visitor-prerequisites'),
            });
            setCategory(resp.data.data.categoryList);
            setSource(resp.data.data.sourceList);
            setStatus(resp.data.data.statusList);    
            const concatcontactType = resp.data.data.contact_type.map(
              (item: any) => {
                return { label: item.key, value: item.key };
              }
            );
            console.log(concatcontactType);
            setContactType(concatcontactType);        
          } catch (error) {
            console.log(error);
          }
        }
        getData();
      }, []);
    return(
        <Leads category={category} source={source} status={status} contactType={contactType}/>
    )
}

export default LeadsPage;