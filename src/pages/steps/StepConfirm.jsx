import { OFFENSES } from '../../data/offenses';
import { COLORS } from '../../data/colors';

const TYPE_META = {
  driving: { label: 'Bad Driving', icon: '🚗💨' },
  parking: { label: 'Bad Parking', icon: '🅿️' },
};

export default function StepConfirm({ report, onSubmit, onBack, submitting }) {
  const offenseLabels = OFFENSES
    .filter((o) => report.offense_types.includes(o.id))
    .map((o) => `${o.icon} ${o.label}`)
    .join(', ');

  const colorHex = COLORS.find((c) => c.name === report.vehicle_color)?.hex;
  const typeMeta = TYPE_META[report.report_type];

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto px-4 py-4 gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-black text-white">Review & Submit</h2>
        {typeMeta && (
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-brand-border text-gray-300">
            {typeMeta.icon} {typeMeta.label}
          </span>
        )}
      </div>

      <div className="bg-brand-card rounded-2xl border border-brand-border divide-y divide-brand-border text-base">
        <Row label="Plate">
          <span className="font-black text-white tracking-widest text-xl">
            {report.plate_state} · {report.plate_number}
          </span>
        </Row>
        <Row label="Vehicle">
          <span className="flex items-center gap-2">
            {colorHex && (
              <span
                className="inline-block w-4 h-4 rounded-full border border-gray-600 shrink-0"
                style={{ backgroundColor: colorHex }}
              />
            )}
            {[report.vehicle_color, report.vehicle_make, report.vehicle_model]
              .filter(Boolean)
              .join(' ')}
          </span>
        </Row>
        {offenseLabels && (
          <Row label="Offenses">
            <span className="text-gray-300">{offenseLabels}</span>
          </Row>
        )}
        {report.notes && (
          <Row label="Notes">
            <span className="text-gray-300 italic">{report.notes}</span>
          </Row>
        )}
        {report.photo?.preview && (
          <Row label="Photo">
            <img
              src={report.photo.preview}
              alt="Report photo"
              className="rounded-xl w-full max-h-48 object-cover border border-brand-border"
            />
          </Row>
        )}
      </div>

      <div className="flex gap-3 mt-auto">
        <button
          onClick={onBack}
          className="flex-1 bg-brand-card border-2 border-brand-border text-white font-bold
                     py-5 rounded-2xl text-xl active:scale-95 transition-transform"
        >
          ‹ Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-[2] btn-primary disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit Report'}
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      {children}
    </div>
  );
}
