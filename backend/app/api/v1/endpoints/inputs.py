"""
Input endpoints — text, PDF, DOCX, TXT upload and processing.
"""

import logging
from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, HTTPException, status

from app.core.firebase import get_current_user
from app.schemas.user import UserPublic
from app.schemas.analysis import InputType
from app.database.repositories.project_repository import ProjectRepository
from app.services.document_service import DocumentService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/text")
async def submit_text_input(
    project_id: str,
    text: str = Form(..., min_length=50),
    input_type: InputType = Form(InputType.TEXT),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    doc_service: DocumentService = Depends(DocumentService),
):
    """Submit plain text or prompt as project input."""
    await project_repo.assert_ownership(project_id=project_id, user_id=current_user.id)

    doc = await doc_service.process_text(
        project_id=project_id,
        content=text,
        input_type=input_type,
    )

    return {"document_id": doc.id, "status": doc.processing_status, "message": "Text input received and queued for processing."}


@router.post("/file")
async def upload_file(
    project_id: str,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    doc_service: DocumentService = Depends(DocumentService),
):
    """Upload a PDF, DOCX, or TXT file as project input."""
    await project_repo.assert_ownership(project_id=project_id, user_id=current_user.id)

    doc = await doc_service.process_file_upload(
        project_id=project_id,
        file=file,
        background_tasks=background_tasks,
    )

    return {"document_id": doc.id, "status": doc.processing_status, "message": "File received and queued for processing."}
