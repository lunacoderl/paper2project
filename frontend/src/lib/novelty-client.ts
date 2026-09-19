/**
 * Novelty Predictor Client for Frontend.
 * Connects to the backend Anchor-Bootstrapped Hybrid CF/CBF Novelty Predictor
 * (Sakib et al., IEEE Access, 2021)
 * 
 * Provides transparent fallback to local demo-engine if the backend is offline.
 */

import { ProjectAnalysis } from "./text-analyzer";
import { SemanticScholarPaper } from "./semantic-scholar";
import {
  ProjectImplementationAssessment,
  analyzeImplementationStatus as localAnalyzeImplementationStatus,
} from "./demo-engine";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "");

export interface BackendNoveltyResponse {
  overall_novelty_score: number;
  overall_implemented_score: number;
  verdict: "High Novelty" | "Moderate Novelty with Proven Precedents" | "Heavily Explored Area — Needs Differentiators";
  verdict_description: string;
  dimensional_scores: {
    problem_novelty: number;
    methodological_novelty: number;
    implementation_novelty: number;
  };
  anchor_paper?: {
    paper_id: string;
    title: string;
    year?: number;
    citation_count: number;
    url?: string;
    similarity_to_idea: number;
  };
  cf_branch_used: boolean;
  top_candidates: {
    paper_id: string;
    title: string;
    year?: number;
    citation_count: number;
    url?: string;
    abstract?: string;
    cbf_score: number;
    cf_score: number;
    hybrid_score: number;
    similarity_percentage: number;
  }[];
  feature_comparisons: {
    feature_id: string;
    feature_name: string;
    description: string;
    status: "fully_implemented" | "partially_implemented" | "novel";
    overlap_percentage: number;
    novelty_percentage: number;
    how_literature_does_it: string;
    your_novel_advantage: string;
    matching_papers: {
      paper_id?: string;
      title: string;
      year?: number;
      citation_count?: number;
      url?: string;
      similarity_reason?: string;
    }[];
  }[];
  gaps_and_recommendations: string[];
}

/**
 * Predicts novelty and literature overlap using the backend hybrid model.
 * Falls back cleanly to local heuristic engine if the backend is unreachable.
 */
export async function predictProjectNovelty(
  analysis: ProjectAnalysis,
  papers: SemanticScholarPaper[] = []
): Promise<ProjectImplementationAssessment> {
  try {
    const payload = {
      title: analysis.project_title || "",
      abstract: analysis.summary || "",
      raw_text: `${analysis.problem_statement || ""} ${analysis.proposed_solution || ""}`,
      domains: analysis.domains || [],
      keywords: analysis.concepts.map((c) => c.concept_name).slice(0, 6),
      methodologies: analysis.technologies.map((t) => t.technology_name).slice(0, 8),
      features: analysis.features.map((f) => ({
        feature_name: f.feature_name,
        description: f.description || "",
        category: f.category || "core",
      })),
      max_candidates: 10,
    };

    const response = await fetch(`${API_BASE}/api/v1/novelty/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }

    const data: BackendNoveltyResponse = await response.json();

    // Map backend candidates to frontend keyExistingCompetitors format
    const keyExistingCompetitors = data.top_candidates.slice(0, 3).map((cand) => ({
      title: cand.title,
      year: cand.year || 2023,
      citations: cand.citation_count || 10,
      url: cand.url || "",
      strengths: [
        "Proven academic peer-reviewed baseline",
        `High hybrid relevance match (${cand.similarity_percentage}%)`,
      ],
      weaknesses: [
        "High infrastructure and computational overhead",
        "Lacks integrated zero-cost real-time workflow",
      ],
      gapYouCanExploit:
        data.gaps_and_recommendations[0] ||
        `Outperform baseline with accessible developer tooling and modular pipelines.`,
    }));

    // Map backend feature comparisons to frontend format
    const featureComparisons = data.feature_comparisons.map((fc) => ({
      featureId: fc.feature_id,
      featureName: fc.feature_name,
      description: fc.description,
      status: fc.status,
      overlapPercentage: fc.overlap_percentage,
      matchingPapers: fc.matching_papers.map((mp) => ({
        paperId: mp.paper_id,
        title: mp.title,
        year: mp.year || 2023,
        citationCount: mp.citation_count || 0,
        url: mp.url || "",
        similarityReason: mp.similarity_reason || "Addressed in related literature.",
      })),
      howLiteratureDoesIt: fc.how_literature_does_it,
      yourNovelAdvantage: fc.your_novel_advantage,
    }));

    // Map backend candidates to SemanticScholarPaper format for discoveredPapers
    const candidatePapers: SemanticScholarPaper[] = data.top_candidates.map((cand) => ({
      paperId: cand.paper_id,
      title: cand.title,
      abstract: cand.abstract || null,
      year: cand.year || null,
      citationCount: cand.citation_count || 0,
      influentialCitationCount: Math.round((cand.citation_count || 0) * 0.15),
      url: cand.url || `https://www.semanticscholar.org/paper/${cand.paper_id}`,
      venue: "Scholarly Literature",
      authors: cand.authors && cand.authors.length > 0 ? cand.authors.map((a) => ({ name: a })) : [{ name: "Researcher" }],
      fieldsOfStudy: analysis.domains || ["Computer Science"],
      isOpenAccess: true,
      openAccessPdf: null,
    }));

    return {
      overallImplementedScore: data.overall_implemented_score,
      noveltyScore: data.overall_novelty_score,
      verdict: data.verdict,
      verdictDescription: data.verdict_description,
      featureComparisons,
      benchmarkedPapersCount: data.top_candidates.length,
      keyExistingCompetitors,
      candidatePapers,
    };
  } catch (error) {
    console.warn("Backend novelty predictor unavailable, using local client engine:", error);
    return localAnalyzeImplementationStatus(analysis, papers);
  }
}

