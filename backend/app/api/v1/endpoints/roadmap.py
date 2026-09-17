"""Roadmap generation and management endpoints."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.core.firebase import get_current_user
from app.schemas.user import UserPublic
from app.schemas.analysis import RoadmapResponse
from app.database.repositories.project_repository import ProjectRepository
from app.services.roadmap_service import RoadmapService

router = APIRouter()


class RoadmapConstraints(BaseModel):
    skill_level: str = "intermediate"   # beginner / intermediate / advanced / expert
    available_hours_per_day: float = 4
    team_size: int = 1
    budget: Optional[str] = None        # "low" / "medium" / "high"
    deadline_weeks: Optional[int] = None
    preferred_technologies: list = []
    has_gpu: bool = False


@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(
    project_id: str,
    constraints: RoadmapConstraints,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    roadmap_svc: RoadmapService = Depends(RoadmapService),
):
    """Generate a personalized implementation roadmap."""
    await project_repo.assert_ownership(project_id, current_user.id)
    return await roadmap_svc.generate(project_id=project_id, constraints=constraints.model_dump())


@router.get("")
async def get_roadmap(
    project_id: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    roadmap_svc: RoadmapService = Depends(RoadmapService),
):
    """Get the current roadmap for a project."""
    await project_repo.assert_ownership(project_id, current_user.id)
    return await roadmap_svc.get_latest(project_id=project_id)


@router.patch("/tasks/{task_id}")
async def update_task_status(
    project_id: str,
    task_id: str,
    status: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    roadmap_svc: RoadmapService = Depends(RoadmapService),
):
    """Update a roadmap task status (todo / in_progress / done)."""
    await project_repo.assert_ownership(project_id, current_user.id)
    return await roadmap_svc.update_task_status(task_id=task_id, status=status)
