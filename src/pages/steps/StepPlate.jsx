import { useState } from 'react';
import StepShell from '../../components/StepShell';

export default function StepPlate({ value, plateState, onChange, onNext, onBack }) {
  const [local, setLocal] = useState(value);
  const [error, setError] = useState('');

  function handleNext() {
    const trimmed = local.trim().toUpperCase();
    if (!trimmed) {
      setError('Enter a plate number');
      return;
    }
    onChange(trimmed);
    onNext();
  }

  return (
    <StepShell step={3} total={8} title="Plate Number" subtitle={`State: ${plateState}`} onBack={onBack}>
      <div className="flex flex-col gap-6 pt-2">
        <div className="bg-brand-card border-2 border-brand-border rounded-2xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1 uppercase tracking-widest">{plateState}</div>
          <input
            type="text"
            value={local}
            onChange={(e) => { setLocal(e.target.value.toUpperCase()); setError(''); }}
            placeholder="ABC 1234"
            maxLength={10}
            autoFocus
            autoComplete="off"
            autoCapitalize="characters"
            className="w-full bg-transparent text-white text-4xl font-black text-center tracking-widest
                       placeholder-gray-700 outline-none"
          />
        </div>

        {error && <p className="text-brand-red text-center font-semibold">{error}</p>}

        <button
          onClick={handleNext}
          disabled={!local.trim()}
          className="btn-primary w-full disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </StepShell>
  );
}
