from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ProjectStatus(str, Enum):
    DRAFT = "draft"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"
    ARCHIVED = "archived"


class ComplexityLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


# ─── Request Schemas ────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    project_type: Optional[str] = None
    complexity_level: Optional[ComplexityLevel] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[ProjectStatus] = None
    project_type: Optional[str] = None
    complexity_level: Optional[ComplexityLevel] = None


# ─── Response Schemas ────────────────────────────────────────────────────────

class ProjectInDB(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.DRAFT
    project_type: Optional[str] = None
    complexity_level: Optional[ComplexityLevel] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: List[ProjectInDB]
    total: int
    has_more: bool
