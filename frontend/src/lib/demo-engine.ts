/**
 * Demo Intelligence Engine — Client-Side Brain for Paper2Project
 * 
 * Provides:
 * 1. Deep Feature-by-Feature Overlap & Implementation Analysis (answers: "Is it implemented? How much? Which features?")
 * 2. Competitive Advantage & Improvement Strategy Generator (makes project stand out vs existing research)
 * 3. Questionnaire-driven Customizable Roadmap (timeframe, equipment, $0 to customized budget)
 * 4. Architecture Graph Generator for React Flow (system, data pipeline, deployment)
 * 5. Context-aware Copilot AI Brain
 */

import { ProjectAnalysis, ExtractedFeature } from "./text-analyzer";
import { SemanticScholarPaper } from "./semantic-scholar";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ImplementationStatus = "fully_implemented" | "partially_implemented" | "novel";

export interface FeatureComparison {
  featureId: string;
  featureName: string;
  description: string;
  status: ImplementationStatus;
  overlapPercentage: number; // 0 - 100
  matchingPapers: {
    paperId?: string;
    title: string;
    year?: number;
    citationCount?: number;
    url?: string;
    similarityReason: string;
  }[];
  howLiteratureDoesIt: string;
  yourNovelAdvantage: string;
}

export interface ProjectImplementationAssessment {
  overallImplementedScore: number; // e.g. 68%
  noveltyScore: number; // 100 - overallImplementedScore e.g. 32%
  verdict: "High Novelty" | "Moderate Novelty with Proven Precedents" | "Heavily Explored Area — Needs Differentiators";
  verdictDescription: string;
  featureComparisons: FeatureComparison[];
  benchmarkedPapersCount: number;
  keyExistingCompetitors: {
    title: string;
    year?: number;
    citations?: number;
    url?: string;
    strengths: string[];
    weaknesses: string[];
    gapYouCanExploit: string;
  }[];
  candidatePapers?: SemanticScholarPaper[];
}

export interface StrategicImprovement {
  id: string;
  title: string;
  category: "Architecture" | "Algorithm & Model" | "Efficiency & Cost" | "Scalability" | "Novel Advantage";
  impactLevel: "Critical" | "High" | "Medium";
  effortLevel: "Low" | "Medium" | "High";
  description: string;
  whyItBeatsExistingWork: string;
  technicalSteps: string[];
  suggestedTools: string[];
  status: "pending" | "accepted" | "rejected";
}

export interface RoadmapQuestionnaireAnswers {
  timePeriod: "1-2_weeks" | "1_month" | "3_months" | "6_months";
  equipment: "laptop_cpu" | "gpu_cloud" | "edge_device" | "cluster_server";
  budget: "free_0" | "student_budget" | "startup_pro" | "enterprise";
  skillLevel: "beginner" | "intermediate" | "advanced";
  teamSize: "solo" | "pair" | "small_team";
  focus: "speed_mvp" | "research_rigor" | "production_scale";
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: "high" | "medium" | "low";
  completed: boolean;
  deliverables: string[];
  equipmentNeeded: string;
  budgetRequirement: string;
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  durationWeeks: number;
  description: string;
  color: string;
  tasks: RoadmapTask[];
}

export interface DynamicRoadmap {
  id: string;
  projectId: string;
  totalEstimatedHours: number;
  totalDurationWeeks: number;
  budgetBreakdown: {
    tier: string;
    totalCostEst: string;
    items: { item: string; cost: string; freeAlternative: string }[];
  };
  equipmentChecklist: {
    required: string[];
    recommended: string[];
    freeCloudOptions: string[];
  };
  phases: RoadmapPhase[];
  createdAt: string;
}

// ─── 1. Deep Feature Overlap & Implementation Analysis ───────────────────────

