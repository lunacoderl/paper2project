"""
Ranking Service — Hybrid scoring and deduplication for multi-source search results.

Scoring Formula (Configurable):
  Final Score =
    0.35 × Semantic Similarity
  + 0.25 × Concept Match
  + 0.25 × Feature Match
  + 0.10 × Technology Match
  + 0.05 × Source Quality (stars/citations)
"""

import logging
import math
from typing import List, Dict, Any, Tuple
from fastapi import Depends

from app.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class RankingService:
    def __init__(self, embedding_svc: EmbeddingService = Depends(EmbeddingService)):
        self.embedding_svc = embedding_svc
        # Configurable weights
        self.weights = {
            "semantic": 0.35,
            "concept": 0.25,
            "feature": 0.25,
            "technology": 0.10,
            "quality": 0.05,
        }

    def deduplicate(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove exact and near-duplicate results across providers by URL and Title similarity."""
        seen_urls = set()
        seen_titles = set()
        unique_results = []

        for r in results:
            url = (r.get("url") or "").strip().lower()
            title = "".join(filter(str.isalnum, (r.get("title") or "").lower()))

            if not title or len(title) < 3:
                continue

            if url and url in seen_urls:
                continue

            if title in seen_titles:
                continue

            if url:
                seen_urls.add(url)
            seen_titles.add(title)
            unique_results.append(r)

        return unique_results

    def _calculate_quality_score(self, result: Dict[str, Any]) -> float:
        """Normalized quality score between 0.0 and 1.0 based on citations or GitHub stars."""
        stars = result.get("stars") or result.get("metadata", {}).get("citation_count") or 0
        if stars <= 0:
            return 0.2
        # Logarithmic scale: 100 stars = ~0.67, 1000 stars = ~0.89, 10000+ = 1.0
        score = min(1.0, math.log10(stars + 1) / 4.0)
        return max(0.2, score)

    def _calculate_keyword_overlap(self, query_keywords: List[str], target_text: str) -> float:
        """Jaccard-like overlap between keyword lists and target text."""
        if not query_keywords or not target_text:
            return 0.0
        target_lower = target_text.lower()
        matched = 0
        for kw in query_keywords:
            if kw.lower() in target_lower:
                matched += 1
        return min(1.0, matched / max(1, len(query_keywords)))

    async def calculate_hybrid_scores(
        self,
        project_context: Dict[str, Any],
        results: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Calculates hybrid score for every result and generates match breakdown.
        """
        if not results:
            return []

        # Prepare project text & embeddings
        project_summary = project_context.get("summary") or project_context.get("project_title") or ""
        concepts = [c.get("concept_name", "") for c in project_context.get("concepts", []) if c.get("concept_name")]
        features = [f.get("feature_name", "") for f in project_context.get("features", []) if f.get("feature_name")]
        technologies = [t.get("technology_name", "") for t in project_context.get("technologies", []) if t.get("technology_name")]

        project_vec = await self.embedding_svc.embed_text(project_summary) if project_summary else []

        scored_results = []

        # Extract descriptions for batch embedding
        result_texts = [f"{r.get('title', '')}. {r.get('description', '')}" for r in results]
        result_vecs = await self.embedding_svc.embed_chunks(result_texts) if project_vec else [[] for _ in results]

        for idx, r in enumerate(results):
            # 1. Semantic Similarity
            semantic_score = 0.5
            if project_vec and idx < len(result_vecs) and result_vecs[idx]:
                semantic_score = await self.embedding_svc.similarity(project_vec, result_vecs[idx])
                semantic_score = max(0.0, min(1.0, (semantic_score + 1.0) / 2.0)) # normalize -1..1 to 0..1

            content = f"{r.get('title', '')} {r.get('description', '')} {' '.join(r.get('technologies', []))}"

            # 2. Concept Match
            concept_score = self._calculate_keyword_overlap(concepts, content)

            # 3. Feature Match
            feature_score = self._calculate_keyword_overlap(features, content)

            # 4. Technology Match
            tech_score = self._calculate_keyword_overlap(technologies, content)

            # 5. Quality Score
            quality_score = self._calculate_quality_score(r)

            # Final weighted score
            final_score = (
                self.weights["semantic"] * semantic_score
                + self.weights["concept"] * concept_score
                + self.weights["feature"] * feature_score
                + self.weights["technology"] * tech_score
                + self.weights["quality"] * quality_score
            )

            # Find matching items for UI badges
            matched_concepts = [c for c in concepts if c.lower() in content.lower()][:4]
            matched_features = [f for f in features if f.lower() in content.lower()][:4]
            matched_technologies = [t for t in technologies if t.lower() in content.lower()][:4]

            scored_item = {
                **r,
                "scores": {
                    "final_score": round(final_score, 3),
                    "semantic_score": round(semantic_score, 3),
                    "concept_score": round(concept_score, 3),
                    "feature_score": round(feature_score, 3),
                    "technology_score": round(tech_score, 3),
                    "quality_score": round(quality_score, 3),
                },
                "matched_concepts": matched_concepts,
                "matched_features": matched_features,
                "matched_technologies": matched_technologies,
                "similarity_percentage": int(round(final_score * 100)),
            }
            scored_results.append(scored_item)

        # Sort highest score first
        scored_results.sort(key=lambda x: x["scores"]["final_score"], reverse=True)
        return scored_results
