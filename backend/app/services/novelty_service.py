"""
Novelty Service — Orchestrates the complete end-to-end pipeline:
1. Model 1: Idea / Document Extraction
2. Embedding Layer: Vectorization via bge-small-en-v1.5
3. Step 0: Anchor Bootstrap (finding closest real paper)
4. CF Branch: 2-level citation co-occurrence & Jaccard similarity (Sakib et al., 2021)
5. CBF Branch: Cosine semantic similarity across candidates
6. Hybrid Scoring Layer: Fuses CF and CBF scores
7. Model 3: Novelty Scoring, Dimensional Breakdown & Gap Detection
"""

import logging
from typing import Dict, Any, List, Optional
from fastapi import Depends

from app.schemas.novelty import (
    NoveltyPredictRequest,
    NoveltyPredictResponse,
    AnchorPaperInfo,
    CandidateScoredPaper,
)
from app.services.embedding_service import EmbeddingService
from app.services.anchor_service import AnchorBootstrapService
from app.services.citation_cf_service import CitationCFService
from app.services.hybrid_ranker import HybridRanker
from app.models.novelty_predictor import NoveltyPredictor
from app.providers.academic_providers import SemanticScholarProvider, OpenAlexProvider
from app.providers.arxiv_provider import ArxivProvider

logger = logging.getLogger(__name__)


