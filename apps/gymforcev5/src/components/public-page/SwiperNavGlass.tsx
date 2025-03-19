import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useSwiper } from "swiper/react";

export const GlassNavigationButtons = () => {
  const swiper = useSwiper();

  return (
    <>
      {/* Split into two separate divs aligned to left and right edges */}
      <div className="absolute left-2 top-0 bottom-0 z-10 flex items-center">
        <button
          onClick={() => swiper.slidePrev()}
          className="transform size-10 flex items-center justify-center rounded-full
           bg-white/20 hover:bg-white/40 backdrop-blur-sm
          transition-all duration-300 border border-white/30
          shadow-lg hover:shadow-xl group"
        >
          <IoIosArrowBack className="size-5 text-gray-800 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div className="absolute right-2 top-0 bottom-0 z-10 flex items-center">
        <button
          onClick={() => swiper.slideNext()}
          className="transform size-10 flex items-center justify-center rounded-full
           bg-white/20 hover:bg-white/40 backdrop-blur-sm
          transition-all duration-300 border border-white/30
          shadow-lg hover:shadow-xl group"
        >
          <IoIosArrowForward className="size-5 text-gray-800 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </>
  );
};
