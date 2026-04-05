import React from 'react';
import { Link } from 'react-router-dom';
import ModulePageHeader from '../components/ModulePageHeader';

/** Strategic budget planning workflow — complements operational Budget module. */
const BudgetPlanning: React.FC = () => {
  const phases = [
    { step: 1, title: 'Ministry intake', desc: 'Department heads submit draft needs.' },
    { step: 2, title: 'Alignment', desc: 'Leadership reviews priorities vs vision.' },
    { step: 3, title: 'Forecast', desc: 'Project income, expenses, and reserves.' },
    { step: 4, title: 'Approval', desc: 'Board / eldership sign-off.' },
    { step: 5, title: 'Load into budget', desc: 'Publish approved lines to the live budget module.' },
  ];

  return (
    <div>
      <ModulePageHeader
        title="Budget planning"
        subtitle="Annual and multi-year planning before numbers are locked into the operational budget."
      />

      <div className="mb-8 flex flex-wrap gap-3">
        <Link to="/budget" className="btn btn-primary btn-md">
          Open live budget module
        </Link>
        <Link to="/reports" className="btn btn-secondary btn-md">
          Financial reports
        </Link>
      </div>

      <div className="space-y-4">
        {phases.map((p) => (
          <div key={p.step} className="card flex gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e7b123]/20 text-sm font-bold text-[#7a0f1a]">
              {p.step}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{p.title}</h3>
              <p className="text-sm text-gray-600">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card p-6">
        <h2 className="mb-2 text-lg font-semibold text-[#7a0f1a]">Next step</h2>
        <p className="text-sm text-gray-600">
          Wire forms and approvals to your database (e.g. Prisma models for planning cycles and draft line items), then
          surface status on this page.
        </p>
      </div>
    </div>
  );
};

export default BudgetPlanning;
