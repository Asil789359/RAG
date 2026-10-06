import React, { useState } from 'react';
import { Play, Shield, Zap, Search, Layers, CheckCircle2, AlertTriangle, FileText, Lock, Sparkles } from 'lucide-react';

interface MockDocument {
  id: string;
  title: string;
  text: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  allowedRoles: string[];
}

const SAMPLE_DOCS: MockDocument[] = [
  {
    id: 'DOC-SEC-2026-042',
    title: 'Restricted Zero Trust Network Infrastructure Guidelines',
    text: 'Zero Trust Network Access (ZTNA) requires multi-factor authentication (MFA) with FIPS 140-3 hardware security keys. Access to production Kubernetes databases (prod-db-cluster-01) is strictly restricted to senior infrastructure engineering personnel with active Security-Level-4 clearance.',
    classification: 'restricted',
    allowedRoles: ['engineering']
  },
  {
    id: 'DOC-FIN-2026-001',
    title: 'Global Travel & Expense Authorization Policy 2026',
    text: 'All employee travel requests exceeding $1,500 USD require prior written approval from a VP or Executive committee member. Expenses must be submitted within 30 calendar days of trip completion via the Enterprise Expense Portal. Business class travel is restricted to executive role holders on flights exceeding 8 continuous hours.',
    classification: 'internal',
    allowedRoles: ['all-staff']
  },
  {
    id: 'DOC-HR-2026-019',
    title: 'Remote Work and Hybrid Flexibility Policy',
    text: 'Full-time employees are eligible for up to 2 remote work days per week upon manager agreement. Core operational hours are defined as 10:00 AM to 4:00 PM EST. Equipment allowances include a $500 home office setup stipend renewed every 24 months.',
    classification: 'public',
    allowedRoles: ['all-staff']
  }
];

