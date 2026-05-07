import StepShell from '../../components/StepShell';
import { STATES } from '../../data/states';

export default function StepState({ value, onChange, onNext }) {
  function select(state) {
    onChange(state);
    onNext();
  }

  return (
    <StepShell step={1} total={6} title="Plate State" subtitle="Tap your state">
      <div className="grid grid-cols-4 gap-2">
        {STATES.map((s) => (
          <button
            key={s}
            onClick={() => select(s)}
            className={`btn-grid ${value === s ? 'btn-grid-selected' : ''}`}
          >
            {s}
          </button>
        ))}
      </div>
    </StepShell>
  );
}
