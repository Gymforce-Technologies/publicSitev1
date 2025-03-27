"use client";
import { createContext, ReactNode } from "react";

interface FirebaseContextType {
  app: any;
  analytics: any;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  return (
    //@ts-ignore
    <FirebaseContext.Provider value={null}>{children}</FirebaseContext.Provider>
  );
}
