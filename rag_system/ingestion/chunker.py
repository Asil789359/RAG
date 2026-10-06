"""
Hierarchical Parent-Child & Semantic Chunking Engine
"""
import uuid
import re
from typing import List, Dict, Any, Tuple

class HierarchicalChunker:
    """
    Parses documents into Parent Chunks (large context window for LLM generation)
    and Child Chunks (small, dense context window for vector similarity indexing).
    """
    def __init__(self, parent_size: int = 2048, child_size: int = 512, overlap: int = 64):
        self.parent_size = parent_size
        self.child_size = child_size
        self.overlap = overlap

    def process_document(
        self,
        doc_id: str,
        title: str,
        text: str,
        metadata: Dict[str, Any]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Splits document into parent and child chunk pairs.
        Returns: (parent_chunks, child_chunks)
        """
        words = text.split()
        parent_chunks = []
        child_chunks = []
        
        parent_word_limit = self.parent_size // 4
        child_word_limit = self.child_size // 4
        child_overlap_words = self.overlap // 4

        p_index = 0
        for i in range(0, len(words), parent_word_limit):
            parent_id = f"parent_{doc_id}_{p_index}"
            p_words = words[i : i + parent_word_limit]
            p_text = " ".join(p_words)
            
            parent_chunk = {
                "parent_id": parent_id,
                "doc_id": doc_id,
                "title": title,
                "text": p_text,
                "token_count": len(p_words) * 4,
                "metadata": metadata
            }
            parent_chunks.append(parent_chunk)

            # Generate child chunks for this parent
            c_index = 0
            for j in range(0, len(p_words), child_word_limit - child_overlap_words):
                c_words = p_words[j : j + child_word_limit]
                if not c_words:
                    continue
                    
                child_id = f"child_{doc_id}_{p_index}_{c_index}"
                c_text = " ".join(c_words)
                
                child_chunk = {
                    "child_id": child_id,
                    "parent_id": parent_id,
                    "doc_id": doc_id,
                    "title": title,
                    "text": c_text,
                    "token_count": len(c_words) * 4,
                    "metadata": {
                        **metadata,
                        "parent_id": parent_id,
                        "child_id": child_id,
                        "doc_title": title,
                        "section_offset": j
                    }
                }
                child_chunks.append(child_chunk)
                c_index += 1
                
            p_index += 1

        return parent_chunks, child_chunks
