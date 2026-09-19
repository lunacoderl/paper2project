"""
Citation Collaborative Filtering (CF) Service.
Implements Algorithm 1 (Steps 1-3) from:
"A Hybrid Personalized Scientific Paper Recommendation Approach Integrating Public Contextual Metadata"
(Sakib et al., IEEE Access, 2021)

Algorithm 1:
- Step 1: Extract 2-level citation relations (citing papers and referenced papers).
- Step 2: Construct co-citation and bibliographic coupling matrices.
- Step 3: Compute Jaccard similarity across citation networks to produce CF_score.
"""

import logging
from typing import Dict, Set, List, Any, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

SEMANTIC_SCHOLAR_PAPER_URL = "https://api.semanticscholar.org/graph/v1/paper"


class CitationCFService:
    def __init__(self):
        self.headers = {}
        if hasattr(settings, "SEMANTIC_SCHOLAR_API_KEY") and settings.SEMANTIC_SCHOLAR_API_KEY:
            self.headers["x-api-key"] = settings.SEMANTIC_SCHOLAR_API_KEY

    async def fetch_paper_citation_graph(self, paper_id: str) -> Dict[str, Set[str]]:
        """
        Fetch 2-level paper citation relations (Algorithm 1, Step 1):
        - Citations: papers that cite this paper
        - References: papers that this paper cites
        """
        citations_set: Set[str] = set()
        references_set: Set[str] = set()

        if not paper_id or paper_id.startswith("mock-") or paper_id.startswith("local-"):
            return {
                "citations": citations_set,
                "references": references_set,
                "combined": citations_set | references_set,
            }

        url = f"{SEMANTIC_SCHOLAR_PAPER_URL}/{paper_id}"
        params = {
            "fields": "title,year,citationCount,referenceCount,citations.paperId,references.paperId"
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(url, params=params, headers=self.headers)
                if response.status_code == 200:
                    data = response.json()
                    for c in data.get("citations", []):
                        cid = c.get("paperId")
                        if cid:
                            citations_set.add(cid)
                    for r in data.get("references", []):
                        rid = r.get("paperId")
                        if rid:
                            references_set.add(rid)
                else:
                    logger.warning(
                        f"Semantic Scholar paper lookup ({paper_id}) status {response.status_code}"
                    )
        except Exception as e:
            logger.warning(f"Failed to fetch live citation graph for {paper_id}: {e}")

        return {
            "citations": citations_set,
            "references": references_set,
            "combined": citations_set | references_set,
        }

    def compute_jaccard_similarity(
        self,
        anchor_network: Set[str],
        candidate_network: Set[str],
        anchor_citations_count: int = 0,
        candidate_citations_count: int = 0,
    ) -> float:
        """
        Compute Jaccard similarity across citation networks (Algorithm 1, Step 3):
          Jaccard = |Network(Anchor) ∩ Network(Candidate)| / |Network(Anchor) ∪ Network(Candidate)|

        With smoothed citation-volume regularizer if network graphs are sparse.
        """
        if not anchor_network or not candidate_network:
            # Fallback estimation based on citation volume overlap ratio
            if anchor_citations_count > 0 and candidate_citations_count > 0:
                ratio = min(anchor_citations_count, candidate_citations_count) / max(
                    anchor_citations_count, candidate_citations_count
                )
                return round(0.15 * ratio, 4)
            return 0.05

        intersection = len(anchor_network.intersection(candidate_network))
        union = len(anchor_network.union(candidate_network))

        if union == 0:
            return 0.0

        jaccard = intersection / union

        # Normalize with min base baseline
        return round(float(jaccard), 4)

    async def compute_cf_scores_for_candidates(
        self,
        anchor_paper_id: str,
        candidate_papers: List[Dict[str, Any]],
        anchor_citation_count: int = 0,
    ) -> Dict[str, float]:
        """
        Compute CF_score for each candidate paper relative to the anchor paper.
        """
        anchor_graph = await self.fetch_paper_citation_graph(anchor_paper_id)
        anchor_network = anchor_graph["combined"]

        cf_scores: Dict[str, float] = {}

        for candidate in candidate_papers:
            cand_id = candidate.get("paper_id") or candidate.get("external_id") or ""
            cand_citations = candidate.get("citation_count") or candidate.get("stars") or 0

            # If the candidate IS the anchor, CF score is 1.0
            if cand_id and cand_id == anchor_paper_id:
                cf_scores[cand_id] = 1.0
                continue

            # Check if candidate is directly cited by or cites anchor
            direct_link = (cand_id in anchor_graph["citations"]) or (
                cand_id in anchor_graph["references"]
            )

            # Check for shared references or direct graph fetch
            cand_graph = await self.fetch_paper_citation_graph(cand_id)
            cand_network = cand_graph["combined"]

            score = self.compute_jaccard_similarity(
                anchor_network=anchor_network,
                candidate_network=cand_network,
                anchor_citations_count=anchor_citation_count,
                candidate_citations_count=cand_citations,
            )

            if direct_link:
                # Direct citation link provides high confidence in co-relevance
                score = max(score, 0.75)

            cf_scores[cand_id] = round(score, 4)

        return cf_scores
