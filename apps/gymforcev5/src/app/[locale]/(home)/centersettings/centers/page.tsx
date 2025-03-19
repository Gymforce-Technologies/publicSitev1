// "use client";
// import {
//   AxiosPrivate,
//   // invalidateAll,
//   newID,
// } from "@/app/[locale]/auth/AxiosPrivate";
// import { useEffect, useState } from "react";
// import NewCenter from "../../../../../components/centersettings/center/NewCenter";
// import WidgetCard from "@core/components/cards/widget-card";
// import AvatarCard from "@core/ui/avatar-card";
// import { Badge, Text, Title } from "rizzui";
// import { getGymId } from "@/app/[locale]/auth/InfoCookies";
// // import { useRouter } from "next/navigation";
// // import { MdOutlineSwitchAccessShortcutAdd } from "react-icons/md";
// // import { BiSolidBadge } from "react-icons/bi";
// import { IoIosStar } from "react-icons/io";

// export default function Centers() {
//   const [centers, setCenters] = useState([]);
//   // const router = useRouter();
//   const [currentGymId, setCurrentGymId] = useState("");
//   const fetchCenters = async () => {
//     try {
//       const response = await AxiosPrivate.get("/api/profile/", {
//         id: newID("user-profile"),
//       });
//       setCenters(response.data?.associated_gyms);
//       console.log(response.data);
//     } catch (error) {
//       console.error("Error fetching centers:", error);
//     }
//     const ID = await getGymId();
//     console.log("ID", ID);
//     if (ID) {
//       setCurrentGymId(ID);
//       console.log("ID", ID);
//     }
//   };
//   useEffect(() => {
//     fetchCenters();
//   }, []);

//   return (
//     <WidgetCard
//       title="Gym Centers"
//       titleClassName="leading-none "
//       headerClassName="mb-3 lg:mb-4"
//       className="max-w-4xl  my-4"
//       action={
//         <div className="flex flex-col gap-2 items-center justify-end">
//           <NewCenter onUpdate={fetchCenters} />
//         </div>
//       }
//     >
//       <div className="grid grid-cols-1 gap-5  max-h-[50vh] overflow-y-scroll custom-scrollbar">
//         {centers.map((item: any, index) => (
//           <div
//             key={index}
//             className="relative grid grid-cols-[40%,40%,20%] items-center gap-3 md:gap-5 shadow-sm p-2 sm:p-4 rounded-lg max-w-2xl"
//           >
//             {item.is_primary && (
//               <div className="absolute top-0 left-0 flex h-6 w-6 items-center justify-center rounded-full ">
//                 <IoIosStar />
//               </div>
//             )}
//             <AvatarCard
//               src="placeholder.jpg"
//               className=""
//               name={item.name}
//               description={item.business_contact_number}
//             />
//             <Title as="h6" className="">
//               {item.country}
//             </Title>
//             {currentGymId === item.gym_id.toString() ? (
//               <div className="flex items-center">
//                 <Badge color="success" renderAsDot />
//                 <Text className="ms-2 font-medium text-green-dark">Active</Text>
//               </div>
//             ) : null}
//           </div>
//         ))}
//       </div>
//     </WidgetCard>
//   );
// }

export default function Centers() {
  return <div>Centers</div>;
}
