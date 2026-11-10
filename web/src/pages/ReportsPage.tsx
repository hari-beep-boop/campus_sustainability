import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export const ReportsPage: React.FC = () => {
  const { isStaff } = useAuth();
  const [downloading, setDownloading] = useState(false);

  if (!isStaff) {
    return (
      <div className="p-8 text-center bg-card rounded-card border border-card-border shadow-soft max-w-lg mx-auto mt-12">
        <span className="text-4xl">🔒</span>
        <h2 className="mt-3 text-lg font-bold text-ink">
          Access Restricted — Administrative Role Required
        </h2>
        <p className="mt-2 text-xs text-muted leading-relaxed">
          PDF report generation and campus compliance downloads are restricted to Administrators and Facility Managers. Your current role is <strong className="text-ink">Student / Viewer</strong>.
        </p>
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const res = await client.get('/reports/download', {
        responseType: 'blob',
      });

      // Trigger browser download
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campus_sustainability_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-8 h-8 rounded-pill bg-primary-soft text-primary flex items-center justify-center text-sm shadow-soft">
            📄
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Institutional Audit
          </span>
        </div>
        <h1 className="text-2xl font-black text-ink">
          Campus Sustainability Performance Reports
        </h1>
        <p className="text-xs text-muted mt-1">
          Export formal PDF reports formatted with institutional letterheads, comprehensive building breakdowns, and carbon totals.
        </p>
      </div>

      {/* Main Download Card */}
      <div className="bg-card p-6 rounded-card border border-card-border shadow-soft flex flex-col sm:flex-row justify-between sm:items-center gap-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📊</span>
            <h2 className="text-base font-bold text-ink">
              Executive Sustainability &amp; Carbon Audit Report
            </h2>
          </div>
          <p className="text-xs text-muted mt-1 max-w-xl leading-relaxed">
            Includes aggregated kWh, municipal water withdrawal, average indoor CO₂ air quality ppm, scope 2 carbon emissions (kg CO₂e), and prioritized facility interventions.
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-pill shadow-pill transition-all flex items-center space-x-2 disabled:opacity-50 whitespace-nowrap"
        >
          <span>{downloading ? 'Generating PDF...' : '⬇️ Download PDF Report'}</span>
        </button>
      </div>

      {/* Report Structure Preview */}
      <div className="bg-frame p-6 rounded-card border border-card-border shadow-soft space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
          Document Specification (Generated via PDFKit Engine)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-card rounded-tile border border-card-border space-y-1">
            <div className="font-bold text-ink">Section 1: Executive KPI Summary</div>
            <div className="text-muted text-[11px] leading-relaxed">Campus score / 100, electricity totals, municipal water draw, and carbon equivalents.</div>
          </div>

          <div className="p-4 bg-card rounded-tile border border-card-border space-y-1">
            <div className="font-bold text-ink">Section 2: Per-Building Table</div>
            <div className="text-muted text-[11px] leading-relaxed">Granular breakdown for all 5 campus facilities across energy, water, ppm, and carbon.</div>
          </div>

          <div className="p-4 bg-card rounded-tile border border-card-border space-y-1">
            <div className="font-bold text-ink">Section 3: Key Recommendations</div>
            <div className="text-muted text-[11px] leading-relaxed">High-priority operational setbacks, leak repairs, and demand-controlled ventilation.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
