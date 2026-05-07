import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { COLORS } from '../data/colors';
import { OFFENSES } from '../data/offenses';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = useCallback(async (query) => {
    setLoading(true);
    setError('');
    try {
      let req = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (query.trim()) {
        // ilike allows partial matches; use % wildcard
        req = req.ilike('plate_number', `%${query.trim()}%`);
      }

      const { data, error: err } = await req;
      if (err) throw err;
      setReports(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchReports(search), 300);
    return () => clearTimeout(timeout);
  }, [search, fetchReports]);

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 py-3 bg-brand-dark sticky top-0 z-10">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search plate number…"
          autoComplete="off"
          className="w-full bg-brand-card border-2 border-brand-border rounded-2xl
                     px-5 py-4 text-white text-lg placeholder-gray-600
                     outline-none focus:border-gray-500 transition-colors"
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {loading && (
          <div className="flex justify-center pt-12 text-gray-500">Loading…</div>
        )}
        {error && (
          <div className="text-brand-red text-center pt-8">{error}</div>
        )}
        {!loading && !error && reports.length === 0 && (
          <div className="text-gray-500 text-center pt-12">
            {search ? 'No reports match that plate.' : 'No reports yet. Be the first to report!'}
          </div>
        )}
        {!loading && reports.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </div>
    </div>
  );
}

function ReportCard({ report }) {
  const colorHex = COLORS.find((c) => c.name === report.vehicle_color)?.hex;
  const offenseLabels = OFFENSES
    .filter((o) => (report.offense_types || []).includes(o.id))
    .map((o) => `${o.icon} ${o.label}`);

  const date = new Date(report.created_at);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-4 mb-3">
      {/* Plate */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-gray-500 text-xs uppercase tracking-wider">{report.plate_state}</span>
          <div className="text-white text-3xl font-black tracking-widest leading-tight">
            {report.plate_number}
          </div>
        </div>
        <span className="text-gray-600 text-xs text-right shrink-0">{dateStr}</span>
      </div>

      {/* Vehicle */}
      {(report.vehicle_make || report.vehicle_color) && (
        <div className="flex items-center gap-2 mb-3">
          {colorHex && (
            <span
              className="inline-block w-4 h-4 rounded-full border border-gray-600 shrink-0"
              style={{ backgroundColor: colorHex }}
            />
          )}
          <span className="text-gray-300 text-sm">
            {[report.vehicle_color, report.vehicle_make, report.vehicle_model]
              .filter(Boolean)
              .join(' ')}
          </span>
        </div>
      )}

      {/* Offenses */}
      {offenseLabels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {offenseLabels.map((label) => (
            <span
              key={label}
              className="bg-brand-red/20 border border-brand-red/40 text-brand-red
                         text-xs font-semibold px-2 py-1 rounded-full"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {report.notes && (
        <p className="text-gray-400 text-sm italic border-t border-brand-border pt-3 mt-1">
          "{report.notes}"
        </p>
      )}
    </div>
  );
}
