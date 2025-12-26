import { useMemo } from "react";
import { Agent, ApplicationData, Dataset, Model } from "../types/overview.types";

export const useOverviewData = (data: ApplicationData) => {
  const linkedModels = useMemo<Model[]>(
    () => data?.model_details || [],
    [data],
  );
  const linkedAgents = useMemo<Agent[]>(
    () => data?.agent_details || [],
    [data],
  );
  const linkedDatasets = useMemo<Dataset[]>(
    () => data?.dataset_details || [],
    [data],
  );

  return {
    linkedModels,
    linkedAgents,
    linkedDatasets,
  };
};
