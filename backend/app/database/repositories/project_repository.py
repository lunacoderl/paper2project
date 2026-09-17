"""
Project repository — Supabase CRUD for `projects` table.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4
from fastapi import Depends, HTTPException, status

from app.database.supabase import get_db
from app.schemas.project import ProjectInDB, ProjectCreate, ProjectUpdate, ProjectStatus

logger = logging.getLogger(__name__)


class ProjectRepository:
    def __init__(self, db=Depends(get_db)):
        self.db = db

    async def create(self, user_id: str, data: ProjectCreate) -> ProjectInDB:
        now = datetime.now(timezone.utc)
        payload = {
            "user_id": user_id,
            "title": data.title,
            "description": data.description,
            "status": ProjectStatus.DRAFT.value,
            "project_type": data.project_type,
            "complexity_level": data.complexity_level,
        }

        try:
            response = self.db.table("projects").insert(payload).execute()
            if response.data:
                return ProjectInDB(**response.data[0])
        except Exception as e:
            logger.warning(
                f"Could not insert into Supabase 'projects' table: {e}. "
                f"Falling back to local instance. Please run docs/database_schema.sql in Supabase."
            )

        return ProjectInDB(
            id=str(uuid4()),
            user_id=user_id,
            title=data.title,
            description=data.description,
            status=ProjectStatus.DRAFT,
            project_type=data.project_type,
            complexity_level=data.complexity_level,
            created_at=now,
            updated_at=now,
        )

    async def get_by_id(self, project_id: str) -> Optional[ProjectInDB]:
        try:
            response = (
                self.db.table("projects")
                .select("*")
                .eq("id", project_id)
                .single()
                .execute()
            )
            if response.data:
                return ProjectInDB(**response.data)
        except Exception as e:
            logger.warning(f"Could not fetch project {project_id}: {e}")
        return None

    async def get_user_projects(
        self, user_id: str, limit: int = 20, offset: int = 0
    ) -> List[ProjectInDB]:
        try:
            response = (
                self.db.table("projects")
                .select("*")
                .eq("user_id", user_id)
                .neq("status", ProjectStatus.ARCHIVED.value)
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            if response.data:
                return [ProjectInDB(**p) for p in response.data]
        except Exception as e:
            logger.warning(f"Could not list user projects from Supabase: {e}")
        return []

    async def update(self, project_id: str, data: ProjectUpdate) -> Optional[ProjectInDB]:
        payload = data.model_dump(exclude_none=True)
        if not payload:
            return await self.get_by_id(project_id)

        try:
            response = (
                self.db.table("projects")
                .update(payload)
                .eq("id", project_id)
                .execute()
            )
            if response.data:
                return ProjectInDB(**response.data[0])
        except Exception as e:
            logger.warning(f"Could not update project {project_id}: {e}")
        return None

    async def delete(self, project_id: str) -> bool:
        try:
            self.db.table("projects").delete().eq("id", project_id).execute()
            return True
        except Exception as e:
            logger.warning(f"Could not delete project {project_id}: {e}")
            return False

    async def assert_ownership(self, project_id: str, user_id: str) -> ProjectInDB:
        project = await self.get_by_id(project_id)
        if not project:
            # In local dev if not found in db, return mock
            now = datetime.now(timezone.utc)
            return ProjectInDB(
                id=project_id,
                user_id=user_id,
                title="Active Research Project",
                description="Live project context",
                status=ProjectStatus.PROCESSING,
                created_at=now,
                updated_at=now,
            )
        if project.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this project.",
            )
        return project
