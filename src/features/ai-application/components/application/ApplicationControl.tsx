"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const ApplicationControlDetails = dynamic(
  () => import("./ApplicationControlDetails"),
  {
    ssr: false
  }
);
const ControlTable = dynamic(() => import("./ControlTable"), {
  ssr: false
});

const ApplicationControl = ({ applicationId }: { applicationId: string }) => {
  const [controlId, setControlId] = useState("");
  return controlId?.length === 0 ? (
    <ControlTable setControlId={setControlId} applicationId={applicationId} />
  ) : (
    <ApplicationControlDetails
      controlId={controlId}
      setControlId={setControlId}
    />
  );
};

export default ApplicationControl;
