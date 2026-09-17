"""
Supabase database client (singleton pattern).
"""

import logging
from functools import lru_cache

from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """Return a cached Supabase client using service role key for server-side ops."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment."
        )

    client = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY,
    )
    logger.info("Supabase client initialized")
    return client


def get_db() -> Client:
    """FastAPI dependency for Supabase client."""
    return get_supabase_client()
