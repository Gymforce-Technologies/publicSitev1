"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Text, Input } from "rizzui";
import toast from "react-hot-toast";

import FormGroup from "@/app/shared/form-group";
import FormFooter from "@core/components/form-footer";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import {
  AxiosPrivate,
  invalidateAll,
  newID,
} from "@/app/[locale]/auth/AxiosPrivate";
import {
  FaAt,
  FaInstagram,
  FaLocationDot,
  FaSquareFacebook,
  FaYoutube,
} from "react-icons/fa6";

interface FormData {
  website_url?: string;
  instagram_url?: string;
  google_direction_url?: string;
  facebook_url?: string;
  youtube_channel_url?: string;
  youtube_channel_username?: string;
  facebook_username?: string;
  instagram_username?: string;
}

export default function ContactDetailView() {
  const [gymId, setGymId] = useState<string | null>(null);
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    mode: "onChange",
  });

  useEffect(() => {
    const fetchGymId = async () => {
      try {
        const gymId = await retrieveGymId();
        setGymId(gymId);
      } catch (error) {
        console.log(error);
      }
    };
    fetchGymId();
  }, []);

  const fetchData = async () => {
    if (!gymId) return;
    try {
      const response = await AxiosPrivate.get(`/api/get-gym/${gymId}/`, {
        id: newID(`get-gym-${gymId}`),
      });
      const data = response.data;
      setValue("facebook_url", data.facebook_url);
      setValue("instagram_url", data.instagram_url);
      setValue("google_direction_url", data.google_direction_url);
      setValue("youtube_channel_url", data.youtube_channel_url);
      setValue("website_url", data.website_url);
      setValue("instagram_username", data.instagram_username);
      setValue("facebook_username", data.facebook_username);
      setValue("youtube_channel_username", data.youtube_channel_username);
    } catch (error) {
      console.error("Error fetching gym data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [gymId, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.put(`/api/update-gym/${gymId}/`, data).then(() =>
        invalidateAll()
      );
      toast.success(<Text as="b">Successfully updated!</Text>);
      fetchData();
    } catch (error) {
      console.error("Error updating gym data:", error);
      toast.error(<Text as="b"> Something went wrong while updating!</Text>);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="@container">
      <div className="mx-auto mb-10 grid w-full max-w-screen-2xl gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
        <FormGroup
          title="Instagram UserName"
          className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
        >
          <Input
            type="text"
            className="col-span-full max-w-xl"
            prefixClassName="relative pe-2.5 before:w-[1px] before:h-[38px] before:absolute before:bg-gray-300 before:-top-[9px] before:right-0"
            placeholder="Enter Instagram UserName"
            {...register("instagram_username")}
            error={errors.instagram_username?.message}
            prefix={<FaInstagram />}
          />
          <Input
            type="url"
            disabled
            className="col-span-full mt-2 md:mt-4 max-w-xl "
            prefixClassName="relative pe-2.5 before:w-[1px] before:h-[38px] before:absolute before:bg-gray-300 before:-top-[9px] before:right-0"
            placeholder="Instagram URL"
            {...register("instagram_url")}
            error={errors.instagram_url?.message}
            prefix={<FaAt />}
          />
        </FormGroup>
        <FormGroup
          title="Facebook UserName"
          className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
        >
          <Input
            type="text"
            className="col-span-full max-w-xl"
            prefixClassName="relative pe-2.5 before:w-[1px] before:h-[38px] before:absolute before:bg-gray-300 before:-top-[9px] before:right-0"
            placeholder="Enter Facebook UserName"
            {...register("facebook_username")}
            error={errors.facebook_username?.message}
            prefix={<FaSquareFacebook />}
          />
          <Input
            type="text"
            disabled
            className="col-span-full mt-2 md:mt-4 max-w-xl "
            prefixClassName="relative pe-2.5 before:w-[1px] before:h-[38px] before:absolute before:bg-gray-300 before:-top-[9px] before:right-0"
            placeholder="Facebook URL"
            {...register("facebook_url")}
            error={errors.facebook_url?.message}
            prefix={<FaAt />}
          />
        </FormGroup>
        <FormGroup
          title="Youtube Channel UserName"
          className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
        >
          <Input
            type="text"
            className="col-span-full max-w-xl"
            prefixClassName="relative pe-2.5 before:w-[1px] before:h-[38px] before:absolute before:bg-gray-300 before:-top-[9px] before:right-0"
            placeholder="Youtube Channel UserName"
            {...register("youtube_channel_username")}
            error={errors.youtube_channel_username?.message}
            prefix={<FaYoutube />}
          />
          <Input
            type="text"
            disabled
            className="col-span-full mt-2 md:mt-4 max-w-xl "
            prefixClassName="relative pe-2.5 before:w-[1px] before:h-[38px] before:absolute before:bg-gray-300 before:-top-[9px] before:right-0"
            placeholder="Youtube URL"
            {...register("youtube_channel_url")}
            error={errors.youtube_channel_url?.message}
            prefix={<FaAt />}
          />
        </FormGroup>
        <FormGroup
          title="Google Direction URL"
          className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
        >
          <Input
            type="url"
            className="col-span-full max-w-xl"
            prefixClassName="relative pe-2.5 before:w-[1px] before:h-[38px] before:absolute before:bg-gray-300 before:-top-[9px] before:right-0"
            placeholder="Enter your Link starts with https://"
            {...register("google_direction_url")}
            error={errors.google_direction_url?.message}
            prefix={<FaLocationDot />}
          />
        </FormGroup>
        <FormGroup
          title="Website"
          className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
        >
          <Input
            type="url"
            className="col-span-full max-w-xl"
            prefixClassName="relative pe-2.5 before:w-[1px] before:h-[38px] before:absolute before:bg-gray-300 before:-top-[9px] before:right-0"
            placeholder="Enter your Link starts with https://"
            {...register("website_url")}
            error={errors.website_url?.message}
          />
        </FormGroup>
      </div>
      <FormFooter altBtnText="Cancel" submitBtnText="Save" />
    </form>
  );
}