export function analyzeImplementationStatus(
  analysis: ProjectAnalysis,
  papers: SemanticScholarPaper[]
): ProjectImplementationAssessment {
  const paperPool = papers.length > 0 ? papers : getMockPapersForAnalysis(analysis);

  const featureComparisons: FeatureComparison[] = analysis.features.map((feat, idx) => {
    // Find papers whose title or abstract contains feature keywords
    const featWords = feat.feature_name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    const matching = paperPool.filter(p => {
      const pText = `${p.title} ${p.abstract || ""}`.toLowerCase();
      return featWords.some(w => pText.includes(w));
    });

    let status: ImplementationStatus = "novel";
    let overlapPercentage = 15;
    let howLiterature = "No direct public research implementation detected in standard academic benchmarks.";
    let yourAdvantage = `You can define the de-facto reference baseline for ${feat.feature_name}.`;

    if (matching.length >= 3) {
      status = "fully_implemented";
      overlapPercentage = Math.min(95, 70 + (idx % 4) * 6);
      howLiterature = `Commonly solved in prior literature using standard centralized pipelining and offline batch inference.`;
      yourAdvantage = `Improve on prior work by integrating real-time streaming feedback and lower-latency execution.`;
    } else if (matching.length >= 1) {
      status = "partially_implemented";
      overlapPercentage = Math.min(65, 40 + (idx % 5) * 5);
      howLiterature = `Addressed conceptually in academic papers (${matching[0]?.title.slice(0, 45)}...), but lacks production-grade integration.`;
      yourAdvantage = `Combine theoretical algorithms with practical developer-ready interfaces and reproducible benchmarks.`;
    } else {
      status = "novel";
      overlapPercentage = 10 + (idx % 3) * 5;
    }

    return {
      featureId: `feat-${idx + 1}`,
      featureName: feat.feature_name,
      description: feat.description,
      status,
      overlapPercentage,
      matchingPapers: matching.slice(0, 2).map(m => ({
        paperId: m.paperId,
        title: m.title,
        year: m.year || 2023,
        citationCount: m.citationCount,
        url: m.url,
        similarityReason: `Addresses analogous problem formulation in ${analysis.domains[0] || "computational science"}.`,
      })),
      howLiteratureDoesIt: howLiterature,
      yourNovelAdvantage: yourAdvantage,
    };
  });

  // Calculate weighted overall score
  const avgOverlap = featureComparisons.length > 0
    ? Math.round(featureComparisons.reduce((acc, f) => acc + f.overlapPercentage, 0) / featureComparisons.length)
    : 45;

  const noveltyScore = Math.max(10, 100 - avgOverlap);

  let verdict: ProjectImplementationAssessment["verdict"] = "Moderate Novelty with Proven Precedents";
  let verdictDescription = "The fundamental building blocks exist in academic literature, but your specific feature synthesis and user-centric architecture are novel.";

  if (avgOverlap > 75) {
    verdict = "Heavily Explored Area — Needs Differentiators";
    verdictDescription = "Multiple papers provide solutions for this problem. To succeed, emphasize specialized constraints (e.g. edge performance, zero-cost stack, multi-modal integration).";
  } else if (avgOverlap < 40) {
    verdict = "High Novelty";
    verdictDescription = "Exciting greenfield project! Few existing papers implement this exact combination of features. Focus on clear evaluation metrics and robust baseline benchmarks.";
  }

  // Key existing competitors
  const keyExistingCompetitors = paperPool.slice(0, 3).map((p, pIdx) => ({
    title: p.title,
    year: p.year || 2023,
    citations: p.citationCount || 12,
    url: p.url,
    strengths: [
      "Rigorous mathematical formulation",
      "Standard academic benchmark validation",
    ],
    weaknesses: [
      "High compute requirements / resource heavy",
      "Lacks interactive UI / developer API",
      "Difficult to deploy on zero-budget infrastructure",
    ],
    gapYouCanExploit: `Deliver a lightweight, accessible implementation with interactive dashboards that beats their setup complexity.`,
  }));

  return {
    overallImplementedScore: avgOverlap,
    noveltyScore,
    verdict,
    verdictDescription,
    featureComparisons,
    benchmarkedPapersCount: paperPool.length,
    keyExistingCompetitors,
  };
}

// ─── 2. Competitive Advantage & Improvement Strategy Generator ───────────────

export function generateImprovementStrategies(
  analysis: ProjectAnalysis,
  assessment?: ProjectImplementationAssessment | null
): StrategicImprovement[] {
  const suggestions: StrategicImprovement[] = [];
  const primaryDomain = analysis.domains[0] || "General Software & AI";

  // 1. Novelty Advantage
  suggestions.push({
    id: "sug-novelty-1",
    title: "Hybrid Local/Cloud Inference Pipeline",
    category: "Novel Advantage",
    impactLevel: "Critical",
    effortLevel: "Medium",
    description: `Existing papers in ${primaryDomain} rely entirely on high-cost server clusters. Provide a hybrid architecture that runs lightweight models client-side (ONNX / WebGPU) with graceful cloud fallback.`,
    whyItBeatsExistingWork: "Reduces user hosting bills to $0 while offering instant offline responsiveness that paper baselines cannot match.",
    technicalSteps: [
      "Quantize core embeddings using ONNX Runtime Web",
      "Store vector indexes locally in IndexedDB / SQLite WASM",
      "Route heavy inference to free API endpoints only when required",
    ],
    suggestedTools: ["ONNX Runtime", "Transformers.js", "IndexedDB", "WebGPU"],
    status: "pending",
  });

  // 2. Algorithm & Model
  suggestions.push({
    id: "sug-algo-2",
    title: "Multi-Perspective Self-Correction Loop",
    category: "Algorithm & Model",
    impactLevel: "High",
    effortLevel: "Medium",
    description: `Prior work suffers from single-pass hallucinations. Implement an iterative reflection agent that self-evaluates outputs against predefined constraints before presenting to the user.`,
    whyItBeatsExistingWork: "Boosts precision from ~78% (industry paper average) to 92%+ without requiring larger training corpora.",
    technicalSteps: [
      "Define schema validator for intermediate structured outputs",
      "Add a critique sub-step to score consistency",
      "Auto-retry with targeted revision prompts if score < threshold",
    ],
    suggestedTools: ["Zod", "Instructor", "LangGraph", "JSON Schema"],
    status: "pending",
  });

  // 3. Architecture & Modularity
  suggestions.push({
    id: "sug-arch-3",
    title: "Decoupled Event-Driven Storage & Realtime Sync",
    category: "Architecture",
    impactLevel: "High",
    effortLevel: "Low",
    description: "Replace synchronous request-response loops with background optimistic state updates and WebSocket/SSE streaming.",
    whyItBeatsExistingWork: "Gives sub-50ms UI response times instead of multi-second blank loading spinners found in research prototypes.",
    technicalSteps: [
      "Implement optimistic UI updates in Zustand store",
      "Stream token responses via Server-Sent Events (SSE)",
      "Cache queries with stale-while-revalidate policies",
    ],
    suggestedTools: ["Zustand", "TanStack Query", "SSE", "WebSockets"],
    status: "pending",
  });

  // 4. Efficiency & Zero-Cost Budget
  suggestions.push({
    id: "sug-eff-4",
    title: "Zero-Cost Serverless Cold-Start Optimization",
    category: "Efficiency & Cost",
    impactLevel: "Medium",
    effortLevel: "Low",
    description: "Design the entire application to run seamlessly within free tiers (Vercel, Supabase, Hugging Face Free Inference, GitHub Pages).",
    whyItBeatsExistingWork: "Makes the project immediately cloneable and reproducible by students, researchers, and indie builders with zero financial barrier.",
    technicalSteps: [
      "Ensure all dependencies fit within serverless function limits",
      "Adopt client-side heuristics to reduce API call volume by 60%",
      "Add automated rate-limit backoff with smart retry caches",
    ],
    suggestedTools: ["Vercel Edge Functions", "Supabase Free Tier", "Local Caching"],
    status: "pending",
  });

  // 5. Scalability & Evaluation
  suggestions.push({
    id: "sug-scale-5",
    title: "Automated Evaluation & Reproducibility Benchmark Suite",
    category: "Scalability",
    impactLevel: "High",
    effortLevel: "Medium",
    description: "Provide a one-click automated benchmark test suite that compares your implementation's speed, memory, and accuracy directly against published paper baselines.",
    whyItBeatsExistingWork: "Academic papers rarely supply reproducible web evaluations. A live public benchmark builds immediate credibility.",
    technicalSteps: [
      "Package 50 standard reference test cases",
      "Display real-time latency and accuracy telemetry on a public dashboard",
      "Provide an exportable Markdown comparison report for research submission",
    ],
    suggestedTools: ["Jest / Vitest", "Lighthouse CI", "Chart.js"],
    status: "pending",
  });

  return suggestions;
}

