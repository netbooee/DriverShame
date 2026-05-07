import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { isDemo, demoQueryReports } from '../demo';
import { COLORS } from '../data/colors';
import { OFFENSES } from '../data/offenses';

function groupByPlate(reports) {
  const map = new Map();
  for (const r of reports) {
    const key = `${r.plate_state}|${r.plate_number.toUpperCase()}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  }
  // Sort groups by most recent report first
  return Array.from(map.values()).sort(
    (a, b) => new Date(b[0].created_at) - new Date(a[0].created_at)
  );
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = useCallback(async (query) => {
    setLoading(true);
    setError('');
    try {
      if (isDemo()) {
        setReports(demoQueryReports(query));
        return;
      }

      let req = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (query.trim()) {
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

  const groups = groupByPlate(reports);

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
        {!loading && !error && groups.length === 0 && (
          <div className="text-gray-500 text-center pt-12">
            {search ? 'No reports match that plate.' : 'No reports yet. Be the first to report!'}
          </div>
        )}
        {!loading && groups.map((group) => (
          <PlateGroup key={`${group[0].plate_state}|${group[0].plate_number}`} group={group} />
        ))}
      </div>
    </div>
  );
}

function LicensePlate({ state, number }) {
  return (
    <div
      className="relative inline-flex flex-col items-center justify-center
                 bg-white rounded-xl px-5 py-2 min-w-[160px]"
      style={{
        border: '3px solid #1a1a2e',
        boxShadow: '0 0 0 1px #aaa inset, 2px 4px 12px rgba(0,0,0,0.5)',
      }}
    >
      {/* Corner bolts */}
      {['top-1.5 left-1.5', 'top-1.5 right-1.5', 'bottom-1.5 left-1.5', 'bottom-1.5 right-1.5'].map((pos) => (
        <span
          key={pos}
          className={`absolute ${pos} w-2 h-2 rounded-full bg-gray-400 border border-gray-500`}
          style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)' }}
        />
      ))}

      <span className="text-gray-500 text-[10px] font-bold tracking-[0.25em] uppercase leading-none mb-0.5">
        {state}
      </span>
      <span className="text-gray-900 text-3xl font-black tracking-widest leading-none">
        {number}
      </span>
    </div>
  );
}

function PlateGroup({ group }) {
  const [expanded, setExpanded] = useState(true);
  // Use the most recent report for vehicle info
  const latest = group[0];
  const colorHex = COLORS.find((c) => c.name === latest.vehicle_color)?.hex;
  const vehicleStr = [latest.vehicle_color, latest.vehicle_make, latest.vehicle_model]
    .filter(Boolean)
    .join(' ');
  const count = group.length;

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl mb-4 overflow-hidden">
      {/* Header with plate */}
      <div className="p-4 flex items-center gap-4">
        <LicensePlate state={latest.plate_state} number={latest.plate_number} />

        <div className="flex-1 min-w-0">
          {vehicleStr && (
            <div className="flex items-center gap-2 mb-2">
              {colorHex && (
                <span
                  className="inline-block w-3.5 h-3.5 rounded-full border border-gray-600 shrink-0"
                  style={{ backgroundColor: colorHex }}
                />
              )}
              <span className="text-gray-300 text-sm truncate">{vehicleStr}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full
                ${count > 1
                  ? 'bg-brand-red text-white'
                  : 'bg-brand-border text-gray-400'}`}
            >
              {count === 1 ? '1 report' : `${count} reports`}
            </span>
            {count > 1 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-gray-500 text-xs underline"
              >
                {expanded ? 'collapse' : 'expand'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Incident list */}
      {expanded && (
        <div className="border-t border-brand-border divide-y divide-brand-border">
          {group.map((r) => (
            <Incident key={r.id} report={r} showVehicle={count > 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function Incident({ report, showVehicle }) {
  const offenseLabels = OFFENSES
    .filter((o) => (report.offense_types || []).includes(o.id))
    .map((o) => ({ key: o.id, label: `${o.icon} ${o.label}` }));

  const colorHex = COLORS.find((c) => c.name === report.vehicle_color)?.hex;

  const date = new Date(report.created_at);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        {showVehicle && (
          <div className="flex items-center gap-1.5">
            {colorHex && (
              <span
                className="inline-block w-3 h-3 rounded-full border border-gray-600 shrink-0"
                style={{ backgroundColor: colorHex }}
              />
            )}
            <span className="text-gray-400 text-xs">
              {[report.vehicle_color, report.vehicle_make, report.vehicle_model]
                .filter(Boolean).join(' ') || 'Unknown vehicle'}
            </span>
          </div>
        )}
        <span className="text-gray-600 text-xs ml-auto">{dateStr}</span>
      </div>

      {offenseLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {offenseLabels.map(({ key, label }) => (
            <span
              key={key}
              className="bg-brand-red/20 border border-brand-red/40 text-brand-red
                         text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {report.notes && (
        <p className="text-gray-400 text-sm italic">"{report.notes}"</p>
      )}
    </div>
  );
}
