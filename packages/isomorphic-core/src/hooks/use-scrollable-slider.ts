import { useEffect, useRef } from "react";

export function useScrollableSlider() {
  const sliderEl = useRef<HTMLDivElement | null>(null);
  const sliderPrevBtn = useRef<HTMLButtonElement | null>(null);
  const sliderNextBtn = useRef<HTMLButtonElement | null>(null);

  const scrollToTheRight = () => {
    if (sliderEl.current && sliderPrevBtn.current) {
      const offsetWidth = sliderEl.current.offsetWidth;
      sliderEl.current.scrollLeft += offsetWidth / 2;
      sliderPrevBtn.current.classList.remove("opacity-0", "invisible");
    }
  };

  const scrollToTheLeft = () => {
    if (sliderEl.current && sliderNextBtn.current) {
      const offsetWidth = sliderEl.current.offsetWidth;
      sliderEl.current.scrollLeft -= offsetWidth / 2;
      sliderNextBtn.current.classList.remove("opacity-0", "invisible");
    }
  };

  useEffect(() => {
    const filterBarEl = sliderEl.current;
    const prevBtn = sliderPrevBtn.current;
    const nextBtn = sliderNextBtn.current;

    if (!filterBarEl || !prevBtn || !nextBtn) return;

    const formPageHeaderEl = filterBarEl.classList.contains(
      "formPageHeaderSliderElJS"
    );

    const initNextPrevBtnVisibility = () => {
      const offsetWidth = filterBarEl.offsetWidth;
      const scrollWidth = filterBarEl.scrollWidth;

      if (scrollWidth > offsetWidth) {
        nextBtn.classList.remove("opacity-0", "invisible");
        if (formPageHeaderEl) {
          filterBarEl.classList.add("!-mb-[43px]");
        }
      } else {
        nextBtn.classList.add("opacity-0", "invisible");
        if (formPageHeaderEl) {
          filterBarEl.classList.remove("!-mb-[43px]");
        }
      }

      prevBtn.classList.add("opacity-0", "invisible");
    };

    const visibleNextAndPrevBtnOnScroll = () => {
      const newScrollLeft = filterBarEl.scrollLeft;
      const offsetWidth = filterBarEl.offsetWidth;
      const scrollWidth = filterBarEl.scrollWidth;

      if (scrollWidth - newScrollLeft === offsetWidth) {
        nextBtn.classList.add("opacity-0", "invisible");
        prevBtn.classList.remove("opacity-0", "invisible");
      } else {
        nextBtn.classList.remove("opacity-0", "invisible");
      }

      if (newScrollLeft === 0) {
        prevBtn.classList.add("opacity-0", "invisible");
        nextBtn.classList.remove("opacity-0", "invisible");
      } else {
        prevBtn.classList.remove("opacity-0", "invisible");
      }
    };

    initNextPrevBtnVisibility();
    window.addEventListener("resize", initNextPrevBtnVisibility);
    filterBarEl.addEventListener("scroll", visibleNextAndPrevBtnOnScroll);

    return () => {
      window.removeEventListener("resize", initNextPrevBtnVisibility);
      filterBarEl.removeEventListener("scroll", visibleNextAndPrevBtnOnScroll);
    };
  }, []);

  return {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  };
}
