"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Milestone,
  CheckCircle2,
  Clock,
  Zap,
  Sliders,
  Sparkles,
  Circle,
  Layers,
  DollarSign,
  Cpu,
  Users,
  Calendar,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  generateCustomizedRoadmap,
  DynamicRoadmap,
  RoadmapQuestionnaireAnswers,
  RoadmapPhase,
} from "@/lib/demo-engine";

export default function RoadmapPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { getProjectById, projects, updateProjectRoadmap, toggleRoadmapTask, hydrateStore } = useAppStore();

  const [project, setProject] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<DynamicRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  // Questionnaire & Hardware Specs State
  const [answers, setAnswers] = useState<RoadmapQuestionnaireAnswers>({
    timePeriod: "1_month",
    equipment: "laptop_cpu",
    budget: "free_0",
    skillLevel: "intermediate",
    teamSize: "solo",
    focus: "speed_mvp",
  });

  const [hardware, setHardware] = useState({
    deviceType: "laptop",
    cpu: "Intel Core i5 / AMD Ryzen 5",
    ram: "8gb",
    diskSpace: "50gb",
    gpu: "none_integrated",
    os: "windows",
  });

  useEffect(() => {
    hydrateStore();
  }, [hydrateStore]);

  useEffect(() => {
    const p = getProjectById(projectId) || projects[0];
    if (p) {
      setProject(p);
      if (p.roadmap) {
        setRoadmap(p.roadmap);
      } else if (p.analysis) {
        const generated = generateCalibratedRoadmap(p.analysis, answers, hardware);
        setRoadmap(generated);
        updateProjectRoadmap(projectId, generated);
      }
    }
    setLoading(false);
  }, [projectId, projects, getProjectById]);

  const handleApplyQuestionnaire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?.analysis) return;

    const generated = generateCalibratedRoadmap(project.analysis, answers, hardware);
    setRoadmap(generated);
    updateProjectRoadmap(projectId, generated);
    setShowQuestionnaire(false);
  };

  const handleToggle = (taskId: string) => {
    toggleRoadmapTask(projectId, taskId);
    if (roadmap) {
      const updatedPhases = roadmap.phases.map((phase) => ({
        ...phase,
        tasks: phase.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
      }));
      setRoadmap({ ...roadmap, phases: updatedPhases });
    }
  };

  if (loading || !roadmap) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-2/3" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  // Calculate progress
  const allTasks = roadmap.phases.flatMap((p) => p.tasks);
  const completedCount = allTasks.filter((t) => t.completed).length;
  const progressPercent = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              Dynamic Execution Planner
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
              Budget: {roadmap.budgetBreakdown.tier}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Implementation Roadmap & Constraints
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal mt-1">
            Customized schedule considering your exact time period, equipment, and budget from $0 free-tier to custom.
          </p>
        </div>

        <button
          onClick={() => setShowQuestionnaire(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/25 transition-all self-start sm:self-auto hover:scale-[1.02]"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Customize Roadmap Questions</span>
        </button>
      </div>

      {/* PC Hardware & Zero-Cost Prototype Execution Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-7 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Target PC Hardware Calibrated
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-emerald-400 font-bold">100% Working Prototype Path</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                {hardware.deviceType.toUpperCase()} ({hardware.cpu}) • {hardware.ram.toUpperCase()} RAM • {hardware.os.toUpperCase()}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setShowQuestionnaire(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors self-start sm:self-auto"
          >
            Change Specs
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <span>🖥️</span>
              <span>GPU / Acceleration Mode</span>
            </div>
            <div className="font-extrabold text-indigo-300">
              {hardware.gpu === "none_integrated"
                ? "CPU Quantized (INT8 ONNX)"
                : hardware.gpu === "apple_silicon"
                ? "Apple Metal (MPS Unified Memory)"
                : hardware.gpu === "free_cloud_colab"
                ? "Free Cloud T4 (Google Colab)"
                : "NVIDIA CUDA Acceleration"}
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              {hardware.gpu === "none_integrated"
                ? "Lightweight ONNX model export eliminates GPU requirements."
                : "Hardware acceleration active for faster convergence."}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <span>💾</span>
              <span>Memory & Disk Strategy</span>
            </div>
            <div className="font-extrabold text-emerald-300">
              {hardware.ram.toUpperCase()} RAM • {hardware.diskSpace} Free Disk
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              Chunked dataset streaming prevents out-of-memory crashes on your local system.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <span>🚀</span>
              <span>Public Live Deployment</span>
            </div>
            <div className="font-extrabold text-amber-300">
              $0.00 Free-Tier Public URL
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              Vercel + Supabase + Hugging Face Spaces free tiers with zero credit card needed.
            </p>
          </div>
        </div>
      </div>

      {/* Progress & Overview Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Overall Milestone Progress</div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {completedCount} of {allTasks.length} Tasks Finished ({progressPercent}%)
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Duration: <strong>{roadmap.totalDurationWeeks} Weeks</strong></span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Est. Effort: <strong>{roadmap.totalEstimatedHours} Hours</strong></span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 shadow-2xs">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cost: <strong>{roadmap.budgetBreakdown.totalCostEst}</strong></span>
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2-Column Constraint Panels: Budget & Equipment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Allocation Panel */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Budget Breakdown</h3>
                <p className="text-[11px] text-slate-500">{roadmap.budgetBreakdown.tier}</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              {roadmap.budgetBreakdown.totalCostEst}
            </span>
          </div>

          <div className="space-y-2.5">
            {roadmap.budgetBreakdown.items.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{item.item}</div>
                  <div className="text-[11px] text-slate-500">
                    Free Option: <span className="font-semibold text-indigo-600">{item.freeAlternative}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200 self-start sm:self-auto shrink-0">
                  {item.cost}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment & Hardware Panel */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Equipment & Compute Specs</h3>
                <p className="text-[11px] text-slate-500">Requirements & Free Cloud Alternatives</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
              Laptop / Cloud Ready
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="font-bold text-slate-700 mb-1">Required Hardware:</div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside font-normal">
                {roadmap.equipmentChecklist.required.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-bold text-slate-700 mb-1">Free Cloud GPU Alternatives:</div>
              <ul className="space-y-1 text-slate-600 list-disc list-inside font-normal">
                {roadmap.equipmentChecklist.freeCloudOptions.map((opt, i) => (
                  <li key={i} className="text-emerald-800 font-medium">
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Phases Timeline & Tasks */}
      <div className="space-y-6">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Milestone className="w-5 h-5 text-indigo-600" />
          <span>Milestone Execution Phases ({roadmap.phases.length} Phases)</span>
        </h2>

        {roadmap.phases.map((phase) => {
          const completedInPhase = phase.tasks.filter((t) => t.completed).length;

          return (
            <div
              key={phase.id}
              className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs hover:border-indigo-300 transition-colors"
            >
              {/* Phase Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Phase {phase.phaseNumber}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      ⏱ {phase.durationWeeks} Weeks
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-600">
                      {completedInPhase}/{phase.tasks.length} Completed
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{phase.title}</h3>
                  <p className="text-xs text-slate-500 font-normal">{phase.description}</p>
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="space-y-3">
                {phase.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggle(task.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      task.completed
                        ? "bg-emerald-50/40 border-emerald-200 text-slate-500"
                        : "bg-slate-50/70 border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        className={`w-5 h-5 rounded-lg flex items-center justify-center mt-0.5 transition-colors ${
                          task.completed
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "border-2 border-slate-300 bg-white hover:border-indigo-500"
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="space-y-1">
                        <div
                          className={`text-xs font-bold ${
                            task.completed ? "line-through text-slate-400" : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal">{task.description}</p>

                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                          <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-bold">
                            ⏱ {task.estimatedHours} hrs
                          </span>
                          <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold">
                            💰 {task.budgetRequirement}
                          </span>
                          <span className="text-slate-500 font-medium">
                            Equipment: {task.equipmentNeeded}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0 ${
                        task.priority === "high"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : task.priority === "medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* QUESTIONNAIRE MODAL */}
      {showQuestionnaire && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  <span>Customize Your Implementation Constraints</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Answer these questions to calibrate hours, timeline, equipment, and budget.
                </p>
              </div>
              <button
                onClick={() => setShowQuestionnaire(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyQuestionnaire} className="space-y-5 text-xs">
              {/* Question 1: Time Period */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>1. Available Time Period</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "1-2_weeks", label: "1-2 Weeks (MVP)" },
                    { id: "1_month", label: "1 Month (Fast)" },
                    { id: "3_months", label: "3 Months (Standard)" },
                    { id: "6_months", label: "6 Months (Research)" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, timePeriod: opt.id as any })}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                        answers.timePeriod === opt.id
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Comprehensive PC Hardware Specifications */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span className="font-extrabold text-slate-900 text-xs">2. Your Exact PC / Laptop Specifications</span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Our algorithm will calibrate memory allocation, quantization, and execution commands to your hardware.
                </p>

                {/* Sub-question: Device & OS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Machine Type</label>
                    <select
                      value={hardware.deviceType}
                      onChange={(e) => setHardware({ ...hardware, deviceType: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs"
                    >
                      <option value="laptop">Standard Laptop</option>
                      <option value="desktop">Desktop Workstation</option>
                      <option value="mac">Apple Mac (MacBook / Mac Mini)</option>
                      <option value="linux">Linux Machine / Rig</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Operating System</label>
                    <select
                      value={hardware.os}
                      onChange={(e) => setHardware({ ...hardware, os: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs"
                    >
                      <option value="windows">Windows 11 / 10</option>
                      <option value="macos">macOS (Apple Silicon)</option>
                      <option value="linux">Ubuntu / Debian Linux</option>
                    </select>
                  </div>
                </div>

                {/* Sub-question: RAM & Disk Space */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Installed RAM</label>
                    <select
                      value={hardware.ram}
                      onChange={(e) => setHardware({ ...hardware, ram: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs"
                    >
                      <option value="4gb">4 GB RAM (Strict INT8 CPU Mode)</option>
                      <option value="8gb">8 GB RAM (Standard Laptop)</option>
                      <option value="16gb">16 GB RAM (Recommended Dev Machine)</option>
                      <option value="32gb_plus">32 GB+ RAM (High-Performance)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Free SSD / Disk Space</label>
                    <select
                      value={hardware.diskSpace}
                      onChange={(e) => setHardware({ ...hardware, diskSpace: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs"
                    >
                      <option value="under_20gb">&lt; 20 GB (Minimal disk cache)</option>
                      <option value="50gb">50 GB (Standard)</option>
                      <option value="100gb_plus">100 GB+ (Abundant)</option>
                    </select>
                  </div>
                </div>

                {/* Sub-question: Dedicated GPU / VRAM */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Dedicated GPU / Acceleration</label>
                  <select
                    value={hardware.gpu}
                    onChange={(e) => setHardware({ ...hardware, gpu: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs"
                  >
                    <option value="none_integrated">No Dedicated GPU (Integrated Intel/AMD Graphics)</option>
                    <option value="free_cloud_colab">Free Cloud GPU (Google Colab Free T4)</option>
                    <option value="nvidia_4gb">NVIDIA GTX / RTX 4GB VRAM (1650 / 3050)</option>
                    <option value="nvidia_8gb_plus">NVIDIA RTX 8GB+ VRAM (3060 / 4060 / 3080)</option>
                    <option value="apple_silicon">Apple Silicon M-Series Metal GPU</option>
                  </select>
                </div>
              </div>

              {/* Question 3: Budget Range */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>3. Budget Range (From $0 to Custom)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: "free_0", label: "$0 (100% Free Tiers & Open-Source)", desc: "Vercel, Supabase, Colab T4, HF Free" },
                    { id: "student_budget", label: "$20 - $50 (Student / Hobby)", desc: "Domain + burst cloud GPU compute" },
                    { id: "enterprise", label: "$200 - $800 (Startup / Scale)", desc: "Dedicated instances + SLA reserves" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, budget: opt.id as any })}
                      className={`p-3 rounded-xl border text-left font-bold transition-all ${
                        answers.budget === opt.id
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className={`text-[10px] font-normal mt-0.5 ${answers.budget === opt.id ? "text-emerald-100" : "text-slate-500"}`}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4: Team Size & Skill Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>4. Team Size</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "solo", label: "Solo (1)" },
                      { id: "pair", label: "Pair (2)" },
                      { id: "small_team", label: "Team (3-5)" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, teamSize: opt.id as any })}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                          answers.teamSize === opt.id
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>5. Engineering Skill Level</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "beginner", label: "Beginner" },
                      { id: "intermediate", label: "Intermediate" },
                      { id: "advanced", label: "Senior/ML" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, skillLevel: opt.id as any })}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                          answers.skillLevel === opt.id
                            ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit & Cancel */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuestionnaire(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs hover:scale-[1.02] transition-all"
                >
                  Generate Calibrated Roadmap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper: Generate Calibrated 6-Phase Prototype Roadmap ───────────────────

function generateCalibratedRoadmap(
  analysis: any,
  answers: RoadmapQuestionnaireAnswers,
  hardware: { deviceType: string; cpu: string; ram: string; diskSpace: string; gpu: string; os: string }
): DynamicRoadmap {
  const durationMap: Record<string, number> = {
    "1-2_weeks": 2,
    "1_month": 4,
    "3_months": 12,
    "6_months": 24,
  };
  const totalWeeks = durationMap[answers.timePeriod] || 4;
  const weeklyHours = answers.teamSize === "small_team" ? 45 : answers.teamSize === "pair" ? 30 : 20;
  const totalEstimatedHours = totalWeeks * weeklyHours;

  const isLowRAM = hardware.ram === "4gb" || hardware.ram === "8gb";
  const hasGPU = hardware.gpu.includes("nvidia") || hardware.gpu === "apple_silicon";

  const phases: RoadmapPhase[] = [
    {
      id: "phase-1",
      phaseNumber: 1,
      title: "Environment Setup & Hardware Calibration",
      durationWeeks: Math.max(1, Math.round(totalWeeks * 0.15)),
      description: `Configure zero-error local toolchain for ${hardware.os.toUpperCase()} (${hardware.ram.toUpperCase()} RAM, ${hardware.gpu === "none_integrated" ? "CPU Quantized" : "GPU Accelerated"}).`,
      color: "from-blue-600 to-indigo-600",
      tasks: [
        {
          id: "p1-t1",
          title: "Initialize Virtual Environment & Hardware Detection",
          description: `Create clean Python 3.11 venv with platform-specific dependencies: ${hardware.os === "windows" ? "python -m venv venv && .\\venv\\Scripts\\activate" : "python3 -m venv venv && source venv/bin/activate"}.`,
          estimatedHours: 4,
          priority: "high",
          completed: true,
          deliverables: ["Working virtualenv", "requirements.txt locked"],
          equipmentNeeded: `${hardware.deviceType.toUpperCase()} (${hardware.cpu})`,
          budgetRequirement: "$0 (Free)",
        },
        {
          id: "p1-t2",
          title: hasGPU ? "Configure CUDA / Metal Runtime" : "Install INT8 ONNX Runtime for CPU Execution",
          description: hasGPU
            ? "Verify PyTorch CUDA acceleration and allocate mixed precision tensor cache."
            : "Install onnxruntime with multi-threaded AVX2/AVX512 instruction support to run models with 0ms GPU dependency.",
          estimatedHours: 6,
          priority: "high",
          completed: true,
          deliverables: ["Hardware verification script pass (0 errors)"],
          equipmentNeeded: hardware.gpu,
          budgetRequirement: "$0 (Free)",
        },
      ],
    },
    {
      id: "phase-2",
      phaseNumber: 2,
      title: "Core Algorithm & Data Ingestion Pipeline",
      durationWeeks: Math.max(1, Math.round(totalWeeks * 0.25)),
      description: `Implement core domain pipelines with memory-safe streaming fitting in ${hardware.ram.toUpperCase()} RAM.`,
      color: "from-indigo-600 to-purple-600",
      tasks: [
        {
          id: "p2-t1",
          title: `Build Ingestion Pipeline for ${analysis?.domains?.[0] || "Data"}`,
          description: isLowRAM
            ? "Implement generator-based chunk streaming (batch size 16) to keep memory footprint under 3.5GB."
            : "Standard batch ingestion with concurrent asynchronous pre-fetching.",
          estimatedHours: 12,
          priority: "high",
          completed: false,
          deliverables: ["Ingestion script", "Clean dataset parser"],
          equipmentNeeded: `${hardware.ram.toUpperCase()} RAM`,
          budgetRequirement: "$0 (Free)",
        },
        {
          id: "p2-t2",
          title: "Implement Dual-Criterion Accuracy & Novelty Scoring",
          description: "Write Pareto scoring formula balancing concept match with accuracy metrics from research baselines.",
          estimatedHours: 10,
          priority: "high",
          completed: false,
          deliverables: ["Dual-criterion scoring module", "Unit tests"],
          equipmentNeeded: "Local Machine",
          budgetRequirement: "$0 (Free)",
        },
      ],
    },
    {
      id: "phase-3",
      phaseNumber: 3,
      title: "Outperformance Features & Model Quantization",
      durationWeeks: Math.max(1, Math.round(totalWeeks * 0.2)),
      description: "Apply model quantization and component-by-component upgrades to outperform published research baselines.",
      color: "from-purple-600 to-pink-600",
      tasks: [
        {
          id: "p3-t1",
          title: "Export INT8 Quantized Model Weights",
          description: "Convert heavy PyTorch weights to INT8 ONNX graph, cutting storage footprint from ~350MB to <85MB.",
          estimatedHours: 8,
          priority: "high",
          completed: false,
          deliverables: ["models/novelty_model.onnx file", "Latency benchmark log"],
          equipmentNeeded: "Local CPU / Colab Free T4",
          budgetRequirement: "$0 (Free)",
        },
        {
          id: "p3-t2",
          title: "Implement Pluggable ML Model Inference Service",
          description: "Wire up Strategy Pattern: prioritize local custom ML model with automatic fallback to NLP engine.",
          estimatedHours: 8,
          priority: "medium",
          completed: false,
          deliverables: ["NoveltyRankerService module"],
          equipmentNeeded: "Local Machine",
          budgetRequirement: "$0 (Free)",
        },
      ],
    },
    {
      id: "phase-4",
      phaseNumber: 4,
      title: "Full-Stack Web Interface & Real-Time Visualization",
      durationWeeks: Math.max(1, Math.round(totalWeeks * 0.2)),
      description: "Assemble responsive Next.js frontend with Tailwind CSS, IndexedDB client storage, and FastAPI REST endpoints.",
      color: "from-pink-600 to-rose-600",
      tasks: [
        {
          id: "p4-t1",
          title: "Setup Client-Side IndexedDB Storage",
          description: "Cache full paper pools (10 to 1,000 papers) in user browser to avoid backend DB storage limits.",
          estimatedHours: 6,
          priority: "high",
          completed: true,
          deliverables: ["IndexedDB wrapper", "Pagination controller"],
          equipmentNeeded: "Web Browser",
          budgetRequirement: "$0 (Free)",
        },
        {
          id: "p4-t2",
          title: "Build Pre-Retrieval Keyword Verification & Paper Details Modals",
          description: "Display categorized algorithms/methods for review before search, and provide raw API JSON inspection.",
          estimatedHours: 10,
          priority: "high",
          completed: true,
          deliverables: ["KeywordVerificationModal", "PaperDetailsModal"],
          equipmentNeeded: "Web Browser",
          budgetRequirement: "$0 (Free)",
        },
      ],
    },
    {
      id: "phase-5",
      phaseNumber: 5,
      title: "Verification, Benchmarking & Accuracy Evaluation",
      durationWeeks: Math.max(1, Math.round(totalWeeks * 0.1)),
      description: "Run automated test suites and prove project superiority over retrieved research papers.",
      color: "from-amber-600 to-yellow-600",
      tasks: [
        {
          id: "p5-t1",
          title: "Benchmark Against Top-Ranked Research Papers",
          description: "Compare inference latency (p95), accuracy %, and memory consumption directly against published paper baselines.",
          estimatedHours: 8,
          priority: "high",
          completed: false,
          deliverables: ["Benchmark comparison table", "ROC/Accuracy curves"],
          equipmentNeeded: "Local Benchmark Suite",
          budgetRequirement: "$0 (Free)",
        },
      ],
    },
    {
      id: "phase-6",
      phaseNumber: 6,
      title: "100% Working Prototype & $0 Public Deployment",
      durationWeeks: Math.max(1, Math.round(totalWeeks * 0.1)),
      description: "Deploy production frontend to Vercel, serverless database to Supabase, and model API to Hugging Face Spaces for $0.",
      color: "from-emerald-600 to-teal-600",
      tasks: [
        {
          id: "p6-t1",
          title: "Deploy Next.js App Router Frontend to Vercel",
          description: "Connect GitHub repository to Vercel Hobby Tier for global edge CDN distribution with custom domain or .vercel.app link.",
          estimatedHours: 4,
          priority: "high",
          completed: false,
          deliverables: ["Live HTTPS frontend URL"],
          equipmentNeeded: "Vercel Free Tier",
          budgetRequirement: "$0 (Free)",
        },
        {
          id: "p6-t2",
          title: "Deploy Python Inference API to Hugging Face Spaces",
          description: "Containerize FastAPI application using Docker on Hugging Face Spaces (Free 2 vCPU, 16GB RAM runtime).",
          estimatedHours: 6,
          priority: "high",
          completed: false,
          deliverables: ["Public REST API endpoint", "Swagger documentation live"],
          equipmentNeeded: "Hugging Face Free Tier",
          budgetRequirement: "$0 (Free)",
        },
      ],
    },
  ];

  return {
    id: `calibrated-roadmap-${Date.now()}`,
    projectId: analysis?.project_title || "project-1",
    createdAt: new Date().toISOString(),
    totalDurationWeeks: totalWeeks,
    totalEstimatedHours,
    phases,
    budgetBreakdown: {
      tier: answers.budget === "free_0" ? "$0 Zero-Cost (100% Free Tiers)" : "Student / Custom Tier",
      totalCostEst: answers.budget === "free_0" ? "$0.00" : "$25.00 - $45.00",
      items: [
        { item: "Frontend Edge Hosting", cost: "$0 / mo", freeAlternative: "Vercel Hobby Tier" },
        { item: "Database & Authentication", cost: "$0 / mo", freeAlternative: "Supabase Free Tier" },
        { item: "Model Inference Compute", cost: "$0 / mo", freeAlternative: "Hugging Face Spaces (Free CPU 16GB)" },
        { item: "Academic Literature Retrieval", cost: "$0 / mo", freeAlternative: "Semantic Scholar & arXiv APIs" },
        { item: "Heavy Training (if needed)", cost: "$0 / mo", freeAlternative: "Google Colab Free T4 GPU" },
      ],
    },
    equipmentChecklist: {
      required: [
        `${hardware.deviceType.toUpperCase()} with ${hardware.ram.toUpperCase()} RAM`,
        `${hardware.os.toUpperCase()} Operating System`,
        "Python 3.10+ and Node.js 18+",
      ],
      recommended: [
        hardware.gpu === "none_integrated" ? "INT8 Quantized Model Execution" : "Hardware GPU Acceleration",
        `${hardware.diskSpace} free storage for dependencies`,
      ],
      freeCloudOptions: [
        "Google Colab Free T4 (Offline model evaluation)",
        "Hugging Face Spaces (Free 16GB RAM Python hosting)",
        "Vercel (Free frontend CDN deployment)",
      ],
    },
  };
}