class NoveltyService:
    def __init__(
        self,
        embedding_svc: EmbeddingService = Depends(EmbeddingService),
        cf_svc: CitationCFService = Depends(CitationCFService),
    ):
        self.embedding_svc = embedding_svc if hasattr(embedding_svc, "embed_text") else EmbeddingService()
        self.cf_svc = cf_svc if hasattr(cf_svc, "compute_jaccard_similarity") else CitationCFService()

        self.anchor_svc = AnchorBootstrapService(embedding_svc=self.embedding_svc)
        self.hybrid_ranker = HybridRanker(embedding_svc=self.embedding_svc, cf_svc=self.cf_svc)
        self.predictor = NoveltyPredictor()
        self.scholar_provider = SemanticScholarProvider()
        self.openalex_provider = OpenAlexProvider()
        self.arxiv_provider = ArxivProvider()

    async def predict_novelty(self, request: NoveltyPredictRequest) -> NoveltyPredictResponse:
        """
        Executes the full pipeline for a student's idea or research document.
        """
        # 1. Model 1: Extraction & Preprocessing
        title = (request.title or "").strip()
        abstract = (request.abstract or "").strip()
        raw_text = (request.raw_text or "").strip()

        if not title and raw_text:
            lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
            title = lines[0][:120] if lines else "Research Concept"
            abstract = " ".join(lines[1:6])[:800] if len(lines) > 1 else raw_text[:800]

        if not abstract and raw_text:
            abstract = raw_text[:800]

        keywords = request.keywords or self._extract_keywords(f"{title} {abstract}")
        methodologies = request.methodologies or self._extract_methods(f"{title} {abstract}")
        domains = request.domains or ["Computer Science"]
        features_dict = [f.model_dump() for f in request.features]

        # 2. Embedding Layer: Generate idea_vector
        idea_text = f"{title}. {abstract}".strip()
        try:
            idea_vector = await self.embedding_svc.embed_text(idea_text[:500])
        except Exception as e:
            logger.warning(f"Embedding failed, will use fallback: {e}")
            idea_vector = []

        # 3. Step 0: Anchor Bootstrap
        anchor_data = await self.anchor_svc.find_anchor_paper(
            title=title,
            abstract=abstract,
            keywords=keywords,
            idea_vector=idea_vector,
        )

        anchor_info = None
        cf_branch_used = False
        if anchor_data and anchor_data.get("status") == "found":
            anchor_info = AnchorPaperInfo(
                paper_id=anchor_data["paper_id"],
                title=anchor_data["title"],
                year=anchor_data.get("year"),
                citation_count=anchor_data.get("citation_count", 0),
                reference_count=anchor_data.get("reference_count", 0),
                url=anchor_data.get("url", ""),
                similarity_to_idea=anchor_data.get("similarity_to_idea", 0.0),
                status="found",
            )
            cf_branch_used = True

        # 4. Retrieve Candidate Papers from Scholarly APIs
        candidates = await self._retrieve_candidate_papers(
            title=title,
            keywords=keywords,
            anchor_paper=anchor_data,
            limit=request.max_candidates,
        )

        # 5. Hybrid Scoring Layer: CBF + CF
        ranked_candidates = await self.hybrid_ranker.rank_candidates(
            idea_text=idea_text,
            idea_vector=idea_vector,
            candidate_papers=candidates,
            anchor_paper=anchor_data,
        )

        # 6. Model 3: Novelty Scoring & Gap Detection
        prediction = self.predictor.predict(
            title=title,
            abstract=abstract,
            features=features_dict,
            top_candidates=ranked_candidates,
            keywords=keywords,
            domains=domains,
            methodologies=methodologies,
        )

        candidate_objs = [
            CandidateScoredPaper(
                paper_id=c["paper_id"],
                title=c["title"],
                year=c.get("year"),
                citation_count=c.get("citation_count", 0),
                authors=c.get("authors", []),
                url=c.get("url", ""),
                abstract=c.get("abstract", ""),
                cbf_score=c["cbf_score"],
                cf_score=c["cf_score"],
                hybrid_score=c["hybrid_score"],
                similarity_percentage=c["similarity_percentage"],
            )
            for c in ranked_candidates[: request.max_candidates]
        ]

        return NoveltyPredictResponse(
            overall_novelty_score=prediction["overall_novelty_score"],
            overall_implemented_score=prediction["overall_implemented_score"],
            verdict=prediction["verdict"],
            verdict_description=prediction["verdict_description"],
            dimensional_scores=prediction["dimensional_scores"],
            anchor_paper=anchor_info,
            cf_branch_used=cf_branch_used,
            top_candidates=candidate_objs,
            feature_comparisons=prediction["feature_comparisons"],
            gaps_and_recommendations=prediction["gaps_and_recommendations"],
            model_version=self.predictor.version,
        )

    async def _retrieve_candidate_papers(
        self,
        title: str,
        keywords: List[str],
        anchor_paper: Optional[Dict[str, Any]],
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Gathers candidates from Semantic Scholar, OpenAlex, and arXiv."""
        results: List[Dict[str, Any]] = []
        query = f"{title} {' '.join(keywords[:2])}".strip()

        # 1. Search Semantic Scholar
        try:
            scholar_res = await self.scholar_provider.search(query, limit=limit)
            results.extend(scholar_res)
        except Exception as e:
            logger.warning(f"Scholar search failed: {e}")

        # 2. Search arXiv
        if len(results) < limit:
            try:
                arxiv_res = await self.arxiv_provider.search(query, limit=limit)
                results.extend(arxiv_res)
            except Exception as e:
                logger.warning(f"arXiv search failed: {e}")

        # 3. Search OpenAlex (reliable, high-throughput, no 429 rate limit)
        if len(results) < limit:
            try:
                openalex_res = await self.openalex_provider.search(query, limit=limit)
                results.extend(openalex_res)
            except Exception as e:
                logger.warning(f"OpenAlex search failed: {e}")

        # If anchor paper is not in results, prepend it
        if anchor_paper and anchor_paper.get("status") == "found":
            anchor_id = anchor_paper.get("paper_id")
            if not any(r.get("external_id") == anchor_id for r in results):
                results.insert(0, {
                    "external_id": anchor_id,
                    "title": anchor_paper.get("title", ""),
                    "description": anchor_paper.get("abstract", ""),
                    "stars": anchor_paper.get("citation_count", 0),
                    "url": anchor_paper.get("url", ""),
                    "metadata": {"year": anchor_paper.get("year", 2023)},
                    "authors": [],
                })

        # Deduplicate by title
        seen_titles = set()
        unique = []
        for r in results:
            t = "".join(filter(str.isalnum, (r.get("title") or "").lower()))
            if t and t not in seen_titles:
                seen_titles.add(t)
                unique.append(r)

        return unique[:limit]

    def _extract_keywords(self, text: str) -> List[str]:
        words = [w.strip(".,;:\"'()") for w in text.split() if len(w) > 4]
        # Basic frequency extraction
        freq: Dict[str, int] = {}
        for w in words:
            wl = w.lower()
            freq[wl] = freq.get(wl, 0) + 1
        sorted_kws = sorted(freq.keys(), key=lambda k: freq[k], reverse=True)
        return sorted_kws[:6]

    def _extract_methods(self, text: str) -> List[str]:
        known_methods = [
            "LSTM", "BiLSTM", "Random Forest", "GBR", "LightGBM", "XGBoost", "CatBoost",
            "Transformer", "BERT", "Attention", "Graph Neural Network", "GNN", "CNN", "ResNet",
            "Autoencoder", "RL", "Reinforcement Learning", "Diffusion", "LoRA", "RAG"
        ]
        found = [m for m in known_methods if m.lower() in text.lower()]
        return found
