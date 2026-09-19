"""
Pydantic schemas for Novelty Predictor & Hybrid Citation-Metadata Recommendation.
Grounded on:
"A Hybrid Personalized Scientific Paper Recommendation Approach Integrating Public Contextual Metadata"
(Sakib et al., IEEE Access, 2021)
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum


class ImplementationStatusEnum(str, Enum):
    FULLY_IMPLEMENTED = "fully_implemented"
    PARTIALLY_IMPLEMENTED = "partially_implemented"
    NOVEL = "novel"


class NoveltyVerdictEnum(str, Enum):
    HIGH_NOVELTY = "High Novelty"
    MODERATE_NOVELTY = "Moderate Novelty with Proven Precedents"
    HEAVILY_EXPLORED = "Heavily Explored Area — Needs Differentiators"


class ExtractedIdeaFeature(BaseModel):
    feature_name: str
    description: Optional[str] = ""
    category: Optional[str] = "core"


class NoveltyPredictRequest(BaseModel):
    title: Optional[str] = ""
    abstract: Optional[str] = ""
    raw_text: Optional[str] = ""
    keywords: List[str] = Field(default_factory=list)
    domains: List[str] = Field(default_factory=list)
    methodologies: List[str] = Field(default_factory=list)
    features: List[ExtractedIdeaFeature] = Field(default_factory=list)
    max_candidates: int = Field(default=10, ge=3, le=50)


class AnchorPaperInfo(BaseModel):
    paper_id: str
    title: str
    year: Optional[int] = None
    citation_count: int = 0
    reference_count: int = 0
    url: Optional[str] = ""
    similarity_to_idea: float = 0.0
    status: str = "found"  # "found" or "fallback_no_anchor"


class CandidateScoredPaper(BaseModel):
    paper_id: str
    title: str
    year: Optional[int] = None
    citation_count: int = 0
    authors: List[str] = Field(default_factory=list)
    url: Optional[str] = ""
    abstract: Optional[str] = ""
    cbf_score: float = Field(description="Content-Based Filtering cosine similarity (0-1)")
    cf_score: float = Field(description="Collaborative Filtering Jaccard citation similarity (0-1)")
    hybrid_score: float = Field(description="Fused hybrid score (0-1)")
    similarity_percentage: int = Field(description="Hybrid score as percentage 0-100")


class DimensionalNoveltyScores(BaseModel):
    problem_novelty: float = Field(ge=0.0, le=100.0, description="How unique is the target problem?")
    methodological_novelty: float = Field(ge=0.0, le=100.0, description="How novel are the algorithms/methods?")
    implementation_novelty: float = Field(ge=0.0, le=100.0, description="How novel are deployment/cost/efficiency constraints?")


class FeatureNoveltyComparison(BaseModel):
    feature_id: str
    feature_name: str
    description: str = ""
    status: ImplementationStatusEnum
    overlap_percentage: int = Field(ge=0, le=100)
    novelty_percentage: int = Field(ge=0, le=100)
    how_literature_does_it: str
    your_novel_advantage: str
    matching_papers: List[Dict[str, Any]] = Field(default_factory=list)


class NoveltyPredictResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    overall_novelty_score: int = Field(ge=0, le=100)
    overall_implemented_score: int = Field(ge=0, le=100)
    verdict: NoveltyVerdictEnum
    verdict_description: str
    dimensional_scores: DimensionalNoveltyScores
    anchor_paper: Optional[AnchorPaperInfo] = None
    cf_branch_used: bool = Field(description="True if 2-level citation CF branch was executed, False if CBF fallback")
    top_candidates: List[CandidateScoredPaper] = Field(default_factory=list)
    feature_comparisons: List[FeatureNoveltyComparison] = Field(default_factory=list)
    gaps_and_recommendations: List[str] = Field(default_factory=list)
    model_version: str = "sakib-hybrid-v1.0"
