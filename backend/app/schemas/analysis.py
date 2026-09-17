from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class InputType(str, Enum):
    TEXT = "text"
    PROMPT = "prompt"
    PDF = "pdf"
    RESEARCH_PAPER = "research_paper"
    DOCX = "docx"
    TXT = "txt"
    OTHER = "other"


class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ─── Document schemas ────────────────────────────────────────────────────────

class DocumentChunk(BaseModel):
    id: str
    document_id: str
    project_id: str
    chunk_index: int
    content: str
    token_count: int
    embedding: Optional[List[float]] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DocumentInDB(BaseModel):
    id: str
    project_id: str
    project_input_id: Optional[str] = None
    title: Optional[str] = None
    document_type: Optional[InputType] = None
    raw_text: Optional[str] = None
    cleaned_text: Optional[str] = None
    language: Optional[str] = None
    processing_status: ProcessingStatus = ProcessingStatus.PENDING
    metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Analysis schemas ────────────────────────────────────────────────────────

class ConceptItem(BaseModel):
    concept_name: str
    normalized_concept: Optional[str] = None
    description: Optional[str] = None
    importance_score: float = 0.5
    parent_concept: Optional[str] = None


class FeatureItem(BaseModel):
    feature_name: str
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None  # high / medium / low
    complexity: Optional[str] = None
    status: str = "planned"  # existing / planned / suggested


class TechnologyItem(BaseModel):
    technology_name: str
    category: Optional[str] = None  # frontend / backend / ai_ml / database / etc.
    purpose: Optional[str] = None
    confidence_score: float = 0.8


class ProjectAnalysisResult(BaseModel):
    model_config = {"protected_namespaces": ()}

    project_title: str
    summary: str
    problem_statement: Optional[str] = None
    proposed_solution: Optional[str] = None
    target_users: List[str] = []
    domains: List[str] = []
    concepts: List[ConceptItem] = []
    features: List[FeatureItem] = []
    technologies: List[TechnologyItem] = []
    functional_requirements: List[str] = []
    non_functional_requirements: List[str] = []
    complexity: Dict[str, Any] = Field(default_factory=lambda: {"score": 0, "level": "unknown"})
    model_used: Optional[str] = None
    analysis_version: int = 1


# ─── Search schemas ──────────────────────────────────────────────────────────

class SearchResultNormalized(BaseModel):
    external_id: str
    source: str  # github / arxiv / openalex / semantic_scholar / etc.
    source_type: str  # repository / paper / dataset
    title: str
    url: str
    description: Optional[str] = None
    authors: List[str] = []
    technologies: List[str] = []
    stars: Optional[int] = None
    metadata: Dict[str, Any] = {}


class SearchResultResponse(BaseModel):
    results: List[Dict[str, Any]]
    total: int
    has_more: bool
    next_offset: Optional[int] = None


# ─── Suggestion schemas ──────────────────────────────────────────────────────

class SuggestionStatus(str, Enum):
    NEW = "new"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    IMPLEMENTED = "implemented"


class SuggestionInDB(BaseModel):
    id: str
    project_id: str
    category: Optional[str] = None
    title: str
    description: Optional[str] = None
    reason: Optional[str] = None
    impact: Optional[str] = None
    difficulty: Optional[str] = None
    estimated_time: Optional[str] = None
    priority_score: float = 0.5
    status: SuggestionStatus = SuggestionStatus.NEW
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Roadmap schemas ─────────────────────────────────────────────────────────

class RoadmapTask(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    difficulty: str = "medium"
    estimated_hours: int = 4
    required_skills: List[str] = []
    status: str = "todo"  # todo / in_progress / done
    dependencies: List[str] = []


class RoadmapPhase(BaseModel):
    id: Optional[str] = None
    phase_number: int
    title: str
    goal: str
    duration_weeks: int
    tasks: List[RoadmapTask] = []
    deliverables: List[str] = []


class RoadmapResponse(BaseModel):
    id: Optional[str] = None
    project_id: str
    total_duration_weeks: int
    complexity_score: int
    mvp_phases: List[int] = []  # phase numbers that form MVP
    phases: List[RoadmapPhase] = []
    created_at: Optional[datetime] = None


# ─── Copilot schemas ─────────────────────────────────────────────────────────

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    TOOL = "tool"


class ChatMessage(BaseModel):
    role: MessageRole
    content: str
    metadata: Optional[Dict[str, Any]] = None


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ActionProposal(BaseModel):
    action: str  # add_feature / remove_feature / update_requirement / etc.
    title: str
    description: str
    data: Dict[str, Any] = {}
    requires_confirmation: bool = True


class ChatResponse(BaseModel):
    message: str
    conversation_id: str
    action_proposal: Optional[ActionProposal] = None
    context_updated: bool = False
