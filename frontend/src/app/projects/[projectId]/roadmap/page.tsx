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
} from "@/lib/demo-engine";

export default function RoadmapPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { getProjectById, projects, updateProjectRoadmap, toggleRoadmapTask, hydrateStore } = useAppStore();

  const [project, setProject] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<DynamicRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  // Questionnaire Form State
  const [answers, setAnswers] = useState<RoadmapQuestionnaireAnswers>({
    timePeriod: "1_month",
    equipment: "laptop_cpu",
    budget: "free_0",
    skillLevel: "intermediate",
    teamSize: "solo",
    focus: "speed_mvp",
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
        const generated = generateCustomizedRoadmap(p.analysis, answers);
        setRoadmap(generated);
        updateProjectRoadmap(projectId, generated);
      }
    }
    setLoading(false);
  }, [projectId, projects, getProjectById]);

  const handleApplyQuestionnaire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?.analysis) return;

    const generated = generateCustomizedRoadmap(project.analysis, answers);
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

              {/* Question 2: Equipment Available */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span>2. Equipment / Hardware Available</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: "laptop_cpu", label: "Standard Laptop (CPU Only, 8-16GB RAM)" },
                    { id: "gpu_cloud", label: "Cloud GPU (Colab, RunPod, Vast.ai)" },
                    { id: "edge_device", label: "Edge Hardware (Raspberry Pi, Jetson Nano)" },
                    { id: "cluster_server", label: "High-End Server / Multi-GPU Workstation" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, equipment: opt.id as any })}
                      className={`p-3 rounded-xl border text-left font-bold transition-all ${
                        answers.equipment === opt.id
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
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
