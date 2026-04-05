import React from 'react';

const ModulePageHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-8">
    <h1 className="text-2xl font-bold text-[#7a0f1a]">{title}</h1>
    {subtitle ? <p className="mt-1 text-gray-600">{subtitle}</p> : null}
  </div>
);

export default ModulePageHeader;
