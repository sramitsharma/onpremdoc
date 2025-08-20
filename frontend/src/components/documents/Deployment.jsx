import React from 'react';

const Deployment = () => {
  return (
    <div className="prose prose-invert max-w-none space-y-6">
      <h1>Deployment</h1>
      <p>
        For on-prem, ensure environment variables are set and static assets are
        served via your ingress. The backend should expose /api-prefixed routes.
      </p>
    </div>
  );
};

export default Deployment;
