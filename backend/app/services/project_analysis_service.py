"""
Project Analysis Service — orchestrates the full AI understanding pipeline.

Pipeline:
  Document text → LLM Analysis → Structured Context →
  Concept/Feature/Technology extraction → Store in Supabase
"""

import logging
from typing import Optional, Dict
from fastapi import Depends

from app.database.supabase import get_db
from app.services.llm_service import LLMService
from app.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class ProjectAnalysisService:
    def __init__(
        self,
        db=Depends(get_db),
        llm: LLMService = Depends(LLMService),
        embedding_svc: EmbeddingService = Depends(EmbeddingService),
    ):
        self.db = db
        self.llm = llm
        self.embedding_svc = embedding_svc

    async def get_project_document_text(self, project_id: str) -> str:
        """Fetch all cleaned document text for a project."""
        response = (
            self.db.table("documents")
            .select("cleaned_text")
            .eq("project_id", project_id)
            .eq("processing_status", "completed")
            .execute()
        )
        texts = [d["cleaned_text"] for d in response.data if d.get("cleaned_text")]
        return "\n\n---\n\n".join(texts)

    async def analyze(self, project_id: str) -> Dict:
        """
        Run the full analysis pipeline for a project.
        Returns the structured analysis result.
        """
        # 1. Get all document content
        content = await self.get_project_document_text(project_id)
        if not content.strip():
            raise ValueError("No processed document content found for this project.")

        # 2. Run LLM analysis
        logger.info(f"Running LLM analysis for project {project_id}")
        analysis = await self.llm.analyze_project(content)
        analysis["model_used"] = self.llm.model

        # 3. Store main analysis
        existing = (
            self.db.table("project_analysis")
            .select("id, analysis_version")
            .eq("project_id", project_id)
            .execute()
        )

        version = 1
        if existing.data:
            version = existing.data[0].get("analysis_version", 1) + 1
            self.db.table("project_analysis").update({
                "summary": analysis.get("summary", ""),
                "problem_statement": analysis.get("problem_statement", ""),
                "proposed_solution": analysis.get("proposed_solution", ""),
                "target_users": analysis.get("target_users", []),
                "project_domain": ", ".join(analysis.get("domains", [])),
                "complexity_score": analysis.get("complexity", {}).get("score", 0),
                "complexity_level": analysis.get("complexity", {}).get("level", "unknown"),
                "analysis_version": version,
                "model_used": analysis.get("model_used", ""),
            }).eq("project_id", project_id).execute()
        else:
            self.db.table("project_analysis").insert({
                "project_id": project_id,
                "summary": analysis.get("summary", ""),
                "problem_statement": analysis.get("problem_statement", ""),
                "proposed_solution": analysis.get("proposed_solution", ""),
                "target_users": analysis.get("target_users", []),
                "project_domain": ", ".join(analysis.get("domains", [])),
                "complexity_score": analysis.get("complexity", {}).get("score", 0),
                "complexity_level": analysis.get("complexity", {}).get("level", "unknown"),
                "analysis_version": version,
                "model_used": analysis.get("model_used", ""),
            }).execute()

        # 4. Store concepts with embeddings
        await self._store_concepts(project_id, analysis.get("concepts", []))

        # 5. Store features
        await self._store_features(project_id, analysis.get("features", []))

        # 6. Store technologies
        await self._store_technologies(project_id, analysis.get("technologies", []))

        # 7. Update project title from analysis
        if analysis.get("project_title"):
            self.db.table("projects").update({
                "title": analysis["project_title"],
                "status": "ready",
            }).eq("id", project_id).execute()

        logger.info(f"Analysis complete for project {project_id}")
        return analysis

    async def _store_concepts(self, project_id: str, concepts: list) -> None:
        """Store extracted concepts with embeddings."""
        # Clear existing concepts for this project
        self.db.table("project_concepts").delete().eq("project_id", project_id).execute()

        if not concepts:
            return

        # Generate embeddings for all concept names
        concept_texts = [c.get("concept_name", "") for c in concepts]
        embeddings = await self.embedding_svc.embed_batch(concept_texts)

        records = []
        for i, concept in enumerate(concepts):
            records.append({
                "project_id": project_id,
                "concept_name": concept.get("concept_name", ""),
                "normalized_concept": concept.get("normalized_concept", ""),
                "description": concept.get("description", ""),
                "importance_score": concept.get("importance_score", 0.5),
                "embedding": embeddings[i] if i < len(embeddings) else None,
            })

        if records:
            self.db.table("project_concepts").insert(records).execute()

    async def _store_features(self, project_id: str, features: list) -> None:
        """Store extracted features."""
        self.db.table("project_features").delete().eq("project_id", project_id).execute()

        if not features:
            return

        records = [{
            "project_id": project_id,
            "feature_name": f.get("feature_name", ""),
            "description": f.get("description", ""),
            "category": f.get("category", ""),
            "priority": f.get("priority", "medium"),
            "complexity": f.get("complexity", "medium"),
            "status": f.get("status", "planned"),
        } for f in features]

        if records:
            self.db.table("project_features").insert(records).execute()

    async def _store_technologies(self, project_id: str, technologies: list) -> None:
        """Store detected technologies."""
        self.db.table("project_technologies").delete().eq("project_id", project_id).execute()

        if not technologies:
            return

        records = [{
            "project_id": project_id,
            "technology_name": t.get("technology_name", ""),
            "category": t.get("category", ""),
            "purpose": t.get("purpose", ""),
            "confidence_score": t.get("confidence_score", 0.8),
            "status": "planned",
        } for t in technologies]

        if records:
            self.db.table("project_technologies").insert(records).execute()

    async def get_project_context(self, project_id: str) -> Dict:
        """Load the full project context for use by other services."""
        analysis = (
            self.db.table("project_analysis")
            .select("*")
            .eq("project_id", project_id)
            .single()
            .execute()
        )
        if not analysis.data:
            return {}

        concepts = (
            self.db.table("project_concepts")
            .select("*")
            .eq("project_id", project_id)
            .order("importance_score", desc=True)
            .execute()
        )
        features = (
            self.db.table("project_features")
            .select("*")
            .eq("project_id", project_id)
            .execute()
        )
        technologies = (
            self.db.table("project_technologies")
            .select("*")
            .eq("project_id", project_id)
            .execute()
        )

        ctx = analysis.data.copy()
        ctx["concepts"] = concepts.data
        ctx["features"] = features.data
        ctx["technologies"] = technologies.data
        return ctx
