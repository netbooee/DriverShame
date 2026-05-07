import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { isDemo, demoQueryReports } from '../demo';
import { COLORS } from '../data/colors';
import { OFFENSES } from '../data/offenses';
import { getPlateStyle } from '../data/plateStyles';

function PhotoLightbox({ url, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl w-11 h-11 flex items-center
                   justify-center rounded-full bg-white/10 active:bg-white/20"
      >
        ✕
      </button>
      <img
        src={url}
        alt="Full photo"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

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
      <div className="px-4 py-3 sticky top-0 z-10" style={{ background: 'linear-gradient(to bottom, #0D0D0D 80%, transparent)' }}>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg select-none">🔍</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plate number…"
            autoComplete="off"
            className="w-full bg-[#1a1a1a] border-2 border-[#2e2e2e] rounded-2xl
                       pl-11 pr-5 py-4 text-white text-lg placeholder-gray-600
                       outline-none focus:border-gray-500 transition-colors"
          />
        </div>
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
  const latest = group[0];
  const colorHex = COLORS.find((c) => c.name === latest.vehicle_color)?.hex;
  const vehicleStr = [latest.vehicle_color, latest.vehicle_make, latest.vehicle_model]
    .filter(Boolean).join(' ');
  const count = group.length;

  return (
    <div
      className="rounded-2xl overflow-hidden mb-5"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4)', border: '1px solid #2e2e2e' }}
    >
      {/* Red accent stripe */}
      <div className="h-1 bg-brand-red w-full" />

      {/* Card header — plate + vehicle */}
      <div className="bg-[#141414] px-5 py-4 flex items-center gap-4">
        <LicensePlate state={latest.plate_state} number={latest.plate_number} />

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Vehicle */}
          {vehicleStr ? (
            <div className="flex items-center gap-2.5">
              {colorHex && (
                <span
                  className="inline-block w-5 h-5 rounded-full border-2 border-black/30 shrink-0"
                  style={{ backgroundColor: colorHex, boxShadow: '0 0 0 1px rgba(255,255,255,0.15)' }}
                />
              )}
              <span className="text-white font-semibold text-base leading-tight truncate">
                {vehicleStr}
              </span>
            </div>
          ) : (
            <span className="text-gray-600 text-sm">Unknown vehicle</span>
          )}

          {/* Tags row */}
          <div className="flex items-center gap-2 flex-wrap">
            {latest.report_type && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/8 text-gray-300 border border-white/10">
                {latest.report_type === 'parking' ? '🅿️ Parking' : '🚗 Driving'}
              </span>
            )}
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full
                ${count > 1 ? 'bg-brand-red text-white' : 'bg-white/8 text-gray-400 border border-white/10'}`}
            >
              {count === 1 ? '1 report' : `⚠ ${count} reports`}
            </span>
            {count > 1 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-gray-500 text-xs underline underline-offset-2"
              >
                {expanded ? 'collapse' : 'expand'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Incident list */}
      {expanded && (
        <div className="bg-[#1a1a1a] divide-y divide-[#252525]">
          {group.map((r) => (
            <Incident key={r.id} report={r} showVehicle={count > 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function Incident({ report, showVehicle }) {
  const [lightbox, setLightbox] = useState(false);

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
    <div className="px-5 py-4">
      {lightbox && (
        <PhotoLightbox url={report.photo_url} onClose={() => setLightbox(false)} />
      )}

      {/* Date + optional vehicle (multi-report) */}
      <div className="flex items-center justify-between mb-3">
        {showVehicle ? (
          <div className="flex items-center gap-2">
            {colorHex && (
              <span
                className="inline-block w-4 h-4 rounded-full border border-black/30 shrink-0"
                style={{ backgroundColor: colorHex }}
              />
            )}
            <span className="text-gray-300 text-sm font-medium">
              {[report.vehicle_color, report.vehicle_make, report.vehicle_model]
                .filter(Boolean).join(' ') || 'Unknown vehicle'}
            </span>
          </div>
        ) : <span />}
        <span className="text-gray-500 text-xs tabular-nums">{dateStr}</span>
      </div>

      {/* Offense badges */}
      {offenseLabels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {offenseLabels.map(({ key, label }) => (
            <span
              key={key}
              className="bg-brand-red/15 border border-brand-red/35 text-brand-red
                         text-sm font-semibold px-3 py-1 rounded-full"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {report.notes && (
        <p className="text-gray-400 text-sm italic leading-relaxed mb-3 pl-1 border-l-2 border-gray-700">
          {report.notes}
        </p>
      )}

      {/* Photo */}
      {report.photo_url && (
        <button
          onClick={() => setLightbox(true)}
          className="w-full rounded-xl overflow-hidden border border-[#2e2e2e]
                     bg-black active:opacity-75 transition-opacity block"
        >
          <div className="relative w-full" style={{ paddingBottom: '75%' }}>
            <img
              src={report.photo_url}
              alt="Report photo"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          <p className="text-gray-600 text-xs py-1.5 text-center tracking-wide">TAP TO ENLARGE</p>
        </button>
      )}
    </div>
  );
}
