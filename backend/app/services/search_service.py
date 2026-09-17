"""
Search Service — Orchestrates multi-source queries, provider aggregation,
hybrid scoring, and result persistence in Supabase.
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import Depends

from app.database.supabase import get_db
from app.services.llm_service import LLMService
from app.services.project_analysis_service import ProjectAnalysisService
from app.services.ranking_service import RankingService
from app.providers.github_provider import GitHubProvider
from app.providers.arxiv_provider import ArxivProvider
from app.providers.academic_providers import (
    OpenAlexProvider,
    SemanticScholarProvider,
    PapersWithCodeProvider,
)

logger = logging.getLogger(__name__)


class SearchService:
    def __init__(
        self,
        db=Depends(get_db),
        llm: LLMService = Depends(LLMService),
        analysis_svc: ProjectAnalysisService = Depends(ProjectAnalysisService),
        ranking_svc: RankingService = Depends(RankingService),
    ):
        self.db = db
        self.llm = llm
        self.analysis_svc = analysis_svc
        self.ranking_svc = ranking_svc

        # Initialize search providers
        self.providers = [
            GitHubProvider(),
            ArxivProvider(),
            OpenAlexProvider(),
            SemanticScholarProvider(),
            PapersWithCodeProvider(),
        ]

    async def start_search_session(self, project_id: str) -> Dict[str, Any]:
        """Creates or resets a search session and initiates background search orchestration."""
        now = datetime.now(timezone.utc).isoformat()
        session_data = {
            "project_id": project_id,
            "status": "processing",
            "total_results": 0,
            "processed_results": 0,
            "created_at": now,
        }

        # Check existing session
        existing = (
            self.db.table("search_sessions")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if existing.data:
            session_id = existing.data[0]["id"]
            self.db.table("search_sessions").update(session_data).eq("id", session_id).execute()
        else:
            res = self.db.table("search_sessions").insert(session_data).execute()
            session_id = res.data[0]["id"]

        # Run multi-source search pipeline asynchronously
        asyncio.create_task(self._execute_search_pipeline(project_id, session_id))

        return {"id": session_id, "status": "processing"}

    async def _execute_search_pipeline(self, project_id: str, session_id: str):
        """Background pipeline that executes multi-source query and ranking."""
        try:
            logger.info(f"Starting multi-source discovery search for project {project_id}")
            context = await self.analysis_svc.get_project_context(project_id)
            if not context:
                raise ValueError("Project context is empty. Run analysis first.")

            # 1. Generate multi-level queries via LLM
            queries = await self.llm.generate_search_queries(context)
            if not queries:
                title = context.get("summary") or "AI software"
                queries = [title[:60]]

            # Ensure we search top 4 distinct queries across all providers
            active_queries = queries[:4]
            raw_results: List[Dict[str, Any]] = []

            # 2. Multi-source querying with error isolation
            tasks = []
            for query in active_queries:
                for provider in self.providers:
                    tasks.append(self._safe_provider_search(provider, query))

            results_nested = await asyncio.gather(*tasks)
            for res_list in results_nested:
                raw_results.extend(res_list)

            # 3. Deduplicate
            unique_results = self.ranking_svc.deduplicate(raw_results)

            # 4. Hybrid Ranking & Scoring
            ranked_results = await self.ranking_svc.calculate_hybrid_scores(context, unique_results)

            # 5. Persist in Supabase
            # Delete old search results for this session
            self.db.table("search_results").delete().eq("search_session_id", session_id).execute()

            records = []
            for r in ranked_results:
                records.append({
                    "search_session_id": session_id,
                    "external_id": str(r.get("external_id") or ""),
                    "source": r.get("source"),
                    "source_type": r.get("source_type"),
                    "title": r.get("title"),
                    "url": r.get("url"),
                    "raw_description": r.get("description"),
                    "normalized_content": r.get("description"),
                    "metadata": {
                        "stars": r.get("stars"),
                        "authors": r.get("authors"),
                        "technologies": r.get("technologies"),
                        "matched_concepts": r.get("matched_concepts", []),
                        "matched_features": r.get("matched_features", []),
                        "matched_technologies": r.get("matched_technologies", []),
                        "scores": r.get("scores", {}),
                        "similarity_percentage": r.get("similarity_percentage", 50),
                    },
                })

            if records:
                self.db.table("search_results").insert(records).execute()

            # Update session status
            now = datetime.now(timezone.utc).isoformat()
            self.db.table("search_sessions").update({
                "status": "completed",
                "total_results": len(records),
                "processed_results": len(records),
                "completed_at": now,
            }).eq("id", session_id).execute()

            logger.info(f"Discovery complete for project {project_id}: {len(records)} results stored.")

        except Exception as e:
            logger.error(f"Search pipeline failed for project {project_id}: {e}", exc_info=True)
            self.db.table("search_sessions").update({
                "status": "failed",
            }).eq("id", session_id).execute()

    async def _safe_provider_search(self, provider, query: str) -> List[Dict[str, Any]]:
        """Isolated search call with timeout and graceful fallback."""
        try:
            return await asyncio.wait_for(provider.search(query, limit=10), timeout=25.0)
        except Exception as e:
            logger.warning(f"Provider {provider.source_name} failed on query '{query}': {e}")
            return []

    async def get_session_status(self, project_id: str) -> Dict[str, Any]:
        """Fetch current search session progress."""
        session = (
            self.db.table("search_sessions")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not session.data:
            return {"status": "not_started", "total_results": 0}
        return session.data[0]

    async def get_paginated_results(
        self,
        project_id: str,
        limit: int = 20,
        offset: int = 0,
        source_filter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Retrieve stored ranked results with pagination."""
        session = (
            self.db.table("search_sessions")
            .select("id, status, total_results")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if not session.data:
            return {"results": [], "total": 0, "has_more": False, "next_offset": None}

        session_id = session.data[0]["id"]
        query = (
            self.db.table("search_results")
            .select("*")
            .eq("search_session_id", session_id)
        )

        if source_filter:
            query = query.eq("source", source_filter)

        # Count total
        count_res = query.execute()
        total_items = len(count_res.data) if count_res.data else 0

        # Paginated fetch
        data_res = query.range(offset, offset + limit - 1).execute()
        results = data_res.data or []

        has_more = (offset + limit) < total_items
        next_offset = (offset + limit) if has_more else None

        return {
            "results": results,
            "total": total_items,
            "has_more": has_more,
            "next_offset": next_offset,
        }

    async def compare_result(self, project_id: str, result_id: str) -> Dict[str, Any]:
        """Deep comparison between user project and a specific search result."""
        context = await self.analysis_svc.get_project_context(project_id)
        result = (
            self.db.table("search_results")
            .select("*")
            .eq("id", result_id)
            .single()
            .execute()
        )
        if not result.data:
            raise ValueError("Search result not found.")

        target = {
            "title": result.data.get("title", ""),
            "description": result.data.get("raw_description", ""),
        }
        return await self.llm.analyze_result(context, target)
