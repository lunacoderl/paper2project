"""
Test FastAPI endpoints for Novelty Predictor using TestClient.
"""

import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.api.v1.endpoints.novelty import router as novelty_router

app = FastAPI()
app.include_router(novelty_router, prefix="/api/v1/novelty")

client = TestClient(app)


def test_novelty_info_endpoint():
    response = client.get("/api/v1/novelty/info")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "sakib-hybrid" in data["version"]
    assert "Sakib et al." in data["base_paper"]
    print("  [PASS] GET /api/v1/novelty/info")


def test_novelty_predict_endpoint():
    payload = {
        "title": "A Hybrid Personalized Scientific Paper Recommendation Approach",
        "abstract": "Integrating public contextual metadata with 2-level citation relations and collaborative filtering.",
        "keywords": ["Paper Recommendation", "Collaborative Filtering", "Metadata"],
        "methodologies": ["Jaccard Similarity", "Cosine Similarity", "Co-citation"],
        "features": [
            {"feature_name": "2-Level Citation Graph", "description": "Citations and references"},
            {"feature_name": "Jaccard CF Similarity", "description": "Co-occurrence scoring"},
            {"feature_name": "Zero-Cost Streaming Cloud API", "description": "Edge deployment"},
        ],
        "max_candidates": 5,
    }

    response = client.post("/api/v1/novelty/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "overall_novelty_score" in data
    assert "overall_implemented_score" in data
    assert 0 <= data["overall_novelty_score"] <= 100
    assert "verdict" in data
    assert "dimensional_scores" in data
    assert "feature_comparisons" in data
    assert len(data["feature_comparisons"]) == 3
    print("  [PASS] POST /api/v1/novelty/predict")
    print(f"         Novelty: {data['overall_novelty_score']}%, Verdict: {data['verdict']}")


if __name__ == "__main__":
    print("[TEST] Testing FastAPI Novelty Endpoints...")
    test_novelty_info_endpoint()
    test_novelty_predict_endpoint()
    print("[SUCCESS] ALL API ENDPOINT TESTS PASSED!")
