import React from 'react';
import { DataPanel } from './RoleDashboardLayout';

export interface UpcomingEventRow {
  id: string;
  title: string;
  startDate: string;
  type?: string;
  status?: string;
}

export function UpcomingEventsPanel({ events }: { events: UpcomingEventRow[] | undefined }) {
  const list = events ?? [];
  return (
    <DataPanel title="Upcoming events">
      {list.length === 0 ? (
        <p className="text-sm text-zinc-500">No upcoming events in the system yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {list.map((e) => (
            <li key={e.id} className="flex flex-wrap items-start justify-between gap-2 py-3 first:pt-0">
              <div>
                <p className="font-medium text-[#f0e6c8]">{e.title}</p>
                <p className="text-xs text-zinc-500">
                  {e.type ? `${e.type} · ` : ''}
                  {e.status ?? ''}
                </p>
              </div>
              <p className="shrink-0 text-sm tabular-nums text-zinc-400">
                {new Date(e.startDate).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DataPanel>
  );
}
