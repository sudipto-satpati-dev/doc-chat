import React from 'react';

interface WelcomeStateProps {
  onInsertPrompt: (promptText: string) => void;
  totalFiles: number;
}

export const WelcomeState: React.FC<WelcomeStateProps> = ({ onInsertPrompt, totalFiles }) => {
  return (
    <div className="relative w-full min-h-[calc(100vh-8rem)] flex flex-col justify-between overflow-hidden">
      {/* Background glowing gradient accents */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-primary-fixed/35 via-surface-container/20 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-tertiary-fixed/20 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-secondary-fixed/20 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-32 flex flex-col items-center text-center">
        {/* Knowledge Connection Pill */}
        <div className="inline-flex items-center gap-2 bg-surface-container-low px-4 py-1 rounded-full shadow-sm mb-6 transition-transform hover:scale-[1.01]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium tracking-wide">
            Connected to: <strong className="text-on-surface font-semibold">Corpus Knowledge Base</strong>
          </span>
          <span className="font-mono text-xs text-primary bg-primary-fixed/60 px-2 py-0.5 rounded ml-1 font-medium">
            {totalFiles} indexed file{totalFiles !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Hero Logo & Icon */}
        <div className="relative mb-6 group cursor-default">
          <div className="w-20 h-20 rounded-2xl bg-surface-container-lowest p-3 shadow-lg border border-outline-variant/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <img src="/corpus_logo.png" alt="Corpus Logo" className="w-full h-full object-contain" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-on-primary shadow-md flex items-center justify-center">
            <span className="material-symbols-outlined text-[15px]">description</span>
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="font-headline-xl text-3xl md:text-4xl font-bold text-on-surface tracking-tight max-w-2xl mb-2">
          Ask anything about your documents
        </h1>
        <p className="font-body-lg text-base text-on-surface-variant max-w-lg mb-8">
          Corpus answers using only what’s in your uploaded PDFs and shows you exactly where each citation came from.
        </p>

        {/* Prompt Suggestion Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
          <button
            onClick={() => onInsertPrompt('What is our standard refund policy according to Section 4.2?')}
            className="group relative bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between text-left cursor-pointer"
            type="button"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </span>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[18px]">
                  arrow_outward
                </span>
              </div>
              <p className="font-semibold text-on-surface pt-1 group-hover:text-primary transition-colors line-clamp-2">
                What is our standard refund policy?
              </p>
              <p className="text-xs text-on-surface-variant line-clamp-2">
                Check Section 4.2 clause & SLA refund conditions for enterprise customers.
              </p>
            </div>
            <div className="pt-3 mt-3 flex items-center gap-1">
              <span className="font-mono text-[11px] bg-surface-container px-2 py-0.5 rounded text-outline group-hover:text-on-surface">
                Master_Agreement.pdf
              </span>
            </div>
          </button>

          <button
            onClick={() => onInsertPrompt('Summarize the onboarding guide timeline and key 30-60-90 day milestones.')}
            className="group relative bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between text-left cursor-pointer"
            type="button"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </span>
                <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors text-[18px]">
                  arrow_outward
                </span>
              </div>
              <p className="font-semibold text-on-surface pt-1 group-hover:text-secondary transition-colors line-clamp-2">
                Summarize onboarding timeline
              </p>
              <p className="text-xs text-on-surface-variant line-clamp-2">
                Key milestones, setup checklists, & 30-60-90 day team trajectory.
              </p>
            </div>
            <div className="pt-3 mt-3 flex items-center gap-1">
              <span className="font-mono text-[11px] bg-surface-container px-2 py-0.5 rounded text-outline group-hover:text-on-surface">
                Onboarding_Guide.pdf
              </span>
            </div>
          </button>

          <button
            onClick={() => onInsertPrompt('What are the key technical recommendations for chunk size and overlap?')}
            className="group relative bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between text-left cursor-pointer"
            type="button"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">grain</span>
                </span>
                <span className="material-symbols-outlined text-outline group-hover:text-tertiary transition-colors text-[18px]">
                  arrow_outward
                </span>
              </div>
              <p className="font-semibold text-on-surface pt-1 group-hover:text-tertiary transition-colors line-clamp-2">
                Chunk size & vector settings
              </p>
              <p className="text-xs text-on-surface-variant line-clamp-2">
                Recommended token count, overlap settings, and indexing parameters.
              </p>
            </div>
            <div className="pt-3 mt-3 flex items-center gap-1">
              <span className="font-mono text-[11px] bg-surface-container px-2 py-0.5 rounded text-outline group-hover:text-on-surface">
                Technical_Docs.pdf
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
