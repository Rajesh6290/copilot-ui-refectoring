import React from "react";
import Sidebar from "./Sidebar";

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-dvh bg-gray-50">
      <Sidebar />
      {children}
    </div>
  );
};

export default AuthenticationLayout;
