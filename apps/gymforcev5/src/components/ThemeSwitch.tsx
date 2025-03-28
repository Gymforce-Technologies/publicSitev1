"use client";

import { useTheme } from "next-themes";
// import { siteConfig } from '@/config/site.config';
import { Switch } from "rizzui";
import { updateThemeColor } from "@core/utils/update-theme-color";
import { presetDark, presetLight } from "@/config/color-presets";
import { useEffect } from "react";
import { useColorPresetName } from "@/layouts/settings/use-theme-color";
import { FaLightbulb } from "react-icons/fa6";
import { BsMoon, BsSun } from "react-icons/bs";
// import { MoonIcon, SunIcon } from 'lucide-react';
// import { RiSunFill } from 'react-icons/ri';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { colorPresetName } = useColorPresetName();

  useEffect(() => {
    if (theme === "light" && colorPresetName === "black") {
      updateThemeColor(
        presetLight.lighter,
        presetLight.light,
        presetLight.default,
        presetLight.dark,
        presetLight.foreground
      );
    }
    if (theme === "dark" && colorPresetName === "black") {
      updateThemeColor(
        presetDark.lighter,
        presetDark.light,
        presetDark.default,
        presetDark.dark,
        presetDark.foreground
      );
    }
  }, [theme, colorPresetName]);

  const handleThemeChange = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Switch
      checked={theme === "dark"}
      onChange={handleThemeChange}
      offIcon={
        <BsSun aria-label="Light Mode" className="size-5 text-yellow-400 p-1" />
      }
      onIcon={<BsMoon aria-label="Dark Mode" className="size-4" />}
    />
  );
}
