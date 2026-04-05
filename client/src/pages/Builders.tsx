import React, { useState } from 'react';
import ModulePageHeader from '../components/ModulePageHeader';

/** Builders / capital campaign tracking — UI scaffold. */
const Builders: React.FC = () => {
  const [tab, setTab] = useState<'cohorts' | 'pledges'>('cohorts');

  return (
    <div>
      <ModulePageHeader
        title="Builders"
        subtitle="Capital campaigns, pledge phases, and builder cohorts."
      />

      <div className="mb-6 border-b border-[#eeedee]">
        <nav className="flex gap-4">
          {(['cohorts', 'pledges'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`border-b-2 px-1 py-2 text-sm font-medium capitalize ${
                tab === t ? 'border-[#e7b123] text-[#7a0f1a]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        {[
          { label: 'Active campaigns', value: '—' },
          { label: 'Total pledged', value: '—' },
          { label: '% to goal', value: '—' },
        ].map((c) => (
          <div key={c.label} className="card p-4">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-semibold text-[#7a0f1a]">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-8 text-center text-gray-500">
        <p className="mb-2">
          Viewing <span className="font-medium text-gray-700">{tab}</span> — data will load from the API when connected.
        </p>
        <p className="text-sm">
          Suggested endpoint: <code className="rounded bg-gray-100 px-1 text-xs">/api/builders</code>
        </p>
      </div>
    </div>
  );
};

export default Builders;
