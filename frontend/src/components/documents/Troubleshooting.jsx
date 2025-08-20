import React from 'react';

const Troubleshooting = () => {
  return (
    <div className="prose prose-invert max-w-none space-y-6">
      <h1>Troubleshooting</h1>
      <p>Check browser console and supervisor logs for diagnostics.</p>
      <ul>
        <li>Frontend logs via the browser devtools.</li>
        <li>Backend logs at /var/log/supervisor/backend.*.log</li>
      </ul>
    </div>
  );
};

export default Troubleshooting;
