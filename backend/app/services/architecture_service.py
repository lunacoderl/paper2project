"""
Architecture Service — Generates and persists React Flow compatible node/edge graph data.
Supports System Architecture, Data Flow, AI Pipeline, and Database Relationships.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import Depends

from app.database.supabase import get_db
from app.services.llm_service import LLMService
from app.services.project_analysis_service import ProjectAnalysisService

logger = logging.getLogger(__name__)


class ArchitectureService:
    def __init__(
        self,
        db=Depends(get_db),
        llm: LLMService = Depends(LLMService),
        analysis_svc: ProjectAnalysisService = Depends(ProjectAnalysisService),
    ):
        self.db = db
        self.llm = llm
        self.analysis_svc = analysis_svc

    async def generate(self, project_id: str, diagram_type: str = "system") -> Dict[str, Any]:
        """Generate React Flow graph data for a project architecture."""
        context = await self.analysis_svc.get_project_context(project_id)
        if not context:
            raise ValueError("Project context is empty. Run analysis first.")

        graph_data = await self.llm.generate_architecture(context, diagram_type)
        now = datetime.now(timezone.utc).isoformat()

        # Store in Supabase
        payload = {
            "project_id": project_id,
            "diagram_type": diagram_type,
            "graph_data": graph_data,
            "created_at": now,
        }

        # Clear old diagram of the same type for this project
        self.db.table("architectures").delete().eq("project_id", project_id).eq("diagram_type", diagram_type).execute()

        res = self.db.table("architectures").insert(payload).execute()
        return res.data[0]["graph_data"] if res.data else graph_data

    async def get_latest(self, project_id: str, diagram_type: str = "system") -> Dict[str, Any]:
        """Get existing architecture graph data or generate if absent."""
        res = (
            self.db.table("architectures")
            .select("*")
            .eq("project_id", project_id)
            .eq("diagram_type", diagram_type)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if res.data:
            return res.data[0].get("graph_data", {})
        return await self.generate(project_id, diagram_type)
