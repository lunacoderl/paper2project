"""
Hybrid Scoring & Candidate Ranking Service.
Fuses:
1. CBF Branch (Content-Based Filtering cosine similarity)
2. CF Branch (Citation Collaborative Filtering Jaccard similarity)
Formula:
  hybrid_score = (CBF_score + CF_score) / 2  (if anchor found)
  hybrid_score = CBF_score                    (fallback if no anchor)
"""

import logging
from typing import List, Dict, Any, Optional
from app.services.embedding_service import EmbeddingService
from app.services.citation_cf_service import CitationCFService

logger = logging.getLogger(__name__)


class HybridRanker:
    def __init__(
        self,
        embedding_svc: Optional[EmbeddingService] = None,
        cf_svc: Optional[CitationCFService] = None,
    ):
        self.embedding_svc = embedding_svc or EmbeddingService()
        self.cf_svc = cf_svc or CitationCFService()

    async def rank_candidates(
        self,
        idea_text: str,
        idea_vector: List[float],
        candidate_papers: List[Dict[str, Any]],
        anchor_paper: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Computes CBF scores, CF scores, and hybrid fusion scores for all candidates.
        """
        if not candidate_papers:
            return []

        # 1. CBF Branch: Compute Content-Based cosine similarity
        cbf_scores: Dict[str, float] = {}
        candidate_texts = [
            f"{c.get('title', '')}. {c.get('description', '') or c.get('abstract', '')}"
            for c in candidate_papers
        ]

        try:
            cand_vectors = await self.embedding_svc.embed_batch(candidate_texts)
        except Exception as e:
            logger.warning(f"Batch embedding failed, using local similarity: {e}")
            cand_vectors = []

        for idx, cand in enumerate(candidate_papers):
            cid = cand.get("paper_id") or cand.get("external_id") or str(idx)
            if cand_vectors and idx < len(cand_vectors) and cand_vectors[idx] and idea_vector:
                cos_sim = await self.embedding_svc.similarity(idea_vector, cand_vectors[idx])
                # Normalize from [-1, 1] to [0, 1]
                normalized_sim = max(0.0, min(1.0, (cos_sim + 1.0) / 2.0))
            else:
                normalized_sim = self._fallback_text_similarity(idea_text, candidate_texts[idx])
            cbf_scores[cid] = round(float(normalized_sim), 4)

        # 2. CF Branch: Compute Citation Jaccard similarity (if anchor exists)
        has_anchor = bool(
            anchor_paper
            and anchor_paper.get("status") == "found"
            and anchor_paper.get("paper_id")
        )

        cf_scores: Dict[str, float] = {}
        if has_anchor:
            try:
                cf_scores = await self.cf_svc.compute_cf_scores_for_candidates(
                    anchor_paper_id=anchor_paper["paper_id"],
                    candidate_papers=candidate_papers,
                    anchor_citation_count=anchor_paper.get("citation_count", 0),
                )
            except Exception as e:
                logger.warning(f"CF calculation failed: {e}")
                has_anchor = False

        # 3. Hybrid Scoring Layer
        scored_candidates: List[Dict[str, Any]] = []

        for cand in candidate_papers:
            cid = cand.get("paper_id") or cand.get("external_id") or ""
            cbf = cbf_scores.get(cid, 0.5)

            if has_anchor and cid in cf_scores:
                cf = cf_scores[cid]
                # Formula: hybrid_score = (CBF_score + CF_score) / 2
                hybrid = (cbf + cf) / 2.0
            else:
                cf = 0.0
                hybrid = cbf

            similarity_pct = int(round(hybrid * 100))

            scored_candidates.append({
                "paper_id": cid,
                "title": cand.get("title", "Untitled Research Paper"),
                "year": cand.get("year") or cand.get("metadata", {}).get("year"),
                "citation_count": cand.get("citation_count") or cand.get("stars") or 0,
                "authors": cand.get("authors", []),
                "url": cand.get("url", ""),
                "abstract": cand.get("description") or cand.get("abstract") or "",
                "cbf_score": round(cbf, 4),
                "cf_score": round(cf, 4),
                "hybrid_score": round(hybrid, 4),
                "similarity_percentage": similarity_pct,
            })

        # Sort descending by hybrid_score
        scored_candidates.sort(key=lambda x: x["hybrid_score"], reverse=True)
        return scored_candidates

    def _fallback_text_similarity(self, text_a: str, text_b: str) -> float:
        words_a = set(w.lower() for w in text_a.split() if len(w) > 3)
        words_b = set(w.lower() for w in text_b.split() if len(w) > 3)
        if not words_a or not words_b:
            return 0.35
        inter = len(words_a.intersection(words_b))
        union = len(words_a.union(words_b))
        return inter / max(1, union)
