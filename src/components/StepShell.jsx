export default function StepShell({ step, total, title, subtitle, onBack, children, fullWidth = false }) {
  const pct = Math.round((step / total) * 100);

  return (
    <div className={`flex flex-col h-full py-4 ${fullWidth ? 'px-2' : 'max-w-lg mx-auto px-4'}`}>
      {/* Progress + back */}
      <div className="flex items-center gap-3 mb-4">
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-400 text-3xl leading-none active:text-white transition-colors p-1"
            aria-label="Go back"
          >
            ‹
          </button>
        )}
        <div className="flex-1 bg-brand-border rounded-full h-2">
          <div
            className="bg-brand-red h-2 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-gray-500 text-sm whitespace-nowrap">{step}/{total}</span>
      </div>

      {/* Header */}
      <p className="step-title">{title}</p>
      {subtitle && <p className="step-subtitle">{subtitle}</p>}

      {/* Content scrolls */}
      <div className="flex-1 overflow-y-auto pb-4">
        {children}
      </div>
    </div>
  );
}
