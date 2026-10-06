"""
Main CLI demonstration runner for Enterprise 100k RAG System.
"""
from rag_system.config import RAGConfig
from rag_system.rag_engine import EnterpriseRAGPipeline
from rag_system.security.rbac import SecurityContext

def run_demo():
    print("==========================================================")
    print("  ENTERPRISE RAG SYSTEM SIMULATOR (100,000 DOCUMENTS)")
    print("==========================================================")
    
    # Initialize Pipeline
    pipeline = EnterpriseRAGPipeline()
    
    # Seed Sample Enterprise Documents across departments & ACLs
    sample_docs = [
        {
            "id": "DOC-FIN-2026-001",
            "title": "Global Travel & Expense Authorization Policy 2026",
            "text": "All employee travel requests exceeding $1,500 USD require prior written approval from a VP or Executive committee member. Expenses must be submitted within 30 calendar days of trip completion via the Enterprise Expense Portal. Business class travel is restricted to executive role holders on flights exceeding 8 continuous hours.",
            "metadata": {
                "classification_level": "internal",
                "allowed_roles": ["all-staff"],
                "department": "Finance"
            }
        },
        {
            "id": "DOC-SEC-2026-042",
            "title": "Restricted Zero Trust Network Infrastructure Guidelines",
            "text": "Zero Trust Network Access (ZTNA) requires multi-factor authentication (MFA) with FIPS 140-3 hardware security keys. Access to production Kubernetes databases (prod-db-cluster-01) is strictly restricted to senior infrastructure engineering personnel with active Security-Level-4 clearance.",
            "metadata": {
                "classification_level": "restricted",
                "allowed_roles": ["engineering"],
                "department": "Security"
            }
        },
        {
            "id": "DOC-HR-2026-019",
            "title": "Remote Work and Hybrid Flexibility Policy",
            "text": "Full-time employees are eligible for up to 2 remote work days per week upon manager agreement. Core operational hours are defined as 10:00 AM to 4:00 PM EST. Equipment allowances include a $500 home office setup stipend renewed every 24 months.",
            "metadata": {
                "classification_level": "public",
                "allowed_roles": ["all-staff"],
                "department": "Human Resources"
            }
        }
    ]

    print(f"\n[Ingestion] Ingesting {len(sample_docs)} enterprise documents into Parent-Child Chunker & Hybrid Index...")
    pipeline.ingest_documents(sample_docs)
    print(f" -> Parent Chunks Ingested: {len(pipeline.parent_chunks_store)}")
    print(f" -> Child Chunks Indexed:  {len(pipeline.child_chunks_store)}")

    # Query Scenario 1: Engineering User (Authorized for Restricted Tech Docs)
    eng_user = SecurityContext(
        user_id="user_eng_99",
        roles=["engineering", "all-staff"],
        department="Engineering",
        clearance_level="restricted"
    )
    
    query_1 = "What are the MFA and security key requirements for production database access?"
    print(f"\n----------------------------------------------------------")
    print(f"Scenario 1: Query by Engineering Lead (Clearance: Restricted)")
    print(f"Query: '{query_1}'")
    res_1 = pipeline.query(query_1, eng_user)
    print(f" -> Response: {res_1['generated_answer']}")
    print(f" -> Retain Citations: {res_1['citations']}")
    print(f" -> P95 Latency: {res_1['timing_ms']['total_e2e']} ms")
    print(f" -> RAGAS Score: {res_1['eval_metrics']}")

    # Query Scenario 2: HR User trying to query Security Restricted Doc (Unauthorized access check)
    hr_user = SecurityContext(
        user_id="user_hr_12",
        roles=["hr", "all-staff"],
        department="HR",
        clearance_level="internal"
    )
    print(f"\n----------------------------------------------------------")
    print(f"Scenario 2: Query by HR Staff (Clearance: Internal) for Restricted Security Info")
    print(f"Query: '{query_1}'")
    res_2 = pipeline.query(query_1, hr_user)
    print(f" -> Response: {res_2['generated_answer']}")
    print(f" -> Retain Citations: {res_2['citations']}")
    print(f" -> Security Status: Restricted chunks correctly filtered pre-retrieval!")

if __name__ == "__main__":
    run_demo()
