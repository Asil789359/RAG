"""
Configuration file for Enterprise RAG System (100k Documents)
"""
from dataclasses import dataclass, field
from typing import List, Dict, Any

@dataclass
class RAGConfig:
    # Scale Constants
    TOTAL_DOCUMENTS: int = 100_000
    AVG_PAGES_PER_DOC: int = 5
    AVG_TOKENS_PER_PAGE: int = 500
    
    # Chunking Config
    PARENT_CHUNK_SIZE: int = 2048
    CHILD_CHUNK_SIZE: int = 512
    CHILD_CHUNK_OVERLAP: int = 64
    
    # Vector DB Index Configuration
    VECTOR_DIMENSION: int = 1536
    HNSW_M: int = 16
    HNSW_EF_CONSTRUCT: int = 128
    HNSW_EF_SEARCH: int = 64
    
    # Hybrid Search Weights (RRF)
    RRF_K: int = 60
    TOP_K_RECALL: int = 100
    TOP_K_RERANK: int = 7
    
    # Re-ranking Threshold
    RERANK_SCORE_THRESHOLD: float = 0.45
    
    # Security Default Roles
    SUPPORTED_ROLES: List[str] = field(default_factory=lambda: [
        "executive", "engineering", "hr", "sales", "public"
    ])

DEFAULT_CONFIG = RAGConfig()
