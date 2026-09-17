"""
Document Service — file validation, extraction, chunking, and storage.
Handles PDF, DOCX, TXT files + plain text inputs.
"""

import logging
import uuid
import re
from typing import Optional, List, Tuple
from fastapi import UploadFile, HTTPException, BackgroundTasks, Depends

from app.core.config import settings
from app.database.supabase import get_db
from app.services.embedding_service import EmbeddingService
from app.schemas.analysis import InputType, ProcessingStatus, DocumentInDB

logger = logging.getLogger(__name__)

# Magic bytes for file validation
MAGIC_BYTES = {
    b"%PDF": "application/pdf",
    b"PK\x03\x04": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_CHUNK_TOKENS = 512
CHUNK_OVERLAP = 64


class DocumentService:
    def __init__(
        self,
        db=Depends(get_db),
        embedding_svc: EmbeddingService = Depends(EmbeddingService),
    ):
        self.db = db
        self.embedding_svc = embedding_svc

    # ─── Validation ───────────────────────────────────────────────────────────

    def _validate_file(self, filename: str, content_type: str, file_bytes: bytes) -> InputType:
        """Validate file and return detected input type."""
        size_mb = len(file_bytes) / (1024 * 1024)
        if size_mb > settings.MAX_FILE_SIZE_MB:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE_MB}MB.",
            )

        # Magic byte validation
        mime = None
        for magic, detected_mime in MAGIC_BYTES.items():
            if file_bytes[:len(magic)] == magic:
                mime = detected_mime
                break

        if mime is None and content_type == "text/plain":
            mime = "text/plain"

        if mime not in settings.ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type. Allowed: PDF, DOCX, TXT.",
            )

        if mime == "application/pdf":
            return InputType.PDF
        elif "wordprocessingml" in mime:
            return InputType.DOCX
        else:
            return InputType.TXT

    # ─── Text Extraction ─────────────────────────────────────────────────────

    def _extract_pdf(self, file_bytes: bytes) -> str:
        """Extract text from PDF using PyMuPDF."""
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text_parts = []
            for page in doc:
                text_parts.append(page.get_text())
            return "\n\n".join(text_parts)
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise HTTPException(status_code=422, detail=f"Could not extract text from PDF: {e}")

    def _extract_docx(self, file_bytes: bytes) -> str:
        """Extract text from DOCX."""
        try:
            import io
            from docx import Document
            doc = Document(io.BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            return "\n\n".join(paragraphs)
        except Exception as e:
            logger.error(f"DOCX extraction failed: {e}")
            raise HTTPException(status_code=422, detail=f"Could not read DOCX: {e}")

    def _clean_text(self, text: str) -> str:
        """Remove noise from extracted text."""
        # Collapse excessive whitespace
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r" {2,}", " ", text)
        # Remove non-printable characters
        text = "".join(ch for ch in text if ch.isprintable() or ch in "\n\t")
        return text.strip()

    def _chunk_text(self, text: str, chunk_size: int = MAX_CHUNK_TOKENS) -> List[str]:
        """Split text into overlapping chunks by approximate token count."""
        words = text.split()
        chunks = []
        start = 0
        while start < len(words):
            end = start + chunk_size
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            start = end - CHUNK_OVERLAP
        return chunks

    # ─── Storage ─────────────────────────────────────────────────────────────

    async def _store_document(
        self,
        project_id: str,
        title: str,
        raw_text: str,
        cleaned_text: str,
        input_type: InputType,
        metadata: dict = None,
    ) -> DocumentInDB:
        """Store document record in Supabase."""
        payload = {
            "project_id": project_id,
            "title": title,
            "document_type": input_type.value,
            "raw_text": raw_text[:100_000],  # Cap storage
            "cleaned_text": cleaned_text[:100_000],
            "processing_status": ProcessingStatus.PENDING.value,
            "metadata": metadata or {},
        }
        response = self.db.table("documents").insert(payload).execute()
        return DocumentInDB(**response.data[0])

    async def _store_chunks(self, document_id: str, project_id: str, chunks: List[str]) -> None:
        """Store document chunks with embeddings."""
        embeddings = await self.embedding_svc.embed_chunks(chunks)
        records = []
        for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            records.append({
                "document_id": document_id,
                "project_id": project_id,
                "chunk_index": i,
                "content": chunk,
                "token_count": len(chunk.split()),
                "embedding": emb,
            })
        if records:
            self.db.table("document_chunks").insert(records).execute()

        # Mark document as completed
        self.db.table("documents").update(
            {"processing_status": ProcessingStatus.COMPLETED.value}
        ).eq("id", document_id).execute()

    # ─── Public API ──────────────────────────────────────────────────────────

    async def process_text(
        self,
        project_id: str,
        content: str,
        input_type: InputType = InputType.TEXT,
    ) -> DocumentInDB:
        """Process plain text input."""
        cleaned = self._clean_text(content)
        doc = await self._store_document(
            project_id=project_id,
            title="Text Input",
            raw_text=content,
            cleaned_text=cleaned,
            input_type=input_type,
        )
        chunks = self._chunk_text(cleaned)
        await self._store_chunks(doc.id, project_id, chunks)
        return doc

    async def process_file_upload(
        self,
        project_id: str,
        file: UploadFile,
        background_tasks: BackgroundTasks,
    ) -> DocumentInDB:
        """Validate, extract, chunk, and store an uploaded file."""
        file_bytes = await file.read()
        input_type = self._validate_file(
            filename=file.filename,
            content_type=file.content_type,
            file_bytes=file_bytes,
        )

        # Extract text
        if input_type == InputType.PDF:
            raw_text = self._extract_pdf(file_bytes)
        elif input_type == InputType.DOCX:
            raw_text = self._extract_docx(file_bytes)
        else:
            raw_text = file_bytes.decode("utf-8", errors="replace")

        cleaned = self._clean_text(raw_text)

        doc = await self._store_document(
            project_id=project_id,
            title=file.filename,
            raw_text=raw_text,
            cleaned_text=cleaned,
            input_type=input_type,
            metadata={"filename": file.filename, "size_bytes": len(file_bytes)},
        )

        # Chunk + embed in background
        background_tasks.add_task(
            self._store_chunks, doc.id, project_id, self._chunk_text(cleaned)
        )

        return doc
