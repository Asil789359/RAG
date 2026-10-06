import React, { useState } from 'react';
import { Header } from './components/Header';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { ArchitectureTab } from './components/ArchitectureTab';
import { SimulatorTab } from './components/SimulatorTab';
import { ChunkingTab } from './components/ChunkingTab';
import { CalculatorTab } from './components/CalculatorTab';
import { SecurityEvaluationTab } from './components/SecurityEvaluationTab';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('blueprint');

  return (
    <div className="min-h-screen pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Bar */}
      <Header />

      {/* Navigation Tab Bar */}
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Dynamic Tab Content Views */}
      <main className="transition-all duration-300">
        {activeTab === 'blueprint' && <ArchitectureTab />}
        {activeTab === 'simulator' && <SimulatorTab />}
        {activeTab === 'chunking' && <ChunkingTab />}
        {activeTab === 'calculator' && <CalculatorTab />}
        {activeTab === 'security' && <SecurityEvaluationTab />}
      </main>

      {/* Footer */}
      <footer className="mt-16 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
        Enterprise RAG System Architecture Spec & Interactive Explorer • Designed for 100,000 Documents (~400M Tokens)
      </footer>
    </div>
  );
}

export default App;