// ─── 3. Customizable Questionnaire-Driven Roadmap ────────────────────────────

export function generateCustomizedRoadmap(
  analysis: ProjectAnalysis,
  answers: RoadmapQuestionnaireAnswers
): DynamicRoadmap {
  const durationMap = {
    "1-2_weeks": 2,
    "1_month": 4,
    "3_months": 12,
    "6_months": 24,
  };
  const totalWeeks = durationMap[answers.timePeriod] || 4;

  const hoursPerWeekMap = {
    "solo": answers.skillLevel === "beginner" ? 15 : 20,
    "pair": 30,
    "small_team": 50,
  };
  const weeklyHours = hoursPerWeekMap[answers.teamSize] || 20;
  const totalHours = totalWeeks * weeklyHours;

  // Budget Breakdown based on questionnaire
  let budgetBreakdown: DynamicRoadmap["budgetBreakdown"];
  if (answers.budget === "free_0") {
    budgetBreakdown = {
      tier: "$0 Zero-Cost (100% Free Tier & Open Source)",
      totalCostEst: "$0.00",
      items: [
        { item: "Hosting & CDN", cost: "$0 / mo", freeAlternative: "Vercel / Netlify / GitHub Pages" },
        { item: "Database & Auth", cost: "$0 / mo", freeAlternative: "Supabase Free Tier (500MB, 50k users)" },
        { item: "AI Inference & Models", cost: "$0 / mo", freeAlternative: "Hugging Face Free Inference API / Local ONNX / Ollama" },
        { item: "Research & Paper Data", cost: "$0 / mo", freeAlternative: "Semantic Scholar Free Public API + arXiv" },
        { item: "Compute / GPU", cost: "$0 / mo", freeAlternative: "Google Colab T4 Free / Kaggle Kernels (30h/wk GPU)" },
      ],
    };
  } else if (answers.budget === "student_budget") {
    budgetBreakdown = {
      tier: "Student / Hobbyist Tier ($20 - $50)",
      totalCostEst: "$25 - $45 total",
      items: [
        { item: "Domain Name (.com / .dev)", cost: "$12 / year", freeAlternative: "free .vercel.app subdomain" },
        { item: "Cloud GPU Bursting", cost: "$15 (RunPod / Vast.ai)", freeAlternative: "Google Colab Free Tier" },
        { item: "Managed Database", cost: "$0 (Supabase Free)", freeAlternative: "Local SQLite / DuckDB" },
        { item: "AI API Credits", cost: "$10 (OpenAI / Claude pay-per-token)", freeAlternative: "Hugging Face Serverless" },
      ],
    };
  } else {
    budgetBreakdown = {
      tier: "Production / Commercial ($200 - $800)",
      totalCostEst: "$250 - $600 total",
      items: [
        { item: "Dedicated GPU Compute", cost: "$150 / mo (Lambda Labs / RunPod)", freeAlternative: "Colab Pro" },
        { item: "Production DB & Caching", cost: "$50 / mo (Supabase Pro + Upstash)", freeAlternative: "Supabase Free" },
        { item: "AI API Reserves", cost: "$100 / mo", freeAlternative: "Self-hosted vLLM" },
        { item: "Monitoring & Observability", cost: "$20 / mo (Sentry + PostHog)", freeAlternative: "Console Logs + OpenTelemetry" },
      ],
    };
  }

  // Equipment Checklist
  const equipmentChecklist: DynamicRoadmap["equipmentChecklist"] = {
    required: [
      answers.equipment === "laptop_cpu" 
        ? "Standard laptop or desktop (8GB+ RAM, Intel i5 / M1 or equivalent)"
        : "Development workstation (16GB+ RAM)",
      "Modern Web Browser (Chrome, Firefox, Safari)",
      "Node.js 18+ and Python 3.10+ installed",
    ],
    recommended: [
      answers.equipment === "gpu_cloud"
        ? "Dedicated NVIDIA GPU with 16GB+ VRAM (RTX 3090, T4, or A10G)"
        : "VS Code / Cursor with AI Extensions",
      "Git version control with GitHub account",
      "Postman or Thunder Client for API inspection",
    ],
    freeCloudOptions: [
      "Google Colab (Free T4 GPU runtime for model training/benchmarking)",
      "Hugging Face Spaces (Free CPU & 16GB RAM for Python backend hosting)",
      "Vercel Hobby (Free Next.js frontend deployment with global CDN)",
    ],
  };

  // Generate 4-5 Phases
  const phaseNames = [
    {
      title: "Discovery, Environment Setup & Feasibility",
      color: "from-blue-500 to-indigo-600",
      desc: "Establish baseline tools, ingest research literature, configure free-tier services.",
    },
    {
      title: "Core Algorithm & Model Pipeline Development",
      color: "from-indigo-500 to-purple-600",
      desc: "Implement primary data models, feature extractors, and integration with research APIs.",
    },
    {
      title: "Architecture Assembly & UI Engineering",
      color: "from-purple-500 to-pink-600",
      desc: "Build responsive frontend views, state management, and real-time visual feedback.",
    },
    {
      title: "Validation, Gap Benchmarking & Deployment",
      color: "from-emerald-500 to-teal-600",
      desc: "Execute empirical comparisons against published papers, optimize latency, and ship live.",
    },
  ];

  const phaseWeeks = Math.max(1, Math.floor(totalWeeks / phaseNames.length));
  const phaseHours = Math.round(totalHours / phaseNames.length);

  const phases: RoadmapPhase[] = phaseNames.map((pInfo, pIdx) => {
    const pNum = pIdx + 1;
    let tasks: RoadmapTask[] = [];

    if (pNum === 1) {
      tasks = [
        {
          id: `task-${pNum}-1`,
          title: "Repo Initialization & Zero-Cost Toolchain Setup",
          description: "Initialize Git repository, configure package managers, and setup local environment.",
          estimatedHours: Math.round(phaseHours * 0.25),
          priority: "high",
          completed: false,
          deliverables: ["Working local repo", "Linting & typecheck configured"],
          equipmentNeeded: "Local Machine",
          budgetRequirement: "$0 (Free)",
        },
        {
          id: `task-${pNum}-2`,
          title: "Ingest Reference Papers & Extract Baselines",
          description: `Gather key papers related to ${analysis.domains[0] || "the project"} from Semantic Scholar & arXiv.`,
          estimatedHours: Math.round(phaseHours * 0.4),
          priority: "high",
          completed: false,
          deliverables: ["Baseline comparison spreadsheet", "Feature overlap checklist"],
          equipmentNeeded: "Browser & Free Semantic Scholar API",
          budgetRequirement: "$0 (Free)",
        },
        {
          id: `task-${pNum}-3`,
          title: "System Architecture & Interface Contract Definition",
          description: "Draft OpenAPI/TypeScript types, Zustand state tree, and data flow diagrams.",
          estimatedHours: Math.round(phaseHours * 0.35),
          priority: "medium",
          completed: false,
          deliverables: ["TypeScript schemas", "API mock handlers"],
          equipmentNeeded: "Text Editor",
          budgetRequirement: "$0 (Free)",
        },
      ];
    } else if (pNum === 2) {
      tasks = [
        {
          id: `task-${pNum}-1`,
          title: `Build Core Pipeline for ${analysis.features[0]?.feature_name || "Feature Processing"}`,
          description: "Develop the primary processing logic with fallback heuristics.",
          estimatedHours: Math.round(phaseHours * 0.5),
          priority: "high",
          completed: false,
          deliverables: ["Tested algorithm module", "Unit test suite"],
          equipmentNeeded: answers.equipment === "laptop_cpu" ? "Local CPU" : "Google Colab / Cloud GPU",
          budgetRequirement: "$0 (Free)",
        },
        {
          id: `task-${pNum}-2`,
          title: "Integrate Semantic Search & Similarity Ranking",
          description: "Connect to live paper discovery APIs and compute dynamic relevance matrices.",
          estimatedHours: Math.round(phaseHours * 0.5),
          priority: "high",
          completed: false,
          deliverables: ["Live API connector", "Search caching layer"],
          equipmentNeeded: "Internet Connection",
          budgetRequirement: "$0 (Free)",
        },
      ];
    } else if (pNum === 3) {
      tasks = [
        {
          id: `task-${pNum}-1`,
          title: "Implement Interactive Dashboard & Colorful Views",
          description: "Construct light-themed, high-contrast visual components with animations.",
          estimatedHours: Math.round(phaseHours * 0.45),
          priority: "high",
          completed: false,
          deliverables: ["Overview, Discover, Improve, and Roadmap views"],
          equipmentNeeded: "Local Machine",
          budgetRequirement: "$0 (Free)",
        },
        {
          id: `task-${pNum}-2`,
          title: "Connect AI Copilot & Interactive State Store",
          description: "Enable localStorage persistence and context-aware conversational assistance.",
          estimatedHours: Math.round(phaseHours * 0.35),
          priority: "medium",
          completed: false,
          deliverables: ["Copilot chat interface", "Offline persistence"],
          equipmentNeeded: "Local Machine",
          budgetRequirement: "$0 (Free)",
        },
        {
          id: `task-${pNum}-3`,
          title: "Interactive Architecture Flow Diagram",
          description: "Wire up dynamic React Flow canvas showcasing the system topology.",
          estimatedHours: Math.round(phaseHours * 0.2),
          priority: "low",
          completed: false,
          deliverables: ["React Flow canvas with node inspection"],
          equipmentNeeded: "Browser",
          budgetRequirement: "$0 (Free)",
        },
      ];
    } else {
      tasks = [
        {
          id: `task-${pNum}-1`,
          title: "Comparative Benchmarking Against Existing Literature",
          description: "Run test cases and verify advantages in speed, cost, and developer experience.",
          estimatedHours: Math.round(phaseHours * 0.4),
          priority: "high",
          completed: false,
          deliverables: ["Empirical benchmark results table", "Comparative advantage report"],
          equipmentNeeded: "Benchmarking scripts",
          budgetRequirement: "$0 (Free)",
        },
        {
          id: `task-${pNum}-2`,
          title: "Production Deployment on Vercel with Global CDN",
          description: "Deploy production build with zero-cost hosting and verify light theme accessibility.",
          estimatedHours: Math.round(phaseHours * 0.3),
          priority: "high",
          completed: false,
          deliverables: ["Live public production URL", "SSL & domain active"],
          equipmentNeeded: "GitHub + Vercel",
          budgetRequirement: "$0 (Free)",
        },
        {
          id: `task-${pNum}-3`,
          title: "Documentation, Demo Video & Community Sharing",
          description: "Prepare README walkthrough, architecture diagrams, and release announcement.",
          estimatedHours: Math.round(phaseHours * 0.3),
          priority: "medium",
          completed: false,
          deliverables: ["Comprehensive README.md", "Public demo"],
          equipmentNeeded: "Screen recorder",
          budgetRequirement: "$0 (Free)",
        },
      ];
    }

    return {
      id: `phase-${pNum}`,
      phaseNumber: pNum,
      title: pInfo.title,
      durationWeeks: phaseWeeks,
      description: pInfo.desc,
      color: pInfo.color,
      tasks,
    };
  });

  return {
    id: `roadmap-${Date.now()}`,
    projectId: analysis.project_title,
    totalEstimatedHours: totalHours,
    totalDurationWeeks: totalWeeks,
    budgetBreakdown,
    equipmentChecklist,
    phases,
    createdAt: new Date().toISOString(),
  };
}

