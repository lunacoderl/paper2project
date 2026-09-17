"""GitHub search provider."""

import logging
from typing import List, Dict, Any
import httpx

from app.core.config import settings
from app.providers.base import BaseSearchProvider

logger = logging.getLogger(__name__)


class GitHubProvider(BaseSearchProvider):
    source_name = "github"
    source_type = "repository"

    BASE_URL = "https://api.github.com/search/repositories"

    def __init__(self):
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        if settings.GITHUB_TOKEN:
            self.headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"

    async def search(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        params = {
            "q": query,
            "sort": "stars",
            "order": "desc",
            "per_page": min(limit, 30),
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(self.BASE_URL, headers=self.headers, params=params)
                response.raise_for_status()
                data = response.json()
                return [self.normalize(item) for item in data.get("items", [])]
        except Exception as e:
            logger.error(f"GitHub search failed for '{query}': {e}")
            return []

    def normalize(self, raw: Dict) -> Dict[str, Any]:
        # Detect technologies from topics and language
        techs = list(filter(None, raw.get("topics", [])))
        if raw.get("language"):
            techs.insert(0, raw["language"])

        return {
            "external_id": str(raw.get("id", "")),
            "source": self.source_name,
            "source_type": self.source_type,
            "title": raw.get("full_name", raw.get("name", "")),
            "url": raw.get("html_url", ""),
            "description": raw.get("description", "") or "",
            "authors": [raw.get("owner", {}).get("login", "")],
            "technologies": techs[:10],
            "stars": raw.get("stargazers_count", 0),
            "metadata": {
                "forks": raw.get("forks_count", 0),
                "language": raw.get("language", ""),
                "topics": raw.get("topics", []),
                "updated_at": raw.get("updated_at", ""),
                "license": raw.get("license", {}).get("name", "") if raw.get("license") else "",
            },
        }
