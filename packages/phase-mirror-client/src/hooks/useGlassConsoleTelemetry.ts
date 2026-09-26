import { useState, useEffect } from 'react';

export interface TelemetryEvent {
  stepId: number;
  hash: string;
  status: 'CERTIFIED' | 'REJECTED' | 'FROZEN';
  slopeUb: number;
  reason?: string;
  timestamp: number;
}

export function useGlassConsoleTelemetry(url: string = 'ws://127.0.0.1:8080/ws') {
  const [telemetryStream, setTelemetryStream] = useState<TelemetryEvent[]>([]);
  const [systemState, setSystemState] = useState<'EXECUTION' | 'STANDBY' | 'SIG_GOV_KILL'>('EXECUTION');
  const [globalSlope, setGlobalSlope] = useState<number>(0.5);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      try {
        const data: TelemetryEvent = JSON.parse(event.data);
        setGlobalSlope(data.slopeUb);
        
        if (data.status === 'REJECTED' || data.status === 'FROZEN') {
          setSystemState('SIG_GOV_KILL');
        } else {
          setSystemState('EXECUTION');
        }

        setTelemetryStream((prev) => [data, ...prev.slice(0, 99)]); // Keep last 100 logs
      } catch (err) {
        console.error('Failed to parse telemetry stream packet:', err);
      }
    };

    ws.onerror = () => {
      setSystemState('SIG_GOV_KILL');
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return { telemetryStream, systemState, globalSlope };
}
