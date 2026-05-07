import StepShell from '../../components/StepShell';
import { STATES } from '../../data/states';

export default function StepState({ value, onChange, onNext, onBack }) {
  function select(state) {
    onChange(state);
    onNext();
  }

  return (
    <StepShell step={2} total={8} title="Plate State" subtitle="Tap your state" onBack={onBack}>
      <div className="grid grid-cols-6 gap-1">
        {STATES.map((s) => (
          <button
            key={s}
            onClick={() => select(s)}
            className={`bg-brand-card text-white font-bold py-3.5 rounded-xl text-base
                        border-2 border-brand-border active:scale-95 transition-transform
                        select-none cursor-pointer text-center
                        ${value === s ? 'btn-grid-selected' : ''}`}
          >
            {s}
          </button>
        ))}
      </div>
    </StepShell>
  );
}
