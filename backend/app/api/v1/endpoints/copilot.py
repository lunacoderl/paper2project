"""Copilot chat endpoints — conversational AI with project context."""

from fastapi import APIRouter, Depends
from app.core.firebase import get_current_user
from app.schemas.user import UserPublic
from app.schemas.analysis import ChatRequest, ChatResponse
from app.database.repositories.project_repository import ProjectRepository
from app.services.copilot_service import CopilotService

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    project_id: str,
    request: ChatRequest,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    copilot: CopilotService = Depends(CopilotService),
):
    """Send a message to the Project Copilot."""
    await project_repo.assert_ownership(project_id, current_user.id)
    return await copilot.chat(
        project_id=project_id,
        user_id=current_user.id,
        request=request,
    )


@router.post("/actions/{action_id}/approve")
async def approve_action(
    project_id: str,
    action_id: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    copilot: CopilotService = Depends(CopilotService),
):
    """Approve a proposed Copilot action (e.g., add feature)."""
    await project_repo.assert_ownership(project_id, current_user.id)
    return await copilot.execute_action(project_id=project_id, action_id=action_id)


@router.post("/actions/{action_id}/reject")
async def reject_action(
    project_id: str,
    action_id: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    copilot: CopilotService = Depends(CopilotService),
):
    """Reject a proposed Copilot action."""
    await project_repo.assert_ownership(project_id, current_user.id)
    return await copilot.reject_action(project_id=project_id, action_id=action_id)


@router.get("/conversations")
async def list_conversations(
    project_id: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    copilot: CopilotService = Depends(CopilotService),
):
    await project_repo.assert_ownership(project_id, current_user.id)
    return await copilot.list_conversations(project_id=project_id)


@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    project_id: str,
    conversation_id: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    copilot: CopilotService = Depends(CopilotService),
):
    await project_repo.assert_ownership(project_id, current_user.id)
    return await copilot.get_messages(conversation_id=conversation_id)
