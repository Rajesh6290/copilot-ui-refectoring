"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import { CircularProgress } from "@mui/material";
import { ArchiveRestore, Pencil } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { IsAccess, Risk, RisksResponse } from "./RiskRegister";
const UpdateRisk = dynamic(() => import("./UpdateRisk"), {
  ssr: false
});
const RiskDetails = dynamic(() => import("./RiskDetails"), {
  ssr: false
});

const RiskTable = ({
  mutate,
  data,
  isValidating,
  isAccess,
  limit,
  page,
  setPage,
  setLimit
}: {
  type: string;
  mutate: () => void;
  data: RisksResponse;
  isValidating: boolean;
  limit: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  setLimit: Dispatch<SetStateAction<number>>;
  isAccess: IsAccess;
}) => {
  const [riskId, setRiskId] = useState<string>("");
  const [riskOpen, setRiskOpen] = useState<boolean>(false);
  const [updateOpen, setUpdateOpen] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<Risk | null>(null);
  const { isLoading, mutation } = useMutation();
  const searchParams = useSearchParams();
  const openRiskid = searchParams.get("riskId");
  const router = useRouter();
  const handleDeleteRisk = (riskIde: string) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "You want to archive this risk?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, archive it!",
        cancelButtonText: "No, cancel!"
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await mutation(`risk?doc_id=${riskIde}`, {
            method: "DELETE",
            isAlert: false
          });
          if (res?.status === 200) {
            mutate();
            setUpdateData(null);
            toast.success("Risk archived successfully");
          }
        }
      });
    } catch (error) {
      toast.error(error instanceof Error);
    }
  };
  const getLikelihoodColor = (likelihood: string | undefined) => {
    switch (likelihood) {
      case "Very Unlikely":
        return "bg-green-500";
      case "Unlikely":
        return "bg-green-300";
      case "Somewhat Likely":
        return "bg-amber-500";
      case "Likely":
        return "bg-red-500";
      case "Very Likely":
        return "bg-red-700";
      default:
        return "bg-gray-300";
    }
  };

  const getImpactColor = (impact: string | undefined) => {
    switch (impact) {
      case "Very Low":
        return "bg-green-500";
      case "Low":
        return "bg-green-300";
      case "Medium":
        return "bg-amber-500";
      case "High":
        return "bg-red-500";
      case "Very High":
        return "bg-red-700";
      default:
        return "bg-gray-300";
    }
  };

  const getRiskLevelColor = (riskLevel: string | undefined) => {
    const riskLevelMap: Record<string, string> = {
      Low: "bg-green-300",
      low: "bg-green-300",
      Medium: "bg-amber-500",
      medium: "bg-amber-500",
      High: "bg-red-500",
      high: "bg-red-500"
    };
    return riskLevelMap[riskLevel || ""] || "bg-[#C4C4C4]";
  };
  const removeRiskId = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("riskId"); // remove param

    router.replace(`?${params.toString()}`, { scroll: false });
  };
  useEffect(() => {
    if (openRiskid && openRiskid?.length > 0) {
      setRiskId(openRiskid);
      setRiskOpen(true);
    }
  }, [openRiskid, setRiskOpen, setRiskId]);
  return (
    <div className="w-full">
      <RiskDetails
        onClose={() => {
          setRiskOpen(!riskOpen);
          removeRiskId();
          setRiskId("");
        }}
        open={riskOpen}
        riskId={riskId}
      />
      <UpdateRisk
        data={updateData}
        onClose={() => setUpdateOpen(!updateOpen)}
        isOpen={updateOpen}
        mutate={mutate}
      />
      <CustomTable<Risk>
        columns={[
          {
            field: "risk_id",
            title: "Risk ID",
            sortable: true,
            filterable: true,
            cellClassName: "w-[20rem]",
            render: (row: Risk) => (
              <div className="relative flex w-full items-center justify-between gap-20 whitespace-nowrap">
                <span className="text-nowrap text-left font-medium capitalize">
                  {row?.id ?? "Not Provided"}
                </span>
                {/* <MessageCirclePlus
                  onClick={() => setOpen(true)}
                  className="cursor-pointer text-tertiary"
                  size={24}
                /> */}
              </div>
            )
          },
          {
            field: "name",
            title: "Name",
            sortable: true,
            filterable: true,
            cellClassName: "w-fit",
            render: (row: Risk) => (
              <span className="flex w-fit items-center justify-start text-nowrap text-left capitalize">
                {row?.name ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "risk_category",
            title: "Risk Category",
            sortable: true,
            filterable: true,
            cellClassName: "w-fit",
            render: (row: Risk) => (
              <span className="flex w-fit items-center justify-start text-nowrap text-left capitalize">
                {row?.risk_category ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "source",
            title: "Source",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <span className="text-nowrap capitalize">
                {row?.source ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "application",
            title: "Application",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <span className="text-nowrap capitalize">
                {row?.application_name ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "status",
            title: "Status",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <span className="text-nowrap capitalize">
                {row?.readiness_status?.replace(/_/g, " ") ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "details",
            title: "Details",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <div className="flex w-full items-center justify-center">
                {isAccess?.permission?.is_shown && (
                  <div className="w-fit">
                    <CustomButton
                      onClick={() => {
                        setRiskId(row?.doc_id);
                        setRiskOpen(true);
                      }}
                      disabled={!isAccess?.permission?.actions?.read}
                      className="w-fit !text-[0.6rem] !uppercase"
                    >
                      VIEW
                    </CustomButton>
                  </div>
                )}
              </div>
            )
          },
          {
            field: "risk_score",
            title: "Risk Score",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <span className="text-nowrap capitalize">
                {row?.risk_score ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "probability",
            title: "Probability",
            sortable: true,
            cellClassName: " relative w-[30rem]  whitespace-nowrap ",
            render: (row: Risk) => (
              <span
                className={`absolute left-0 top-0 flex h-full w-full items-center justify-center whitespace-nowrap text-nowrap text-center capitalize text-white ${getLikelihoodColor(row?.likelihood)}`}
              >
                {row?.likelihood || "Not Provided"}
              </span>
            )
          },
          {
            field: "impact",
            title: "Impact",
            sortable: true,
            cellClassName: " relative w-[30rem]  whitespace-nowrap ",
            render: (row: Risk) => (
              <span
                className={`absolute left-0 top-0 flex h-full w-full items-center justify-center whitespace-nowrap text-nowrap text-center capitalize text-white ${getImpactColor(row?.impact)}`}
              >
                {row?.impact || "Not Provided"}
              </span>
            )
          },
          {
            field: "risk_level",
            title: "Risk Level",
            sortable: true,
            cellClassName: " relative w-[30rem]  whitespace-nowrap ",
            render: (row: Risk) => (
              <span
                className={`absolute left-0 top-0 flex h-full w-full items-center justify-center whitespace-nowrap text-nowrap text-center capitalize text-white ${getRiskLevelColor(row?.risk_level)}`}
              >
                {row?.risk_level || "Not Available"}
              </span>
            )
          }
        ]}
        actions={[
          {
            icon: isAccess?.buttons?.[1]?.permission?.is_shown ? (
              <Pencil className="size-5 text-tertiary" />
            ) : (
              <></>
            ),
            tooltip: "Update",
            onClick: (row: Risk) => {
              if (isAccess?.buttons?.[1]?.permission?.actions?.update) {
                setUpdateData(row);
                setUpdateOpen(true);
              } else {
                toast.error("You don't have permission to update risk");
              }
            }
          },
          {
            icon: (row: Risk) =>
              isLoading && row?.doc_id === updateData?.doc_id ? (
                <CircularProgress size={10} className="!ml-3 !text-tertiary" />
              ) : isAccess?.buttons?.[2]?.permission?.is_shown ? (
                <ArchiveRestore className="ml-3 size-5 text-tertiary" />
              ) : (
                <></>
              ),
            tooltip: "Archive",
            onClick: (row: Risk) => {
              if (isAccess?.buttons?.[2]?.permission?.actions?.delete) {
                setUpdateData(row);
                handleDeleteRisk(row?.doc_id);
              } else {
                toast.error("You don't have permission to archive risk");
              }
            }
          }
        ]}
        data={data?.risks || []}
        isLoading={isValidating || isLoading}
        page={page}
        pageSize={limit}
        totalCount={data?.pagination?.total_records}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
        title=""
        selection={true}
        filtering={false}
        options={{
          toolbar: false,
          search: false,
          filtering: true,
          sorting: true,
          pagination: true
        }}
        className="flex-1"
        localization={{
          header: {
            actions: "Actions"
          }
        }}
      />
      <div className="mt-4 flex items-center justify-end">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#16A34A]"></div>
            <span className="text-sm text-gray-500">Closed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#2563EB]"></div>
            <span className="text-sm text-gray-500">Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#FFC107]"></div>
            <span className="text-sm text-gray-500">Under Review</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RiskTable;
