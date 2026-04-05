import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ModulePageHeader from '../components/ModulePageHeader';

const SLOTS = ['6–8 AM', '8–10 AM', '10–12 PM', '12–2 PM', '2–4 PM', '4–6 PM', '6–8 PM'];

/** Prayer line / telephone prayer coverage — scheduling UI; API TBD. */
const PrayersLine: React.FC = () => {
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10));

  return (
    <div>
      <ModulePageHeader
        title="Prayer line"
        subtitle="Coordinate prayer warriors, time slots, and call-in coverage."
      />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Schedule date</label>
          <input type="date" className="input" value={day} onChange={(e) => setDay(e.target.value)} />
          <p className="mt-1 text-xs text-gray-500">Showing slots for {day}</p>
        </div>
        <Link to="/pastoral-care" className="text-sm font-medium text-[#7a0f1a] hover:text-[#e7b123]">
          Open pastoral care →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#7a0f1a]">Today&apos;s slots</h2>
          <ul className="space-y-2">
            {SLOTS.map((slot) => (
              <li
                key={slot}
                className="flex items-center justify-between rounded-md border border-[#eeedee] px-3 py-2 text-sm"
              >
                <span className="font-medium text-gray-800">{slot}</span>
                <span className="text-gray-400">Unassigned</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#7a0f1a]">Quick actions</h2>
          <div className="flex flex-col gap-2">
            <button type="button" className="btn btn-primary btn-md w-full sm:w-auto">
              Assign intercessor
            </button>
            <button type="button" className="btn btn-secondary btn-md w-full sm:w-auto">
              Export schedule
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Persist slots and assignments via a future <code className="rounded bg-gray-100 px-1 text-xs">/api/prayer-line</code>{' '}
            module.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrayersLine;
