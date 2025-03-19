import cn from "@core/utils/class-names";
import Image from "next/image";
import { Title, Text, Badge, Switch, Tooltip, ActionIcon } from "rizzui";
import { formateDateValue } from "../../app/[locale]/auth/DateFormat";
import { Dispatch, SetStateAction } from "react";
import { EditIcon } from "lucide-react";
import { retrieveGymId } from "../../app/[locale]/auth/InfoCookies";
import { AxiosPrivate, invalidateAll } from "../../app/[locale]/auth/AxiosPrivate";
import toast from "react-hot-toast";
import { IoStarOutline, IoStarSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";

interface GalleryItem {
  id: number;
  title: string;
  image_type: string;
  description: string;
  is_active: boolean;
  image: string;
  caption: string | null;
  uploaded_at: string;
  gym: number;
  is_featured: boolean;
}

type GalleryCardProps = {
  item: GalleryItem;
  className?: string;
  setEditData: Dispatch<SetStateAction<GalleryItem | null>>;
  setIsEditDrawerOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess: () => void;
};

export default function GalleryCard({
  item,
  className,
  setEditData,
  setIsEditDrawerOpen,
  onSuccess,
}: GalleryCardProps) {
  const {
    title,
    image_type,
    description,
    image,
    uploaded_at,
    id,
    is_active,
    is_featured,
  } = item;
  const handleActiveChnage = async (id: number, status: boolean) => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.patch(`/api/update-gallery/${id}/?gym_id=${gymId}`, {
        is_active: !status,
      });
      toast.success("Status updated successfully");
      invalidateAll();
      onSuccess();
    } catch (error) {
      toast.error("Failed to update offer status");
      console.error("Error updating offer status:", error);
    }
  };

  const deleteGalleryFunc = async (id: number) => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.delete(`/api/delete-gallery/${id}/?gym_id=${gymId}`);
      toast.success("Gallery Image deleted successfully");
      invalidateAll();
      onSuccess();
      // setDeleteOffer(false);
    } catch (error) {
      // toast.error("Failed to delete offer");
      console.error("Error deleting offer:", error);
    }
  };

  const handleFeaturedChnage = async (id: number, is_featured: boolean) => {
    try {
      const gymId = await retrieveGymId();
      await AxiosPrivate.patch(`/api/update-gallery/${id}/?gym_id=${gymId}`, {
        is_featured: !is_featured,
      });
      toast.success("Featured Image updated successfully");
      invalidateAll();
      onSuccess();
    } catch (error) {
      toast.error("Failed to update feature Image");
      console.error("Error updating feature Image:", error);
    }
  };
  return (
    <div className={cn("group relative overflow-hidden ", className)}>
      <div className="grid gap-2 p-2">
        <div className="relative aspect-[4/3] w-full rounded-lg">
          <Image
            src={image}
            alt={title}
            fill
            quality={100}
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <Text className="text-gray-100 text-sm">{image_type}</Text>
            {description && (
              <Text className="text-gray-50 text-xs mt-2">{description}</Text>
            )}
            <Text className="text-gray-100 text-xs mt-auto">
              {formateDateValue(new Date(uploaded_at))}
            </Text>
          </div>
        </div>

        <div className=" flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge renderAsDot></Badge>
            <Title as="h5" className="capitalize">
              {item.title}
            </Title>
          </div>
          <EditIcon
            className="size-5 cursor-pointer hover:scale-105 hover:text-primary"
            onClick={() => {
              setIsEditDrawerOpen(true);
              setEditData(item);
            }}
          />
        </div>
        <div className="flex items-center gap-4 justify-between mx-4">
          <div className="flex items-center gap-2">
            <Text>Active : </Text>
            <Switch
              checked={is_active === true}
              onChange={async () => await handleActiveChnage(id, is_active)}
              size="sm"
              className={`ps-2`}
            />
          </div>
          <div className="flex items-center gap-2">
            {is_featured ? (
              <Tooltip content="UnMark as Featured" placement="bottom">
                <div>
                  <IoStarSharp
                    size={20}
                    onClick={async () =>
                      await handleFeaturedChnage(id, is_featured)
                    }
                    className="hover:scale-110 duration-200 cursor-pointer text-primary shadow-primary hover:shadow-lg"
                  />
                </div>
              </Tooltip>
            ) : (
              <Tooltip content="Mark as Featured" placement="bottom">
                <div>
                  <IoStarOutline
                    size={20}
                    onClick={async () =>
                      await handleFeaturedChnage(id, is_featured)
                    }
                    className="hover:scale-110 duration-200 cursor-pointer text-primary shadow-primary hover:shadow-lg"
                  />
                </div>
              </Tooltip>
            )}
            <ActionIcon
              onClick={() => deleteGalleryFunc(item.id)}
              variant="text"
            >
              <MdDelete size={20} />
            </ActionIcon>
          </div>
        </div>
      </div>
    </div>
  );
}
