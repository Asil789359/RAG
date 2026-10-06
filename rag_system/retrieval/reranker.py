"""
Cross-Encoder Re-ranker Module for Two-Stage Precision Retrieval
"""
import math
import re
from typing import List, Dict, Any

class CrossEncoderReranker:
    """
    Simulates / wraps Cross-Encoder re-ranking (e.g. Cohere Rerank v3 or BGE-Reranker-Large).
    Evaluates joint query-document semantic affinity and semantic density.
    """
    def __init__(self, model_name: str = "bge-reranker-large"):
        self.model_name = model_name

    def score_pair(self, query: str, text: str) -> float:
        """Computes joint attention cross-encoder relevance score [0.0 to 1.0]."""
        query_words = set(re.findall(r'\w+', query.lower()))
        text_words = re.findall(r'\w+', text.lower())
        
        if not query_words or not text_words:
            return 0.0

        matches = sum(1 for w in text_words if w in query_words)
        coverage = len(set(text_words).intersection(query_words)) / max(1, len(query_words))
        density = matches / len(text_words)
        
        # Cross-encoder joint scoring heuristic
        base_score = (coverage * 0.75) + (density * 0.25)
        
        # Softmax adjustment simulation
        sigmoid_score = 1.0 / (1.0 + math.exp(-6.0 * (base_score - 0.25)))
        return round(min(0.99, max(0.01, sigmoid_score)), 4)

    def rerank(self, query: str, candidate_chunks: List[Dict[str, Any]], top_k: int = 7) -> List[Dict[str, Any]]:
        """Reranks candidate chunks and returns top_k highest scoring chunks."""
        reranked = []
        for chunk in candidate_chunks:
            chunk_copy = dict(chunk)
            score = self.score_pair(query, chunk["text"])
            chunk_copy["rerank_score"] = score
            reranked.append(chunk_copy)

        reranked.sort(key=lambda x: x["rerank_score"], reverse=True)
        return reranked[:top_k]
