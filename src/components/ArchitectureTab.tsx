import React, { useState } from 'react';
import { Database, FileText, Lock, Cpu, Server, Filter, CheckCircle2, ArrowRight, Zap, Code2 } from 'lucide-react';

interface StageDetail {
  title: string;
  category: string;
  description: string;
  specs: { label: string; value: string }[];
  rationale: string;
  codeSnippet: string;
}

export const ArchitectureTab: React.FC = () => {
  const [activeStage, setActiveStage] = useState<string>('chunking');

  const stageDetails: Record<string, StageDetail> = {
    connectors: {
      title: 'Heterogeneous Connectors & Parsing',
      category: 'Data Ingestion Layer',
      description: 'Ingests 100,000 documents from SharePoint, Confluence, Google Drive, S3, Jira, and Slack. Layout-aware parsing extracts tables, headers, and metadata tags.',
      specs: [
        { label: 'Parser Engine', value: 'Docling / LlamaParse / Unstructured.io' },
        { label: 'OCR Fallback', value: 'Tesseract / Cloud Vision API' },
        { label: 'Sync Pipeline', value: 'Kafka / Celery CDC (< 60s Latency)' },
        { label: 'Supported Formats', value: 'PDF, DOCX, XLSX, Markdown, HTML, PNG' }
      ],
      rationale: 'Plain text extractors destroy table alignment and document headings. Layout-aware parsing converts documents into clean Markdown, preserving tables in pipe-delimited format.',
      codeSnippet: `doc = LlamaParse(result_type="markdown").load_data("quarterly_report.pdf")\nmetadata = extract_acl_tags(doc.headers)`
    },
    chunking: {
      title: 'Hierarchical Parent-Child Chunking',
      category: 'Indexing & Context Assembly',
      description: 'Resolves the trade-off between vector similarity search precision and LLM generation context window size.',
      specs: [
        { label: 'Child Chunk Size', value: '512 Tokens (~200 Words, 64t Overlap)' },
        { label: 'Parent Chunk Size', value: '2,048 Tokens (~800 Words Context)' },
        { label: 'Total Child Vectors', value: '1,200,000 Vectors (100k Docs)' },
        { label: 'Vector Index Target', value: 'Indexed in Qdrant HNSW Index' }
      ],
      rationale: 'Vector search is most precise on dense, focused text (512 tokens). LLM generation produces better answers with broad surrounding context (2048 tokens). Parent-Child links both seamlessly.',
      codeSnippet: `parent_chunk, child_chunks = chunker.process_document(\n    doc_id="DOC-001",\n    parent_size=2048,\n    child_size=512,\n    overlap=64\n)`
    },
    vector_store: {
      title: 'Vector Store & HNSW Indexing',
      category: 'Storage & Retrieval Index',
      description: 'High-speed vector database (Qdrant / Milvus) running HNSW graph index with Scalar Quantization (SQ8).',
      specs: [
        { label: 'Index Type', value: 'HNSW (m=16, ef_construct=128)' },
        { label: 'Embedding Model', value: 'text-embedding-3-large (1536d)' },
        { label: 'RAM Footprint', value: '4.10 GB RAM (SQ8 Quantized)' },
        { label: 'Recall Latency', value: '35 ms for 1.2M vectors' }
      ],
      rationale: 'HNSW provides sub-50ms approximate nearest neighbor search over millions of vectors. SQ8 quantization cuts RAM requirements by 4x with minimal accuracy loss.',
      codeSnippet: `qdrant.create_collection(\n    collection_name="enterprise_100k",\n    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),\n    quantization_config=ScalarQuantization(scalar_type=ScalarType.INT8)\n)`
    },
    hybrid_rrf: {
      title: 'Hybrid BM25 + Reciprocal Rank Fusion',
      category: 'Retrieval Optimization',
      description: 'Combines dense semantic vector similarity search with sparse lexical BM25 term matching to capture exact acronyms, policy IDs, and SKU numbers.',
      specs: [
        { label: 'Dense Recall', value: 'Top 100 Vectors' },
        { label: 'Sparse Recall', value: 'Top 100 BM25 Keyword Hits' },
        { label: 'RRF Constant (k)', value: '60' },
        { label: 'Combined Candidate Pool', value: 'Top 100 Candidate Chunks' }
      ],
      rationale: 'Dense vectors struggle with specific alphanumeric strings like "POLICY-2026-X9". BM25 excels at exact keyword matches. RRF merges their rank positions without calibration scaling issues.',
      codeSnippet: `rrf_score = sum(1.0 / (60 + rank_dense), 1.0 / (60 + rank_bm25))`
    },
    cross_encoder: {
      title: 'Cross-Encoder Re-ranking Stage',
      category: 'Precision Re-ranking',
      description: 'Evaluates joint query-document semantic relevance using a Cross-Encoder model (Cohere Rerank v3 / BGE-Reranker-Large).',
      specs: [
        { label: 'Input Pool', value: 'Top 100 Candidates from Hybrid Search' },
        { label: 'Output Pool', value: 'Top 7 High-Density Chunks' },
        { label: 'Re-ranking Latency', value: '~110 ms' },
        { label: 'Precision Lift', value: '+34% Context Precision' }
      ],
      rationale: 'Bi-encoder vector search evaluates query and document embeddings independently. Cross-encoders evaluate full joint attention between query and candidate text, filtering out false positives.',
      codeSnippet: `reranked_chunks = reranker.rerank(\n    query=user_query,\n    candidate_chunks=rrf_top_100,\n    top_k=7\n)`
    },
    rbac_gate: {
      title: 'Pre-Retrieval RBAC & ABAC Security Filter',
      category: 'Enterprise Security & Governance',
      description: 'Injects user JWT claims (department, clearance level, role memberships) directly into vector query filters.',
      specs: [
        { label: 'Security Enforcement', value: 'Pre-retrieval at Vector DB level' },
        { label: 'Supported Standards', value: 'SAML 2.0 / Okta / Azure AD' },
        { label: 'Data Redaction', value: 'Microsoft Presidio PII Masking' },
        { label: 'Audit Trail', value: 'Immutable CloudWatch Logs' }
      ],
      rationale: 'Post-retrieval security filtering leaks chunk count metrics and degrades top-K precision. Pre-filtering guarantees zero unauthorized chunk retrieval at query evaluation time.',
      codeSnippet: `filter = {\n    "must": [\n        {"key": "classification", "match": {"any": user.clearance_levels}},\n        {"key": "allowed_roles", "match": {"any": user.roles}}\n    ]\n}`
    },
    llm_generation: {
      title: 'LLM Generation & Source Citation Engine',
      category: 'Synthesis & Grounding',
      description: 'Synthesizes grounded answers using retrieved Parent Contexts (2048t) with mandatory inline source citations.',
      specs: [
        { label: 'LLM Engine', value: 'Gemini 1.5 Flash / GPT-4o-mini' },
        { label: 'Streaming', value: 'Server-Sent Events (SSE)' },
        { label: 'TTFT Latency', value: '< 320 ms' },
        { label: 'Citation Anchoring', value: 'Explicit [Doc Title, Section, Page]' }
      ],
      rationale: 'Retrieving parent chunks provides rich, complete background info to the LLM, eliminating hallucinated answers while strict system prompts enforce exact source attribution.',
      codeSnippet: `prompt = f"Answer using context below. Cite exact document title for every claim.\\nContext: {parent_contexts}"`
    }
  };

  const current = stageDetails[activeStage];

  return (
    <div className="space-y-8">
      {/* Top Architecture Interactive Pipeline Flowchart */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          End-to-End System Architecture (Click any stage to inspect specs)
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          High-performance RAG pipeline engineered for 100,000 documents with &lt;1.2s P95 query latency and enterprise RBAC security.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {[
            { id: 'connectors', label: '1. Connectors & Parser', icon: FileText, color: 'border-slate-700 text-slate-300' },
            { id: 'chunking', label: '2. Parent-Child Chunker', icon: SplitIcon, color: 'border-indigo-500/40 text-indigo-300' },
            { id: 'vector_store', label: '3. HNSW Vector DB', icon: Database, color: 'border-cyan-500/40 text-cyan-300' },
            { id: 'hybrid_rrf', label: '4. Hybrid BM25+RRF', icon: Filter, color: 'border-purple-500/40 text-purple-300' },
            { id: 'cross_encoder', label: '5. Cross-Encoder Rerank', icon: Zap, color: 'border-amber-500/40 text-amber-300' },
            { id: 'rbac_gate', label: '6. RBAC Security Gate', icon: Lock, color: 'border-emerald-500/40 text-emerald-300' },
            { id: 'llm_generation', label: '7. LLM & Citations', icon: Cpu, color: 'border-rose-500/40 text-rose-300' },
          ].map((stage) => {
            const Icon = stage.icon;
            const isSelected = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-500/20 scale-105'
                    : `bg-slate-900/60 ${stage.color} hover:bg-slate-800/80`
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold leading-tight">{stage.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Inspector Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                {current.category}
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{current.title}</h3>
            </div>
            <span className="badge badge-cyan flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Stage Active
            </span>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">{current.description}</p>

          <div className="grid grid-cols-2 gap-4">
            {current.specs.map((spec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-slate-400 font-mono block mb-1">{spec.label}</span>
                <span className="text-sm font-semibold text-slate-100">{spec.value}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-400" /> Architectural Design Rationale
            </h4>
            <p className="text-xs text-indigo-100/90 leading-relaxed">{current.rationale}</p>
          </div>
        </div>

        {/* Code Snippet / Implementation Panel */}
        <div className="glass-panel p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4 text-cyan-400" /> Python Implementation Blueprint
            </h3>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
              <pre>{current.codeSnippet}</pre>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <span className="text-slate-400 block font-mono">100k Document Target SLA</span>
            <div className="flex justify-between items-center text-slate-200">
              <span>Stage Processing Target:</span>
              <span className="font-bold text-emerald-400">&lt; 150 ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SplitIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);
