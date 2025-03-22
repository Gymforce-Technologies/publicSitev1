import { Metadata } from "next";
import logoImg from "@public/svg/Live_Logo.png";
import { AxiosPublic } from "../../auth/AxiosPrivate";

type Props = {
  params: any;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { code } = await params;
    const gymData = await AxiosPublic.get(`/center/initial/${code}/`, {
      id: `Gym-${code}`,
    }).then((res) => res.data);

    return {
      title: gymData.name || "GymForce Center",
      description:
        gymData.description ||
        `${gymData.street ? gymData.street + "," : ""} ${gymData.city ? gymData.city + "," : ""} ${gymData.zip_code ? gymData.zip_code + "," : ""}, ${gymData.state ? gymData.state + "," : ""} ${gymData.country}`,
      openGraph: {
        title: gymData.name || "GymForce Center",
        description:
          gymData.description ||
          `${gymData.street ? gymData.street + "," : ""} ${gymData.city ? gymData.city + "," : ""} ${gymData.zip_code ? gymData.zip_code + "," : ""}, ${gymData.state ? gymData.state + "," : ""} ${gymData.country}`,
        images: [
          {
            url: gymData?.gym_image || logoImg.src,
            width: 1200,
            height: 630,
            alt: gymData.name,
          },
        ],
      },
      icons: {
        icon: gymData?.gym_image || logoImg.src,
        apple: gymData?.gym_image || logoImg.src,
        shortcut: gymData?.gym_image || logoImg.src,
      },
    };
  } catch (error) {
    return {
      title: "Gymforce - Ultimate Gym Management Solution",
      description: `Experience the ultimate gym management solution with Gymforce...`,
      openGraph: {
        images: [
          {
            url: logoImg.src,
            width: 1200,
            height: 630,
            alt: "Gymforce",
          },
        ],
      },
      icons: {
        icon: logoImg.src,
        apple: logoImg.src,
        shortcut: logoImg.src,
      },
    };
  }
}

export default function PublicGymLayout({ children }: Props) {
  return <div>{children}</div>;
}
