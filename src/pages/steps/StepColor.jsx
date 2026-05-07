import StepShell from '../../components/StepShell';
import { COLORS } from '../../data/colors';

export default function StepColor({ value, onChange, onNext, onBack }) {
  function select(color) {
    onChange(color);
    onNext();
  }

  return (
    <StepShell step={5} total={6} title="Vehicle Color" subtitle="Tap the color" onBack={onBack}>
      <div className="grid grid-cols-3 gap-3">
        {COLORS.map((c) => (
          <button
            key={c.name}
            onClick={() => select(c.name)}
            style={{ backgroundColor: c.hex }}
            className={`rounded-2xl py-8 font-bold text-lg ${c.text} border-4 transition-all
              ${value === c.name ? 'border-white scale-95' : 'border-transparent active:scale-95'}`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </StepShell>
  );
}
