import React from 'react';
import { Cpu, Play, Split, Calculator, ShieldCheck } from 'lucide-react';

export type TabType = 'blueprint' | 'simulator' | 'chunking' | 'calculator' | 'security';

interface NavigationTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'blueprint', label: '1. Architecture Blueprint', icon: Cpu, badge: 'System Flow' },
    { id: 'simulator', label: '2. Live RAG Query Simulator', icon: Play, badge: 'Interactive' },
    { id: 'chunking', label: '3. Parent-Child Chunker', icon: Split, badge: 'Hierarchical' },
    { id: 'calculator', label: '4. Sizing & TCO Estimator', icon: Calculator, badge: 'Capacity' },
    { id: 'security', label: '5. RBAC & RAGAS Quality', icon: ShieldCheck, badge: 'Security' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-slate-900/90 rounded-xl border border-slate-800">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {tab.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
};
