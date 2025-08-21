import React from 'react';

const Prerequite = () => {
    return (
        <div className="prose prose-invert max-w-none space-y-6">
          <h1>Pre</h1>
          <p>
            Configure header links and logos via configuration.
          </p>
          <h3>Environment</h3>
          <ul>
            <li>REACT_APP_BACKEND_URL for API routing.</li>
            <li>Feature flags via a settings endpoint (future).</li>
          </ul>
        </div>
      );
};

export default Prerequite;