import React, { useState } from 'react';
import { Split, FileText, Layers, Tag, HelpCircle } from 'lucide-react';

export const ChunkingTab: React.FC = () => {
  const [parentTokens, setParentTokens] = useState<number>(2048);
  const [childTokens, setChildTokens] = useState<number>(512);
  const [overlapTokens, setOverlapTokens] = useState<number>(64);
  const [sampleText, setSampleText] = useState<string>(
    `# Global Data Security & Compliance Policy 2026\n\n` +
    `## 1. Zero Trust Access Control Requirements\n` +
    `All employee system access must be validated under a strict Zero Trust Architecture. Multi-Factor Authentication (MFA) with FIPS 140-3 hardware security tokens is strictly mandated for all engineers accessing production Kubernetes databases (prod-db-cluster-01).\n\n` +
    `## 2. PII Anonymization & Data Masking\n` +
    `Customer Personally Identifiable Information (PII) including Social Security Numbers, Credit Card details, and primary phone numbers must be automatically anonymized using Microsoft Presidio prior to vector embedding generation. Unencrypted PII storage in vector payloads is strictly prohibited.\n\n` +
    `## 3. Financial Expense Limits\n` +
    `Business travel expenses exceeding $1,500 USD require prior written authorization from a department Vice President. Submissions must be uploaded to the Enterprise Portal within 30 days of trip completion.`
  );

  const calculateChunks = () => {
    const words = sampleText.split(/\s+/);
    const parentWordCount = Math.max(20, Math.floor(parentTokens / 4));
    const childWordCount = Math.max(10, Math.floor(childTokens / 4));
    const overlapWordCount = Math.floor(overlapTokens / 4);

    const parents: any[] = [];
    const children: any[] = [];

    let pIndex = 0;
    for (let i = 0; i < words.length; i += parentWordCount) {
      const parentWords = words.slice(i, i + parentWordCount);
      const parentId = `parent_doc_2026_${pIndex}`;
      const parentText = parentWords.join(' ');

      parents.push({
        id: parentId,
        wordCount: parentWords.length,
        estimatedTokens: parentWords.length * 4,
        text: parentText
      });

      let cIndex = 0;
      for (let j = 0; j < parentWords.length; j += (childWordCount - overlapWordCount)) {
        const childWords = parentWords.slice(j, j + childWordCount);
        if (childWords.length === 0) continue;
        const childId = `child_doc_2026_${pIndex}_${cIndex}`;

        children.push({
          id: childId,
          parentId: parentId,
          wordCount: childWords.length,
          estimatedTokens: childWords.length * 4,
          text: childWords.join(' ')
        });
        cIndex++;
      }
      pIndex++;
    }

    return { parents, children };
  };

  const { parents, children } = calculateChunks();

  return (
    <div className="space-y-8">
      {/* Top Header & Slider Controls */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Split className="w-5 h-5 text-cyan-400" />
              Parent-Child Hierarchical Chunker Playground
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Visualize how parent context windows (for LLM) and child vectors (for similarity search) are linked.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge badge-indigo">{parents.length} Parent Contexts</span>
            <span className="badge badge-cyan">{children.length} Child Vectors</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Parent Token Slider */}
          <div className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-slate-300 font-semibold">Parent Size (LLM Context)</span>
              <span className="font-mono font-bold text-indigo-400">{parentTokens} Tokens</span>
            </div>
            <input
              type="range"
              min="512"
              max="4096"
              step="256"
              value={parentTokens}
              onChange={(e) => setParentTokens(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-[11px] text-slate-500 block">Retrieved during response generation</span>
          </div>

          {/* Child Token Slider */}
          <div className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-slate-300 font-semibold">Child Size (Vector Index)</span>
              <span className="font-mono font-bold text-cyan-400">{childTokens} Tokens</span>
            </div>
            <input
              type="range"
              min="128"
              max="1024"
              step="64"
              value={childTokens}
              onChange={(e) => setChildTokens(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-[11px] text-slate-500 block">Indexed in Qdrant HNSW Vector DB</span>
          </div>

          {/* Overlap Token Slider */}
          <div className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-slate-300 font-semibold">Child Overlap Window</span>
              <span className="font-mono font-bold text-amber-400">{overlapTokens} Tokens</span>
            </div>
            <input
              type="range"
              min="0"
              max="256"
              step="32"
              value={overlapTokens}
              onChange={(e) => setOverlapTokens(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-[11px] text-slate-500 block">Prevents boundary text clipping</span>
          </div>
        </div>

        {/* Input Text Box */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">Sample Markdown Document Text</label>
          <textarea
            rows={4}
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Visual Chunk Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parent Chunks View */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-indigo-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Parent Chunks ({parents.length})
            </span>
            <span className="text-xs font-mono text-slate-400">LLM Generation Payload</span>
          </h3>

          <div className="space-y-3">
            {parents.map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-semibold text-indigo-300">{p.id}</span>
                  <span className="badge badge-purple">{p.estimatedTokens} Tokens</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Child Chunks View */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-cyan-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" /> Child Chunks ({children.length})
            </span>
            <span className="text-xs font-mono text-slate-400">Indexed for Vector Search</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {children.map((c, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-cyan-300">{c.id}</span>
                    <span className="text-[10px] text-slate-400 font-mono">↗ {c.parentId}</span>
                  </div>
                  <span className="badge badge-cyan">{c.estimatedTokens} Tokens</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
