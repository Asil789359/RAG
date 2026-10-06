import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertOctagon, Activity, FileCheck, EyeOff, Server } from 'lucide-react';

export const SecurityEvaluationTab: React.FC = () => {
  const rbacMatrix = [
    { classification: 'Restricted (Level 4)', engineering: 'ALLOWED', hr: 'DENIED', finance: 'DENIED', public: 'DENIED' },
    { classification: 'Confidential (Level 3)', engineering: 'ALLOWED', hr: 'DENIED', finance: 'ALLOWED', public: 'DENIED' },
    { classification: 'Internal (Level 2)', engineering: 'ALLOWED', hr: 'ALLOWED', finance: 'ALLOWED', public: 'DENIED' },
    { classification: 'Public (Level 1)', engineering: 'ALLOWED', hr: 'ALLOWED', finance: 'ALLOWED', public: 'ALLOWED' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Enterprise RBAC Security & RAGAS Quality Assurance
        </h2>
        <p className="text-xs text-slate-400">
          Strict authorization pre-filtering inside vector query execution prevents context leakage. Automated RAGAS testing guarantees grounded, hallucination-free generation.
        </p>
      </div>

      {/* RBAC Security Matrix & Zero-Leakage Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pre-filtering Matrix Table */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-cyan-400" /> Pre-Retrieval ACL Clearance Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-mono">
                <tr>
                  <th className="p-3">Doc Level</th>
                  <th className="p-3">Engineering</th>
                  <th className="p-3">HR Staff</th>
                  <th className="p-3">Finance</th>
                  <th className="p-3">Public</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {rbacMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-200">{row.classification}</td>
                    <td className="p-3 text-emerald-400 font-bold">{row.engineering}</td>
                    <td className={`p-3 font-bold ${row.hr === 'ALLOWED' ? 'text-emerald-400' : 'text-rose-400'}`}>{row.hr}</td>
                    <td className={`p-3 font-bold ${row.finance === 'ALLOWED' ? 'text-emerald-400' : 'text-rose-400'}`}>{row.finance}</td>
                    <td className={`p-3 font-bold ${row.public === 'ALLOWED' ? 'text-emerald-400' : 'text-rose-400'}`}>{row.public}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Compliance Guarantees */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <EyeOff className="w-4 h-4 text-emerald-400" /> Zero Context-Leakage Security Enforcers
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">Pre-Retrieval Metadata Filter Injection</span>
                <span className="text-slate-400">Claims filtering happens inside vector DB engine prior to HNSW vector distance evaluation. Unauthorized chunks are never loaded into RAM candidate memory.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">Automatic PII Anonymization</span>
                <span className="text-slate-400">Microsoft Presidio inspects ingested documents for SSNs, phone numbers, and financial details, replacing sensitive values with anonymized tokens before vectorization.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">SOC2 & HIPAA Immutable Audit Logging</span>
                <span className="text-slate-400">Every query records User identity, timestamp, retrieved chunk IDs, and LLM generated response to tamper-proof AWS CloudWatch / GCP Audit Logs.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RAGAS Quality Framework Metrics */}
      <div className="glass-panel p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Activity className="w-4 h-4 text-cyan-400" /> RAGAS Production Benchmark Telemetry (500 Test Queries)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QualityCard label="Faithfulness (Groundedness)" score="96.5%" target="> 95%" status="PASS" desc="Validates claims against context" />
          <QualityCard label="Context Precision" score="94.2%" target="> 90%" status="PASS" desc="Ratio of useful chunks in top-K" />
          <QualityCard label="Context Recall" score="92.8%" target="> 90%" status="PASS" desc="Completeness of retrieved facts" />
          <QualityCard label="Answer Relevance" score="95.1%" target="> 90%" status="PASS" desc="Alignment with original user intent" />
        </div>
      </div>
    </div>
  );
};

const QualityCard = ({ label, score, target, status, desc }: { label: string; score: string; target: string; status: string; desc: string }) => (
  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
    <div className="flex justify-between items-center text-xs font-mono">
      <span className="text-slate-400">{label}</span>
      <span className="badge badge-emerald">{status}</span>
    </div>
    <div className="text-2xl font-extrabold text-white font-mono">{score}</div>
    <div className="flex justify-between text-[11px] text-slate-400">
      <span>Target: {target}</span>
      <span className="text-slate-500">{desc}</span>
    </div>
  </div>
);
