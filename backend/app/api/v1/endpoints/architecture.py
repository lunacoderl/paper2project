"""Architecture diagram generation endpoints."""

from fastapi import APIRouter, Depends
from app.core.firebase import get_current_user
from app.schemas.user import UserPublic
from app.database.repositories.project_repository import ProjectRepository
from app.services.architecture_service import ArchitectureService

router = APIRouter()


@router.post("/generate")
async def generate_architecture(
    project_id: str,
    diagram_type: str = "system",  # system / data_flow / module / database / ai_pipeline
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    arch_svc: ArchitectureService = Depends(ArchitectureService),
):
    """Generate a React Flow architecture diagram for the project."""
    await project_repo.assert_ownership(project_id, current_user.id)
    return await arch_svc.generate(project_id=project_id, diagram_type=diagram_type)


@router.get("")
async def get_architecture(
    project_id: str,
    diagram_type: str = "system",
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    arch_svc: ArchitectureService = Depends(ArchitectureService),
):
    """Get the latest architecture diagram."""
    await project_repo.assert_ownership(project_id, current_user.id)
    return await arch_svc.get_latest(project_id=project_id, diagram_type=diagram_type)
