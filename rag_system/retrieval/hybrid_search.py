"""
Hybrid Search Engine with Reciprocal Rank Fusion (RRF) & BM25
"""
import math
from collections import defaultdict
from typing import List, Dict, Any, Tuple
from rag_system.security.rbac import SecurityContext, RBACFilterBuilder

class InvertedBM25Index:
    """Lightweight in-memory BM25 index for sparse lexical retrieval."""
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.doc_len = {}
        self.doc_tokens = {}
        self.avg_doc_len = 0.0
        self.doc_count = 0
        self.idf = {}
        self.df = defaultdict(int)
        self.inverted_index = defaultdict(list)

    def tokenize(self, text: str) -> List[str]:
        return [w.lower() for w in text.split() if w.isalnum() or len(w) > 2]

    def add_documents(self, documents: List[Dict[str, Any]]):
        self.doc_count = len(documents)
        total_len = 0
        
        for doc in documents:
            doc_id = doc["child_id"]
            tokens = self.tokenize(doc["text"])
            self.doc_tokens[doc_id] = tokens
            self.doc_len[doc_id] = len(tokens)
            total_len += len(tokens)
            
            unique_terms = set(tokens)
            for term in unique_terms:
                self.df[term] += 1
                self.inverted_index[term].append(doc_id)

        self.avg_doc_len = total_len / max(1, self.doc_count)

        # Compute IDF
        for term, freq in self.df.items():
            self.idf[term] = math.log((self.doc_count - freq + 0.5) / (freq + 0.5) + 1.0)

    def search(self, query: str, top_k: int = 100) -> List[Tuple[str, float]]:
        query_terms = self.tokenize(query)
        scores = defaultdict(float)

        for term in query_terms:
            if term not in self.idf:
                continue
            idf_val = self.idf[term]
            matching_doc_ids = self.inverted_index[term]

            for doc_id in matching_doc_ids:
                tokens = self.doc_tokens[doc_id]
                tf = tokens.count(term)
                dl = self.doc_len[doc_id]
                
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (1 - self.b + self.b * (dl / self.avg_doc_len))
                scores[doc_id] += idf_val * (numerator / denominator)

        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_scores[:top_k]


class HybridSearchEngine:
    """Combines Dense Vectors and BM25 Sparse Search via Reciprocal Rank Fusion (RRF)."""

    def __init__(self, rrf_k: int = 60):
        self.rrf_k = rrf_k
        self.bm25 = InvertedBM25Index()
        self.child_chunks_by_id = {}

    def index_chunks(self, child_chunks: List[Dict[str, Any]]):
        for chunk in child_chunks:
            self.child_chunks_by_id[chunk["child_id"]] = chunk
        self.bm25.add_documents(child_chunks)

    def reciprocal_rank_fusion(
        self,
        dense_results: List[Tuple[str, float]],
        sparse_results: List[Tuple[str, float]],
        security_context: SecurityContext,
        top_k: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Calculates RRF score: score(d) = sum( 1 / (k + rank(d)) )
        Filters out unauthorized chunks based on SecurityContext pre-checking.
        """
        rrf_scores = defaultdict(float)

        # Process Dense Ranks
        for rank, (doc_id, score) in enumerate(dense_results, start=1):
            rrf_scores[doc_id] += 1.0 / (self.rrf_k + rank)

        # Process Sparse BM25 Ranks
        for rank, (doc_id, score) in enumerate(sparse_results, start=1):
            rrf_scores[doc_id] += 1.0 / (self.rrf_k + rank)

        # Sort combined results
        sorted_candidates = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)

        authorized_results = []
        for doc_id, score in sorted_candidates:
            chunk = self.child_chunks_by_id.get(doc_id)
            if not chunk:
                continue

            # RBAC Metadata Security Enforcement
            if RBACFilterBuilder.authorize_chunk(chunk["metadata"], security_context):
                chunk_copy = dict(chunk)
                chunk_copy["rrf_score"] = score
                authorized_results.append(chunk_copy)

            if len(authorized_results) >= top_k:
                break

        return authorized_results
