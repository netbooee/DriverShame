import StepShell from '../../components/StepShell';
import { MODELS } from '../../data/vehicles';

export default function StepModel({ value, make, onChange, onNext, onBack }) {
  const models = MODELS[make] || ['Other'];

  function select(model) {
    onChange(model);
    onNext();
  }

  return (
    <StepShell step={4} total={6} title="Vehicle Model" subtitle={make} onBack={onBack}>
      <div className="grid grid-cols-2 gap-3">
        {models.map((model) => (
          <button
            key={model}
            onClick={() => select(model)}
            className={`btn-grid py-5 text-base ${value === model ? 'btn-grid-selected' : ''}`}
          >
            {model}
          </button>
        ))}
      </div>
    </StepShell>
  );
}
