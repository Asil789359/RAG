"""
RBAC & Security Filter Module for Enterprise RAG
"""
from typing import List, Dict, Any, Set

class SecurityContext:
    def __init__(self, user_id: str, roles: List[str], department: str, clearance_level: str):
        self.user_id = user_id
        self.roles = set(roles)
        self.department = department
        self.clearance_level = clearance_level  # public, internal, confidential, restricted

class RBACFilterBuilder:
    """Builds Vector Database metadata filters based on user SecurityContext."""
    
    LEVEL_HIERARCHY = {
        "public": 1,
        "internal": 2,
        "confidential": 3,
        "restricted": 4
    }

    @staticmethod
    def build_qdrant_filter(context: SecurityContext) -> Dict[str, Any]:
        """Generate metadata filter for Vector DB execution pre-filtering."""
        user_level_val = RBACFilterBuilder.LEVEL_HIERARCHY.get(context.clearance_level.lower(), 1)
        allowed_levels = [
            lvl for lvl, val in RBACFilterBuilder.LEVEL_HIERARCHY.items()
            if val <= user_level_val
        ]
        
        return {
            "must": [
                {
                    "key": "classification_level",
                    "match": {"any": allowed_levels}
                },
                {
                    "key": "allowed_roles",
                    "match": {"any": list(context.roles.union({"all-staff", "public"}))}
                }
            ]
        }

    @staticmethod
    def authorize_chunk(chunk_metadata: Dict[str, Any], context: SecurityContext) -> bool:
        """In-memory security verification for chunk access."""
        doc_level = chunk_metadata.get("classification_level", "public").lower()
        user_max_level = context.clearance_level.lower()
        
        if RBACFilterBuilder.LEVEL_HIERARCHY.get(doc_level, 99) > RBACFilterBuilder.LEVEL_HIERARCHY.get(user_max_level, 1):
            return False
            
        allowed_roles = set(chunk_metadata.get("allowed_roles", ["public"]))
        if not allowed_roles.intersection(context.roles.union({"all-staff", "public"})):
            return False
            
        return True
