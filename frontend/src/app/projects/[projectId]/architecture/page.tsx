"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Network,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Database,
  Globe,
  Bot,
  Layers3,
  Server,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { generateArchitectureElements } from "@/lib/demo-engine";

export default function ArchitecturePage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { getProjectById, projects, hydrateStore } = useAppStore();

  const [project, setProject] = useState<any>(null);
  const [diagramType, setDiagramType] = useState<"system" | "data_pipeline" | "deployment">("system");
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  useEffect(() => {
    hydrateStore();
  }, [hydrateStore]);

  useEffect(() => {
    const p = getProjectById(projectId) || projects[0];
    if (p) {
      setProject(p);
      const elements = generateArchitectureElements(p.analysis, diagramType);
      setNodes(elements.nodes);
      setEdges(elements.edges);
    }
  }, [projectId, projects, diagramType, getProjectById, setNodes, setEdges]);

  const handleSwitchDiagram = (type: "system" | "data_pipeline" | "deployment") => {
    setDiagramType(type);
    if (project?.analysis) {
      const elements = generateArchitectureElements(project.analysis, type);
      setNodes(elements.nodes);
      setEdges(elements.edges);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-200 font-bold">
              Interactive System Topology
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
              React Flow Live Graph
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            System & Data Pipeline Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal mt-1">
            Dynamic node graph modeled from your detected technology stack and research components.
          </p>
        </div>

        {/* Diagram Type Switcher */}
        <div className="flex rounded-xl bg-white p-1 border border-slate-200 shadow-2xs">
          <button
            onClick={() => handleSwitchDiagram("system")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              diagramType === "system"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            System Layers
          </button>
          <button
            onClick={() => handleSwitchDiagram("data_pipeline")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              diagramType === "data_pipeline"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Data Pipeline
          </button>
          <button
            onClick={() => handleSwitchDiagram("deployment")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              diagramType === "deployment"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            $0 Cloud Deploy
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="w-full h-[620px] rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls className="bg-white border border-slate-200 shadow-xs rounded-xl text-slate-700" />
          <MiniMap
            nodeColor={(n) => {
              if (n.id.includes("client")) return "#6366f1";
              if (n.id.includes("api")) return "#8b5cf6";
              if (n.id.includes("scholar")) return "#22c55e";
              return "#ec4899";
            }}
            className="rounded-xl border border-slate-200 bg-white shadow-xs"
          />
        </ReactFlow>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs text-[11px] font-semibold text-slate-600 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Frontend Client</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Backend API</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Scholar Data</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <span>AI Reasoning</span>
          </div>
        </div>
      </div>
    </div>
  );
}
