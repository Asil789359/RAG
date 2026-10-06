import React, { useState } from 'react';
import { Calculator, HardDrive, Cpu, DollarSign, Server, Layers, MemoryStick as Memory } from 'lucide-react';

export const CalculatorTab: React.FC = () => {
  const [docCount, setDocCount] = useState<number>(100000);
  const [avgPages, setAvgPages] = useState<number>(5);
  const [dailyQueries, setDailyQueries] = useState<number>(10000);
  const [llmChoice, setLlmChoice] = useState<'flash' | 'gpt4o' | 'claude'>('flash');
  const [useQuantization, setUseQuantization] = useState<boolean>(true);

  // Math sizing computations
  const totalPages = docCount * avgPages;
  const totalTokens = totalPages * 500; // ~500 tokens/page
  const totalChildChunks = Math.round(totalTokens / 350); // ~350 tokens active child chunk
  const totalParentChunks = Math.round(totalTokens / 1600); // ~1600 tokens active parent chunk

  // Vector RAM (1536d float32 = 6144 bytes per vector)
  const rawVectorBytes = totalChildChunks * 1536 * 4;
  const hnswOverheadBytes = rawVectorBytes * 1.5;
  const rawRamGb = hnswOverheadBytes / (1024 * 1024 * 1024);
  
  // SQ8 Quantization cuts RAM by ~70%
  const effectiveRamGb = useQuantization ? rawRamGb * 0.35 : rawRamGb;
  
  // Recommended Nodes (16GB RAM each, 75% max utilization)
  const nodesNeeded = Math.max(2, Math.ceil(effectiveRamGb / 12));

  // Storage calculation (Payload + BM25 index)
  const storageGb = Math.round((totalTokens * 0.0000002) + (docCount * 0.0003));

  // Costs
  const monthlyQueries = dailyQueries * 30;
  
  // Model rates per 1M tokens (avg input 3k, output 500)
  const modelRates = {
    flash: { input: 0.15, output: 0.60, name: 'Gemini 1.5 Flash' },
    gpt4o: { input: 0.15, output: 0.60, name: 'GPT-4o-mini' },
    claude: { input: 3.00, output: 15.00, name: 'Claude 3.5 Sonnet' }
  };
  const rate = modelRates[llmChoice];
  
  const monthlyLlmTokensInput = (monthlyQueries * 3000) / 1000000;
  const monthlyLlmTokensOutput = (monthlyQueries * 500) / 1000000;
  const monthlyLlmCost = (monthlyLlmTokensInput * rate.input) + (monthlyLlmTokensOutput * rate.output);

  const monthlyVectorHostCost = nodesNeeded * 90; // $90 per 16GB node/mo
  const monthlyEmbeddingCost = (docCount * 0.05 * 0.1) + ((monthlyQueries * 500 / 1000000) * 0.13); // $0.13/1M tokens
  const monthlyRerankCost = (monthlyQueries / 1000) * 1.0; // $1 per 1k reranks
  const monthlyStorageCost = storageGb * 0.15; // $0.15/GB NVMe

  const totalMonthlyCost = monthlyVectorHostCost + monthlyLlmCost + monthlyEmbeddingCost + monthlyRerankCost + monthlyStorageCost;

  return (
    <div className="space-y-8">
      {/* Interactive Controls & Parameters */}
      <div className="glass-panel p-6 space-y-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-cyan-400" />
          Enterprise Capacity & TCO Cost Estimator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Document Count */}
          <div className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-slate-400">Knowledge Base Docs</span>
              <span className="font-mono font-bold text-cyan-300">{docCount.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="500000"
              step="10000"
              value={docCount}
              onChange={(e) => setDocCount(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Pages per Doc */}
          <div className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-slate-400">Avg Pages / Doc</span>
              <span className="font-mono font-bold text-indigo-300">{avgPages} Pages</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={avgPages}
              onChange={(e) => setAvgPages(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Daily Queries */}
          <div className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-slate-400">Daily User Queries</span>
              <span className="font-mono font-bold text-amber-300">{dailyQueries.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="5000"
              value={dailyQueries}
              onChange={(e) => setDailyQueries(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <label className="text-xs font-mono text-slate-400 block">LLM Inference Model</label>
            <select
              value={llmChoice}
              onChange={(e) => setLlmChoice(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-medium focus:outline-none"
            >
              <option value="flash">Gemini 1.5 Flash ($0.15/1M)</option>
              <option value="gpt4o">GPT-4o-mini ($0.15/1M)</option>
              <option value="claude">Claude 3.5 Sonnet ($3.00/1M)</option>
            </select>
          </div>
        </div>

        {/* Quantization Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <Memory className="w-5 h-5 text-purple-400" />
            <div>
              <span className="text-sm font-semibold text-slate-200">Scalar Quantization (SQ8) Vector Compression</span>
              <p className="text-xs text-slate-400">Reduces RAM footprint by 70% with 99%+ cosine precision retention</p>
            </div>
          </div>
          <button
            onClick={() => setUseQuantization(!useQuantization)}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
              useQuantization
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {useQuantization ? 'SQ8 ENABLED (3.5x Savings)' : 'FLOAT32 RAW'}
          </button>
        </div>
      </div>

      {/* Sizing & Cost Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Capacity Sizing Metrics */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-cyan-400" /> Vector & Document Sizing
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Total Child Vectors:</span>
              <span className="font-mono font-semibold text-cyan-300">{totalChildChunks.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Total Parent Contexts:</span>
              <span className="font-mono font-semibold text-indigo-300">{totalParentChunks.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Total Corpus Tokens:</span>
              <span className="font-mono font-semibold text-purple-300">{(totalTokens / 1000000).toFixed(1)}M Tokens</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>NVMe Document Storage:</span>
              <span className="font-mono font-semibold text-emerald-300">{storageGb} GB</span>
            </div>
          </div>
        </div>

        {/* Hardware Infrastructure Footprint */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Server className="w-4 h-4 text-purple-400" /> Cluster Infrastructure
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Required Vector RAM:</span>
              <span className="font-mono font-semibold text-purple-300">{effectiveRamGb.toFixed(2)} GB</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>HNSW Vector Nodes (16GB):</span>
              <span className="font-mono font-semibold text-cyan-300">{nodesNeeded} Nodes (HA Cluster)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Primary Vector DB:</span>
              <span className="font-mono font-semibold text-slate-200">Qdrant Enterprise / Milvus</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Inverted Search Engine:</span>
              <span className="font-mono font-semibold text-slate-200">OpenSearch (BM25)</span>
            </div>
          </div>
        </div>

        {/* Monthly Cost Breakdown */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Estimated Monthly Cost
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Vector DB Hosting ({nodesNeeded} nodes):</span>
              <span className="font-mono font-semibold text-slate-200">${monthlyVectorHostCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>LLM Generation ({rate.name}):</span>
              <span className="font-mono font-semibold text-slate-200">${monthlyLlmCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Cohere Cross-Encoder Rerank:</span>
              <span className="font-mono font-semibold text-slate-200">${monthlyRerankCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Embedding & Storage:</span>
              <span className="font-mono font-semibold text-slate-200">${(monthlyEmbeddingCost + monthlyStorageCost).toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-slate-100">
              <span>Total Estimated TCO:</span>
              <span className="font-mono text-emerald-400">${totalMonthlyCost.toFixed(2)} / mo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
