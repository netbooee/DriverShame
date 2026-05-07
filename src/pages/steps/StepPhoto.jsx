import { useRef, useState } from 'react';
import StepShell from '../../components/StepShell';

export default function StepPhoto({ value, onChange, onNext, onBack }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState(value?.preview ?? null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    onChange({ file, preview: previewUrl });
  }

  function clear() {
    setPreview(null);
    onChange(null);
    inputRef.current.value = '';
  }

  return (
    <StepShell step={8} total={8} title="Add a Photo" subtitle="Optional — tap to take or choose one" onBack={onBack}>
      <div className="flex flex-col gap-4">
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />

        {preview ? (
          <div className="relative rounded-2xl overflow-hidden border-2 border-brand-border">
            <img src={preview} alt="Report photo" className="w-full object-cover max-h-72" />
            <button
              onClick={clear}
              className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-9 h-9
                         flex items-center justify-center text-lg active:scale-95 transition-transform"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current.click()}
            className="flex flex-col items-center justify-center gap-4
                       bg-brand-card border-2 border-dashed border-brand-border
                       rounded-2xl py-16 active:scale-95 transition-transform"
          >
            <span className="text-6xl">📷</span>
            <span className="text-white font-semibold text-lg">Take or Choose Photo</span>
            <span className="text-gray-500 text-sm">Camera · Photo Library</span>
          </button>
        )}

        <button onClick={onNext} className="btn-primary w-full">
          {preview ? 'Next →' : 'Skip'}
        </button>
      </div>
    </StepShell>
  );
}
