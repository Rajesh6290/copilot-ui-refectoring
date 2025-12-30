"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState
} from "react";
import usePermission from "../hooks/usePermission";
import { useUser } from "@clerk/nextjs";

interface AppContextType {
  fullScreen: boolean;
  setFullScreen: Dispatch<SetStateAction<boolean>>;
  metaTitle: string;
  setMetaTitle: Dispatch<SetStateAction<string>>;
  helpOpen?: boolean;
  setHelpOpen?: Dispatch<SetStateAction<boolean>>;
  helpOpenMax?: boolean;
  setHelpOpenMax?: Dispatch<SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [metaTitle, setMetaTitle] = useState<string>("");
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [helpOpenMax, setHelpOpenMax] = useState<boolean>(false);
  const { getUser } = usePermission();
  const { isLoaded, user } = useUser();

  // Initialize user data when Clerk user is loaded
  useEffect(() => {
    if (isLoaded && user?.id) {
      getUser();
    }
  }, [isLoaded, user?.id, getUser]);
  const value: AppContextType = {
    fullScreen,
    setFullScreen,
    metaTitle,
    setMetaTitle,
    helpOpen,
    setHelpOpen,
    helpOpenMax,
    setHelpOpenMax
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useMyContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
