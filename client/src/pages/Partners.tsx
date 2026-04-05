import React from 'react';
import ModulePageHeader from '../components/ModulePageHeader';

/** Covenant / ministry partners — UI ready; connect to `/api/partners` when available. */
const Partners: React.FC = () => {
  return (
    <div>
      <ModulePageHeader
        title="Partners"
        subtitle="Track covenant partners, organizations, and strategic ministry relationships."
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <input type="search" name="partnerSearch" className="input max-w-md" placeholder="Search partners…" />
        <button type="button" className="btn btn-primary btn-md shrink-0">
          Add partner
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        {[
          { label: 'Active partners', value: '—' },
          { label: 'Renewals due (90d)', value: '—' },
          { label: 'Organizations', value: '—' },
        ].map((c) => (
          <div key={c.label} className="card p-4">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-semibold text-[#7a0f1a]">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-[#eeedee] px-6 py-3 text-sm font-medium text-gray-700">Partner directory</div>
        <div className="p-8 text-center text-gray-500">
          <p className="mb-2">No partner records loaded yet.</p>
          <p className="text-sm">
            Backend route <code className="rounded bg-gray-100 px-1 text-xs">GET /api/partners</code> can be added to
            list and manage partners from this screen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Partners;
