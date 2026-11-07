"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Image as ImageIcon,
  Clock,
  AlertCircle,
  Sliders,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAppStore, ProjectData } from "@/lib/store";
import {
  analyzeProjectText,
  extractTextFromFile,
  generateSearchQueries,
  extractCategorizedKeywords,
  ExtractedKeywords,
} from "@/lib/text-analyzer";
import { retrieveAndRankPapers, SemanticScholarPaper } from "@/lib/semantic-scholar";
import { savePapersToLocalDB } from "@/lib/indexed-db";
import {
  analyzeImplementationStatus,
  generateImprovementStrategies,
  generateCustomizedRoadmap,
} from "@/lib/demo-engine";
import { KeywordVerificationModal } from "@/components/KeywordVerificationModal";

const RATE_LIMIT_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes in ms

export default function NewProjectPage() {
  const router = useRouter();
  const { saveProject, projects, hydrateStore } = useAppStore();
  const [activeTab, setActiveTab] = useState<"file" | "text">("text");
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Keyword Verification Modal State
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [extractedKeywords, setExtractedKeywords] = useState<ExtractedKeywords | null>(null);
  const [preparedText, setPreparedText] = useState("");

  // Rate Limiting State (1 project per 10 minutes)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  useEffect(() => {
    hydrateStore();
  }, [hydrateStore]);

  useEffect(() => {
    // Check most recently created project timestamp
    if (projects && projects.length > 0) {
      const sorted = [...projects].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const lastCreated = new Date(sorted[0].createdAt).getTime();
      const now = Date.now();
      const diff = now - lastCreated;

      if (diff < RATE_LIMIT_COOLDOWN_MS) {
        setCooldownRemaining(Math.ceil((RATE_LIMIT_COOLDOWN_MS - diff) / 1000));
      }
    }
  }, [projects]);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const processingSteps = [
    "Reading & extracting source content (PDF, DOCX, TXT, Image OCR)",
    "Deconstructing algorithmic entities & technical requirements",
    "Querying Academic Graph APIs (Semantic Scholar, arXiv, OpenAlex)",
    "Executing Dual-Criterion Novelty & Performance Ranking (Top 1 to N)",
    "Caching complete literature pool in client-side Local DB (IndexedDB)",
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
Key Algorithms & Techniques:
- Offline edge inference using INT8 quantized MobileNetV3 neural network
- Multi-crop leaf disease classification with bounding box severity mapping
- Treatment prescription recommender using localized regional organic remedies
- Voice-assisted diagnostics in regional dialects for accessibility
- Historical disease progression tracking with localized SQLite storage
Technology Stack: PyTorch, MobileNetV3, ONNX Runtime, React, Tailwind CSS, TypeScript, SQLite, FastAPI`);
    } else if (sampleType === "rag") {
      setProjectTitle("BioGraph — Multi-Agent Clinical Guideline RAG");
      setTextContent(`Title: BioGraph — Multi-Agent Self-Correcting RAG for Rare Drug Interactions
Domain: Healthcare NLP, Biomedical Graphs, Agentic AI
Problem Statement: Clinical guidelines and medical literature contain conflicting recommendations across specialties. Standard LLMs hallucinate drug dosages and fail to cross-reference multi-drug interactions across medical papers.
Proposed Solution: An agentic retrieval-augmented generation framework combining PubMed biomedical literature with Neo4j structured knowledge graphs. Employs a self-corrective verification agent that cross-checks citations and flags contradictions before showing prescriptions to physicians.
Key Algorithms & Techniques:
- Knowledge graph entity linking with UMLS and MeSH medical ontologies
- Multi-hop graph traversal to uncover indirect drug-drug contraindications
- Self-corrective reflection agent validating claims against original paper DOIs
- Differential diagnosis comparison table with confidence metrics
Technology Stack: Python, FastAPI, Next.js, LangChain, Neo4j, Fastembed, PyTorch, Transformers`);
    } else {
      setProjectTitle("AeroNav — Vision-Only Autonomous Drone Navigation");
      setTextContent(`Title: AeroNav — GPS-Denied Visual Inertial Odometry for Search & Rescue Drones
Domain: Robotics, Autonomous Navigation, Computer Vision
Problem Statement: In search and rescue missions inside collapsed buildings or deep underground mines, GPS signals are unavailable and heavy LiDAR sensors drain drone batteries in minutes.
Proposed Solution: A lightweight visual-inertial odometry system using dual monocular RGB cameras and optical flow algorithms to build real-time 3D spatial occupancy maps with sub-10cm drift without GPS or cloud servers.
Key Algorithms & Techniques:
- Real-time stereo optical flow estimation running at 45 FPS on Raspberry Pi CM4
- 3D occupancy voxel grid mapping with automated return-to-home pathfinding
- Thermal anomaly detector for locating trapped survivors in smoke
Technology Stack: C++, Python, OpenCV, ROS2, PyTorch, TensorRT, FastAPI, Next.js`);
    }
  };

  /**
   * Phase 1: Analyze source and trigger Pre-Retrieval Keyword Verification Modal
   */
  const handlePreRetrievalPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownRemaining > 0) return;

    let textToAnalyze = textContent.trim();
    if (activeTab === "file") {
      if (!file) return;
      textToAnalyze = await extractTextFromFile(file);
    } else {
      if (!textToAnalyze) return;
    }

    setPreparedText(textToAnalyze);
    const resolvedTitle = projectTitle.trim() || (file ? file.name.replace(/\.[^/.]+$/, "") : "Research Project");
    const extracted = extractCategorizedKeywords(textToAnalyze, resolvedTitle);

    setExtractedKeywords(extracted);
    setShowKeywordModal(true);
  };

  /**
   * Phase 2: User confirmed keywords -> Launch Deep Retrieval & Dual-Criterion Ranking
   */
  const handleConfirmAndSearch = async (verifiedKeywords: ExtractedKeywords) => {
    setShowKeywordModal(false);
    setIsProcessing(true);
    setCurrentStep(0);

    try {
      // Step 1: Ingestion
      await new Promise((r) => setTimeout(r, 400));
      setCurrentStep(1);

      // Step 2: NLP Analysis
      const analysis = analyzeProjectText(preparedText, verifiedKeywords.project_title);
      await new Promise((r) => setTimeout(r, 500));
      setCurrentStep(2);

      // Step 3: Deep Academic Literature Retrieval (Semantic Scholar + arXiv + OpenAlex)
      const queries = generateSearchQueries(analysis);
      const discoveredPapers: SemanticScholarPaper[] = await retrieveAndRankPapers(
        queries,
        {
          algorithms: verifiedKeywords.algorithms,
          techniques: verifiedKeywords.techniques,
          methods: verifiedKeywords.methods,
          tools: verifiedKeywords.tools,
          domains: verifiedKeywords.domains,
        },
        50 // Up to 50 candidate papers per project
      );

      await new Promise((r) => setTimeout(r, 600));
      setCurrentStep(3);

      // Step 4: Overlap Assessment & Dual-Criterion Verification
      const assessment = analyzeImplementationStatus(analysis, discoveredPapers);
      await new Promise((r) => setTimeout(r, 500));
      setCurrentStep(4);

      // Step 5: Competitive Advantage & Roadmap
      const suggestions = generateImprovementStrategies(analysis, assessment);
      const roadmap = generateCustomizedRoadmap(analysis, {
        timePeriod: "1_month",
        equipment: "laptop_cpu",
        budget: "free_0",
        skillLevel: "intermediate",
        teamSize: "solo",
        focus: "speed_mvp",
      });

      const newProjectId = `proj-${Date.now()}`;

      // Step 6: Store complete pool in Client-Side Local DB (IndexedDB)
      await savePapersToLocalDB(newProjectId, discoveredPapers);

      setCurrentStep(5);
      await new Promise((r) => setTimeout(r, 400));

      const newProject: ProjectData = {
        id: newProjectId,
        title: verifiedKeywords.project_title,
        description: analysis.summary || "Structured research implementation context.",
        sourceType: activeTab === "file" ? (file?.type.includes("image") ? "doc" : "pdf") : "prompt",
        rawInput: preparedText,
        fileName: file?.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analysis,
        discoveredPapers: discoveredPapers.slice(0, 10), // Keep top 10 in quick memory, rest in IndexedDB
        implementationAssessment: assessment,
        suggestions,
        roadmap,
        copilotMessages: [
          {
            id: `msg-${Date.now()}`,
            sender: "copilot",
            text: `Welcome to **${verifiedKeywords.project_title}**! I have indexed ${discoveredPapers.length} research papers and assigned dual-criterion novelty rankings. You can load 10 more papers from your local DB at any time. How would you like to refine your implementation?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      };

      saveProject(newProject);
      router.push(`/projects/${newProjectId}`);
    } catch (err) {
      console.error("Deep literature pipeline failed:", err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 flex flex-col justify-center">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>

          {cooldownRemaining > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
              <Clock className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>
                Rate Limit Cooldown: {Math.floor(cooldownRemaining / 60)}m {cooldownRemaining % 60}s
              </span>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-lg space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Universal Source & Research Ingestion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Analyze Idea, Extract Entities & Retrieve Similar Papers
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Upload any raw prompt, PDF, Word doc, or paper document image. We extract algorithms, techniques, methods, and functions, allow you to verify the search basis, and rank 10 to 1,000 papers by novelty and accuracy.
            </p>
          </div>

          {/* If Processing: Live Multi-Step Indicator */}
          {isProcessing ? (
            <div className="py-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200 shadow-xs animate-spin">
                  <Loader2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Retrieving & Ranking Literature...</h3>
                <p className="text-xs text-slate-500">
                  Cross-referencing algorithms against 200M+ research papers and extracting reported accuracy metrics
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-2.5">
                {processingSteps.map((step, idx) => {
                  const isDone = currentStep > idx;
                  const isCurrent = currentStep === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all ${
                        isDone
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-800 font-medium"
                          : isCurrent
                          ? "bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-400"
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
            <form onSubmit={handlePreRetrievalPreview} className="space-y-6">
              {/* Optional Project Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Project / Research Paper Working Title</label>
                <input
                  type="text"
                  placeholder="e.g. EdgeVision — Low-Power Foliar Disease Classification"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>

              {/* Input Type Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Input Source Format</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab("text")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "text"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>Raw Text / Abstract Prompt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("file")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === "file"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Document or Image</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Text Prompt */}
              {activeTab === "text" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Project Idea Description, Algorithms & Functions
                    </label>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>Quick Load:</span>
                      <button
                        type="button"
                        onClick={() => handleLoadSample("vision")}
                        className="text-indigo-600 hover:underline font-semibold"
                      >
                        EdgeVision
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleLoadSample("rag")}
                        className="text-indigo-600 hover:underline font-semibold"
                      >
                        BioGraph
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={8}
                    placeholder="Describe your technical idea in detail... Mention your proposed algorithms, techniques, methods, functions, datasets, and tools so we can extract them accurately."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full text-xs rounded-2xl border border-slate-200 p-4 focus:border-indigo-500 outline-none leading-relaxed transition-colors font-mono"
                  />
                </div>
              ) : (
                /* Tab 2: Universal File Upload */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">
                    Upload Research Paper PDF, Word Document, or Scanned Image
                  </label>
                  <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all text-center">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shadow-2xs">
                      {file ? <FileText className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {file ? file.name : "Click to select or drag and drop your research document"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Supported: PDF, DOCX, TXT, PNG, JPG, WEBP (Max 25MB)
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    cooldownRemaining > 0 ||
                    (activeTab === "file" && !file) ||
                    (activeTab === "text" && !textContent.trim())
                  }
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-extrabold shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {cooldownRemaining > 0
                      ? `Rate Limited (Please wait ${cooldownRemaining}s)`
                      : "Analyze Source & Verify Extracted Keywords &rarr;"}
                  </span>
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2 font-normal">
                  Before querying academic APIs, you will review the extracted algorithms and methods to verify the retrieval basis.
                </p>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Pre-Retrieval Keyword Verification Modal */}
      {showKeywordModal && extractedKeywords && (
        <KeywordVerificationModal
          isOpen={showKeywordModal}
          initialKeywords={extractedKeywords}
          onConfirm={handleConfirmAndSearch}
          onCancel={() => setShowKeywordModal(false)}
        />
      )}
    </div>
  );
}