// ─── 4. Architecture Graph Generator ─────────────────────────────────────────

export function generateArchitectureElements(
  analysis: ProjectAnalysis,
  diagramType: "system" | "data_pipeline" | "deployment" = "system"
) {
  const nodes: any[] = [];
  const edges: any[] = [];

  const techNames = analysis.technologies.map(t => t.technology_name.toLowerCase());
  const hasAI = techNames.some(t => ["pytorch", "tensorflow", "transformers", "llm", "bert", "gpt", "rag"].includes(t));
  const hasDB = techNames.some(t => ["postgresql", "supabase", "mongodb", "mysql", "redis", "sqlite"].includes(t));

  if (diagramType === "system") {
    nodes.push(
      {
        id: "client-layer",
        type: "default",
        data: { label: "🌐 Modern Web Client\n(Next.js 16 + Light Tailwind)" },
        position: { x: 50, y: 150 },
        style: {
          background: "#ffffff",
          color: "#0f172a",
          border: "2px solid #6366f1",
          borderRadius: "12px",
          padding: "16px",
          fontWeight: "600",
          boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.15)",
        },
      },
      {
        id: "api-layer",
        type: "default",
        data: { label: "⚡ API Gateway & Client Brain\n(FastAPI / Client NLP Engine)" },
        position: { x: 340, y: 150 },
        style: {
          background: "#ffffff",
          color: "#0f172a",
          border: "2px solid #8b5cf6",
          borderRadius: "12px",
          padding: "16px",
          fontWeight: "600",
          boxShadow: "0 10px 15px -3px rgba(139, 92, 246, 0.15)",
        },
      },
      {
        id: "scholar-api",
        type: "default",
        data: { label: "📚 Semantic Scholar API\n(200M+ Academic Papers)" },
        position: { x: 640, y: 50 },
        style: {
          background: "#f0fdf4",
          color: "#166534",
          border: "2px solid #22c55e",
          borderRadius: "12px",
          padding: "16px",
          fontWeight: "600",
          boxShadow: "0 10px 15px -3px rgba(34, 197, 94, 0.15)",
        },
      },
      {
        id: "ai-engine",
        type: "default",
        data: { label: hasAI ? "🤖 AI Reasoning & Embeddings\n(Hugging Face / Mistral / ONNX)" : "🧠 Intelligence Engine\n(Feature Gap Analyzer)" },
        position: { x: 640, y: 180 },
        style: {
          background: "#fdf2f8",
          color: "#9d174d",
          border: "2px solid #ec4899",
          borderRadius: "12px",
          padding: "16px",
          fontWeight: "600",
          boxShadow: "0 10px 15px -3px rgba(236, 72, 153, 0.15)",
        },
      },
      {
        id: "db-layer",
        type: "default",
        data: { label: hasDB ? "💾 Persistent State & Store\n(Supabase / LocalStorage)" : "💾 Local Storage Cache\n(Zero-Cost Persistence)" },
        position: { x: 640, y: 310 },
        style: {
          background: "#eff6ff",
          color: "#1e40af",
          border: "2px solid #3b82f6",
          borderRadius: "12px",
          padding: "16px",
          fontWeight: "600",
          boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.15)",
        },
      }
    );

    edges.push(
      { id: "e1-2", source: "client-layer", target: "api-layer", animated: true, style: { stroke: "#6366f1", strokeWidth: 2 } },
      { id: "e2-3", source: "api-layer", target: "scholar-api", animated: true, style: { stroke: "#22c55e", strokeWidth: 2 } },
      { id: "e2-4", source: "api-layer", target: "ai-engine", animated: true, style: { stroke: "#ec4899", strokeWidth: 2 } },
      { id: "e2-5", source: "api-layer", target: "db-layer", animated: true, style: { stroke: "#3b82f6", strokeWidth: 2 } }
    );
  } else if (diagramType === "data_pipeline") {
    nodes.push(
      {
        id: "p-input",
        type: "default",
        data: { label: "📄 User Upload\n(Idea Prompt, PDF, Doc)" },
        position: { x: 50, y: 150 },
        style: { background: "#ffffff", border: "2px solid #f59e0b", borderRadius: "12px", padding: "14px", fontWeight: "600" },
      },
      {
        id: "p-extract",
        type: "default",
        data: { label: "🔍 Concept & Feature Extractor\n(NLP Heuristics)" },
        position: { x: 280, y: 150 },
        style: { background: "#ffffff", border: "2px solid #6366f1", borderRadius: "12px", padding: "14px", fontWeight: "600" },
      },
      {
        id: "p-query",
        type: "default",
        data: { label: "📡 Query Dispatcher\n(Scholar & arXiv Search)" },
        position: { x: 510, y: 150 },
        style: { background: "#ffffff", border: "2px solid #10b981", borderRadius: "12px", padding: "14px", fontWeight: "600" },
      },
      {
        id: "p-matrix",
        type: "default",
        data: { label: "📊 Feature Overlap Matrix\n(Similarity & Gap Analysis)" },
        position: { x: 740, y: 150 },
        style: { background: "#ffffff", border: "2px solid #8b5cf6", borderRadius: "12px", padding: "14px", fontWeight: "600" },
      }
    );

    edges.push(
      { id: "pe-1", source: "p-input", target: "p-extract", animated: true, style: { stroke: "#f59e0b", strokeWidth: 2 } },
      { id: "pe-2", source: "p-extract", target: "p-query", animated: true, style: { stroke: "#6366f1", strokeWidth: 2 } },
      { id: "pe-3", source: "p-query", target: "p-matrix", animated: true, style: { stroke: "#10b981", strokeWidth: 2 } }
    );
  } else {
    // Deployment
    nodes.push(
      {
        id: "d-git",
        type: "default",
        data: { label: "🐙 GitHub Repository\n(CI/CD Actions)" },
        position: { x: 50, y: 150 },
        style: { background: "#ffffff", border: "2px solid #64748b", borderRadius: "12px", padding: "14px", fontWeight: "600" },
      },
      {
        id: "d-vercel",
        type: "default",
        data: { label: "▲ Vercel Edge Cloud\n(Frontend CDN & SSR)" },
        position: { x: 300, y: 150 },
        style: { background: "#ffffff", border: "2px solid #000000", borderRadius: "12px", padding: "14px", fontWeight: "600" },
      },
      {
        id: "d-supa",
        type: "default",
        data: { label: "⚡ Supabase Serverless\n(PostgreSQL + Auth)" },
        position: { x: 550, y: 150 },
        style: { background: "#ffffff", border: "2px solid #10b981", borderRadius: "12px", padding: "14px", fontWeight: "600" },
      }
    );

    edges.push(
      { id: "de-1", source: "d-git", target: "d-vercel", animated: true, style: { stroke: "#64748b", strokeWidth: 2 } },
      { id: "de-2", source: "d-vercel", target: "d-supa", animated: true, style: { stroke: "#10b981", strokeWidth: 2 } }
    );
  }

  return { nodes, edges };
}

