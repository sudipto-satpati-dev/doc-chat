import React from 'react';

export const UsageAnalytics: React.FC = () => {
  return (
    <div className="px-space-xl py-space-lg max-w-[1440px] mx-auto w-full space-y-6 pb-16">
      <div className="space-y-1">
        <h1 className="font-headline-xl text-3xl font-bold text-on-surface tracking-tight">Usage & System Metrics</h1>
        <p className="text-xs text-on-surface-variant">Track query performance, vector search metrics, and embedding costs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs">
          <div className="flex justify-between text-xs text-outline font-mono mb-2">
            <span>Avg Query Latency</span>
            <span className="text-emerald-600 font-semibold">&lt; 1.2s</span>
          </div>
          <div className="text-2xl font-bold text-on-surface">340 ms</div>
          <p className="text-[11px] text-outline mt-1">Similarity search + LLM prompt stream</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs">
          <div className="flex justify-between text-xs text-outline font-mono mb-2">
            <span>Embedding Model</span>
            <span className="text-primary font-semibold">OpenAI</span>
          </div>
          <div className="text-2xl font-bold text-on-surface">text-embedding-3-small</div>
          <p className="text-[11px] text-outline mt-1">1,536 Dimensionality • Cosine distance</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs">
          <div className="flex justify-between text-xs text-outline font-mono mb-2">
            <span>LLM Model</span>
            <span className="text-primary font-semibold">Configured</span>
          </div>
          <div className="text-2xl font-bold text-on-surface">gpt-4o-mini</div>
          <p className="text-[11px] text-outline mt-1">Temperature 0.1 • Strict grounding</p>
        </div>
      </div>
    </div>
  );
};
