import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export const AlertsThresholdsPage: React.FC = () => {
  const { isStaff, isAdmin } = useAuth();

  const [alerts, setAlerts] = useState<any[]>([]);
  const [thresholds, setThresholds] = useState({
    energy_kwh: 6000,
    water_litres: 95000,
    co2_ppm: 1000,
    waste_kg: 500,
    gridEmissionFactorKgPerKwh: 0.71,
    reportCampusName: 'Greenwood Central Campus',
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const loadData = async () => {
    try {
      const [alertRes, setRes] = await Promise.all([
        client.get('/alerts'),
        client.get('/settings/thresholds'),
      ]);

      setAlerts(alertRes.data?.alerts || []);
      if (setRes.data) {
        setThresholds({
          energy_kwh: setRes.data.thresholds?.energy_kwh || 6000,
          water_litres: setRes.data.thresholds?.water_litres || 95000,
          co2_ppm: setRes.data.thresholds?.co2_ppm || 1000,
          waste_kg: setRes.data.thresholds?.waste_kg || 500,
          gridEmissionFactorKgPerKwh: setRes.data.gridEmissionFactorKgPerKwh || 0.71,
          reportCampusName: setRes.data.reportCampusName || 'Greenwood Central Campus',
        });
      }
    } catch (err) {
      console.error('Failed to load alerts/settings:', err);
    }
  };

  useEffect(() => {
    if (isStaff) {
      loadData();
    }
  }, [isStaff]);

  if (!isStaff) {
    return (
      <div className="p-8 text-center bg-card rounded-card border border-card-border shadow-soft max-w-lg mx-auto mt-12">
        <span className="text-4xl">🔒</span>
        <h2 className="mt-3 text-lg font-bold text-ink">
          Access Restricted — Administrative Role Required
        </h2>
        <p className="mt-2 text-xs text-muted leading-relaxed">
          Alert acknowledgement and threshold modifications are restricted to Administrators and Facility Managers. Your current role is <strong className="text-ink">Student / Viewer</strong>.
        </p>
      </div>
    );
  }

  const handleAck = async (id: string) => {
    try {
      await client.patch(`/alerts/${id}/ack`);
      loadData();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');

    try {
      await client.put('/settings/thresholds', thresholds);
      setSavedMsg('Settings updated successfully!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-8 h-8 rounded-pill bg-primary-soft text-primary flex items-center justify-center text-sm shadow-soft">
            ⚠️
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Campus Governance
          </span>
        </div>
        <h1 className="text-2xl font-black text-ink">
          Anomaly Alerts &amp; Threshold Governance
        </h1>
        <p className="text-xs text-muted mt-1">
          Review automated z-score anomalies and configure institutional sustainability thresholds.
        </p>
      </div>

      {/* Active Alerts List */}
      <div className="bg-card p-6 rounded-card border border-card-border shadow-soft">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-ink">
            Active Alerts &amp; Incident Queue
          </h2>
          <span className="text-xs px-3 py-1 rounded-pill bg-danger-soft text-danger border border-danger/30 font-bold">
            {alerts.filter((a) => !a.ackBy).length} Unacknowledged
          </span>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-xs text-muted italic">No alerts reported. All sensors operating within normal bands.</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-4 rounded-tile border flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all ${
                  alert.ackBy
                    ? 'bg-frame/60 border-card-border opacity-60'
                    : alert.severity === 'high'
                    ? 'bg-danger-soft/40 border-danger/30'
                    : 'bg-amber-500/10 border-warn/20'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-pill ${
                        alert.severity === 'high'
                          ? 'bg-danger-soft text-danger border border-danger/30'
                          : 'bg-amber-500/20 text-warn border border-warn/30'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-bold text-xs text-ink">
                      {alert.buildingId?.name || 'Campus Wide'}
                    </span>
                    <span className="text-xs text-muted">• Source: {alert.source}</span>
                  </div>
                  <p className="text-xs text-ink/90 mt-1 leading-relaxed">{alert.message}</p>
                </div>

                <div>
                  {alert.ackBy ? (
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <span>✓</span> Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAck(alert._id)}
                      className="px-4 py-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-pill shadow-soft transition-all"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Threshold Limit Settings */}
      <div className="bg-card p-6 rounded-card border border-card-border shadow-soft">
        <h2 className="text-base font-bold text-ink mb-1">
          Threshold Configuration
        </h2>
        <p className="text-xs text-muted mb-4">
          Adjust triggers for automatic anomaly alerts and the regional carbon emissions factor.
        </p>

        <form onSubmit={handleSaveThresholds} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-muted uppercase tracking-wider mb-1.5">
                Electricity Threshold (kWh)
              </label>
              <input
                type="number"
                disabled={!isAdmin}
                value={thresholds.energy_kwh}
                onChange={(e) => setThresholds({ ...thresholds, energy_kwh: Number(e.target.value) })}
                className="w-full px-3 py-2.5 border border-card-border rounded-tile bg-frame text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-bold text-muted uppercase tracking-wider mb-1.5">
                Water Threshold (Litres)
              </label>
              <input
                type="number"
                disabled={!isAdmin}
                value={thresholds.water_litres}
                onChange={(e) => setThresholds({ ...thresholds, water_litres: Number(e.target.value) })}
                className="w-full px-3 py-2.5 border border-card-border rounded-tile bg-frame text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-bold text-muted uppercase tracking-wider mb-1.5">
                CO₂ Indoor Air Limit (ppm)
              </label>
              <input
                type="number"
                disabled={!isAdmin}
                value={thresholds.co2_ppm}
                onChange={(e) => setThresholds({ ...thresholds, co2_ppm: Number(e.target.value) })}
                className="w-full px-3 py-2.5 border border-card-border rounded-tile bg-frame text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-bold text-muted uppercase tracking-wider mb-1.5">
                Municipal Waste Limit (kg)
              </label>
              <input
                type="number"
                disabled={!isAdmin}
                value={thresholds.waste_kg}
                onChange={(e) => setThresholds({ ...thresholds, waste_kg: Number(e.target.value) })}
                className="w-full px-3 py-2.5 border border-card-border rounded-tile bg-frame text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-bold text-muted uppercase tracking-wider mb-1.5">
                Grid Emission Factor (kg/kWh)
              </label>
              <input
                type="number"
                step="0.01"
                disabled={!isAdmin}
                value={thresholds.gridEmissionFactorKgPerKwh}
                onChange={(e) =>
                  setThresholds({ ...thresholds, gridEmissionFactorKgPerKwh: Number(e.target.value) })
                }
                className="w-full px-3 py-2.5 border border-card-border rounded-tile bg-frame text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-bold text-muted uppercase tracking-wider mb-1.5">
                Institution Campus Name
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={thresholds.reportCampusName}
                onChange={(e) => setThresholds({ ...thresholds, reportCampusName: e.target.value })}
                className="w-full px-3 py-2.5 border border-card-border rounded-tile bg-frame text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-card-border flex justify-between items-center">
            {savedMsg && <span className="text-xs font-bold text-primary">{savedMsg}</span>}
            {!isAdmin && (
              <span className="text-xs text-muted">
                Note: Editing thresholds requires Administrator privileges.
              </span>
            )}
            {isAdmin && (
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-pill shadow-pill transition-all"
              >
                {saving ? 'Saving...' : 'Save Threshold Settings'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertsThresholdsPage;
