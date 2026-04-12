import React from 'react';
import { useBackendStatus } from '../hooks/useBackendStatus';

export default function BackendStatus() {
  const { status, latency } = useBackendStatus();

  return (
    <div className={`backend-status ${status}`}>
      <span className={`status-dot ${status}`} />
      {status === 'online' && (
        <span>{latency != null ? `${latency}ms` : 'Online'}</span>
      )}
      {status === 'offline' && <span>Backend offline</span>}
      {status === 'checking' && <span>Connecting...</span>}
    </div>
  );
}
