"""
Base search provider — all sources implement this interface.
Ensures normalized output format across GitHub, arXiv, OpenAlex, etc.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseSearchProvider(ABC):
    """Every search source must implement this interface."""

    source_name: str = ""
    source_type: str = ""  # repository / paper / dataset

    @abstractmethod
    async def search(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search and return normalized results."""
        pass

    def normalize(self, raw: Dict) -> Dict[str, Any]:
        """Convert raw API response to standard format."""
        return {
            "external_id": "",
            "source": self.source_name,
            "source_type": self.source_type,
            "title": "",
            "url": "",
            "description": "",
            "authors": [],
            "technologies": [],
            "stars": None,
            "metadata": {},
        }