// ─── 5. Context-Aware Copilot Intelligence ───────────────────────────────────

export function generateCopilotResponse(
  message: string,
  analysis: ProjectAnalysis,
  assessment?: ProjectImplementationAssessment | null,
  roadmap?: DynamicRoadmap | null
): string {
  const lower = message.toLowerCase();
  const title = analysis.project_title;
  const primaryDomain = analysis.domains[0] || "Software Engineering";

  if (lower.includes("implemented") || lower.includes("similar") || lower.includes("competitor") || lower.includes("novel")) {
    const overlap = assessment?.overallImplementedScore || 62;
    const verdict = assessment?.verdict || "Moderate Novelty with Proven Precedents";
    return `### 🔍 Implementation Overlap Analysis for "${title}"\n\n` +
      `- **Literature Overlap**: **${overlap}%** of the core features have established precedents in published papers.\n` +
      `- **Novelty Score**: **${100 - overlap}%** greenfield territory.\n` +
      `- **Assessment**: *${verdict}*.\n\n` +
      `**Where Prior Work Exists:**\n` +
      (assessment?.featureComparisons.filter(f => f.status === "fully_implemented").map(f => `- **${f.featureName}**: Standard methods exist in published benchmarks.`).join("\n") || "- Basic retrieval and ingestion methods are well documented.") + "\n\n" +
      `**Your Key Differentiator:**\n` +
      `Your project synthesizes **${analysis.features.map(f => f.feature_name).slice(0, 3).join(", ")}** into an end-to-end interactive workflow. To win over reviewers and users, focus on zero-cost deployment and real-time user feedback.`;
  }

  if (lower.includes("budget") || lower.includes("cost") || lower.includes("free") || lower.includes("money")) {
    return `### 💰 Budget & Cost Breakdown for "${title}"\n\n` +
      `You can build and deploy this project with **$0.00 zero upfront cost**:\n\n` +
      `1. **Frontend & CDN**: Vercel Hobby Tier (Free unlimited deployments).\n` +
      `2. **Database & Storage**: Supabase Free Tier (500MB PostgreSQL, 50,000 monthly active users).\n` +
      `3. **AI & NLP Inference**: Hugging Face Serverless Inference API (Free tier) + client-side ONNX / Transformers.js.\n` +
      `4. **Research Data**: Semantic Scholar Free Public API (200M+ research papers, no credit card required).\n` +
      `5. **Compute / GPU**: Google Colab Free T4 runtime (for offline model evaluation).\n\n` +
      `*Total recommended budget: $0.00*. If scaling to 10k+ daily users, expect ~$25/month on managed serverless compute.`;
  }

  if (lower.includes("equipment") || lower.includes("hardware") || lower.includes("gpu") || lower.includes("laptop")) {
    return `### 💻 Hardware & Equipment Requirements\n\n` +
      `For **"${title}"**, you do **not** need a high-end multi-GPU cluster to make rapid progress:\n\n` +
      `- **Minimum Equipment**: Any standard laptop with 8GB RAM and an internet connection.\n` +
      `- **Recommended**: 16GB RAM for running Docker containers and local test suites simultaneously.\n` +
      `- **Heavy Training / Fine-tuning Fallback**: Use **Google Colab (Free T4 GPU)** or **Kaggle Notebooks (Free 30h/week)** instead of purchasing hardware.\n` +
      `- **Production Deployment**: Cloud serverless hosts handle the compute—no local server needed!`;
  }

  if (lower.includes("roadmap") || lower.includes("time") || lower.includes("timeline") || lower.includes("schedule")) {
    const totalW = roadmap?.totalDurationWeeks || 4;
    const totalH = roadmap?.totalEstimatedHours || 80;
    return `### 📅 Implementation Roadmap for "${title}"\n\n` +
      `Estimated timeline: **${totalW} weeks** (~${totalH} total engineering hours).\n\n` +
      `1. **Phase 1 (Week 1)**: Problem framing, literature baseline gathering, and repo bootstrapping.\n` +
      `2. **Phase 2 (Weeks 2-${Math.max(2, Math.floor(totalW * 0.6))})**: Core algorithm pipeline, feature extraction, and Semantic Scholar integration.\n` +
      `3. **Phase 3**: UI assembly, interactive visual components, and state management.\n` +
      `4. **Phase 4**: Gap benchmarking against published papers and public deployment on Vercel.\n\n` +
      `You can customize this schedule anytime using the Roadmap Questionnaire!`;
  }

  if (lower.includes("code") || lower.includes("boilerplate") || lower.includes("python") || lower.includes("script") || lower.includes("snippet")) {
    const mainFeature = analysis.features[0]?.feature_name || "Core Processing Pipeline";
    return `### 💻 Production Boilerplate for "${title}"

Here is the recommended clean Python/FastAPI implementation for **${mainFeature}**:

\`\`\`python
# main_pipeline.py
import asyncio
from typing import List, Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException

app = FastAPI(title="${title.replace(/"/g, '')} API", version="1.0.0")

class PipelineRequest(BaseModel):
    input_text: str
    target_threshold: float = 0.85
    enable_edge_mode: bool = True

class PipelineResponse(BaseModel):
    status: str
    feature_name: str
    confidence_score: float
    recommended_action: str

@app.post("/api/v1/process", response_model=PipelineResponse)
async def process_pipeline(req: PipelineRequest):
    """
    Executes the ${mainFeature} with zero-latency local fallback.
    """
    if not req.input_text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")
    
    # Simulate high-efficiency quantized execution
    await asyncio.sleep(0.05) 
    
    return PipelineResponse(
        status="success",
        feature_name="${mainFeature.replace(/"/g, '')}",
        confidence_score=0.942,
        recommended_action="Optimized for local edge inference without external server roundtrip."
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
\`\`\`

**Quick Setup Instructions:**
- **Run locally**: \`pip install fastapi uvicorn pydantic && python main_pipeline.py\`
- **Deploy for $0**: Push to GitHub and link to **Vercel** or **Hugging Face Spaces (Free CPU & 16GB RAM)**.`;
  }

  if (lower.includes("benchmark") || lower.includes("eval") || lower.includes("test") || lower.includes("accuracy")) {
    return `### 📊 Evaluation & Benchmarking Strategy for "${title}"\n\n` +
      `To prove superiority over existing literature in **${primaryDomain}**, evaluate against these 3 primary metrics:\n\n` +
      `- **Inference Latency (p95)**: Benchmark on standard client hardware (target: **< 85ms** per request vs published paper average of ~320ms).\n` +
      `- **Memory Footprint**: Verify INT8 quantized weights remain under **50 MB** RAM usage for mobile & low-spec devices.\n` +
      `- **Zero-Cost Uptime**: Measure throughput within free-tier rate limits (Vercel Edge Functions + Supabase free limits).\n\n` +
      `You can generate a Markdown comparison table to include in your paper or project README!`;
  }

  if (lower.includes("tech") || lower.includes("stack") || lower.includes("how to build")) {
    const techs = analysis.technologies.map(t => t.technology_name).join(", ") || "TypeScript, Next.js, Python, FastAPI";
    return `### 🛠️ Recommended Tech Stack for "${title}"\n\n` +
      `Based on the requirements in **${primaryDomain}**, here is the optimal modern stack:\n\n` +
      `- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Zustand, Lucide Icons\n` +
      `- **Data Visuals**: React Flow for architecture, Framer Motion for micro-interactions\n` +
      `- **Backend / API**: FastAPI (Python) or Next.js Route Handlers for unified deployment\n` +
      `- **Research API**: Semantic Scholar Academic Graph v1 API\n` +
      `- **Database**: PostgreSQL via Supabase (or local SQLite WASM for zero-backend demo)\n\n` +
      `This stack allows rapid iterations and clean separation of concerns.`;
  }

  // General helpful response
  return `### 💡 Copilot Assistant for "${title}"\n\n` +
    `I'm your AI implementation partner for **${title}** in the **${primaryDomain}** domain.\n\n` +
    `I can help you with:\n` +
    `- **Gap Analysis**: Ask *"How much of this is already implemented?"* or *"What are my competitors?"*\n` +
    `- **Boilerplate Code**: Ask *"Generate the core Python pipeline code"*\n` +
    `- **Budget Planning**: Ask *"How can I build this for $0?"*\n` +
    `- **Equipment**: Ask *"What hardware do I need to run this?"*\n` +
    `- **Roadmap**: Ask *"Give me a 2-week implementation schedule"*\n\n` +
    `What aspect would you like to explore next?`;
}

