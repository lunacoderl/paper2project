"""
Unit and integration tests for Novelty Predictor & Hybrid CF/CBF recommendation.
"""

import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.citation_cf_service import CitationCFService
from app.models.novelty_predictor import NoveltyPredictor
from app.schemas.novelty import NoveltyVerdictEnum, ImplementationStatusEnum


def test_jaccard_similarity_calculation():
    cf_svc = CitationCFService()
    
    # Identical sets
    set_a = {"p1", "p2", "p3"}
    set_b = {"p1", "p2", "p3"}
    assert cf_svc.compute_jaccard_similarity(set_a, set_b) == 1.0

    # Disjoint sets
    set_c = {"p4", "p5"}
    assert cf_svc.compute_jaccard_similarity(set_a, set_c) == 0.0

    # Partial overlap (1 in common, 4 total unique) -> 0.25
    set_d = {"p3", "p4"}
    assert cf_svc.compute_jaccard_similarity(set_a, set_d) == 0.25


def test_novelty_predictor_score_bounds():
    predictor = NoveltyPredictor()
    features = [
        {"feature_name": "Novel Feature A", "description": "Test desc A"},
        {"feature_name": "Existing Baseline B", "description": "Test desc B"},
    ]
    candidates = [
        {"title": "Prior Art 1", "abstract": "Existing Baseline B", "hybrid_score": 0.85},
        {"title": "Prior Art 2", "abstract": "General work", "hybrid_score": 0.40},
    ]

    res = predictor.predict(
        title="Novel Architecture Concept",
        abstract="A new method combining feature A with baseline B.",
        features=features,
        top_candidates=candidates,
    )

    assert 0 <= res["overall_novelty_score"] <= 100
    assert 0 <= res["overall_implemented_score"] <= 100
    assert res["overall_novelty_score"] + res["overall_implemented_score"] == 100
    assert isinstance(res["verdict"], NoveltyVerdictEnum)
    assert 0 <= res["dimensional_scores"].problem_novelty <= 100
    assert 0 <= res["dimensional_scores"].methodological_novelty <= 100
    assert 0 <= res["dimensional_scores"].implementation_novelty <= 100
    assert len(res["feature_comparisons"]) == 2


def test_feature_classification_states():
    predictor = NoveltyPredictor()
    features = [
        {"feature_name": "Standard Centralized Deep Neural Network", "description": ""},
        {"feature_name": "Quantum Zero-Latency Hyper-Graph Synthesis", "description": ""},
    ]
    candidates = [
        {"title": "Standard Centralized Deep Neural Network Study", "abstract": "Standard Centralized Deep Neural Network", "hybrid_score": 0.9},
        {"title": "Deep Neural Network Benchmarking", "abstract": "Centralized Deep Neural Network", "hybrid_score": 0.8},
        {"title": "Analysis of Deep Neural Networks", "abstract": "Standard Deep Neural Network", "hybrid_score": 0.85},
    ]

    res = predictor.predict(
        title="AI Comparison",
        abstract="A study comparing neural network and quantum hyper-graphs.",
        features=features,
        top_candidates=candidates,
    )

    feature_map = {f.feature_name: f for f in res["feature_comparisons"]}
    assert feature_map["Standard Centralized Deep Neural Network"].status == ImplementationStatusEnum.FULLY_IMPLEMENTED
    assert feature_map["Quantum Zero-Latency Hyper-Graph Synthesis"].status == ImplementationStatusEnum.NOVEL


if __name__ == "__main__":
    print("[TEST] Running unit tests for Novelty Predictor & Citation CF...")
    test_jaccard_similarity_calculation()
    print("  [PASS] Jaccard similarity calculation")
    test_novelty_predictor_score_bounds()
    print("  [PASS] Novelty predictor score bounds")
    test_feature_classification_states()
    print("  [PASS] Feature classification states")
    print("[SUCCESS] ALL UNIT TESTS PASSED!")
