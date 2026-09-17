"""
Discovery endpoints — paginated similar project results.
"""

from fastapi import APIRouter, Depends, Query
from app.core.firebase import get_current_user
from app.schemas.user import UserPublic
from app.schemas.analysis import SearchResultResponse
from app.database.repositories.project_repository import ProjectRepository
from app.services.search_service import SearchService

router = APIRouter()


@router.post("/start")
async def start_discovery(
    project_id: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    search_service: SearchService = Depends(SearchService),
):
    """Start the multi-source discovery search for a project."""
    await project_repo.assert_ownership(project_id, current_user.id)
    session = await search_service.start_search_session(project_id=project_id)
    return {"session_id": session["id"], "status": session["status"]}


@router.get("/status")
async def get_discovery_status(
    project_id: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    search_service: SearchService = Depends(SearchService),
):
    """Check discovery search progress."""
    await project_repo.assert_ownership(project_id, current_user.id)
    return await search_service.get_session_status(project_id=project_id)


@router.get("/results")
async def get_discovery_results(
    project_id: str,
    limit: int = Query(20, le=50),
    offset: int = Query(0, ge=0),
    source: str = Query(None),
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    search_service: SearchService = Depends(SearchService),
):
    """
    Get paginated discovery results.
    Do NOT re-run the search — reads from stored ranked results.
    """
    await project_repo.assert_ownership(project_id, current_user.id)
    return await search_service.get_paginated_results(
        project_id=project_id,
        limit=limit,
        offset=offset,
        source_filter=source,
    )


@router.get("/compare/{result_id}")
async def compare_result(
    project_id: str,
    result_id: str,
    current_user: UserPublic = Depends(get_current_user),
    project_repo: ProjectRepository = Depends(ProjectRepository),
    search_service: SearchService = Depends(SearchService),
):
    """Get detailed comparison between a search result and the user's project."""
    await project_repo.assert_ownership(project_id, current_user.id)
    return await search_service.compare_result(
        project_id=project_id, result_id=result_id
    )
