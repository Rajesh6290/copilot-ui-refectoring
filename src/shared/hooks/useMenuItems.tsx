"use client";
import { useMemo } from "react";
import useAuth from "./usePermission";

const useMenuItems = () => {
  const { user, isUserLoading } = useAuth();

  // Memoize menuItems to prevent unnecessary re-renders
  const menuItems = useMemo(() => {
    return user && user?.resources?.UI;
  }, [user?.resources?.UI]);

  return { isUserLoading, menuItems };
};

export default useMenuItems;
