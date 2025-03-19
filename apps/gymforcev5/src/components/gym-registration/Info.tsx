import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import { Title } from "rizzui";
import ReviewCard from "@core/components/cards/review-card";

const reviewData = [
  {
    id: 1,
    rating: 5,
    description:
      "The gym management software has revolutionized our operations. It's user-friendly and efficient!",
    name: "John Doe",
    date: "7 June, 2024",
  },
  {
    id: 2,
    rating: 4,
    description:
      "Great software for member management. The scheduling feature is a game-changer for our classes.",
    name: "Jane Smith",
    date: "12 June, 2024",
  },
  {
    id: 3,
    rating: 5,
    description:
      "The reporting tools have given us valuable insights into our gym's performance. Highly recommended!",
    name: "Mike Johnson",
    date: "15 June, 2024",
  },
];

export default function Info() {
  const sliderRef = useRef(null);

  return (
    <div className="mt-4 grid grid-cols-1">
      <Title
        as="h2"
        className="text-3xl font-bold text-gray-900 mb-6 max-sm:text-xl"
      >
        What Owners Say
      </Title>
      <p
        className="text-gray-500 mb-8 text-base
       md:text-lg"
      >
        Discover how Gymforce has helped gym owners streamline their operations
        and boost member satisfaction.
      </p>
      <div className=" rounded-md shadow-md p-4">
        <Swiper
          ref={sliderRef}
          slidesPerView={1}
          freeMode={true}
          loop={true}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          modules={[FreeMode, Autoplay]}
          className="mySwiper"
        >
          {reviewData.map((item) => (
            <SwiperSlide key={`review-key-${item.id}`}>
              <ReviewCard
                customer={{ name: item.name }}
                message={item.description}
                date={new Date(item.date)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
