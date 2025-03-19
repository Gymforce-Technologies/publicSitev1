import cn from "@core/utils/class-names";
import Image, { StaticImageData } from "next/image";
import { Text, Avatar, AvatarProps } from "rizzui";

interface ImageCardProps {
  src: string | StaticImageData;
  name: string;
  className?: string;
  nameClassName?: string;
  description?: React.ReactNode;
}

export default function ImageCard({
  src,
  name,
  className,
  description,
  nameClassName,
}: ImageCardProps) {
  return (
    <figure className={cn("flex items-center gap-3", className)}>
      <Image
        src={src}
        alt={name}
        height={40}
        width={40}
        className="size-10 rounded-full"
      />
      <figcaption className="grid gap-0.5">
        <Text
          className={cn(
            "font-lexend text-sm font-medium text-gray-900 dark:text-gray-700",
            nameClassName
          )}
        >
          {name}
        </Text>
        {description && (
          <Text className="text-[13px] text-gray-500">{description}</Text>
        )}
      </figcaption>
    </figure>
  );
}
