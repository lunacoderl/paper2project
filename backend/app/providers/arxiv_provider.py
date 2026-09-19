"""arXiv search provider."""

import logging
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
import httpx

from app.providers.base import BaseSearchProvider

logger = logging.getLogger(__name__)


class ArxivProvider(BaseSearchProvider):
    source_name = "arxiv"
    source_type = "paper"
    BASE_URL = "https://export.arxiv.org/api/query"

    async def search(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        params = {
            "search_query": f"all:{query}",
            "start": 0,
            "max_results": limit,
            "sortBy": "relevance",
            "sortOrder": "descending",
        }
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                return self._parse_atom(response.text)
        except Exception as e:
            logger.error(f"arXiv search failed for '{query}': {e}")
            return []

    def _parse_atom(self, xml_text: str) -> List[Dict[str, Any]]:
        ns = {
            "atom": "http://www.w3.org/2005/Atom",
            "arxiv": "http://arxiv.org/schemas/atom",
        }
        root = ET.fromstring(xml_text)
        results = []
        for entry in root.findall("atom:entry", ns):
            arxiv_id = (entry.findtext("atom:id", "", ns) or "").split("/abs/")[-1]
            title = (entry.findtext("atom:title", "", ns) or "").replace("\n", " ").strip()
            summary = (entry.findtext("atom:summary", "", ns) or "").replace("\n", " ").strip()
            authors = [
                a.findtext("atom:name", "", ns)
                for a in entry.findall("atom:author", ns)
            ]
            url = f"https://arxiv.org/abs/{arxiv_id}"

            results.append({
                "external_id": arxiv_id,
                "source": self.source_name,
                "source_type": self.source_type,
                "title": title,
                "url": url,
                "description": summary[:500],
                "authors": authors[:5],
                "technologies": [],
                "stars": None,
                "metadata": {
                    "arxiv_id": arxiv_id,
                    "published": entry.findtext("atom:published", "", ns),
                    "pdf_url": f"https://arxiv.org/pdf/{arxiv_id}",
                },
            })
        return results
