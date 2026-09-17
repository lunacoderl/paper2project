"""
Suggestion Service — Gap analysis, opportunity detection, and accept/reject workflow.
Accepting a suggestion converts it into an active project feature and updates project context.
"""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import Depends

from app.database.supabase import get_db
from app.services.llm_service import LLMService
from app.services.project_analysis_service import ProjectAnalysisService

logger = logging.getLogger(__name__)


class SuggestionService:
    def __init__(
        self,
        db=Depends(get_db),
        llm: LLMService = Depends(LLMService),
        analysis_svc: ProjectAnalysisService = Depends(ProjectAnalysisService),
    ):
        self.db = db
        self.llm = llm
        self.analysis_svc = analysis_svc

    async def list_suggestions(self, project_id: str) -> List[Dict[str, Any]]:
        """List current suggestions, or generate them on the fly if none exist."""
        res = (
            self.db.table("project_suggestions")
            .select("*")
            .eq("project_id", project_id)
            .order("priority_score", desc=True)
            .execute()
        )

        if res.data and len(res.data) > 0:
            return res.data

        # Auto-generate if empty
        return await self.generate_suggestions(project_id)

    async def generate_suggestions(self, project_id: str) -> List[Dict[str, Any]]:
        """Generate improvement suggestions using project context and discovered implementations."""
        context = await self.analysis_svc.get_project_context(project_id)
        if not context:
            return []

        # Fetch top similar search results for gap analysis
        session = (
            self.db.table("search_sessions")
            .select("id")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        similar_results = []
        if session.data:
            session_id = session.data[0]["id"]
            results_res = (
                self.db.table("search_results")
                .select("title, raw_description")
                .eq("search_session_id", session_id)
                .limit(8)
                .execute()
            )
            similar_results = results_res.data or []

        raw_suggestions = await self.llm.generate_suggestions(context, similar_results)
        if not raw_suggestions:
            return []

        # Store in Supabase
        records = []
        for s in raw_suggestions:
            records.append({
                "project_id": project_id,
                "category": s.get("category", "technical"),
                "title": s.get("title", ""),
                "description": s.get("description", ""),
                "reason": s.get("reason", ""),
                "impact": s.get("impact", "medium"),
                "difficulty": s.get("difficulty", "medium"),
                "estimated_time": s.get("estimated_time", "1-2 days"),
                "priority_score": s.get("priority_score", 0.7),
                "status": "new",
            })

        res = self.db.table("project_suggestions").insert(records).execute()
        return res.data or []

    async def accept_suggestion(self, project_id: str, suggestion_id: str) -> Dict[str, Any]:
        """
        Accept a suggestion:
        1. Mark suggestion as 'accepted'
        2. Create a new entry in `project_features`
        3. Recalculate or log change
        """
        # Fetch suggestion
        sug_res = (
            self.db.table("project_suggestions")
            .select("*")
            .eq("id", suggestion_id)
            .eq("project_id", project_id)
            .single()
            .execute()
        )
        if not sug_res.data:
            raise ValueError("Suggestion not found.")

        suggestion = sug_res.data

        # Update suggestion status
        self.db.table("project_suggestions").update({"status": "accepted"}).eq("id", suggestion_id).execute()

        # Insert new project feature
        feature_payload = {
            "project_id": project_id,
            "feature_name": suggestion.get("title"),
            "description": f"{suggestion.get('description')} (Reason: {suggestion.get('reason')})",
            "category": suggestion.get("category", "suggested"),
            "priority": "high" if suggestion.get("impact") == "high" else "medium",
            "complexity": suggestion.get("difficulty", "medium"),
            "status": "planned",
        }
        feat_res = self.db.table("project_features").insert(feature_payload).execute()

        return {
            "status": "accepted",
            "suggestion_id": suggestion_id,
            "feature": feat_res.data[0] if feat_res.data else None,
            "message": "Suggestion accepted and converted into a planned project feature.",
        }

    async def reject_suggestion(self, project_id: str, suggestion_id: str) -> Dict[str, Any]:
        """Mark a suggestion as 'rejected'."""
        self.db.table("project_suggestions").update({"status": "rejected"}).eq("id", suggestion_id).eq("project_id", project_id).execute()
        return {"status": "rejected", "suggestion_id": suggestion_id}
