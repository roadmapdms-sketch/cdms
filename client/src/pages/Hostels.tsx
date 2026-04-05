import React, { useState } from 'react';
import ModulePageHeader from '../components/ModulePageHeader';

/** Hostel beds / dormitory management — occupancy UI scaffold. */
const Hostels: React.FC = () => {
  const [filter, setFilter] = useState('all');

  return (
    <div>
      <ModulePageHeader
        title="Hostels"
        subtitle="Beds, blocks, check-in/out, and maintenance for hostel facilities."
      />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <select className="input max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All blocks</option>
          <option value="a">Block A</option>
          <option value="b">Block B</option>
        </select>
        <button type="button" className="btn btn-primary btn-md">
          New reservation
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Total beds', v: '—' },
          { label: 'Occupied', v: '—' },
          { label: 'Available', v: '—' },
          { label: 'Maintenance', v: '—' },
        ].map((x) => (
          <div key={x.label} className="card p-4">
            <p className="text-sm text-gray-500">{x.label}</p>
            <p className="text-2xl font-semibold text-[#7a0f1a]">{x.v}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-[#eeedee] px-6 py-3 text-sm font-medium">Room grid</div>
        <div className="p-8 text-center text-gray-500 text-sm">
          Filter: <span className="font-medium text-gray-700">{filter}</span>. Connect{' '}
          <code className="rounded bg-gray-100 px-1">/api/hostels</code> for live occupancy and reservations.
        </div>
      </div>
    </div>
  );
};

export default Hostels;
