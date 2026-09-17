"""OpenAlex + SemanticScholar providers."""

import logging
from typing import List, Dict, Any
import httpx

from app.providers.base import BaseSearchProvider

logger = logging.getLogger(__name__)


class OpenAlexProvider(BaseSearchProvider):
    source_name = "openalex"
    source_type = "paper"
    BASE_URL = "https://api.openalex.org/works"

    async def search(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        params = {
            "search": query,
            "per-page": limit,
            "select": "id,title,abstract_inverted_index,authorships,primary_location,publication_year,cited_by_count,concepts",
            "mailto": "paper2project@dev.com",
        }
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
                return [self.normalize(item) for item in data.get("results", [])]
        except Exception as e:
            logger.error(f"OpenAlex search failed for '{query}': {e}")
            return []

    def normalize(self, raw: Dict) -> Dict[str, Any]:
        # Reconstruct abstract from inverted index
        abstract = ""
        inv = raw.get("abstract_inverted_index") or {}
        if inv:
            word_positions = [(word, pos) for word, positions in inv.items() for pos in positions]
            word_positions.sort(key=lambda x: x[1])
            abstract = " ".join(w for w, _ in word_positions)

        authors = [
            a.get("author", {}).get("display_name", "")
            for a in raw.get("authorships", [])[:5]
        ]
        concepts = [c.get("display_name", "") for c in raw.get("concepts", [])[:8]]
        url = raw.get("primary_location", {}).get("landing_page_url", "") or f"https://openalex.org/{raw.get('id','')}"

        return {
            "external_id": raw.get("id", ""),
            "source": self.source_name,
            "source_type": self.source_type,
            "title": raw.get("title", ""),
            "url": url,
            "description": abstract[:600],
            "authors": authors,
            "technologies": concepts,
            "stars": raw.get("cited_by_count", 0),
            "metadata": {
                "year": raw.get("publication_year"),
                "cited_by_count": raw.get("cited_by_count", 0),
                "concepts": concepts,
            },
        }


class SemanticScholarProvider(BaseSearchProvider):
    source_name = "semantic_scholar"
    source_type = "paper"
    BASE_URL = "https://api.semanticscholar.org/graph/v1/paper/search"

    async def search(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        params = {
            "query": query,
            "limit": limit,
            "fields": "title,abstract,authors,year,citationCount,externalIds,url",
        }
        headers = {}
        from app.core.config import settings
        if settings.SEMANTIC_SCHOLAR_API_KEY:
            headers["x-api-key"] = settings.SEMANTIC_SCHOLAR_API_KEY

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(self.BASE_URL, params=params, headers=headers)
                response.raise_for_status()
                data = response.json()
                return [self.normalize(item) for item in data.get("data", [])]
        except Exception as e:
            logger.error(f"SemanticScholar search failed: {e}")
            return []

    def normalize(self, raw: Dict) -> Dict[str, Any]:
        authors = [a.get("name", "") for a in raw.get("authors", [])[:5]]
        paper_id = raw.get("paperId", "")
        url = f"https://www.semanticscholar.org/paper/{paper_id}"

        return {
            "external_id": paper_id,
            "source": self.source_name,
            "source_type": self.source_type,
            "title": raw.get("title", ""),
            "url": url,
            "description": (raw.get("abstract") or "")[:600],
            "authors": authors,
            "technologies": [],
            "stars": raw.get("citationCount", 0),
            "metadata": {
                "year": raw.get("year"),
                "citation_count": raw.get("citationCount", 0),
            },
        }


class PapersWithCodeProvider(BaseSearchProvider):
    source_name = "papers_with_code"
    source_type = "paper"
    BASE_URL = "https://paperswithcode.com/api/v1/papers/"

    async def search(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        params = {"q": query, "items_per_page": limit}
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
                return [self.normalize(item) for item in data.get("results", [])]
        except Exception as e:
            logger.error(f"PapersWithCode search failed: {e}")
            return []

    def normalize(self, raw: Dict) -> Dict[str, Any]:
        return {
            "external_id": raw.get("id", ""),
            "source": self.source_name,
            "source_type": self.source_type,
            "title": raw.get("title", ""),
            "url": raw.get("url_pdf", f"https://paperswithcode.com/paper/{raw.get('id','')}"),
            "description": (raw.get("abstract") or "")[:600],
            "authors": raw.get("authors", [])[:5],
            "technologies": raw.get("methods", [])[:8],
            "stars": raw.get("stars", 0),
            "metadata": {
                "github_url": raw.get("repository_url", ""),
                "published": raw.get("published", ""),
            },
        }
