import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useBackendStatus() {
  const [status, setStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [latency, setLatency] = useState(null);

  const check = useCallback(async () => {
    const t0 = Date.now();
    try {
      await axios.get('/api/health', { timeout: 3000 });
      setLatency(Date.now() - t0);
      setStatus('online');
    } catch {
      setStatus('offline');
      setLatency(null);
    }
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, [check]);

  return { status, latency };
}
