"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";

interface PWAContextType {
  installPrompt: any;
  setInstallPrompt: React.Dispatch<any>;
  handleInstall: () => void;
}

const PWAContext = createContext<PWAContextType>({
  installPrompt: null,
  setInstallPrompt: () => {},
  handleInstall: () => {},
});

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const handleInstall = () => {
    if (!installPrompt) {
      //   toast.error("Installation not available");
      console.log('App Installation Cancelled');
      return;
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      toast.success("App is Already Installed");
      return;
    }

    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        toast.success("App Will be Installed on the Device Soon");
      } else {
        console.log("App Installation Cancelled");
      }
    });
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  return (
    <PWAContext.Provider
      value={{ installPrompt, setInstallPrompt, handleInstall }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWAInstall() {
  const context = useContext(PWAContext);

  if (!context) {
    throw new Error("usePWAInstall must be used within a PWAProvider");
  }

  return context;
}
