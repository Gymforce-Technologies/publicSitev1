import Link from "next/link";
import React, { Dispatch, SetStateAction } from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa6";
import { MdFeedback } from "react-icons/md";
import { Avatar, Button, Title, Tooltip } from "rizzui";

const PublicHeader = ({
  initialData,
  setIsModalOpen,
}: {
  initialData: any;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="container mx-auto px-3 md:px-6 flex flex-col md:flex-row md:items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar
          src={initialData?.gym_image || ""}
          name="Gym Logo"
          size="xl"
          className="max-sm:text-lg"
        />
        <Title className="text-gray-100 text-xl sm:text-2xl md:text-3xl">
          {initialData.name || "GymForce Gym"}
        </Title>
      </div>
      <div className="flex space-x-4 items-center self-end">
        {initialData.instagram_username && (
          <Link
            href={`https://instagram.com/${initialData.instagram_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className=" hover:scale-105"
          >
            <FaInstagram size={18} />
            {/* Instagram */}
          </Link>
        )}
        {initialData.facebook_username && (
          <Link
            href={`https://facebook.com/${initialData.facebook_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className=" hover:scale-105"
          >
            <FaFacebook size={18} />
            {/* Facebook */}
          </Link>
        )}

        <Tooltip
          content="Please Provide Your Experience with US"
          className="z-[99999999] font-semibold"
          placement="bottom-end"
          color="invert"
          animation="slideIn"
        >
          <Button
            className="flex gap-2 items-center"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <MdFeedback size={18} />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default PublicHeader;
