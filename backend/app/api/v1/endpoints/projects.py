"""
Project CRUD endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.firebase import get_current_user
from app.schemas.user import UserPublic
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectInDB,
    ProjectListResponse,
)
from app.database.repositories.project_repository import ProjectRepository

router = APIRouter()


@router.post("", response_model=ProjectInDB, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    current_user: UserPublic = Depends(get_current_user),
    repo: ProjectRepository = Depends(ProjectRepository),
):
    """Create a new project for the authenticated user."""
    return await repo.create(user_id=current_user.id, data=data)


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    limit: int = 20,
    offset: int = 0,
    current_user: UserPublic = Depends(get_current_user),
    repo: ProjectRepository = Depends(ProjectRepository),
):
    """List all projects for the authenticated user."""
    projects = await repo.get_user_projects(
        user_id=current_user.id, limit=limit, offset=offset
    )
    return ProjectListResponse(
        projects=projects,
        total=len(projects),
        has_more=len(projects) == limit,
    )


@router.get("/{project_id}", response_model=ProjectInDB)
async def get_project(
    project_id: str,
    current_user: UserPublic = Depends(get_current_user),
    repo: ProjectRepository = Depends(ProjectRepository),
):
    """Get a specific project."""
    return await repo.assert_ownership(project_id=project_id, user_id=current_user.id)


@router.patch("/{project_id}", response_model=ProjectInDB)
async def update_project(
    project_id: str,
    data: ProjectUpdate,
    current_user: UserPublic = Depends(get_current_user),
    repo: ProjectRepository = Depends(ProjectRepository),
):
    """Update a project."""
    await repo.assert_ownership(project_id=project_id, user_id=current_user.id)
    updated = await repo.update(project_id=project_id, data=data)
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found.")
    return updated


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: UserPublic = Depends(get_current_user),
    repo: ProjectRepository = Depends(ProjectRepository),
):
    """Archive (soft-delete) a project."""
    await repo.assert_ownership(project_id=project_id, user_id=current_user.id)
    await repo.delete(project_id=project_id, user_id=current_user.id)
