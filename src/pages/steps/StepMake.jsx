import StepShell from '../../components/StepShell';
import { MAKES } from '../../data/vehicles';

export default function StepMake({ value, onChange, onNext, onBack }) {
  function select(make) {
    onChange(make);
    onNext();
  }

  return (
    <StepShell step={3} total={6} title="Vehicle Make" subtitle="Tap the brand" onBack={onBack}>
      <div className="grid grid-cols-2 gap-3">
        {MAKES.map((make) => (
          <button
            key={make}
            onClick={() => select(make)}
            className={`btn-grid py-5 text-base ${value === make ? 'btn-grid-selected' : ''}`}
          >
            {make}
          </button>
        ))}
      </div>
    </StepShell>
  );
}
