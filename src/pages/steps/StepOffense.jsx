import { useState } from 'react';
import StepShell from '../../components/StepShell';
import { DRIVING_OFFENSES, PARKING_OFFENSES } from '../../data/offenses';

export default function StepOffense({ reportType, selectedOffenses, notes, onChangeOffenses, onChangeNotes, onNext, onBack }) {
  const offenses = reportType === 'parking' ? PARKING_OFFENSES : DRIVING_OFFENSES;
  const [localOffenses, setLocalOffenses] = useState(selectedOffenses);
  const [localNotes, setLocalNotes] = useState(notes);

  function toggle(id) {
    setLocalOffenses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleNext() {
    onChangeOffenses(localOffenses);
    onChangeNotes(localNotes);
    onNext();
  }

  const title = reportType === 'parking' ? 'Parking Violation?' : 'What Did They Do?';

  return (
    <StepShell step={7} total={8} title={title} subtitle="Select all that apply" onBack={onBack}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {offenses.map((o) => {
            const active = localOffenses.includes(o.id);
            return (
              <button
                key={o.id}
                onClick={() => toggle(o.id)}
                className={`btn-grid flex flex-col items-center gap-1 py-4
                  ${active ? 'btn-grid-selected' : ''}`}
              >
                <span className="text-2xl">{o.icon}</span>
                <span className="text-sm leading-tight">{o.label}</span>
              </button>
            );
          })}
        </div>

        <div>
          <label className="text-gray-400 text-sm block mb-2">Additional notes (optional)</label>
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder="Describe what happened..."
            rows={3}
            className="w-full bg-brand-card border-2 border-brand-border rounded-xl px-4 py-3
                       text-white placeholder-gray-600 outline-none focus:border-gray-500 resize-none text-base"
          />
        </div>

        <button onClick={handleNext} className="btn-primary w-full">
          Review Report →
        </button>
      </div>
    </StepShell>
  );
}
