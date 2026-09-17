"""Analysis, Discover, Suggestions, Copilot, Roadmap, Architecture endpoints — stub implementations."""

from fastapi import APIRouter, Depends, BackgroundTasks
from app.core.firebase import get_current_user
from app.schemas.user import UserPublic
from app.database.repositories.project_repository import ProjectRepository

# ─── Analysis ────────────────────────────────────────────────────────────────
router = APIRouter()

@router.post("/start")
async def start_analysis(
    project_id: str,
    background_tasks: BackgroundTasks,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
):
    await project_repo.assert_ownership(project_id, current_user.id)
    return {"job_id": "pending", "status": "queued", "message": "Analysis started."}


@router.get("/status")
async def get_analysis_status(
    project_id: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
):
    await project_repo.assert_ownership(project_id, current_user.id)
    return {"project_id": project_id, "status": "not_started"}


@router.get("/result")
async def get_analysis_result(
    project_id: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
):
    await project_repo.assert_ownership(project_id, current_user.id)
    return {"project_id": project_id, "analysis": None}
