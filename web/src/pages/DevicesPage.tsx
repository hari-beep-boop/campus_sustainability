import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export const DevicesPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // New device form state
  const [deviceId, setDeviceId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [label, setLabel] = useState('');
  const [registeredKey, setRegisteredKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [devRes, bldRes] = await Promise.all([
        client.get('/devices'),
        client.get('/buildings'),
      ]);
      setDevices(devRes.data?.devices || []);
      setBuildings(bldRes.data?.buildings || []);
      if (bldRes.data?.buildings?.length > 0) {
        setBuildingId(bldRes.data.buildings[0]._id);
      }
    } catch (err) {
      console.error('Failed to load devices:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-card rounded-card border border-card-border shadow-soft max-w-lg mx-auto mt-12">
        <span className="text-4xl">🔒</span>
        <h2 className="mt-3 text-lg font-bold text-ink">
          Access Restricted — Administrator Only
        </h2>
        <p className="mt-2 text-xs text-muted leading-relaxed">
          Hardware node registration and sensor calibration are restricted to Campus Administrators.
        </p>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await client.post('/devices', {
        deviceId,
        buildingId,
        label,
        sensors: ['co2', 'electricity', 'water'],
      });

      setRegisteredKey(res.data.apiKey);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to register device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-pill bg-primary-soft text-primary flex items-center justify-center text-sm shadow-soft">
              🔌
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Hardware Fleet
            </span>
          </div>
          <h1 className="text-2xl font-black text-ink">
            IoT Sensor Node Management &amp; Calibration
          </h1>
          <p className="text-xs text-muted mt-1">
            Register ESP32 nodes, manage secure device credentials, and adjust analog calibration curves.
          </p>
        </div>

        <button
          onClick={() => {
            setRegisteredKey(null);
            setShowModal(true);
          }}
          className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-pill shadow-pill transition-all"
        >
          + Register Sensor Node
        </button>
      </div>

      {/* Device Table */}
      <div className="bg-card rounded-card border border-card-border shadow-soft overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-frame text-muted font-bold border-b border-card-border">
            <tr>
              <th className="py-3 px-4">Device ID</th>
              <th className="py-3 px-4">Building Location</th>
              <th className="py-3 px-4">Sensors</th>
              <th className="py-3 px-4">Calibration Offsets</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border bg-card">
            {devices.map((dev) => (
              <tr key={dev._id} className="hover:bg-frame/40 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-ink">{dev.label}</div>
                  <div className="font-mono text-[11px] text-muted mt-0.5">{dev.deviceId}</div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-ink">
                  {dev.buildingId?.name || 'Unassigned'}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex gap-1.5 flex-wrap">
                    {dev.sensors?.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-primary-soft text-primary border border-primary/20 rounded-pill text-[10px] uppercase font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-muted">
                  <div>ACS721: {dev.calibration?.electricity?.sensitivityMvPerA || 100} mV/A, {dev.calibration?.electricity?.mainsVoltage || 230}V</div>
                  <div className="mt-0.5">Water: {dev.calibration?.water?.pulsesPerLitre || 450} pulses/L</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-pill font-bold uppercase text-[10px] bg-primary-soft text-primary border border-primary/20">
                    {dev.status || 'online'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-frame border border-card-border rounded-frame shadow-frame max-w-md w-full p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-black text-ink">
                Register New IoT Node
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Generate cryptographic credentials for an ESP32 edge node.
              </p>
            </div>

            {registeredKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary-soft/50 border border-primary/30 rounded-tile text-xs text-ink space-y-1.5">
                  <div className="font-bold text-primary">✅ Device Registered Successfully!</div>
                  <div className="text-muted leading-relaxed">Save this API key immediately into your ESP32 firmware. It will not be shown again:</div>
                  <code className="block mt-2 p-2.5 bg-card border border-card-border rounded-tile font-mono text-primary font-bold break-all">
                    {registeredKey}
                  </code>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-pill shadow-pill transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-muted uppercase tracking-wider mb-1.5">
                    Device ID (Unique Slug)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. bldg-06-node"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-card-border rounded-tile bg-card text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-muted uppercase tracking-wider mb-1.5">
                    Friendly Node Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sports Complex Main Hub"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-card-border rounded-tile bg-card text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-muted uppercase tracking-wider mb-1.5">
                    Building Assignment
                  </label>
                  <select
                    value={buildingId}
                    onChange={(e) => setBuildingId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-card-border rounded-tile bg-card text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {buildings.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex justify-end items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-bold text-muted hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-pill shadow-pill transition-all disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Register Node'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;