// export function ProfileHeader({
//   title,
//   description,
//   children,
// }: React.PropsWithChildren<{ title: string; description?: string }>) {
//   const { layout } = useLayout();
//   const { expandedLeft } = useBerylliumSidebars();

//   return (
//     <div
//       className={cn(
//         'relative z-0 -mx-4 px-4 pt-28 before:absolute before:start-0 before:top-0 before:h-40 before:w-full before:bg-gradient-to-r before:from-[#F8E1AF] before:to-[#F6CFCF] @3xl:pt-[190px] @3xl:before:h-[calc(100%-120px)] dark:before:from-[#bca981] dark:before:to-[#cbb4b4] md:-mx-5 md:px-5 lg:-mx-8 lg:px-8 xl:-mx-6 xl:px-6 3xl:-mx-[33px] 3xl:px-[33px] 4xl:-mx-10 4xl:px-10',
//         layout === LAYOUT_OPTIONS.BERYLLIUM && expandedLeft
//           ? 'before:start-5 3xl:before:start-[25px]'
//           : 'xl:before:w-[calc(100%_+_10px)]'
//       )}
//     >
//       <div className="relative z-10 mx-auto flex w-full max-w-screen-2xl flex-wrap items-end justify-start gap-6 border-b border-dashed border-muted pb-10">
//         <div className="relative -top-1/3 aspect-square w-[110px] overflow-hidden rounded-full border-[6px] border-white bg-gray-100 shadow-profilePic @2xl:w-[130px] @5xl:-top-2/3 @5xl:w-[150px] dark:border-gray-50 3xl:w-[200px]">
//           <Image
//             src="https://isomorphic-furyroad.s3.amazonaws.com/public/profile-image.webp"
//             alt="profile-pic"
//             fill
//             sizes="(max-width: 768px) 100vw"
//             className="aspect-auto"
//           />
//         </div>
//         <div>
//           <Title
//             as="h2"
//             className="mb-2 inline-flex items-center gap-3 text-xl font-bold text-gray-900"
//           >
//             {title}
//             <PiSealCheckFill className="h-5 w-5 text-primary md:h-6 md:w-6" />
//           </Title>
//           {description ? (
//             <Text className="text-sm text-gray-500">{description}</Text>
//           ) : null}
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// }
