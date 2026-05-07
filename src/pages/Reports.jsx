import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { isDemo, demoQueryReports } from '../demo';
import { COLORS } from '../data/colors';
import { OFFENSES } from '../data/offenses';
import { getPlateStyle } from '../data/plateStyles';

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
  const { bg, text, label } = getPlateStyle(state);

  // Darken bg slightly for border
  const borderColor = text + 'CC';

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-xl shrink-0"
      style={{
        width: 176,
        height: 88,
        backgroundColor: bg,
        border: `3px solid ${borderColor}`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.15) inset, 2px 4px 14px rgba(0,0,0,0.55)`,
      }}
    >
      {/* Corner bolts */}
      {[
        { t: 6, l: 6 }, { t: 6, r: 6 },
        { b: 6, l: 6 }, { b: 6, r: 6 },
      ].map((pos, i) => (
        <span
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            top:    pos.t,
            bottom: pos.b,
            left:   pos.l,
            right:  pos.r,
            backgroundColor: text + '55',
            border: `1px solid ${text}88`,
          }}
        />
      ))}

      <span
        className="text-[10px] font-bold tracking-[0.3em] uppercase leading-none mb-1"
        style={{ color: label }}
      >
        {state}
      </span>
      <span
        className="font-black leading-none tracking-wider"
        style={{
          color: text,
          fontSize: number.length <= 6 ? 26 : number.length <= 8 ? 22 : 18,
          letterSpacing: number.length <= 6 ? '0.15em' : '0.08em',
        }}
      >
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
