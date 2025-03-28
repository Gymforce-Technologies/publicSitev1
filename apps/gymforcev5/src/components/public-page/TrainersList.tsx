import Image from "next/image";
import React from "react";
import { FaGraduationCap, FaMapPin } from "react-icons/fa6";
import { PiCertificateLight } from "react-icons/pi";
import { Title, Text } from "rizzui";
// Import Swiper and required modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { GlassNavigationButtons } from "./SwiperNavGlass";

interface Trainer {
  name: string;
  contact: string;
  email: string;
  address_street: string;
  status: string;
  gender: string;
  employment_type: string | null;
  qualifications: string | null;
  certifications: string | null;
  specializations: string | null;
  staff_image: string | null;
  staffType: string;
}

interface TrainersListProps {
  trainers: Trainer[];
}

export default function TrainersList({ trainers }: TrainersListProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:mt-8 md:-mt-4 lg:-mt-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Title
            as="h1"
            className="text-2xl sm:text-3xl md:text-4xl  font-bold text-nowrap"
          >
            Our Expert
          </Title>
          <Text className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-500">
            {" "}
            Trainers
          </Text>
        </div>
        <Text className="text-gray-500 max-w-2xl mx-auto">
          Meet our dedicated team of professional fitness trainers committed to
          helping you achieve your fitness goals.
        </Text>
      </div>

      <Swiper
        modules={[Navigation, Autoplay, Pagination]}
        navigation={false}
        spaceBetween={30}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          stopOnLastSlide: false,
        }}
        pagination={{ clickable: true }}
        effect="cards"
        breakpoints={{
          // when window width is >= 320px
          320: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          // when window width is >= 768px
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          // when window width is >= 1024px
          1024: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
        }}
        className="mySwiper relative "
      >
        <GlassNavigationButtons />
        {trainers.map((trainer, index) => (
          <SwiperSlide key={index} className="px-4 md:px-12">
            <div className="border rounded-xl hover:scale-105 duration-150 hover:shadow bg-gray-50">
              <div className="flex flex-col min-h-[275px] items-center p-4 sm:p-6">
                <div className="flex  gap-4 self-start items-center">
                  <Image
                    alt={trainer?.name}
                    src={trainer?.staff_image ?? ""}
                    width="200"
                    height="200"
                    className=" size-20 sm:size-[110px] rounded-full"
                  />

                  <div className="flex flex-col gap-1">
                    <Title
                      as="h4"
                      className=" text-base sm:text-xl font-semibold mb-2"
                    >
                      {trainer.name}
                    </Title>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  {trainer.address_street && (
                    <div className="flex items-center mt-4">
                      <FaMapPin className="size-4 sm:size-6 mr-2" />
                      <Text className="font-medium">
                        {trainer.address_street}
                      </Text>
                    </div>
                  )}
                </div>

                {(trainer.qualifications ||
                  trainer.certifications ||
                  trainer.specializations) && (
                  <div className=" pt-4 border-t border-gray-100 w-full">
                    {trainer.qualifications && (
                      <div className="flex items-center mb-2">
                        <FaGraduationCap className="size-4 sm:size-6 mr-2" />
                        <Text className="font-medium">
                          {trainer.qualifications}
                        </Text>
                      </div>
                    )}

                    {trainer.certifications && (
                      <div className="flex items-center">
                        <PiCertificateLight className="size-4 sm:size-6 mr-2" />
                        <Text className="font-medium">
                          {trainer.certifications}
                        </Text>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
