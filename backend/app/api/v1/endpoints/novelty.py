"""
Novelty Predictor Endpoints.
Grounded on:
"A Hybrid Personalized Scientific Paper Recommendation Approach Integrating Public Contextual Metadata"
(Sakib et al., IEEE Access, 2021)
"""

from fastapi import APIRouter, Depends, HTTPException
from app.schemas.novelty import NoveltyPredictRequest, NoveltyPredictResponse
from app.services.novelty_service import NoveltyService

router = APIRouter()


@router.post("/predict", response_model=NoveltyPredictResponse)
async def predict_novelty(
    request: NoveltyPredictRequest,
    novelty_svc: NoveltyService = Depends(NoveltyService),
):
    """
    Predict novelty, overlap, and literature gaps for a student's idea or document:
    1. Model 1: Extraction of keywords and methods
    2. Embedding Layer: Vector encoding via bge-small-en-v1.5
    3. Step 0: Anchor Bootstrapping (finding closest published paper)
    4. CF Branch: 2-level citation co-occurrence & Jaccard similarity (Sakib et al., 2021)
    5. CBF Branch: Cosine semantic similarity across candidates
    6. Hybrid Scoring: Fused (CBF + CF) / 2 ranking
    7. Model 3: Novelty Scoring, Dimensional Breakdown & Gap Analysis
    """
    try:
        response = await novelty_svc.predict_novelty(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Novelty prediction failed: {str(e)}")


@router.get("/info")
async def get_model_info():
    """Returns metadata about the Novelty Predictor architecture and algorithm."""
    return {
        "model_name": "Anchor-Bootstrapped Hybrid Citation & Metadata Novelty Predictor",
        "version": "sakib-hybrid-v1.0",
        "base_paper": "A Hybrid Personalized Scientific Paper Recommendation Approach Integrating Public Contextual Metadata (Sakib et al., IEEE Access, 2021)",
        "embedding_layer": "bge-small-en-v1.5 / SentenceTransformers",
        "cf_branch": "Algorithm 1 (2-level co-occurrence matrix & Jaccard citation similarity)",
        "cbf_branch": "Cosine similarity in latent semantic space",
        "hybrid_formula": "hybrid_score = (CBF_score + CF_score) / 2 (with CBF fallback)",
        "model_3_novelty": "Multi-dimensional (Problem, Methodological, Implementation) with feature-level greenfield classification",
    }
