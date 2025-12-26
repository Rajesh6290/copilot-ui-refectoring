"use client";
import React from "react";
import { motion } from "framer-motion";
import { GitBranch, Target, Bot, Cpu, Database, Zap } from "lucide-react";
import moment from "moment";
import {
  Agent,
  ApplicationData,
  Dataset,
  Model
} from "../../types/overview.types";

interface ResourceRelationshipsProps {
  data: ApplicationData;
  linkedModels: Model[];
  linkedAgents: Agent[];
  linkedDatasets: Dataset[];
  cardVariants: {
    hidden: { opacity: number; scale: number };
  };
}

const ResourceRelationships: React.FC<ResourceRelationshipsProps> = ({
  data,
  linkedModels,
  linkedAgents,
  linkedDatasets,
  cardVariants
}) => {
  // Get all model IDs that are used by agents
  const getModelsUsedByAgents = (): string[] => {
    const usedModelIds: string[] = [];
    linkedAgents.forEach((agent: Agent) => {
      if (agent.model_ids) {
        usedModelIds.push(...agent.model_ids);
      }
    });
    return usedModelIds;
  };

  // Model-Dataset Relationships (only for models NOT used by agents)
  const renderModelDatasetRelationships = () => {
    const modelsUsedByAgents = getModelsUsedByAgents();

    return linkedModels
      .filter((model: Model) => !modelsUsedByAgents.includes(model.doc_id))
      .map((model: Model, modelIndex: number) =>
        model.dataset_ids?.map((datasetId: string, datasetIndex: number) => {
          const dataset = linkedDatasets.find(
            (d: Dataset) => d.doc_id === datasetId
          );
          if (!dataset) {
            return null;
          }

          return (
            <motion.div
              key={`${model.doc_id}-${datasetId}`}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-white to-green-50 p-6 shadow-lg dark:from-blue-900/20 dark:via-gray-800 dark:to-green-900/20"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                transition: `all 0.3s ease ${(modelIndex + datasetIndex) * 0.1}s`
              }}
            >
              {/* Tree connection indicator */}
              <div className="absolute -top-6 left-1/2 flex -translate-x-1/2 items-center">
                <div className="h-6 w-px bg-gradient-to-b from-indigo-300 to-blue-300"></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex w-full items-center space-x-4">
                  {/* Application connection */}
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 p-2 dark:from-indigo-900 dark:to-indigo-800">
                      <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="font-semibold text-blue-700 dark:text-blue-300">
                      {data?.name || "App"}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="h-px w-8 bg-gradient-to-r from-indigo-300 to-blue-300"></div>
                    <div className="rounded-full bg-white p-1 shadow-sm dark:bg-gray-700">
                      <GitBranch className="h-3 w-3 text-gray-500" />
                    </div>
                    <div className="h-px w-8 bg-gradient-to-r from-indigo-300 to-blue-300"></div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                      <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-700 dark:text-blue-300">
                        {model.model_name}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Model
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="h-px w-12 bg-gradient-to-r from-blue-300 to-green-300"></div>
                    <div className="rounded-full bg-white p-2 shadow-sm dark:bg-gray-700">
                      <GitBranch className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="h-px w-12 bg-gradient-to-r from-blue-300 to-green-300"></div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                      <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-300">
                        {dataset.name}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Dataset
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-white/50 p-3 dark:bg-gray-700/50">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Training relationship established on{" "}
                  <span className="font-medium">
                    {moment(model.created_at).format("MMM DD, YYYY")}
                  </span>
                </p>
              </div>
            </motion.div>
          );
        })
      );
  };

  // Agent-Model-Dataset Chain Relationships
  const renderAgentModelDatasetChains = () => {
    return linkedAgents.map((agent: Agent, agentIndex: number) =>
      agent.model_ids?.map((modelId: string, modelIndex: number) => {
        const model = linkedModels.find((m: Model) => m.doc_id === modelId);
        if (!model) {
          return null;
        }

        const modelDatasets =
          model?.dataset_ids
            ?.map((datasetId: string) =>
              linkedDatasets?.find((d: Dataset) => d.doc_id === datasetId)
            )
            .filter((dataset): dataset is Dataset => dataset !== undefined) ||
          [];

        if (modelDatasets.length > 0) {
          // Show Agent -> Model -> Dataset chain for each dataset
          return modelDatasets.map((dataset: Dataset, datasetIndex: number) => (
            <motion.div
              key={`${agent.doc_id}-${modelId}-${dataset.doc_id}`}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 p-6 shadow-lg dark:from-purple-900/20 dark:via-blue-900/20 dark:to-green-900/20"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                transition: `all 0.3s ease ${(agentIndex + modelIndex + datasetIndex) * 0.1 + 0.2}s`
              }}
            >
              {/* Tree connection indicator */}
              <div className="absolute -top-6 left-1/2 flex -translate-x-1/2 items-center">
                <div className="h-6 w-px bg-gradient-to-b from-indigo-300 to-purple-300"></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex w-full items-center space-x-3">
                  {/* Application connection */}
                  <div className="flex items-center space-x-2">
                    <div className="rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 p-2 dark:from-indigo-900 dark:to-indigo-800">
                      <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      {data?.name || "App"}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <div className="h-px w-6 bg-gradient-to-r from-indigo-300 to-purple-300"></div>
                    <div className="rounded-full bg-white p-1 shadow-sm dark:bg-gray-700">
                      <GitBranch className="h-2 w-2 text-gray-500" />
                    </div>
                    <div className="h-px w-6 bg-gradient-to-r from-indigo-300 to-purple-300"></div>
                  </div>

                  {/* Agent */}
                  <div className="flex items-center space-x-2">
                    <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                      <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                        {agent.agent_name}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        Agent
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <div className="h-px w-8 bg-gradient-to-r from-purple-300 to-blue-300"></div>
                    <div className="rounded-full bg-white p-1 shadow-sm dark:bg-gray-700">
                      <Zap className="h-2 w-2 text-gray-500" />
                    </div>
                    <div className="h-px w-8 bg-gradient-to-r from-purple-300 to-blue-300"></div>
                  </div>

                  {/* Model */}
                  <div className="flex items-center space-x-2">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                      <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {model.model_name}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Model
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <div className="h-px w-8 bg-gradient-to-r from-blue-300 to-green-300"></div>
                    <div className="rounded-full bg-white p-1 shadow-sm dark:bg-gray-700">
                      <GitBranch className="h-2 w-2 text-gray-500" />
                    </div>
                    <div className="h-px w-8 bg-gradient-to-r from-blue-300 to-green-300"></div>
                  </div>

                  {/* Dataset */}
                  <div className="flex items-center space-x-2">
                    <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                      <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {dataset.name}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Dataset
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-white/50 p-3 dark:bg-gray-700/50">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Complete AI pipeline: Agent{" "}
                  <span className="font-medium">{agent.agent_name}</span>{" "}
                  utilizes model{" "}
                  <span className="font-medium">{model.model_name}</span>{" "}
                  trained on dataset{" "}
                  <span className="font-medium">{dataset.name}</span>
                </p>
              </div>
            </motion.div>
          ));
        } else {
          // Show Agent -> Model only (no datasets)
          return (
            <motion.div
              key={`${agent.doc_id}-${modelId}`}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-50 via-white to-blue-50 p-6 shadow-lg dark:from-purple-900/20 dark:via-gray-800 dark:to-blue-900/20"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                transition: `all 0.3s ease ${(agentIndex + modelIndex) * 0.1 + 0.2}s`
              }}
            >
              {/* Tree connection indicator */}
              <div className="absolute -top-6 left-1/2 flex -translate-x-1/2 items-center">
                <div className="h-6 w-px bg-gradient-to-b from-indigo-300 to-purple-300"></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex w-full items-center space-x-4">
                  {/* Application connection */}
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 p-2 dark:from-indigo-900 dark:to-indigo-800">
                      <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400">
                      {data?.name || "App"}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="h-px w-8 bg-gradient-to-r from-indigo-300 to-purple-300"></div>
                    <div className="rounded-full bg-white p-1 shadow-sm dark:bg-gray-700">
                      <GitBranch className="h-3 w-3 text-gray-500" />
                    </div>
                    <div className="h-px w-8 bg-gradient-to-r from-indigo-300 to-purple-300"></div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                      <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-700 dark:text-purple-300">
                        {agent.agent_name}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        Agent
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="h-px w-12 bg-gradient-to-r from-purple-300 to-blue-300"></div>
                    <div className="rounded-full bg-white p-2 shadow-sm dark:bg-gray-700">
                      <Zap className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="h-px w-12 bg-gradient-to-r from-purple-300 to-blue-300"></div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                      <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-700 dark:text-blue-300">
                        {model.model_name}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Model
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-white/50 p-3 dark:bg-gray-700/50">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Agent utilizes model capabilities for{" "}
                  <span className="font-medium">
                    {agent.purpose || "processing tasks"}
                  </span>
                </p>
              </div>
            </motion.div>
          );
        }
      })
    );
  };

  // Check if there are any relationships
  const hasRelationships = () => {
    const modelsUsedByAgents = getModelsUsedByAgents();
    const hasModelDatasetRelations = linkedModels
      .filter((m: Model) => !modelsUsedByAgents.includes(m.doc_id))
      .some((m: Model) => m.dataset_ids?.length);
    const hasAgentModelRelations = linkedAgents.some(
      (a: Agent) => a.model_ids?.length
    );
    return hasModelDatasetRelations || hasAgentModelRelations;
  };

  return (
    <motion.div
      className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-indigo-50 p-8 shadow-xl dark:border-neutral-700 dark:from-darkSidebarBackground dark:to-indigo-900/20"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="mb-8 flex items-center space-x-4">
        <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 p-3 shadow-lg">
          <GitBranch className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resource Relationships
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connected components and data flow
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Agent-Model-Dataset Chain Relationships */}
        {renderAgentModelDatasetChains()}

        {/* Model-Dataset Relationships (only for models NOT used by agents) */}
        {renderModelDatasetRelationships()}

        {/* If no relationships found */}
        {!hasRelationships() && (
          <motion.div
            className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="mb-6">
              <div className="mx-auto w-fit rounded-2xl bg-gradient-to-r from-gray-400 to-gray-500 p-4 opacity-50">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-white" />
                  <span className="font-medium text-white">
                    {data?.name || "AI Application"}
                  </span>
                </div>
              </div>
              <div className="mx-auto mt-4 h-8 w-px bg-gradient-to-b from-gray-300 to-transparent opacity-30"></div>
            </div>
            <GitBranch className="mx-auto h-16 w-16 text-gray-400" />
            <h4 className="mt-6 text-xl font-medium text-gray-900 dark:text-white">
              No Relationships Found
            </h4>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Create connections between your models, datasets, and agents to
              visualize their relationships with{" "}
              <strong>{data?.name || "this application"}</strong>.
              <br />
              <span className="text-xs text-gray-400">
                Complete chains like Agent → Model → Dataset will be displayed
                automatically
              </span>
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ResourceRelationships;
