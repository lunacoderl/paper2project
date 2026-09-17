"""Suggestions endpoints — list, accept, reject improvements."""

from fastapi import APIRouter, Depends
from app.core.firebase import get_current_user
from app.schemas.user import UserPublic
from app.database.repositories.project_repository import ProjectRepository
from app.services.suggestion_service import SuggestionService

router = APIRouter()


@router.get("")
async def list_suggestions(
    project_id: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    svc: SuggestionService = Depends(SuggestionService),
):
    await project_repo.assert_ownership(project_id, current_user.id)
    return await svc.list_suggestions(project_id)


@router.post("/{suggestion_id}/accept")
async def accept_suggestion(
    project_id: str,
    suggestion_id: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    svc: SuggestionService = Depends(SuggestionService),
):
    await project_repo.assert_ownership(project_id, current_user.id)
    return await svc.accept_suggestion(project_id=project_id, suggestion_id=suggestion_id)


@router.post("/{suggestion_id}/reject")
async def reject_suggestion(
    project_id: str,
    suggestion_id: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    svc: SuggestionService = Depends(SuggestionService),
):
    await project_repo.assert_ownership(project_id, current_user.id)
    return await svc.reject_suggestion(project_id=project_id, suggestion_id=suggestion_id)
