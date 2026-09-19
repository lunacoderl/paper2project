"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Upload,
  FileText,
  Type,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Compass,
  Lightbulb,
  FileCode,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAppStore, ProjectData } from "@/lib/store";
import { analyzeProjectText, extractTextFromFile, generateSearchQueries } from "@/lib/text-analyzer";
import { searchPapers } from "@/lib/semantic-scholar";
import {
  analyzeImplementationStatus,
  generateImprovementStrategies,
  generateCustomizedRoadmap,
} from "@/lib/demo-engine";
import { predictProjectNovelty } from "@/lib/novelty-client";

export default function NewProjectPage() {
  const router = useRouter();
  const { saveProject } = useAppStore();
  const [activeTab, setActiveTab] = useState<"file" | "text">("text");
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const processingSteps = [
    "Reading & extracting full text content",
    "Identifying core technical concepts & domain entities",
    "Detecting features, algorithms & technology stack",
    "Benchmarking literature overlap against 200M+ research papers",
    "Generating competitive advantages & novelty gaps",
    "Synthesizing customized $0-budget execution roadmap",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!projectTitle) {
        setProjectTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleLoadSample = (sampleType: "vision" | "rag" | "drone") => {
    if (sampleType === "vision") {
      setProjectTitle("EdgeVision — Offline Crop Disease Classification");
      setTextContent(`Title: EdgeVision — AI-Powered Crop Disease Detection & Local Offline Treatment
Domain: Computer Vision, Agriculture, Edge AI
Problem Statement: Farmers in rural areas lose up to 40% of their harvest to treatable plant diseases because agricultural experts are scarce and cellular internet is unreliable for cloud-based AI.
Proposed Solution: A quantized mobile computer vision pipeline that runs 100% offline on low-power smartphones and edge cameras to detect 38 foliar disease classes, measure affected leaf surface area, and provide actionable remedies.
Key Features:
- Offline edge inference using INT8 quantized neural network backbones
- Multi-crop leaf disease classification with bounding box severity mapping
- Treatment prescription recommender using localized regional organic remedies
- Voice-assisted diagnostics in regional dialects for accessibility
- Historical disease progression tracking with localized SQLite storage
Technology Stack: PyTorch, MobileNetV3, ONNX Runtime, React, Tailwind CSS, TypeScript, SQLite`);
    } else if (sampleType === "rag") {
      setProjectTitle("BioGraph — Multi-Agent Clinical Guideline RAG");
      setTextContent(`Title: BioGraph — Multi-Agent Self-Correcting RAG for Rare Drug Interactions
Domain: Healthcare NLP, Biomedical Graphs, Agentic AI
Problem Statement: Clinical guidelines and medical literature contain conflicting recommendations across specialties. Standard LLMs hallucinate drug dosages and fail to cross-reference multi-drug interactions across medical papers.
Proposed Solution: An agentic retrieval-augmented generation framework combining PubMed biomedical literature with Neo4j structured knowledge graphs. Employs a self-corrective verification agent that cross-checks citations and flags contradictions before showing prescriptions to physicians.
Key Features:
- Knowledge graph entity linking with UMLS and MeSH medical ontologies
- Multi-hop traversal to uncover indirect drug-drug contraindications
- Self-corrective reflection agent that validates claims against original paper DOIs
- Differential diagnosis comparison table with confidence metrics
- HIPAA-compliant zero-retention ephemeral processing
Technology Stack: Python, FastAPI, Next.js, LangChain, Neo4j, Fastembed, PyTorch, Transformers`);
    } else {
      setProjectTitle("AeroNav — Vision-Only Autonomous Drone Navigation");
      setTextContent(`Title: AeroNav — GPS-Denied Visual Inertial Odometry for Search & Rescue Drones
Domain: Robotics, Autonomous Navigation, Computer Vision
Problem Statement: In search and rescue missions inside collapsed buildings or deep underground mines, GPS signals are unavailable and heavy LiDAR sensors drain drone batteries in minutes.
Proposed Solution: A lightweight visual-inertial odometry system using dual monocular RGB cameras and optical flow algorithms to build real-time 3D spatial occupancy maps with sub-10cm drift without GPS or cloud servers.
Key Features:
- Real-time stereo optical flow estimation running at 45 FPS on Raspberry Pi CM4
- 3D occupancy voxel grid mapping with automated return-to-home pathfinding
- Thermal anomaly detector for locating trapped survivors in smoke
- Ultra-low power consumption under 5 Watts total compute draw
Technology Stack: C++, Python, OpenCV, ROS2, PyTorch, TensorRT, FastAPI, Next.js`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let textToAnalyze = textContent.trim();

    if (activeTab === "file") {
      if (!file) return;
    } else {
      if (!textToAnalyze) return;
    }

    setIsProcessing(true);
    setCurrentStep(0);

    try {
      // Step 1: Text extraction
      setCurrentStep(0);
      if (activeTab === "file" && file) {
        textToAnalyze = await extractTextFromFile(file);
      }

      await new Promise((r) => setTimeout(r, 600));
      setCurrentStep(1);

      // Step 2 & 3: Run Text Analyzer
      const resolvedTitle = projectTitle.trim() || (file ? file.name.replace(/\.[^/.]+$/, "") : "Research Project");
      const analysis = analyzeProjectText(textToAnalyze, resolvedTitle);

      await new Promise((r) => setTimeout(r, 700));
      setCurrentStep(2);

      // Step 4: Semantic Scholar Paper Search
      let discoveredPapers: any[] = [];
      try {
        const queries = generateSearchQueries(analysis);
        const topQuery = queries[0] || analysis.project_title;
        const searchRes = await searchPapers(topQuery, 8);
        discoveredPapers = searchRes.data || [];
      } catch (err) {
        console.warn("Scholar API live search error (will use fallback pool):", err);
      }

      await new Promise((r) => setTimeout(r, 700));
      setCurrentStep(3);

      // Step 5: Overlap & Competitor Analysis (calls ML novelty model with local fallback)
      const assessment = await predictProjectNovelty(analysis, discoveredPapers);

      await new Promise((r) => setTimeout(r, 600));
      setCurrentStep(4);

      // Step 6: Advantage Strategies & Roadmap
      const suggestions = generateImprovementStrategies(analysis, assessment);
      const roadmap = generateCustomizedRoadmap(analysis, {
        timePeriod: "1_month",
        equipment: "laptop_cpu",
        budget: "free_0",
        skillLevel: "intermediate",
        teamSize: "solo",
        focus: "speed_mvp",
      });

      setCurrentStep(5);
      await new Promise((r) => setTimeout(r, 500));

      const newProjectId = `proj-${Date.now()}`;
      const newProject: ProjectData = {
        id: newProjectId,
        title: analysis.project_title,
        description: analysis.summary || "Structured research implementation context.",
        sourceType: activeTab === "file" ? "pdf" : "prompt",
        rawInput: textToAnalyze,
        fileName: file?.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analysis,
        discoveredPapers,
        implementationAssessment: assessment,
        suggestions,
        roadmap,
        copilotMessages: [
          {
            id: `msg-${Date.now()}`,
            sender: "copilot",
            text: `Welcome to ${analysis.project_title}! I've completed the initial literature check against 200M+ research papers. Your overlap score is ${assessment.overallImplementedScore}%. How would you like to refine your implementation?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      };

      saveProject(newProject);
      router.push(`/projects/${newProjectId}`);
    } catch (err) {
      console.error("Analysis pipeline failed:", err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 flex flex-col justify-center">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-lg space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Universal Idea & Paper Ingestion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Analyze Idea & Check Existing Implementations
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              Provide any raw prompt, document, or research paper PDF. Our pipeline decomposes your concept, queries 200M+ papers to see how much is already implemented, identifies your novel advantage, and builds a roadmap from $0 budget.
            </p>
          </div>

          {/* If Processing: Show Live Stepper */}
          {isProcessing ? (
            <div className="py-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200 shadow-xs animate-spin">
                  <Loader2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Analyzing Project Intelligence...</h3>
                <p className="text-xs text-slate-500">
                  Cross-referencing literature overlap, extracting tech requirements, and building competitive roadmap
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-3 pt-4">
                {processingSteps.map((step, idx) => {
                  const isDone = idx < currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-3 p-3.5 rounded-xl text-xs transition-all ${
                        isDone
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold"
                          : isCurrent
                          ? "bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold scale-[1.02] shadow-xs"
                          : "bg-slate-50 border border-slate-200 text-slate-400 opacity-60"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Optional Project Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Project Title (Optional)</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g., Real-Time Plant Leaf Disease Classifier with Offline Edge Inference"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-2xs transition-colors"
                />
              </div>

              {/* Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("text")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "text"
                      ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Type className="w-4 h-4 text-indigo-600" />
                  <span>Text / Idea Prompt / Paper Abstract</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("file")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "file"
                      ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Upload Document (PDF / DOCX / TXT)</span>
                </button>
              </div>

              {/* Quick Sample Prompts */}
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-slate-500 font-medium">Try instant idea templates:</span>
                <button
                  type="button"
                  onClick={() => handleLoadSample("vision")}
                  className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold transition-colors"
                >
                  🌾 Plant Disease Vision
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample("rag")}
                  className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold transition-colors"
                >
                  🧬 Medical Graph RAG
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample("drone")}
                  className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold transition-colors"
                >
                  🚁 Rescue Drone VIO
                </button>
              </div>

              {/* File Upload Mode */}
              {activeTab === "file" ? (
                <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl p-8 text-center transition-colors relative cursor-pointer bg-indigo-50/20">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center border border-indigo-200">
                      <Upload className="w-6 h-6" />
                    </div>
                    {file ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for text extraction & scholar analysis
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800">
                          Drag & drop your research paper here, or <span className="text-indigo-600 underline">browse files</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Supported formats: PDF, DOCX, TXT (up to 25MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Text Input Mode */
                <div className="space-y-1.5">
                  <textarea
                    rows={9}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Paste the abstract, methodology, or full text of a research paper, or write your raw project concept with desired features and goals..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-2xs transition-colors leading-relaxed font-sans"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={activeTab === "file" ? !file : !textContent.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-40 hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Analysis & Literature Overlap Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
