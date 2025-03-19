'use client';
import { useEffect, useRef } from 'react';

export function useScrollableSlider() {
  const sliderEl = useRef<HTMLDivElement>(null);
  const sliderPrevBtn = useRef<HTMLButtonElement>(null);
  const sliderNextBtn = useRef<HTMLButtonElement>(null);

  function scrollToTheRight() {
    if (!sliderEl.current || !sliderPrevBtn.current) return;

    const offsetWidth = sliderEl.current.offsetWidth;
    sliderEl.current.scrollLeft += offsetWidth / 2;
    sliderPrevBtn.current.classList.remove('opacity-0', 'invisible');
  }

  function scrollToTheLeft() {
    if (!sliderEl.current || !sliderNextBtn.current) return;

    const offsetWidth = sliderEl.current.offsetWidth;
    sliderEl.current.scrollLeft -= offsetWidth / 2;
    sliderNextBtn.current.classList.remove('opacity-0', 'invisible');
  }

  useEffect(() => {
    // Early return if any refs are null
    if (!sliderEl.current || !sliderPrevBtn.current || !sliderNextBtn.current) {
      return;
    }

    const filterBarEl = sliderEl.current;
    const prevBtn = sliderPrevBtn.current;
    const nextBtn = sliderNextBtn.current;

    // Safely check for class
    const formPageHeaderEl = filterBarEl.classList.contains('formPageHeaderSliderElJS');

    function initNextPrevBtnVisibility() {
      // Ensure elements exist
      if (!filterBarEl || !nextBtn || !prevBtn) return;

      let offsetWidth = filterBarEl.offsetWidth;
      let scrollWidth = filterBarEl.scrollWidth;

      // show next btn when scrollWidth is greater than offsetWidth
      if (scrollWidth > offsetWidth) {
        nextBtn.classList.remove('opacity-0', 'invisible');
        
        if (formPageHeaderEl) {
          filterBarEl.classList.add('!-mb-[43px]');
        }
      } else {
        nextBtn.classList.add('opacity-0', 'invisible');
        
        if (formPageHeaderEl) {
          filterBarEl.classList.remove('!-mb-[43px]');
        }
      }

      // hide prev btn initially
      prevBtn.classList.add('opacity-0', 'invisible');
    }

    function visibleNextAndPrevBtnOnScroll() {
      // Ensure elements exist
      if (!filterBarEl || !nextBtn || !prevBtn) return;

      let newScrollLeft = filterBarEl.scrollLeft;
      let offsetWidth = filterBarEl.offsetWidth;
      let scrollWidth = filterBarEl.scrollWidth;

      // reach to the right end
      if (scrollWidth - newScrollLeft === offsetWidth) {
        nextBtn.classList.add('opacity-0', 'invisible');
        prevBtn.classList.remove('opacity-0', 'invisible');
      } else {
        nextBtn.classList.remove('opacity-0', 'invisible');
      }

      // reach to the left end
      if (newScrollLeft === 0) {
        prevBtn.classList.add('opacity-0', 'invisible');
        nextBtn.classList.remove('opacity-0', 'invisible');
      } else {
        prevBtn.classList.remove('opacity-0', 'invisible');
      }
    }

    // Initial visibility check
    initNextPrevBtnVisibility();

    // Add event listeners
    window.addEventListener('resize', initNextPrevBtnVisibility);
    filterBarEl.addEventListener('scroll', visibleNextAndPrevBtnOnScroll);

    // Clear event listeners
    return () => {
      window.removeEventListener('resize', initNextPrevBtnVisibility);
      filterBarEl.removeEventListener('scroll', visibleNextAndPrevBtnOnScroll);
    };
  }, []); // Empty dependency array as we want this to run once

  return {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  };
}