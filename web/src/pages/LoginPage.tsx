import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'facility_manager' | 'student'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Standard submit form handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      const res = await client.post(endpoint, {
        username,
        password,
        role: selectedRole,
      });

      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-soft text-primary text-3xl mb-3 shadow-soft">
          🌿
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Campus Sustainability Tracker
        </h2>
        <p className="mt-1.5 text-xs text-muted">
          EcoPulse Operations • MERN + IoT Telemetry + Gemini AI
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-frame border border-card-border rounded-frame shadow-frame p-6 sm:p-10">
          {error && (
            <div className="mb-5 p-3.5 bg-danger-soft border border-danger/30 rounded-tile text-xs text-danger font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Choose Role Selector in the form */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2.5">
                Choose Access Role <span className="text-primary">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Student / User Role */}
                <label
                  className={`relative flex flex-col p-3.5 border rounded-tile cursor-pointer text-center transition-all ${
                    selectedRole === 'student'
                      ? 'border-primary ring-2 ring-primary/20 bg-primary-soft shadow-soft'
                      : 'bg-card border-card-border hover:border-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={selectedRole === 'student'}
                    onChange={() => setSelectedRole('student')}
                    className="sr-only"
                  />
                  <span className="text-xl">🎓</span>
                  <span className="text-xs font-bold text-ink mt-1.5">Student / User</span>
                  <span className="text-[11px] text-muted mt-0.5">Stats Only</span>
                </label>

                {/* Facility Manager Role */}
                <label
                  className={`relative flex flex-col p-3.5 border rounded-tile cursor-pointer text-center transition-all ${
                    selectedRole === 'facility_manager'
                      ? 'border-primary ring-2 ring-primary/20 bg-primary-soft shadow-soft'
                      : 'bg-card border-card-border hover:border-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="facility_manager"
                    checked={selectedRole === 'facility_manager'}
                    onChange={() => setSelectedRole('facility_manager')}
                    className="sr-only"
                  />
                  <span className="text-xl">🛠️</span>
                  <span className="text-xs font-bold text-ink mt-1.5">Facility Manager</span>
                  <span className="text-[11px] text-muted mt-0.5">Operations</span>
                </label>

                {/* Admin Role */}
                <label
                  className={`relative flex flex-col p-3.5 border rounded-tile cursor-pointer text-center transition-all ${
                    selectedRole === 'admin'
                      ? 'border-primary ring-2 ring-primary/20 bg-primary-soft shadow-soft'
                      : 'bg-card border-card-border hover:border-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={selectedRole === 'admin'}
                    onChange={() => setSelectedRole('admin')}
                    className="sr-only"
                  />
                  <span className="text-xl">👑</span>
                  <span className="text-xs font-bold text-ink mt-1.5">Administrator</span>
                  <span className="text-[11px] text-muted mt-0.5">All Features</span>
                </label>
              </div>

              {/* Role Scope Notice */}
              <div className="mt-3 p-3 bg-card border border-card-border rounded-tile text-xs text-muted leading-relaxed">
                {selectedRole === 'student' && (
                  <span>
                    ℹ️ <strong className="text-ink">Student / Viewer Role:</strong> Access is limited to statistics, historical resource charts, building comparisons, and live air quality/power telemetry.
                  </span>
                )}
                {selectedRole === 'admin' && (
                  <span>
                    ✨ <strong className="text-ink">Administrator Role:</strong> Unlocks the <strong className="text-ink">Gemini AI Implementation Planner</strong>, PDF report generation, alert acknowledgements, metric thresholds, and IoT calibration.
                  </span>
                )}
                {selectedRole === 'facility_manager' && (
                  <span>
                    ⚡ <strong className="text-ink">Facility Manager Role:</strong> Unlocks the <strong className="text-ink">Gemini AI Implementation Planner</strong>, PDF reports, anomaly alerts, and threshold management.
                  </span>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                placeholder="e.g. admin or student"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none block w-full px-3.5 py-2.5 border border-card-border rounded-tile bg-card text-ink placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3.5 py-2.5 border border-card-border rounded-tile bg-card text-ink placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs sm:text-sm"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-pill shadow-pill text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : isSignup ? `Create Account as ${selectedRole}` : `Sign In as ${selectedRole}`}
              </button>
            </div>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="mt-6 text-center text-xs">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-primary hover:underline font-bold"
            >
              {isSignup ? 'Already have an account? Sign In' : 'Need an account? Sign Up with Role'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
