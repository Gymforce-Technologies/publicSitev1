import React, { useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Button, Text, Title } from "rizzui";

export interface GalleryItemProps {
  id: number;
  title: string;
  image: string | StaticImageData;
  description: string;
  subtitle?: string;
  is_featured?: boolean;
}

const GallerySection = ({ items }: { items: GalleryItemProps[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperRef>(null);

  const [featuredImage, setFeaturedImage] = useState<GalleryItemProps | null>(
    null
  );

  const handlePrev = () => {
    swiperRef.current?.swiper.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.swiper.slideNext();
  };

  useEffect(() => {
    items.map((item, index) => {
      if (item.is_featured) {
        setFeaturedImage(item);
      }
    });
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="p-6 md:p-10 min-w-full">
        <Text className="text-lg sm:text-xl font-medium text-blue-500">
          Our Gallery
        </Text>
        <Title className="text-2xl sm:text-3xl md:text-4xl mb-8">
          Gym <span className="text-blue-500">Highlights</span>
        </Title>

        {items.length > 0 && (
          <>
            {/* Featured Image Section */}
            {featuredImage ? (
              <div className="relative w-full h-[300px] md:h-[400px] lg:h-[600px] mb-4 px-4 md:px-8 lg:px-12 rounded-2xl overflow-hidden">
                <Image
                  src={featuredImage.image}
                  alt={featuredImage.title}
                  fill
                  priority={true}
                  className="object-cover"
                  // sizes=""
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <Title as="h4" className="text-white mb-2">
                    {featuredImage.title}
                  </Title>
                  {featuredImage.subtitle && (
                    <Text className="text-blue-200 text-sm md:text-base">
                      {featuredImage.subtitle}
                    </Text>
                  )}
                  <Text className="text-sm text-gray-400 line-clamp-2">
                    {featuredImage.description}
                  </Text>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-[300px] md:h-[400px] lg:h-[600px] mb-4 px-4 md:px-8 lg:px-12 rounded-2xl overflow-hidden">
                <Image
                  src={items[activeIndex].image}
                  alt={items[activeIndex].title}
                  fill
                  className="object-cover"
                  priority={true}
                  // sizes=""
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <Title as="h4" className="text-white mb-2">
                    {items[activeIndex].title}
                  </Title>
                  {items[activeIndex].subtitle && (
                    <Text className="text-blue-200 text-sm md:text-base">
                      {items[activeIndex].subtitle}
                    </Text>
                  )}
                  <Text className="text-sm text-gray-400 line-clamp-2">
                    {items[activeIndex].description}
                  </Text>
                </div>
              </div>
            )}
            {/* Carousel Section */}
            <div className="relative">
              <Swiper
                ref={swiperRef}
                modules={[Navigation, Autoplay]}
                navigation={false}
                loop={true}
                autoplay={{
                  delay: 2500,
                  disableOnInteraction: false,
                  stopOnLastSlide: false,
                }}
                slidesPerView={1.5}
                spaceBetween={16}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                onSlideChange={(swiper) => {
                  setActiveIndex(swiper.realIndex);
                }}
                className="w-full mx-auto"
              >
                {items.map((item, index) => (
                  <SwiperSlide key={item.id}>
                    <div
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        activeIndex === index
                          ? "border-blue-500 scale-95"
                          : "border-transparent"
                      }`}
                      onClick={() => setActiveIndex(index)}
                    >
                      <div className="relative aspect-video">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="absolute top-2 right-2 z-[999]">
                        <Title as="h5" className=" mb-2 line-clamp-1">
                          {item.title}
                        </Title>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Navigation Buttons */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 z-10">
                <Button
                  variant="text"
                  className="p-2 text-blue-500 bg-white/80 dark:bg-gray-800/80 transition-colors duration-300 rounded-full hover:bg-blue-400 hover:text-white"
                  onClick={handlePrev}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Button>

                <Button
                  variant="text"
                  className="p-2 text-blue-500 bg-white/80 dark:bg-gray-800/80 transition-colors duration-300 rounded-full hover:bg-blue-400 hover:text-white"
                  onClick={handleNext}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GallerySection;
