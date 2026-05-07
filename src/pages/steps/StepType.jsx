export default function StepType({ onChange }) {
  return (
    <div className="flex flex-col h-full max-w-lg mx-auto px-4 py-6 gap-6">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-black text-white">DriverShame</h1>
        <p className="text-gray-400 mt-1">What are you reporting?</p>
      </div>

      <button
        onClick={() => onChange('driving')}
        className="flex-1 flex flex-col items-center justify-center gap-4
                   bg-brand-card border-2 border-brand-border rounded-3xl
                   active:scale-95 transition-transform"
      >
        <span className="text-7xl">🚗💨</span>
        <span className="text-2xl font-black text-white">Bad Driving</span>
        <span className="text-gray-500 text-sm px-6 text-center">
          Speeding, tailgating, ran a light, road rage…
        </span>
      </button>

      <button
        onClick={() => onChange('parking')}
        className="flex-1 flex flex-col items-center justify-center gap-4
                   bg-brand-card border-2 border-brand-border rounded-3xl
                   active:scale-95 transition-transform"
      >
        <span className="text-7xl">🅿️</span>
        <span className="text-2xl font-black text-white">Bad Parking</span>
        <span className="text-gray-500 text-sm px-6 text-center">
          Blocking hydrant, handicap spot, double parked…
        </span>
      </button>
    </div>
  );
}
