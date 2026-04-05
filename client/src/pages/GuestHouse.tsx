import React, { useState } from 'react';
import ModulePageHeader from '../components/ModulePageHeader';

/** Guest house bookings — nightly stays, housekeeping, billing hooks. */
const GuestHouse: React.FC = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  return (
    <div>
      <ModulePageHeader
        title="Guest house"
        subtitle="Reservations, housekeeping status, and guest services."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Check-in from</label>
          <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Check-out to</label>
          <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button type="button" className="btn btn-primary btn-md w-full md:w-auto">
            Search availability
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: 'Rooms', v: '—' },
          { label: 'Tonight booked', v: '—' },
          { label: 'Arrivals today', v: '—' },
        ].map((x) => (
          <div key={x.label} className="card p-4">
            <p className="text-sm text-gray-500">{x.label}</p>
            <p className="text-2xl font-semibold text-[#7a0f1a]">{x.v}</p>
          </div>
        ))}
      </div>

      <div className="card p-8 text-center text-gray-500 text-sm">
        {from && to ? (
          <p className="mb-2 text-gray-700">
            Selected range: {from} → {to}
          </p>
        ) : null}
        Booking calendar and folios can be backed by <code className="rounded bg-gray-100 px-1">/api/guest-house</code>.
      </div>
    </div>
  );
};

export default GuestHouse;
