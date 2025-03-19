import { createContext, useEffect, useState, ReactNode, useContext } from "react";
import { FormData } from "./Addmember";

// Define the context type
type NewMemberContextType = {
  newMember: FormData | null;
  setNewMember: React.Dispatch<React.SetStateAction<FormData | null>>;
  setMemberDetails: (data: any) => void;
  getmemberDetails: () => FormData | null;
  removeMemberDetails: () => void;
};

// Create context with proper type
export const NewMemberContext = createContext<NewMemberContextType | null>(null);

// Create a custom hook for using this context
export function useNewMemberContext() {
  const context = useContext(NewMemberContext);
  if (!context) {
    throw new Error("useNewMemberContext must be used within a MemberProvider");
  }
  return context;
}

export function MemberProvider({ children }: { children: ReactNode }) {
  const [newMember, setNewMember] = useState<FormData | null>(null);
  
  const setMemberDetails = (data: any) => {
    sessionStorage.setItem("newMember", JSON.stringify(data));
  };
  
  const getmemberDetails = () => {
    const MemberInfo = sessionStorage.getItem("newMember");
    if (MemberInfo) {
      return JSON.parse(MemberInfo);
    } else {
      return null;
    }
  };
  
  const removeMemberDetails = () => {
    sessionStorage.removeItem("newMember");
  };
  
  useEffect(() => {
    if (newMember) {
      setMemberDetails(newMember);
    }
  }, [newMember]);
  
  return (
    <NewMemberContext.Provider value={{ 
      newMember, 
      setNewMember, 
      setMemberDetails, 
      getmemberDetails, 
      removeMemberDetails 
    }}>
      {children}
    </NewMemberContext.Provider>
  );
}