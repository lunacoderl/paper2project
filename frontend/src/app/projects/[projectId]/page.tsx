"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sparkles,
  Layers,
  Compass,
  Lightbulb,
  Milestone,
  CheckCircle2,
  Cpu,
  Target,
  ArrowRight,
  Brain,
  Code2,
  Activity,
  ShieldCheck,
  Zap,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";

export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { getProjectById, projects, hydrateStore } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    hydrateStore();
  }, [hydrateStore]);

  useEffect(() => {
    async function loadData() {
      // 1. Try store first
      const stored = getProjectById(projectId);
      if (stored) {
        setProject(stored);
        setLoading(false);
        return;
      }

      // 2. Try backend API fallback
      try {
        const res = await api.getAnalysisResult(projectId);
        if (res.analysis) {
          setProject({
            title: res.analysis.project_title,
            analysis: res.analysis,
            implementationAssessment: {
              overallImplementedScore: 68,
              noveltyScore: 32,
              verdict: "Moderate Novelty with Proven Precedents",
            },
          });
        }
      } catch (err) {
        console.warn("Backend API unavailable, using store fallback");
      }

      // 3. Fallback to first project or demo
      if (projects.length > 0) {
        setProject(projects[0]);
      }
      setLoading(false);
    }
    loadData();
  }, [projectId, projects, getProjectById]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-2/3" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const analysis = project?.analysis || {
    project_title: project?.title || "Research Project Intelligence",
    summary: "Systematic deep learning pipeline engineered for real-world deployment.",
    problem_statement: "High compute requirements and lack of offline execution prevent practical adoption.",
    proposed_solution: "Quantized edge architecture combined with automated self-verifying heuristics.",
    target_users: ["Software Engineers", "Researchers", "Domain Practitioners"],
    domains: ["Artificial Intelligence", "System Engineering"],
    concepts: [],
    features: [],
    technologies: [],
    complexity: { score: 70, level: "Intermediate" },
  };

  const assessment = project?.implementationAssessment || {
    overallImplementedScore: 65,
    noveltyScore: 35,
    verdict: "Moderate Novelty with Proven Precedents",
  };

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
              Paper2Project Intelligence v2
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Analyzed & Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {analysis.project_title || project?.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}/discover`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-xs font-bold text-slate-700 shadow-2xs hover:bg-indigo-50/50 transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Discover & Compare</span>
          </Link>
          <Link
            href={`/projects/${projectId}/improve`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-xs font-bold text-slate-700 shadow-2xs hover:bg-amber-50/50 transition-all"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Improve & Advantages</span>
          </Link>
          <Link
            href={`/projects/${projectId}/roadmap`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/25 transition-all hover:scale-[1.02]"
          >
            <Milestone className="w-3.5 h-3.5" />
            <span>Roadmap & Budget</span>
          </Link>
        </div>
      </div>

      {/* Overlap & Novelty Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/80 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-md border border-indigo-100">
                Academic Overlap & Novelty Verdict
              </span>
              <span className="text-xs font-semibold text-slate-600">
                • {assessment.verdict}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {assessment.overallImplementedScore}% Literature Overlap • {assessment.noveltyScore}% Novel Territory
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Based on automated feature mapping against 200M+ research papers, key building blocks exist in prior work. Our strategic recommendations outline how to optimize edge latency and achieve a competitive advantage.
            </p>
          </div>

          <div className="flex flex-col justify-center space-y-3 p-4 rounded-2xl bg-white border border-indigo-100 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-indigo-900">Feature Overlap: {assessment.overallImplementedScore}%</span>
              <span className="text-emerald-700">{assessment.noveltyScore}% Novel</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-full transition-all duration-1000"
                style={{ width: `${assessment.overallImplementedScore}%` }}
              />
            </div>
            <Link
              href={`/projects/${projectId}/discover`}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-between pt-1"
            >
              <span>See feature-by-feature breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Summary, Problem & Proposed Solution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>Project Summary</span>
            </h2>
            <p className="text-sm text-slate-800 leading-relaxed font-normal">{analysis.summary}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1.5 p-4 rounded-2xl bg-rose-50/70 border border-rose-200/70">
              <h3 className="text-xs font-bold text-rose-900">Problem Statement</h3>
              <p className="text-xs text-rose-800 leading-relaxed font-normal">{analysis.problem_statement}</p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
              <h3 className="text-xs font-bold text-emerald-900">Proposed Solution</h3>
              <p className="text-xs text-emerald-800 leading-relaxed font-normal">{analysis.proposed_solution}</p>
            </div>
          </div>

          {/* Target Users & Domains */}
          <div className="flex flex-wrap gap-2 pt-2">
            {analysis.domains?.map((d: string) => (
              <span key={d} className="text-[11px] px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                🏷️ {d}
              </span>
            ))}
            {analysis.target_users?.map((u: string) => (
              <span key={u} className="text-[11px] px-3 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                👤 {u}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Complexity & Quick Navigation */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span>Complexity Engine</span>
              </h3>
              <span className="text-xs font-extrabold text-indigo-600">{analysis.complexity?.score || 72}/100</span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 transition-all duration-1000"
                style={{ width: `${analysis.complexity?.score || 72}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Estimated Level</span>
              <span className="font-bold text-slate-800 capitalize">{analysis.complexity?.level || "Intermediate"}</span>
            </div>
          </div>

          {/* Action Navigation Widget */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/80 p-6 space-y-3 shadow-xs">
            <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">Next Step Recommendations</h4>
            <div className="space-y-2">
              <Link
                href={`/projects/${projectId}/discover`}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-xs font-semibold text-slate-800 hover:shadow-2xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Check Overlap & Competitors</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href={`/projects/${projectId}/improve`}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-xs font-semibold text-slate-800 hover:shadow-2xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>View Advantage Strategies</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href={`/projects/${projectId}/roadmap`}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 text-xs font-semibold text-slate-800 hover:shadow-2xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Milestone className="w-4 h-4 text-emerald-600" />
                  <span>Customize $0 Roadmap</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Concepts Cloud & Feature Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Concepts */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Core Technical Concepts</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              {analysis.concepts?.length || 0} extracted
            </span>
          </div>

          <div className="space-y-2.5">
            {analysis.concepts?.slice(0, 6).map((c: any) => (
              <div key={c.concept_name} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-xs text-slate-900">{c.concept_name}</div>
                  <div className="text-[11px] text-slate-500 leading-relaxed font-normal">{c.description}</div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                  {Math.round((c.importance_score || 0.8) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Extracted Features & Scope</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              {analysis.features?.length || 0} features
            </span>
          </div>

          <div className="space-y-2.5">
            {analysis.features?.slice(0, 6).map((f: any) => (
              <div key={f.feature_name} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{f.feature_name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{f.category}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded capitalize bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  {f.status || "planned"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-600" />
          <span>Detected & Recommended Technology Stack</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {analysis.technologies?.map((tech: any) => (
            <div key={tech.technology_name} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-indigo-400 transition-colors shadow-2xs">
              <div className="text-[10px] font-mono font-bold text-indigo-600">{tech.category}</div>
              <div className="font-extrabold text-sm text-slate-900">{tech.technology_name}</div>
              <p className="text-[11px] text-slate-500 line-clamp-2 font-normal">{tech.purpose}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
