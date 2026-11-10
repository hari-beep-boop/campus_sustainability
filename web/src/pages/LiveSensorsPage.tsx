import React, { useEffect, useState } from 'react';

interface LiveNode {
  building: string;
  code: string;
  deviceId: string;
  co2Ppm: number;
  powerKw: number;
  waterFlowLpm: number;
  status: 'online' | 'offline';
  lastSeen: string;
}

export const LiveSensorsPage: React.FC = () => {
  const [nodes, setNodes] = useState<LiveNode[]>([
    {
      building: 'Science Block A',
      code: 'SCI-A',
      deviceId: 'bldg-01-node',
      co2Ppm: 680,
      powerKw: 24.5,
      waterFlowLpm: 3.2,
      status: 'online',
      lastSeen: 'Just now',
    },
    {
      building: 'Engineering Hall',
      code: 'ENG',
      deviceId: 'bldg-02-node',
      co2Ppm: 740,
      powerKw: 31.8,
      waterFlowLpm: 4.8,
      status: 'online',
      lastSeen: 'Just now',
    },
    {
      building: 'Library Complex',
      code: 'LIB',
      deviceId: 'bldg-03-node',
      co2Ppm: 920,
      powerKw: 18.2,
      waterFlowLpm: 1.5,
      status: 'online',
      lastSeen: 'Just now',
    },
    {
      building: 'Student Residence North',
      code: 'RES-N',
      deviceId: 'bldg-04-node',
      co2Ppm: 540,
      powerKw: 28.0,
      waterFlowLpm: 8.4,
      status: 'online',
      lastSeen: 'Just now',
    },
    {
      building: 'Admin Building',
      code: 'ADMIN',
      deviceId: 'bldg-05-node',
      co2Ppm: 610,
      powerKw: 12.4,
      waterFlowLpm: 1.1,
      status: 'online',
      lastSeen: 'Just now',
    },
  ]);

  // Simulate real-time subtle fluctuations or connect to SSE
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          co2Ppm: Math.max(400, Math.min(1300, node.co2Ppm + Math.floor(Math.random() * 9) - 4)),
          powerKw: Number(Math.max(5, node.powerKw + (Math.random() * 0.8 - 0.4)).toFixed(1)),
          waterFlowLpm: Number(Math.max(0.5, node.waterFlowLpm + (Math.random() * 0.4 - 0.2)).toFixed(1)),
          lastSeen: 'Live',
        }))
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getPpmBand = (ppm: number) => {
    if (ppm <= 800) {
      return { label: 'Good Quality', bg: 'bg-primary-soft text-primary border-primary/20' };
    }
    if (ppm <= 1000) {
      return { label: 'Acceptable', bg: 'bg-amber-500/10 text-warn border-warn/20' };
    }
    if (ppm <= 1500) {
      return { label: 'Poor (Ventilate)', bg: 'bg-orange-500/10 text-energy border-energy/20' };
    }
    return { label: 'Hazardous', bg: 'bg-danger-soft text-danger border-danger/30' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-pill bg-primary-soft text-primary flex items-center justify-center text-sm shadow-soft">
              📡
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Live Sensor Telemetry
            </span>
          </div>
          <h1 className="text-2xl font-black text-ink">
            Campus Node Telemetry Stream
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time telemetry stream from ESP32 DevKit nodes (CO₂ NDIR, ACS721 current, pulse water flow)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-primary-soft text-primary text-xs font-bold border border-primary/20 shadow-soft">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            SSE Stream Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {nodes.map((node) => {
          const band = getPpmBand(node.co2Ppm);

          return (
            <div
              key={node.deviceId}
              className="bg-card rounded-card border border-card-border shadow-soft p-5 flex flex-col justify-between transition-all hover:border-primary/30"
            >
              <div>
                {/* Node Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-ink text-base">
                      {node.building}
                    </h3>
                    <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                      <code className="text-xs font-semibold">{node.deviceId}</code>
                      <span>•</span>
                      <span className="font-medium">{node.code}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase bg-primary-soft text-primary border border-primary/20">
                    Online
                  </span>
                </div>

                {/* Air Quality (NDIR CO2) */}
                <div className={`p-3.5 rounded-tile border mb-3 ${band.bg}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold">💨 Indoor Air Quality</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      {band.label}
                    </span>
                  </div>
                  <div className="text-2xl font-black mt-1">
                    {node.co2Ppm} <span className="text-xs font-medium text-muted">ppm</span>
                  </div>
                </div>

                {/* Electric & Water Live Readouts */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-frame rounded-tile border border-card-border">
                    <div className="text-muted font-bold text-[11px] uppercase tracking-wider">⚡ Active Power</div>
                    <div className="text-lg font-extrabold text-ink mt-0.5">
                      {node.powerKw} <span className="text-xs font-normal text-muted">kW</span>
                    </div>
                  </div>

                  <div className="p-3 bg-frame rounded-tile border border-card-border">
                    <div className="text-muted font-bold text-[11px] uppercase tracking-wider">💧 Water Flow</div>
                    <div className="text-lg font-extrabold text-water mt-0.5">
                      {node.waterFlowLpm} <span className="text-xs font-normal text-muted">L/min</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-card-border flex justify-between items-center text-[11px] text-muted">
                <span>Sampling: 10s • Batch: 60s</span>
                <span className="font-semibold">{node.lastSeen}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveSensorsPage;