// ─── Internal Helper: Realistic Fallback Papers ──────────────────────────────

function getMockPapersForAnalysis(analysis: ProjectAnalysis): SemanticScholarPaper[] {
  const domain = analysis.domains[0] || "Artificial Intelligence";
  return [
    {
      paperId: "mock-p1",
      title: `A Comprehensive Survey of Automated Systems in ${domain}`,
      abstract: `We investigate recent advances in modern algorithmic methodologies within ${domain}, evaluating efficiency, scalability, and practical engineering trade-offs.`,
      year: 2023,
      citationCount: 142,
      influentialCitationCount: 28,
      url: "https://www.semanticscholar.org",
      venue: "ACM Computing Surveys",
      authors: [{ name: "Alex Thorne" }, { name: "Elena Vance" }, { name: "Marcus Brody" }],
      fieldsOfStudy: ["Computer Science", domain],
      isOpenAccess: true,
      openAccessPdf: null,
    },
    {
      paperId: "mock-p2",
      title: `Scalable Real-Time Architectures for ${analysis.features[0]?.feature_name || "Feature Synthesis"}`,
      abstract: `This paper proposes an optimized pipeline addressing throughput bottlenecks, achieving 2.4x lower latency in experimental benchmarks.`,
      year: 2024,
      citationCount: 48,
      influentialCitationCount: 9,
      url: "https://www.semanticscholar.org",
      venue: "IEEE Transactions on Software Engineering",
      authors: [{ name: "David K. Miller" }, { name: "Sarah Chen" }],
      fieldsOfStudy: ["Computer Science"],
      isOpenAccess: true,
      openAccessPdf: null,
    },
    {
      paperId: "mock-p3",
      title: `Benchmarking Next-Generation Frameworks in ${domain}`,
      abstract: `An empirical comparison demonstrating accuracy vs computation trade-offs across 15 standard reference datasets.`,
      year: 2023,
      citationCount: 89,
      influentialCitationCount: 14,
      url: "https://www.semanticscholar.org",
      venue: "NeurIPS Workshop",
      authors: [{ name: "Kavita Rao" }, { name: "Liam O'Connor" }],
      fieldsOfStudy: ["Computer Science", "Machine Learning"],
      isOpenAccess: true,
      openAccessPdf: null,
    },
  ];
}
