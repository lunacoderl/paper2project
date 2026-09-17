"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Plus,
  Search,
  FolderKanban,
  ArrowUpRight,
  Clock,
  Layers,
  CheckCircle2,
  Trash2,
  Tag,
  BarChart2,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAppStore, ProjectData } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { analyzeProjectText } from "@/lib/text-analyzer";
import { analyzeImplementationStatus, generateImprovementStrategies, generateCustomizedRoadmap } from "@/lib/demo-engine";

export default function DashboardPage() {
  const router = useRouter();
  const { projects, saveProject, deleteProject, hydrateStore, isHydrated } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrateStore();
    setLoading(false);
  }, [hydrateStore]);

  // Seed default sample projects if store is empty after hydration
  useEffect(() => {
    if (!loading && isHydrated && projects.length === 0) {
      const sample1Text = `Title: EdgeVision — AI-Powered Crop Disease Detection & Local Offline Treatment
Domain: Computer Vision, Agriculture, Edge AI
Summary: A lightweight computer vision application utilizing quantized MobileNetV3 and ResNet backbones to diagnose 38 crop disease classes in real-time. Designed to run offline on low-cost smartphones and Raspberry Pi edge devices without needing cellular internet in rural farming communities.
Features:
- Offline edge inference with INT8 quantization
- Multi-crop leaf disease classification with 94% mAP
- Remediation prescription engine based on local agricultural guidelines
- Multi-lingual voice output for non-literate farmers
- Batch scan gallery with disease progression tracking
Technologies: PyTorch, MobileNetV3, ONNX Runtime, React, Tailwind CSS, FastAPI, SQLite`;

      const analysis1 = analyzeProjectText(sample1Text, "EdgeVision — Offline Crop Disease Detection");
      const assessment1 = analyzeImplementationStatus(analysis1, []);
      const suggestions1 = generateImprovementStrategies(analysis1, assessment1);
      const roadmap1 = generateCustomizedRoadmap(analysis1, {
        timePeriod: "1_month",
        equipment: "laptop_cpu",
        budget: "free_0",
        skillLevel: "intermediate",
        teamSize: "solo",
        focus: "speed_mvp",
      });

      const sampleProject1: ProjectData = {
        id: "demo-crop-vision",
        title: "EdgeVision — Offline Crop Disease Detection",
        description: "Lightweight computer vision model running offline on edge devices to diagnose 38 crop disease classes with actionable prescriptions.",
        sourceType: "prompt",
        rawInput: sample1Text,
        createdAt: new Date(Date.now() - 3600 * 24 * 2 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        analysis: analysis1,
        discoveredPapers: [],
        implementationAssessment: assessment1,
        suggestions: suggestions1,
        roadmap: roadmap1,
        copilotMessages: [
          {
            id: "msg-1",
            sender: "copilot",
            text: "Welcome to EdgeVision! I can help you benchmark quantization trade-offs against published ResNet baselines or configure your $0 budget deployment.",
            timestamp: "10:00 AM",
          },
        ],
      };

      const sample2Text = `Title: MediGraph — Self-Correcting RAG for Clinical Treatment Guidelines
Domain: Healthcare NLP, Graph RAG, Agentic AI
Summary: An agentic retrieval-augmented generation framework that navigates biomedical knowledge graphs and PubMed papers to assist doctors in cross-referencing rare contraindications. Features multi-hop verification and automated hallucination scoring.
Features:
- Neo4j biomedical knowledge graph navigation
- Self-corrective reflection agent with schema validation
- Source paper provenance tracking with DOI deep links
- Differential diagnosis comparison table
- Zero-retention HIPAA compliant local caching
Technologies: Python, LangChain, Neo4j, Fastembed, FastAPI, Next.js, TypeScript, HuggingFace`;

      const analysis2 = analyzeProjectText(sample2Text, "MediGraph — Self-Correcting Clinical RAG");
      const assessment2 = analyzeImplementationStatus(analysis2, []);
      const suggestions2 = generateImprovementStrategies(analysis2, assessment2);
      const roadmap2 = generateCustomizedRoadmap(analysis2, {
        timePeriod: "3_months",
        equipment: "gpu_cloud",
        budget: "student_budget",
        skillLevel: "advanced",
        teamSize: "pair",
        focus: "research_rigor",
      });

      const sampleProject2: ProjectData = {
        id: "demo-medigraph",
        title: "MediGraph — Self-Correcting Clinical RAG",
        description: "Agentic graph retrieval system verifying rare contraindications across clinical papers with zero hallucination guarantee.",
        sourceType: "doc",
        rawInput: sample2Text,
        createdAt: new Date(Date.now() - 3600 * 24 * 6 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        analysis: analysis2,
        discoveredPapers: [],
        implementationAssessment: assessment2,
        suggestions: suggestions2,
        roadmap: roadmap2,
        copilotMessages: [
          {
            id: "msg-2",
            sender: "copilot",
            text: "Hello! MediGraph has a 64% overlap with existing graph retrieval papers, but your multi-hop verification loop provides a strong novelty advantage.",
            timestamp: "11:30 AM",
          },
        ],
      };

      saveProject(sampleProject1);
      saveProject(sampleProject2);
    }
  }, [loading, isHydrated, projects.length, saveProject]);

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Projects Workspace" subtitle="Manage, compare, and execute your research projects" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 space-y-8">
        {/* Top Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/80 p-8 sm:p-10 overflow-hidden shadow-xs">
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-gradient-to-br from-indigo-200/40 to-pink-200/40 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl border border-indigo-200 bg-white shadow-2xs p-1 flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" width={24} height={24} style={{ width: "auto", height: "auto" }} className="object-contain" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-indigo-200 text-indigo-700 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Scholar Intelligence Pipeline</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Turn any research idea into an advantageous plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Upload a paper or describe any concept. We analyze literature overlap across 200M+ research papers, identify what makes your idea unique, and build a tailored roadmap from $0 to custom budget.
            </p>

            <div className="pt-2">
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/25 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create New Project</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Action & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects by title or concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-2xs transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>{filteredProjects.length} {filteredProjects.length === 1 ? "Project" : "Projects"} in Workspace</span>
          </div>
        </div>

        {/* Project Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-56 rounded-2xl bg-white border border-slate-200 animate-pulse p-6" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No projects found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Get started by uploading your research paper PDF or typing a project idea.
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const overlap = project.implementationAssessment?.overallImplementedScore || 50;
              const novelty = 100 - overlap;

              return (
                <div
                  key={project.id}
                  className="group relative rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                        {project.analysis?.domains?.[0] || "AI / Software"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDelete(e, project.id)}
                          title="Delete project"
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {project.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {project.description || project.analysis?.summary || "Project analysis context."}
                    </p>

                    {/* Novelty & Overlap Indicators */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                        <span className="text-slate-600">Literature Overlap: {overlap}%</span>
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                          {novelty}% Novel
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${overlap}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(project.createdAt)}</span>
                    </div>

                    <span className="capitalize px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                      {project.analysis?.complexity?.level || "Intermediate"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
