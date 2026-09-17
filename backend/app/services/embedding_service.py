"""
Embedding Service — Hugging Face Inference API for text embeddings.
Uses BAAI/bge-large-en-v1.5 via HF serverless inference.
"""

import logging
import asyncio
from typing import List, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

HF_INFERENCE_URL = "https://api-inference.huggingface.co/models"


class EmbeddingService:
    def __init__(self):
        self.model = settings.HF_EMBEDDING_MODEL
        self.api_key = settings.HUGGINGFACE_API_KEY
        self.headers = {"Authorization": f"Bearer {self.api_key}"}
        self._dim = 1024  # bge-large dimension

    async def embed_text(self, text: str) -> List[float]:
        """Embed a single text string."""
        results = await self.embed_batch([text])
        return results[0] if results else []

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embed multiple texts in one API call."""
        if not texts:
            return []

        url = f"{HF_INFERENCE_URL}/{self.model}"
        payload = {
            "inputs": texts,
            "options": {"wait_for_model": True},
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            for attempt in range(3):
                try:
                    response = await client.post(
                        url, headers=self.headers, json=payload
                    )
                    response.raise_for_status()
                    data = response.json()

                    # HF returns list of embeddings or nested list
                    if isinstance(data, list):
                        # Single text returns flat list; batch returns list of lists
                        if data and isinstance(data[0], float):
                            return [data]
                        return data

                    raise ValueError(f"Unexpected embedding response: {type(data)}")

                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 503 and attempt < 2:
                        # Model loading — wait and retry
                        wait = (attempt + 1) * 10
                        logger.warning(f"Model loading, retrying in {wait}s...")
                        await asyncio.sleep(wait)
                    else:
                        logger.error(f"Embedding API error: {e}")
                        raise
                except Exception as e:
                    if attempt < 2:
                        await asyncio.sleep(5)
                    else:
                        logger.error(f"Embedding failed after 3 attempts: {e}")
                        raise

        return []

    async def similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        """Cosine similarity between two embedding vectors."""
        if not vec_a or not vec_b:
            return 0.0
        import math

        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))

        if norm_a == 0 or norm_b == 0:
            return 0.0

        return dot / (norm_a * norm_b)

    async def embed_chunks(self, chunks: List[str]) -> List[List[float]]:
        """Embed document chunks in batches of 32."""
        BATCH_SIZE = 32
        all_embeddings = []

        for i in range(0, len(chunks), BATCH_SIZE):
            batch = chunks[i : i + BATCH_SIZE]
            embeddings = await self.embed_batch(batch)
            all_embeddings.extend(embeddings)
            if i + BATCH_SIZE < len(chunks):
                await asyncio.sleep(0.5)  # Rate limit courtesy

        return all_embeddings
