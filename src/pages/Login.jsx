import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { enableDemo } from '../demo';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function startDemo() {
    enableDemo();
    navigate('/report');
  }

  async function sendMagicLink(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-8">
      {/* Logo */}
      <div className="text-center">
        <div className="text-6xl mb-3">🚗</div>
        <h1 className="text-4xl font-black text-white tracking-tight">DriverShame</h1>
        <p className="text-gray-400 mt-2">Report bad drivers on the road</p>
      </div>

      {sent ? (
        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 text-center max-w-sm w-full">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-gray-400">
            We sent a sign-in link to <span className="text-white font-semibold">{email}</span>.
            Tap the link in the email to continue.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 text-gray-500 text-sm underline"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={sendMagicLink} className="flex flex-col gap-4 w-full max-w-sm">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="bg-brand-card border-2 border-brand-border rounded-2xl px-5 py-5
                       text-white text-xl placeholder-gray-600 outline-none
                       focus:border-gray-500 transition-colors"
          />
          {error && <p className="text-brand-red text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="btn-primary w-full disabled:opacity-40"
          >
            {loading ? 'Sending…' : 'Send Magic Link'}
          </button>
          <p className="text-gray-600 text-xs text-center">
            No password required — we'll email you a sign-in link.
          </p>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-brand-border" />
            <span className="text-gray-600 text-xs">or</span>
            <div className="flex-1 border-t border-brand-border" />
          </div>

          <button
            type="button"
            onClick={startDemo}
            className="w-full bg-brand-card border-2 border-brand-border text-gray-300
                       font-semibold py-4 rounded-2xl text-lg active:scale-95 transition-transform"
          >
            Try Demo (no account needed)
          </button>
        </form>
      )}
    </div>
  );
}
