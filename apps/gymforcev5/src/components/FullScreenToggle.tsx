import React, { useState, useEffect } from "react";
import { FaMaximize, FaMinimize } from "react-icons/fa6";
// import { Maximize, Minimize } from 'lucide-react';

const FullscreenToggle = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div
      onClick={toggleFullscreen}
      className="hidden hover:text-primary lg:block cursor-pointer hover:scale-105 duration-300 size-6  dark:text-primary dark:hover:text-primary-dark "
    >
      {isFullscreen ? <FaMinimize size={24} /> : <FaMaximize size={24} />}
    </div>
  );
};

export default FullscreenToggle;
