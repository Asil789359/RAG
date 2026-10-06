import React from 'react';
import { Database, ShieldCheck, Zap, Layers, FileText } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="glass-panel p-6 mb-8 border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl shadow-lg shadow-cyan-500/20">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight gradient-text-cyan">
                Enterprise RAG Architecture Explorer
              </h1>
              <span className="badge badge-cyan">100,000 Docs SLA</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Production Architecture, Parent-Child Hybrid Retrieval, RBAC Pre-Filtering & RAGAS Evaluator
            </p>
          </div>
        </div>

        {/* SLA Pill Indicators */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">P95 Latency:</span>
            <span className="font-semibold text-cyan-300">&lt; 1,200 ms</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Groundedness:</span>
            <span className="font-semibold text-emerald-300">&gt; 96%</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="text-slate-400">Total Vectors:</span>
            <span className="font-semibold text-purple-300">~1.2M Chunks</span>
          </div>
        </div>
      </div>
    </header>
  );
};
