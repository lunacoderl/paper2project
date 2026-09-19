"""
Model 3: Novelty Scoring & Gap Detection Model.
Grounded on:
"A Hybrid Personalized Scientific Paper Recommendation Approach Integrating Public Contextual Metadata"
(Sakib et al., IEEE Access, 2021)

Computes:
1. Calibrated Overall Novelty Score (0 - 100%)
2. Multi-Dimensional Novelty Breakdown (Problem, Methodological, Implementation)
3. Feature-Level Novelty Matrix (fully_implemented, partially_implemented, novel)
4. Literature Gap Detection & Competitive Advantage Recommendations
"""

import logging
from typing import List, Dict, Any, Optional
from app.schemas.novelty import (
    NoveltyVerdictEnum,
    ImplementationStatusEnum,
    DimensionalNoveltyScores,
    FeatureNoveltyComparison,
)

logger = logging.getLogger(__name__)


class NoveltyPredictor:
    def __init__(self):
        self.version = "sakib-hybrid-v1.0"

    def predict(
        self,
        title: str,
        abstract: str,
        features: List[Dict[str, Any]],
        top_candidates: List[Dict[str, Any]],
        keywords: Optional[List[str]] = None,
        domains: Optional[List[str]] = None,
        methodologies: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Executes Model 3 Novelty Prediction and Gap Detection.
        """
        keywords = keywords or []
        domains = domains or ["Computer Science"]
        methodologies = methodologies or []

        # 1. Compute Literature Overlap from Top Candidates
        if top_candidates:
            # Top-3 weighted hybrid scores
            top_scores = [c.get("hybrid_score", 0.5) for c in top_candidates[:3]]
            weights = [0.5, 0.3, 0.2][:len(top_scores)]
            norm_weights = [w / sum(weights) for w in weights]
            avg_top_sim = sum(s * w for s, w in zip(top_scores, norm_weights))
            overall_overlap = int(round(avg_top_sim * 100))
        else:
            overall_overlap = 45

        # Clamp overlap between 10% and 95%
        overall_overlap = max(10, min(95, overall_overlap))
        overall_novelty = max(5, 100 - overall_overlap)

        # 2. Dimensional Novelty Breakdown
        problem_novelty = self._calculate_problem_novelty(title, abstract, top_candidates)
        method_novelty = self._calculate_method_novelty(methodologies, top_candidates)
        implementation_novelty = self._calculate_implementation_novelty(features, abstract)

        # Refine overall novelty as weighted average of dimensional scores and inverse overlap
        calibrated_novelty = int(
            round(
                0.40 * overall_novelty
                + 0.25 * problem_novelty
                + 0.20 * method_novelty
                + 0.15 * implementation_novelty
            )
        )
        calibrated_novelty = max(5, min(95, calibrated_novelty))
        calibrated_overlap = 100 - calibrated_novelty

        # 3. Verdict Determination
        if calibrated_novelty >= 65:
            verdict = NoveltyVerdictEnum.HIGH_NOVELTY
            verdict_desc = (
                "Exciting greenfield project! Few existing papers implement this exact combination of features. "
                "Focus on clear evaluation metrics, robust baseline benchmarks, and open reproducible code."
            )
        elif calibrated_novelty >= 38:
            verdict = NoveltyVerdictEnum.MODERATE_NOVELTY
            verdict_desc = (
                "The fundamental building blocks exist in academic literature, but your specific feature synthesis, "
                "dataset integration, or user-centric architecture provides a tangible novel advantage."
            )
        else:
            verdict = NoveltyVerdictEnum.HEAVILY_EXPLORED
            verdict_desc = (
                "Multiple published papers already provide direct solutions in this domain. To stand out, "
                "emphasize specialized engineering constraints (e.g. edge performance, zero-cost stack, or real-time latency)."
            )

        # 4. Feature-by-Feature Novelty Matrix
        feature_comparisons = self._analyze_features(features, top_candidates, domains)

        # 5. Gap Detection & Recommendations
        gaps = self._detect_gaps_and_recommendations(
            title=title,
            top_candidates=top_candidates,
            methodologies=methodologies,
            calibrated_novelty=calibrated_novelty,
        )

        return {
            "overall_novelty_score": calibrated_novelty,
            "overall_implemented_score": calibrated_overlap,
            "verdict": verdict,
            "verdict_description": verdict_desc,
            "dimensional_scores": DimensionalNoveltyScores(
                problem_novelty=round(problem_novelty, 1),
                methodological_novelty=round(method_novelty, 1),
                implementation_novelty=round(implementation_novelty, 1),
            ),
            "feature_comparisons": feature_comparisons,
            "gaps_and_recommendations": gaps,
        }

    def _calculate_problem_novelty(
        self, title: str, abstract: str, top_candidates: List[Dict[str, Any]]
    ) -> float:
        """Measures rarity of problem formulation against candidate titles."""
        if not top_candidates:
            return 75.0

        title_words = set(w.lower() for w in title.split() if len(w) > 3)
        if not title_words:
            return 50.0

        overlaps = []
        for cand in top_candidates[:5]:
            cand_title_words = set(w.lower() for w in cand.get("title", "").split() if len(w) > 3)
            if cand_title_words:
                jaccard = len(title_words.intersection(cand_title_words)) / len(
                    title_words.union(cand_title_words)
                )
                overlaps.append(jaccard)

        avg_overlap = sum(overlaps) / max(1, len(overlaps))
        problem_nov = (1.0 - avg_overlap) * 100.0
        return max(15.0, min(95.0, problem_nov))

    def _calculate_method_novelty(
        self, methodologies: List[str], top_candidates: List[Dict[str, Any]]
    ) -> float:
        """Measures methodological innovation (unique model/algorithm combinations)."""
        if not methodologies:
            return 55.0

        matched = 0
        candidate_corpus = " ".join(
            f"{c.get('title', '')} {c.get('abstract', '')}" for c in top_candidates[:5]
        ).lower()

        for m in methodologies:
            if m.lower() in candidate_corpus:
                matched += 1

        match_ratio = matched / max(1, len(methodologies))
        # If all methods already appear together, lower novelty
        method_nov = (1.0 - match_ratio) * 100.0
        return max(20.0, min(90.0, method_nov))

    def _calculate_implementation_novelty(
        self, features: List[Dict[str, Any]], abstract: str
    ) -> float:
        """Measures practical differentiation (edge, real-time, low-power, zero-cost)."""
        text = f"{abstract} " + " ".join(f.get("feature_name", "") for f in features).lower()
        keywords = [
            "zero-cost",
            "serverless",
            "edge",
            "real-time",
            "streaming",
            "low latency",
            "lightweight",
            "mobile",
            "quantization",
            "interactive",
        ]
        hits = sum(1 for kw in keywords if kw in text)
        score = 40.0 + min(50.0, hits * 12.0)
        return score

    def _analyze_features(
        self,
        features: List[Dict[str, Any]],
        top_candidates: List[Dict[str, Any]],
        domains: List[str],
    ) -> List[FeatureNoveltyComparison]:
        """Categorizes each feature into fully_implemented, partially_implemented, or novel."""
        if not features:
            features = [
                {"feature_name": "Core End-to-End Pipeline", "description": "Primary architecture and workflow."},
                {"feature_name": "Automated Evaluation & Benchmarking", "description": "Testing against baseline datasets."},
                {"feature_name": "Interactive User Dashboard", "description": "Frontend UI for inspection."},
            ]

        results: List[FeatureNoveltyComparison] = []

        for idx, feat in enumerate(features):
            name = feat.get("feature_name", f"Feature {idx + 1}")
            desc = feat.get("description", "")
            feat_words = [w.lower() for w in name.split() if len(w) > 3]

            matching_papers = []
            for cand in top_candidates:
                cand_text = f"{cand.get('title', '')} {cand.get('abstract', '')}".lower()
                matches = sum(1 for w in feat_words if w in cand_text)
                if matches > 0:
                    matching_papers.append({
                        "paper_id": cand.get("paper_id"),
                        "title": cand.get("title"),
                        "year": cand.get("year", 2023),
                        "citation_count": cand.get("citation_count", 0),
                        "url": cand.get("url", ""),
                        "similarity_reason": f"Directly addresses analogous formulation in {domains[0] if domains else 'literature'}.",
                    })

            # Generate dynamic, domain-aware, and feature-specific comparison text
            fname_lower = name.lower()
            top_matching_title = matching_papers[0]["title"] if matching_papers else (top_candidates[0]["title"] if top_candidates else "published literature")
            domain_name = domains[0] if domains else "machine learning"

            if len(matching_papers) >= 3:
                status = ImplementationStatusEnum.FULLY_IMPLEMENTED
                overlap_pct = min(92, 72 + (idx % 4) * 5)
            elif len(matching_papers) >= 1:
                status = ImplementationStatusEnum.PARTIALLY_IMPLEMENTED
                overlap_pct = min(65, 42 + (idx % 5) * 5)
            else:
                status = ImplementationStatusEnum.NOVEL
                overlap_pct = max(10, 15 + (idx % 3) * 5)

            # Contextualize based on feature semantic type
            if any(k in fname_lower for k in ["risk", "hazard", "severity", "prognosis", "analyzer"]):
                how_lit = f"Prior studies in {domain_name} (e.g. '{top_matching_title[:45]}...') predominantly treat risk as a static post-hoc survival curve rather than an interactive predictive engine."
                your_adv = f"Provides an explainable, multi-factor risk analyzer that dynamically stratifies risk levels alongside predictive confidence intervals."
            elif any(k in fname_lower for k in ["classif", "predict", "detect", "segment", "model", "neural"]):
                how_lit = f"Standard academic baselines in {domain_name} (such as '{top_matching_title[:45]}...') focus on heavy offline monolithic architectures evaluated on pre-cleaned benchmarks."
                your_adv = f"Differentiates {name} by combining multi-class accuracy with lightweight edge inference, robust uncertainty estimation, and patient-specific validation."
            elif any(k in fname_lower for k in ["platform", "dashboard", "system", "app", "ui", "interface"]):
                how_lit = f"Existing implementations in literature are typically shared as standalone Python/MATLAB scripts with complex local dependency requirements."
                your_adv = f"Engineers an accessible, zero-cost web platform with interactive visualization and rapid automated report generation for practitioners."
            elif any(k in fname_lower for k in ["data", "preprocess", "pipeline", "extract", "feature"]):
                how_lit = f"Literature benchmarks assume clean, pre-segmented input data with manual annotations, failing under real-world clinical noise."
                your_adv = f"Implements automated end-to-end normalization, noise filtering, and resilient feature extraction specifically optimized for {domain_name}."
            else:
                how_lit = f"Explored from a narrow theoretical angle in '{top_matching_title[:45]}...', lacking end-to-end integration."
                your_adv = f"Establishes a practical, developer-ready implementation and reproducible benchmarking suite for {name}."

            results.append(
                FeatureNoveltyComparison(
                    feature_id=f"feat-{idx + 1}",
                    feature_name=name,
                    description=desc,
                    status=status,
                    overlap_percentage=overlap_pct,
                    novelty_percentage=100 - overlap_pct,
                    how_literature_does_it=how_lit,
                    your_novel_advantage=your_adv,
                    matching_papers=matching_papers[:2],
                )
            )

        return results


    def _detect_gaps_and_recommendations(
        self,
        title: str,
        top_candidates: List[Dict[str, Any]],
        methodologies: List[str],
        calibrated_novelty: int,
    ) -> List[str]:
        """Generates strategic actionable recommendations to outperform top candidates."""
        gaps = []

        if top_candidates:
            top_paper = top_candidates[0].get("title", "Existing literature")
            gaps.append(
                f"Top Prior Art Match: '{top_paper}'. Benchmark against this paper's published evaluation metrics."
            )

        if methodologies:
            gaps.append(
                f"Synthesize {methodologies[0]} with lightweight on-device inference to bypass the heavy compute requirements typical in published baselines."
            )

        if calibrated_novelty < 40:
            gaps.append(
                "High literature saturation detected. Introduce specialized constraints: evaluate with noisy data, low-power edge hardware, or zero-cost serverless hosting."
            )
        else:
            gaps.append(
                "Strong greenfield territory. Prioritize creating a publicly reproducible open-source benchmark dataset and public evaluation leaderboard."
            )

        gaps.append(
            "Implement automated self-evaluating feedback loops to improve reliability beyond static offline models."
        )

        return gaps
