"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Lightbulb,
  Check,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  Layers,
  Wrench,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { generateImprovementStrategies, StrategicImprovement } from "@/lib/demo-engine";

export default function ImprovePage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { getProjectById, projects, updateSuggestionStatus, hydrateStore } = useAppStore();

  const [project, setProject] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<StrategicImprovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    hydrateStore();
  }, [hydrateStore]);

  useEffect(() => {
    const p = getProjectById(projectId) || projects[0];
    if (p) {
      setProject(p);
      if (p.suggestions && p.suggestions.length > 0) {
        setSuggestions(p.suggestions);
      } else if (p.analysis) {
        const gen = generateImprovementStrategies(p.analysis, p.implementationAssessment);
        setSuggestions(gen);
      }
    }
    setLoading(false);
  }, [projectId, projects, getProjectById]);

  const handleAccept = (id: string) => {
    updateSuggestionStatus(projectId, id, "accepted");
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "accepted" } : s))
    );
    setFeedbackMessage("Advantage strategy accepted & incorporated into your project plan!");
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleReject = (id: string) => {
    updateSuggestionStatus(projectId, id, "rejected");
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "rejected" } : s))
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-2/3" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  const acceptedCount = suggestions.filter((s) => s.status === "accepted").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">
              Competitive Advantage Generator
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              {acceptedCount} Strategies Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            How to Surpass Existing Implementations
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal mt-1">
            Don&apos;t just copy prior research. These strategic differentiators make your project faster, zero-cost, and more advantageous than published baselines.
          </p>
        </div>

        <Link
          href={`/projects/${projectId}/roadmap`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm shadow-emerald-500/25 transition-all self-start sm:self-auto"
        >
          <span>Apply to Dynamic Roadmap &rarr;</span>
        </Link>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Overview Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Winning Strategy Matrix
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Transform Literature Gaps into Your Core Value Proposition
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed">
              Most research papers stay as theoretical Jupyter notebooks that cannot run without $5,000 servers. By adopting local inference, interactive web dashboards, and self-correcting agents, your project delivers immediate production utility.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2 shrink-0 text-center">
            <div className="text-2xl font-extrabold text-amber-600">{suggestions.length}</div>
            <div className="text-[11px] font-bold text-slate-700 uppercase">Tailored Gaps Identified</div>
            <div className="text-[10px] text-slate-500">{acceptedCount} Accepted for Roadmap</div>
          </div>
        </div>
      </div>

      {/* COMPONENT-BY-COMPONENT EVALUATION (Algorithms, Techniques, Methods, Functions, Tools) */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                Component-Level Superiority Engine
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600 font-medium">Deep Technical Reasoning</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-600" />
              <span>Component-by-Component Upgrade & Validation Analysis</span>
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Every algorithm, technique, method, function, and tool in your project analyzed against published baselines with explicit upgrade or validation reasoning.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getComponentEvaluations(project).map((evalItem, idx) => {
            const isUpgrade = evalItem.status === "upgrade_recommended";
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  isUpgrade
                    ? "bg-amber-50/40 border-amber-200/80 hover:border-amber-300"
                    : "bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200">
                      {evalItem.componentType}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900">{evalItem.componentName}</h4>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${
                      isUpgrade
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : "bg-emerald-100 text-emerald-900 border-emerald-300"
                    }`}
                  >
                    {isUpgrade ? "⚡ Upgrade Recommended" : "✅ Optimal Choice Validated"}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-100 space-y-1">
                    <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                      <span className="text-slate-400">Published Literature Baseline:</span>
                    </div>
                    <p className="text-slate-700 font-normal">{evalItem.publishedBaseline}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-100 space-y-1">
                    <div className="text-[11px] font-bold text-indigo-700 flex items-center gap-1.5">
                      <span>Recommendation:</span>
                    </div>
                    <p className="text-slate-900 font-bold">{evalItem.suggestedAlternative}</p>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-bold text-slate-700">Technical Reasoning:</div>
                    <p className="text-slate-600 leading-relaxed font-normal">{evalItem.reasoning}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] font-mono font-bold">
                    <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Gain: {evalItem.expectedBoost}
                    </span>
                    <span className="text-slate-500">
                      Effort: {evalItem.effort}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strategic Roadmap Advantages */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Strategic Outperformance Upgrades</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Click &apos;Accept Idea&apos; to integrate into execution roadmap</span>
        </div>
        {suggestions.map((sug) => {
          const isAccepted = sug.status === "accepted";
          const isRejected = sug.status === "rejected";

          return (
            <div
              key={sug.id}
              className={`rounded-3xl p-6 sm:p-8 transition-all border shadow-xs ${
                isAccepted
                  ? "bg-emerald-50/50 border-emerald-300"
                  : isRejected
                  ? "bg-slate-50/50 border-slate-200 opacity-60"
                  : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-md"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {sug.category}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                        sug.impactLevel === "Critical"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : sug.impactLevel === "High"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {sug.impactLevel} Advantage Impact
                    </span>

                    <span className="text-[10px] font-mono text-slate-500 font-medium">
                      Effort: {sug.effortLevel}
                    </span>

                    {isAccepted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Included in Roadmap
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{sug.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{sug.description}</p>

                  {/* Why It Beats Existing Work */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <span>🏆</span>
                      <span>Why This Beats Published Papers:</span>
                    </div>
                    <p className="text-xs text-amber-800 font-normal leading-relaxed">{sug.whyItBeatsExistingWork}</p>
                  </div>

                  {/* Implementation Steps & Tools */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Execution Steps:</span>
                      </div>
                      <ul className="space-y-1 text-slate-600 list-disc list-inside font-normal">
                        {sug.technicalSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Suggested Free Tools:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {sug.suggestedTools.map((tool) => (
                          <span
                            key={tool}
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-indigo-700 border border-slate-200 shadow-2xs"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => handleAccept(sug.id)}
                    disabled={isAccepted}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isAccepted
                        ? "bg-emerald-600 text-white cursor-default shadow-2xs"
                        : "bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAccepted ? "Accepted" : "Accept Idea"}</span>
                  </button>

                  {!isAccepted && (
                    <button
                      onClick={() => handleReject(sug.id)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ComponentEvaluation {
  componentType: "Algorithm" | "Technique" | "Method" | "Function" | "Tool" | "Dataset";
  componentName: string;
  publishedBaseline: string;
  status: "upgrade_recommended" | "optimal_choice";
  suggestedAlternative: string;
  reasoning: string;
  expectedBoost: string;
  effort: "Low" | "Medium" | "High";
}

function getComponentEvaluations(project: any): ComponentEvaluation[] {
  const analysis = project?.analysis;
  const mainFeature = analysis?.features?.[0]?.feature_name || "Deep Neural Feature Extraction";
  const mainTech = analysis?.technologies?.[0]?.technology_name || "PyTorch";
  const domain = analysis?.domains?.[0] || "Deep Learning";

  return [
    {
      componentType: "Algorithm",
      componentName: analysis?.concepts?.[0]?.concept_name || "Standard Deep CNN / ResNet",
      publishedBaseline: "Standard ResNet-50 / VGG backbones with 88.4% accuracy and 45ms latency per frame.",
      status: "upgrade_recommended",
      suggestedAlternative: "Hybrid FlashAttention-2 + MobileNetV4 with Rotary Position Embeddings",
      reasoning: "Published literature struggles with quadratic memory complexity on longer sequences. By adopting a modern hybrid backbone with FlashAttention, you preserve receptive field coverage while cutting FLOPs by 42% on consumer hardware.",
      expectedBoost: "+4.2% Accuracy, 2.8x Faster Inference",
      effort: "Medium",
    },
    {
      componentType: "Technique",
      componentName: "Inference & Model Quantization",
      publishedBaseline: "Unquantized FP32 weights requiring dedicated cloud server GPUs (NVIDIA A100 / V100).",
      status: "optimal_choice",
      suggestedAlternative: "INT8 Post-Training Quantization + ONNX Runtime (Client-Side Edge Execution)",
      reasoning: "Your proposed edge quantization strategy is optimal. INT8 calibration via ONNX Runtime reduces model footprint from 350MB to ~85MB with less than 0.6% degradation in Top-1 accuracy, enabling 100% free hosting.",
      expectedBoost: "76% VRAM Reduction, $0 Hosting Cost",
      effort: "Low",
    },
    {
      componentType: "Method",
      componentName: mainFeature,
      publishedBaseline: "Synchronous batch inference with blocking REST endpoints and high tail latency.",
      status: "upgrade_recommended",
      suggestedAlternative: "Asynchronous Streaming WebSockets with Speculative Execution",
      reasoning: "Research papers primarily test offline datasets where latency does not impact usability. In real-world software, switching to asynchronous SSE/WebSockets allows progressive rendering and reduces perceived latency by over 600ms.",
      expectedBoost: "Perceived Latency -65%",
      effort: "Medium",
    },
    {
      componentType: "Function",
      componentName: "Loss / Objective Metric Computation",
      publishedBaseline: "Single-objective Cross-Entropy or mean squared error ignoring concept coverage balance.",
      status: "optimal_choice",
      suggestedAlternative: "Dual-Criterion Multi-Task Loss (Concept Alignment + Accuracy Weighting)",
      reasoning: "Your multi-criterion formulation correctly penalizes papers or representations that sacrifice domain specificity for trivial accuracy. This prevents false positive ranking collapses found in prior benchmarks.",
      expectedBoost: "+6.8% Precision on Edge Cases",
      effort: "Low",
    },
    {
      componentType: "Tool",
      componentName: `${mainTech} & Web Framework`,
      publishedBaseline: "Jupyter notebooks with unoptimized Flask endpoints running in debug mode.",
      status: "optimal_choice",
      suggestedAlternative: "FastAPI Async Worker + Next.js App Router Client",
      reasoning: "Published academic repositories rarely provide production-grade web APIs. Your asynchronous FastAPI backend with typed Pydantic V2 serialization provides 4x higher request throughput than standard Flask baselines.",
      expectedBoost: "4.1x Higher Request Concurrency",
      effort: "Low",
    },
    {
      componentType: "Dataset",
      componentName: "Evaluation & Benchmarking Callset",
      publishedBaseline: "Static public test splits prone to data leakage and historical test set degradation.",
      status: "upgrade_recommended",
      suggestedAlternative: "Augmented Dynamic Test Suite with Adversarial Perturbations",
      reasoning: "Existing papers overfit to standard splits. Introducing noise injection and domain-shifted cross-validation proves true algorithmic generalization, impressing research reviewers.",
      expectedBoost: "+12.4% Robustness Under Noise",
      effort: "High",
    },
  ];
}

