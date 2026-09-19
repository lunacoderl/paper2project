"""
End-to-end verification script for:
"A Hybrid Personalized Scientific Paper Recommendation Approach Integrating Public Contextual Metadata"
(Sakib et al., IEEE Access, 2021)
Adapted for Paper2Project Student Idea Bootstrapping & Novelty Scoring.
"""

import sys
import os
import asyncio

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.schemas.novelty import NoveltyPredictRequest, ExtractedIdeaFeature
from app.services.citation_cf_service import CitationCFService
from app.services.anchor_service import AnchorBootstrapService
from app.services.hybrid_ranker import HybridRanker
from app.models.novelty_predictor import NoveltyPredictor
from app.services.novelty_service import NoveltyService


async def test_full_pipeline():
    print("=" * 75)
    print("[RUNNING] SAKIB ET AL. (2021) HYBRID CITATION & METADATA NOVELTY PIPELINE")
    print("=" * 75)

    # 1. Test Citation CF Service (Algorithm 1) unit behavior
    cf_svc = CitationCFService()
    anchor_network = {"paper-A", "paper-B", "paper-C", "paper-D"}
    candidate_network = {"paper-C", "paper-D", "paper-E", "paper-F"}

    jaccard = cf_svc.compute_jaccard_similarity(anchor_network, candidate_network)
    print(f"\n[Algorithm 1 Test] Intersection = 2, Union = 6 -> Jaccard = {jaccard} (Expected ~0.3333)")
    assert 0.30 <= jaccard <= 0.35, f"Jaccard calculation mismatch: {jaccard}"

    # 2. Test Anchor Bootstrap Service
    anchor_svc = AnchorBootstrapService()
    anchor = await anchor_svc.find_anchor_paper(
        title="Time Series Forecasting and Modeling of Food Demand Supply Chain",
        abstract="Forecasting food orders using lag features, EWMA, Random Forest, LightGBM, and LSTM regressors.",
        keywords=["Demand Forecasting", "LSTM", "Supply Chain"],
    )
    print(f"\n[Step 0 Anchor Bootstrap] Anchor Found: '{anchor.get('title')}'")
    print(f"  - Citations: {anchor.get('citation_count')}")
    print(f"  - Anchor Status: {anchor.get('status')}")
    assert anchor is not None, "Anchor should not be None"
    assert "title" in anchor, "Anchor must have title"

    # 3. Test Hybrid Ranker (CBF + CF)
    hybrid_ranker = HybridRanker(cf_svc=cf_svc)
    mock_candidates = [
        {
            "paper_id": "paper-cand-1",
            "title": "Deep Learning for Food Supply Chain Optimization",
            "abstract": "Applying LSTM networks and regression trees to supply chains.",
            "citation_count": 35,
        },
        {
            "paper_id": "paper-cand-2",
            "title": "Quantum Computing Approaches in Chemistry",
            "abstract": "Simulating molecular bonds on quantum hardware.",
            "citation_count": 12,
        },
    ]

    ranked = await hybrid_ranker.rank_candidates(
        idea_text="Time series food demand forecasting using LSTM and boosting models.",
        idea_vector=[0.1] * 1024,
        candidate_papers=mock_candidates,
        anchor_paper=anchor,
    )
    print(f"\n[Hybrid Ranker Test] Ranked {len(ranked)} candidates:")
    for r in ranked:
        print(f"  - {r['title'][:45]}... | CBF: {r['cbf_score']} | CF: {r['cf_score']} | Hybrid: {r['hybrid_score']}")
    
    assert ranked[0]["paper_id"] == "paper-cand-1", "Domain-relevant paper should rank first"
    assert ranked[0]["hybrid_score"] >= ranked[1]["hybrid_score"], "Scores must be descending"

    # 4. Test Model 3 Novelty Predictor
    predictor = NoveltyPredictor()
    test_features = [
        {"feature_name": "Lag & EWMA Feature Engineering", "description": "10-15 week moving average"},
        {"feature_name": "Comparative Study of 7 Regressors", "description": "RF, GBR, LightGBM, XGBoost, CatBoost, LSTM, BiLSTM"},
        {"feature_name": "Zero-Cost Real-Time Edge Deployment", "description": "Serverless edge inference without GPU"},
    ]
    pred_res = predictor.predict(
        title="Time Series Forecasting and Modeling of Food Demand Supply Chain",
        abstract="Forecasting food orders using lag features, EWMA, and LSTM.",
        features=test_features,
        top_candidates=ranked,
        keywords=["Demand Forecasting", "Time Series"],
        methodologies=["LSTM", "Random Forest", "LightGBM"],
    )

    print(f"\n[Model 3 Novelty Predictor Test]")
    print(f"  - Overall Novelty Score: {pred_res['overall_novelty_score']}%")
    print(f"  - Literature Overlap: {pred_res['overall_implemented_score']}%")
    print(f"  - Verdict: {pred_res['verdict']}")
    print(f"  - Problem Novelty: {pred_res['dimensional_scores'].problem_novelty}%")
    print(f"  - Methodological Novelty: {pred_res['dimensional_scores'].methodological_novelty}%")
    print(f"  - Implementation Novelty: {pred_res['dimensional_scores'].implementation_novelty}%")
    print(f"  - Feature Classifications:")
    for fc in pred_res["feature_comparisons"]:
        print(f"      * {fc.feature_name}: {fc.status.value} (Overlap: {fc.overlap_percentage}%, Novelty: {fc.novelty_percentage}%)")

    assert 0 <= pred_res["overall_novelty_score"] <= 100, "Novelty must be 0-100"
    assert 0 <= pred_res["overall_implemented_score"] <= 100, "Overlap must be 0-100"
    assert len(pred_res["feature_comparisons"]) == 3, "All features must be analyzed"

    # 5. Full NoveltyService Orchestration Test
    print(f"\n[NoveltyService Full Pipeline Test]")
    novelty_svc = NoveltyService()
    req = NoveltyPredictRequest(
        title="Time Series Forecasting and Modeling of Food Demand Supply Chain Based on Regressors Analysis",
        abstract="Accurate demand forecasting using Random Forest, GBR, LightGBM, XGBoost, CatBoost, LSTM, and BiLSTM.",
        keywords=["Food Demand", "Forecasting", "LSTM", "Time Series"],
        domains=["Supply Chain", "Machine Learning"],
        methodologies=["LSTM", "BiLSTM", "LightGBM", "CatBoost"],
        features=[
            ExtractedIdeaFeature(feature_name="Lag & EWMA Feature Engineering"),
            ExtractedIdeaFeature(feature_name="Multi-Model Regressor Benchmark"),
            ExtractedIdeaFeature(feature_name="Serverless $0 Cost Cloud Dashboard"),
        ],
        max_candidates=5,
    )
    full_res = await novelty_svc.predict_novelty(req)
    print(f"  - Anchor Paper: {full_res.anchor_paper.title if full_res.anchor_paper else 'None'}")
    print(f"  - CF Branch Used: {full_res.cf_branch_used}")
    print(f"  - Final Novelty Score: {full_res.overall_novelty_score}%")
    print(f"  - Verdict: {full_res.verdict}")
    print(f"  - Top Ranked Candidate: {full_res.top_candidates[0].title if full_res.top_candidates else 'None'}")
    print(f"  - Literature Gaps Found: {len(full_res.gaps_and_recommendations)}")
    for g in full_res.gaps_and_recommendations[:2]:
        print(f"      * {g}")

    print("\n" + "=" * 75)
    print("[SUCCESS] ALL PIPELINE TESTS PASSED SUCCESSFULLY!")
    print("=" * 75)


if __name__ == "__main__":
    asyncio.run(test_full_pipeline())
