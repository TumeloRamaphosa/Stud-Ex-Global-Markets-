"""
Trading RAG Engine

Retrieval-Augmented Generation system that gives the LLM analyst
access to relevant context before making decisions:

1. Trade Memory Store — Past trades, outcomes, and learnings
2. Strategy Knowledge Base — Claude Trading Skills methodology docs
3. Market Research — News articles, SARB reports, sector analysis
4. Pattern Library — Recognized chart patterns and their historical outcomes

Architecture:
- Embedding: Ollama embeddings (local, free) or Vertex AI embeddings
- Vector Store: SQLite + numpy (lightweight) or ChromaDB
- Retrieval: Semantic search + keyword filtering
- Augmentation: Inject top-K relevant chunks into LLM prompt

Why RAG matters for trading:
- "Last time BTC RSI was 25 in a broadening regime, what happened?" → retrieves actual trade data
- "What does Minervini say about VCP in declining volume?" → retrieves strategy docs
- "Recent SARB rate decision impact on JSE banks?" → retrieves news + past trades
"""

import json
import sqlite3
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional

import numpy as np
import httpx
from loguru import logger


class TradingRAG:
    """
    RAG engine optimized for trading decisions.

    Stores documents as embeddings in SQLite with numpy vectors.
    Retrieves relevant context for LLM analysis prompts.
    """

    def __init__(self, config: dict):
        self.db_path = str(Path(__file__).parent.parent / "data" / "rag.db")
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)

        ollama_config = config.get("ollama", {})
        self.ollama_url = ollama_config.get("base_url", "http://localhost:11434")
        self.embed_model = "nomic-embed-text"  # Small, fast embedding model for Ollama
        self.embed_dim = 768  # nomic-embed-text dimension

        # Vertex AI fallback
        vertex_config = config.get("vertex", {})
        self.use_vertex_embeddings = vertex_config.get("use_embeddings", False)

        self._init_db()
        logger.info("[RAG] Engine initialized")

    def _init_db(self):
        """Initialize the RAG vector store schema."""
        with sqlite3.connect(self.db_path) as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS documents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    doc_id TEXT UNIQUE NOT NULL,
                    content TEXT NOT NULL,
                    category TEXT NOT NULL,
                    metadata TEXT,
                    embedding BLOB,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                );

                CREATE TABLE IF NOT EXISTS chunks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    doc_id TEXT NOT NULL,
                    chunk_index INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    embedding BLOB,
                    FOREIGN KEY (doc_id) REFERENCES documents(doc_id)
                );

                CREATE INDEX IF NOT EXISTS idx_docs_category ON documents(category);
                CREATE INDEX IF NOT EXISTS idx_chunks_doc ON chunks(doc_id);
            """)

    # ================================================================
    # DOCUMENT INGESTION
    # ================================================================

    async def ingest_document(
        self,
        content: str,
        category: str,
        metadata: dict = None,
        doc_id: str = None,
    ):
        """
        Ingest a document into the RAG store.

        Categories:
        - 'trade_memory': Past trade reasoning and outcomes
        - 'strategy_docs': Trading strategy methodology
        - 'market_research': News, reports, analysis
        - 'learnings': RALF-extracted insights
        - 'patterns': Chart patterns and historical outcomes
        """
        if not doc_id:
            doc_id = hashlib.md5(content[:500].encode()).hexdigest()

        # Chunk the document
        chunks = self._chunk_text(content, chunk_size=500, overlap=50)

        # Generate embeddings for each chunk
        embeddings = []
        for chunk in chunks:
            embedding = await self._get_embedding(chunk)
            embeddings.append(embedding)

        # Store in database
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """INSERT OR REPLACE INTO documents (doc_id, content, category, metadata, updated_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (doc_id, content, category, json.dumps(metadata or {}), datetime.now().isoformat()),
            )

            # Clear old chunks for this doc
            conn.execute("DELETE FROM chunks WHERE doc_id = ?", (doc_id,))

            # Insert new chunks
            for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
                emb_blob = emb.tobytes() if emb is not None else None
                conn.execute(
                    """INSERT INTO chunks (doc_id, chunk_index, content, embedding)
                       VALUES (?, ?, ?, ?)""",
                    (doc_id, i, chunk, emb_blob),
                )

        logger.debug(f"[RAG] Ingested doc {doc_id} ({category}): {len(chunks)} chunks")

    async def ingest_trade_memory(self, trade: dict):
        """Ingest a completed trade as searchable memory."""
        content = f"""TRADE RECORD — {trade.get('symbol', 'Unknown')}
Strategy: {trade.get('strategy', 'Unknown')}
Direction: {trade.get('side', 'Unknown')}
Entry: {trade.get('entry_price', 'N/A')} | Exit: {trade.get('exit_price', 'N/A')}
PnL: {trade.get('pnl', 0):+.2f} ({trade.get('pnl_pct', 0):+.2f}%)
Duration: {trade.get('duration_hours', 0):.1f} hours
Outcome: {trade.get('outcome', 'Unknown')}
Regime: {trade.get('regime', 'Unknown')}
Hypothesis: {trade.get('hypothesis', 'N/A')}
Lessons: {trade.get('lessons', 'N/A')}
RSI at entry: {trade.get('rsi', 'N/A')}
Volume ratio: {trade.get('volume_ratio', 'N/A')}"""

        await self.ingest_document(
            content=content,
            category="trade_memory",
            metadata=trade,
            doc_id=f"trade_{trade.get('trade_id', datetime.now().timestamp())}",
        )

    async def ingest_learning(self, learning: dict):
        """Ingest a RALF learning as searchable knowledge."""
        content = f"""LEARNING — {learning.get('category', 'general')}
Insight: {learning.get('insight', '')}
Confidence: {learning.get('confidence', 0):.0%}
Applies to: {learning.get('applies_to', 'all')}
Observed: {learning.get('first_observed', 'N/A')}"""

        await self.ingest_document(
            content=content,
            category="learnings",
            metadata=learning,
            doc_id=f"learning_{hashlib.md5(learning.get('insight', '').encode()).hexdigest()[:12]}",
        )

    async def ingest_strategy_docs(self, docs_dir: str):
        """Ingest strategy knowledge base documents from a directory."""
        docs_path = Path(docs_dir)
        if not docs_path.exists():
            logger.warning(f"[RAG] Strategy docs directory not found: {docs_dir}")
            return

        for doc_file in docs_path.glob("*.md"):
            content = doc_file.read_text()
            await self.ingest_document(
                content=content,
                category="strategy_docs",
                metadata={"filename": doc_file.name, "source": "knowledge_base"},
                doc_id=f"strategy_{doc_file.stem}",
            )
            logger.info(f"[RAG] Ingested strategy doc: {doc_file.name}")

    async def ingest_news(self, headline: str, body: str, source: str, symbol: str = None):
        """Ingest a news article."""
        content = f"""NEWS — {headline}
Source: {source}
Symbol: {symbol or 'General'}
Date: {datetime.now().strftime('%Y-%m-%d')}

{body}"""

        await self.ingest_document(
            content=content,
            category="market_research",
            metadata={"headline": headline, "source": source, "symbol": symbol},
            doc_id=f"news_{hashlib.md5(headline.encode()).hexdigest()[:12]}",
        )

    # ================================================================
    # RETRIEVAL
    # ================================================================

    async def retrieve(
        self,
        query: str,
        category: str = None,
        top_k: int = 5,
        min_similarity: float = 0.3,
    ) -> list[dict]:
        """
        Retrieve the most relevant documents for a query.

        Args:
            query: Natural language query
            category: Filter by category (None = search all)
            top_k: Number of results to return
            min_similarity: Minimum cosine similarity threshold
        """
        query_embedding = await self._get_embedding(query)
        if query_embedding is None:
            return self._keyword_fallback(query, category, top_k)

        # Search through all chunks
        results = []

        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row

            if category:
                chunks = conn.execute(
                    """SELECT c.content, c.embedding, d.category, d.metadata, d.doc_id
                       FROM chunks c JOIN documents d ON c.doc_id = d.doc_id
                       WHERE d.category = ?""",
                    (category,),
                ).fetchall()
            else:
                chunks = conn.execute(
                    """SELECT c.content, c.embedding, d.category, d.metadata, d.doc_id
                       FROM chunks c JOIN documents d ON c.doc_id = d.doc_id""",
                ).fetchall()

        for chunk in chunks:
            if chunk["embedding"] is None:
                continue

            stored_emb = np.frombuffer(chunk["embedding"], dtype=np.float32)
            if len(stored_emb) != len(query_embedding):
                continue

            similarity = self._cosine_similarity(query_embedding, stored_emb)

            if similarity >= min_similarity:
                results.append({
                    "content": chunk["content"],
                    "category": chunk["category"],
                    "similarity": float(similarity),
                    "metadata": json.loads(chunk["metadata"]) if chunk["metadata"] else {},
                    "doc_id": chunk["doc_id"],
                })

        # Sort by similarity and return top-K
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]

    async def retrieve_for_trade(self, symbol: str, strategy: str, regime: str) -> str:
        """
        Retrieve relevant context for a trade decision.
        Returns a formatted string to inject into the LLM prompt.
        """
        # Search for similar past trades
        query = f"trading {symbol} with {strategy} strategy in {regime} market regime"
        trade_memories = await self.retrieve(query, category="trade_memory", top_k=3)

        # Search strategy docs
        strategy_docs = await self.retrieve(f"{strategy} entry conditions rules", category="strategy_docs", top_k=2)

        # Search recent learnings
        learnings = await self.retrieve(f"{strategy} {regime} performance", category="learnings", top_k=2)

        # Format context
        context_parts = []

        if trade_memories:
            context_parts.append("=== SIMILAR PAST TRADES ===")
            for tm in trade_memories:
                context_parts.append(f"[Similarity: {tm['similarity']:.0%}]\n{tm['content']}\n")

        if strategy_docs:
            context_parts.append("=== STRATEGY METHODOLOGY ===")
            for sd in strategy_docs:
                context_parts.append(sd["content"][:500])

        if learnings:
            context_parts.append("=== RELEVANT LEARNINGS ===")
            for l in learnings:
                context_parts.append(l["content"])

        return "\n\n".join(context_parts) if context_parts else "No relevant historical context found."

    # ================================================================
    # EMBEDDING GENERATION
    # ================================================================

    async def _get_embedding(self, text: str) -> Optional[np.ndarray]:
        """Generate embedding via Ollama or Vertex AI."""
        if self.use_vertex_embeddings:
            return await self._vertex_embedding(text)
        return await self._ollama_embedding(text)

    async def _ollama_embedding(self, text: str) -> Optional[np.ndarray]:
        """Generate embedding via local Ollama."""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/embeddings",
                    json={"model": self.embed_model, "prompt": text},
                )
                if response.status_code == 200:
                    embedding = response.json().get("embedding", [])
                    return np.array(embedding, dtype=np.float32)
                else:
                    logger.debug(f"[RAG] Ollama embedding failed: {response.status_code}")
                    return None
        except Exception as e:
            logger.debug(f"[RAG] Ollama embedding error: {e}")
            return None

    async def _vertex_embedding(self, text: str) -> Optional[np.ndarray]:
        """Generate embedding via Google Vertex AI (if configured)."""
        try:
            from google.cloud import aiplatform
            from vertexai.language_models import TextEmbeddingModel

            model = TextEmbeddingModel.from_pretrained("textembedding-gecko@003")
            embeddings = model.get_embeddings([text])
            return np.array(embeddings[0].values, dtype=np.float32)
        except ImportError:
            logger.debug("[RAG] Vertex AI SDK not installed")
            return await self._ollama_embedding(text)
        except Exception as e:
            logger.debug(f"[RAG] Vertex embedding failed: {e}")
            return await self._ollama_embedding(text)

    # ================================================================
    # UTILITIES
    # ================================================================

    def _chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
        """Split text into overlapping chunks."""
        words = text.split()
        chunks = []
        start = 0

        while start < len(words):
            end = start + chunk_size
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            start = end - overlap

        return chunks if chunks else [text]

    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors."""
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))

    def _keyword_fallback(self, query: str, category: str, top_k: int) -> list[dict]:
        """Fallback to keyword search when embeddings are unavailable."""
        keywords = query.lower().split()

        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row

            if category:
                docs = conn.execute(
                    "SELECT content, category, metadata, doc_id FROM documents WHERE category = ?",
                    (category,),
                ).fetchall()
            else:
                docs = conn.execute(
                    "SELECT content, category, metadata, doc_id FROM documents"
                ).fetchall()

        scored = []
        for doc in docs:
            content_lower = doc["content"].lower()
            score = sum(1 for kw in keywords if kw in content_lower) / len(keywords)
            if score > 0:
                scored.append({
                    "content": doc["content"],
                    "category": doc["category"],
                    "similarity": score,
                    "metadata": json.loads(doc["metadata"]) if doc["metadata"] else {},
                    "doc_id": doc["doc_id"],
                })

        scored.sort(key=lambda x: x["similarity"], reverse=True)
        return scored[:top_k]

    async def get_stats(self) -> dict:
        """Get RAG store statistics."""
        with sqlite3.connect(self.db_path) as conn:
            total_docs = conn.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
            total_chunks = conn.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
            categories = conn.execute(
                "SELECT category, COUNT(*) FROM documents GROUP BY category"
            ).fetchall()

        return {
            "total_documents": total_docs,
            "total_chunks": total_chunks,
            "categories": {row[0]: row[1] for row in categories},
        }