export const SimulatorTab: React.FC = () => {
  const [userRole, setUserRole] = useState<'engineering' | 'hr' | 'finance' | 'public'>('engineering');
  const [clearanceLevel, setClearanceLevel] = useState<'restricted' | 'internal' | 'public'>('restricted');
  const [retrievalMode, setRetrievalMode] = useState<'dense' | 'sparse' | 'hybrid' | 'rerank'>('rerank');
  const [queryText, setQueryText] = useState<string>('What are the MFA and security key requirements for production database access?');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<any>(null);

  const sampleQueries = [
    { label: 'DB Access Security (Restricted)', text: 'What are the MFA and security key requirements for production database access?' },
    { label: 'Travel & Expense Policy (Internal)', text: 'How do I submit travel expense claims over $1,500?' },
    { label: 'Remote Work Allowance (Public)', text: 'What is the hybrid remote work equipment allowance?' }
  ];

  const levelHierarchy: Record<string, number> = {
    public: 1,
    internal: 2,
    confidential: 3,
    restricted: 4
  };

  const executeSimulatedQuery = () => {
    setIsExecuting(true);
    setQueryResult(null);

    setTimeout(() => {
      // Security Pre-filtering
      const userLevelVal = levelHierarchy[clearanceLevel] || 1;
      const authorizedDocs = SAMPLE_DOCS.filter(doc => {
        const docLevelVal = levelHierarchy[doc.classification] || 1;
        if (docLevelVal > userLevelVal) return false;
        if (doc.allowedRoles.includes('all-staff') || doc.allowedRoles.includes('public')) return true;
        return doc.allowedRoles.includes(userRole);
      });

      // Reranking scoring logic
      const scoredDocs = authorizedDocs.map(doc => {
        const queryTerms = queryText.lowerCaseWords();
        const textTerms = doc.text.lowerCaseWords();
        const overlap = queryTerms.filter(t => textTerms.includes(t)).length;
        
        let score = 0.2 + (overlap * 0.18);
        if (retrievalMode === 'rerank') score += 0.22;
        if (retrievalMode === 'sparse' && overlap > 2) score += 0.15;
        
        return {
          ...doc,
          score: Math.min(0.98, Math.max(0.12, score))
        };
      }).sort((a, b) => b.score - a.score);

      const topResult = scoredDocs[0];
      const isSecurityRefusal = authorizedDocs.length === 0 || !topResult || topResult.score < 0.35;

      let answerText = '';
      if (isSecurityRefusal) {
        answerText = '⚠️ Security Guardrail Notice: No authorized documents matching your security role & clearance level were found in the 100,000 document knowledge base for this query.';
      } else {
        answerText = `Based on enterprise documentation (${topResult.title}):\n\n${topResult.text}\n\n**Key Takeaways**:\n- Grounded across ${scoredDocs.length} authorized source document(s).\n- Evaluated under RBAC Security Policy with zero context leakage.`;
      }

      setQueryResult({
        authorizedCount: authorizedDocs.length,
        retrievedChunks: scoredDocs,
        generatedAnswer: answerText,
        isSecurityRefusal,
        timing: {
          retrieval: retrievalMode === 'rerank' ? 42 : 30,
          rerank: retrievalMode === 'rerank' ? 115 : 0,
          llm: 240,
          total: retrievalMode === 'rerank' ? 397 : 270
        },
        evalMetrics: {
          contextPrecision: retrievalMode === 'rerank' ? 0.94 : (retrievalMode === 'hybrid' ? 0.86 : 0.72),
          faithfulness: isSecurityRefusal ? 1.0 : 0.965,
          answerRelevance: isSecurityRefusal ? 0.5 : 0.94,
          overall: retrievalMode === 'rerank' ? 0.95 : 0.84
        }
      });

      setIsExecuting(false);
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Control Panel: User Role, Security Clearance, Retrieval Mode */}
      <div className="glass-panel p-6 space-y-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Play className="w-5 h-5 text-cyan-400" />
          Live Query Simulator & Security Gateway
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 block">User Role & Identity</label>
            <select
              value={userRole}
              onChange={(e) => {
                const role = e.target.value as any;
                setUserRole(role);
                if (role === 'engineering') setClearanceLevel('restricted');
                else if (role === 'finance') setClearanceLevel('internal');
                else if (role === 'hr') setClearanceLevel('internal');
                else setClearanceLevel('public');
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400"
            >
              <option value="engineering">Engineering Lead (Dept: Infra)</option>
              <option value="finance">Finance Director (Dept: Accounting)</option>
              <option value="hr">HR Specialist (Dept: Human Resources)</option>
              <option value="public">Guest / External Contractor</option>
            </select>
          </div>

          {/* Security Clearance Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 block">Security Clearance Tag</label>
            <div className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-700 rounded-xl">
              <Shield className={`w-5 h-5 ${clearanceLevel === 'restricted' ? 'text-rose-400' : 'text-emerald-400'}`} />
              <select
                value={clearanceLevel}
                onChange={(e) => setClearanceLevel(e.target.value as any)}
                className="w-full bg-transparent text-sm text-slate-100 font-medium focus:outline-none"
              >
                <option value="restricted">Level 4: Restricted (Confidential Tech)</option>
                <option value="internal">Level 2: Internal (Employee Staff)</option>
                <option value="public">Level 1: Public (Unclassified)</option>
              </select>
            </div>
          </div>

          {/* Retrieval Engine Mode */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 block">Retrieval Pipeline Mode</label>
            <select
              value={retrievalMode}
              onChange={(e) => setRetrievalMode(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400"
            >
              <option value="rerank">Hybrid + Cross-Encoder Rerank (Recommended)</option>
              <option value="hybrid">Hybrid (Dense Cosine + Sparse BM25 via RRF)</option>
              <option value="dense">Dense Vector Only (Cosine Similarity)</option>
              <option value="sparse">Sparse Lexical Only (BM25 Keyword)</option>
            </select>
          </div>
        </div>

        {/* Input Query & Quick Suggestions */}
        <div className="space-y-3">
          <label className="text-xs font-mono text-slate-400 block">Query Text</label>
          <div className="relative">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Type an enterprise knowledge base question..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pl-4 pr-32 text-sm text-white font-medium focus:outline-none focus:border-cyan-400 shadow-inner"
            />
            <button
              onClick={executeSimulatedQuery}
              disabled={isExecuting}
              className="absolute right-2 top-2 bottom-2 px-5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
            >
              {isExecuting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Execute RAG
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500 font-mono">Sample Queries:</span>
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQueryText(sq.text);
                }}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-slate-700 transition"
              >
                {sq.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Execution Results View */}
      {queryResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Main LLM Answer Output */}
          <div className="lg:col-span-2 glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Synthesized RAG Response
              </h3>
              <div className="flex items-center gap-2">
                <span className="badge badge-cyan">{queryResult.timing.total} ms Latency</span>
                <span className="badge badge-emerald">RBAC Verified</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm leading-relaxed font-sans whitespace-pre-line">
              {queryResult.generatedAnswer}
            </div>

            {/* Retrieved Chunks List */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Retrieved Context Chunks ({queryResult.retrievedChunks.length} Authorized)</span>
                <span>Top-K Reranker Scores</span>
              </h4>

              <div className="space-y-2">
                {queryResult.retrievedChunks.map((chunk: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span className="font-semibold text-slate-200">{chunk.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${chunk.classification === 'restricted' ? 'badge-rose' : 'badge-emerald'}`}>
                          {chunk.classification}
                        </span>
                        <span className="font-mono text-cyan-400 font-bold">
                          Score: {(chunk.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">{chunk.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance & RAGAS Telemetry Side Panel */}
          <div className="space-y-6">
            {/* Timing Breakdown */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" /> Latency Breakdown (P95)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Hybrid Retrieval (HNSW+BM25):</span>
                  <span className="font-mono font-semibold text-cyan-300">{queryResult.timing.retrieval} ms</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Cross-Encoder Reranker:</span>
                  <span className="font-mono font-semibold text-amber-300">{queryResult.timing.rerank} ms</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>LLM Token Generation:</span>
                  <span className="font-mono font-semibold text-purple-300">{queryResult.timing.llm} ms</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-center font-bold text-slate-100">
                  <span>Total End-to-End Latency:</span>
                  <span className="font-mono text-emerald-400">{queryResult.timing.total} ms</span>
                </div>
              </div>
            </div>

            {/* RAGAS Quality Scorecard */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> RAGAS Metric Scorecard
              </h3>
              <div className="space-y-3 text-xs">
                <MetricProgress label="Faithfulness / Groundedness" value={queryResult.evalMetrics.faithfulness} color="bg-emerald-500" />
                <MetricProgress label="Context Precision" value={queryResult.evalMetrics.contextPrecision} color="bg-cyan-500" />
                <MetricProgress label="Answer Relevance" value={queryResult.evalMetrics.answerRelevance} color="bg-indigo-500" />
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-semibold text-slate-300">Overall RAGAS Score:</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {(queryResult.evalMetrics.overall * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricProgress = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-slate-300 font-mono">
      <span>{label}</span>
      <span className="font-semibold">{(value * 100).toFixed(0)}%</span>
    </div>
    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${value * 100}%` }} />
    </div>
  </div>
);

declare global {
  interface String {
    lowerCaseWords(): string[];
  }
}
String.prototype.lowerCaseWords = function() {
  return this.toLowerCase().match(/\w+/g) || [];
};
