import { useState } from 'react';
import StepShell from '../../components/StepShell';
import { OFFENSES } from '../../data/offenses';

export default function StepOffense({ selectedOffenses, notes, onChangeOffenses, onChangeNotes, onNext, onBack }) {
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

  return (
    <StepShell step={6} total={6} title="What Did They Do?" subtitle="Select all that apply" onBack={onBack}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {OFFENSES.map((o) => {
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
