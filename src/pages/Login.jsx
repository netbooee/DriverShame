import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { enableDemo } from '../demo';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  function startDemo() {
    enableDemo();
    navigate('/report');
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
    // On success the browser redirects to Google — no further action needed
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
          <button onClick={() => setSent(false)} className="mt-6 text-gray-500 text-sm underline">
            Use a different email
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {/* Google — primary CTA */}
          <button
            onClick={signInWithGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800
                       font-bold py-5 rounded-2xl text-lg active:scale-95 transition-transform
                       disabled:opacity-50 shadow-lg"
          >
            <GoogleIcon />
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-brand-border" />
            <span className="text-gray-600 text-xs">or use email</span>
            <div className="flex-1 border-t border-brand-border" />
          </div>

          {/* Magic link */}
          <form onSubmit={sendMagicLink} className="flex flex-col gap-3">
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
              No password — we'll email you a one-tap sign-in link.
            </p>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-brand-border" />
            <span className="text-gray-600 text-xs">or</span>
            <div className="flex-1 border-t border-brand-border" />
          </div>

          <button
            type="button"
            onClick={startDemo}
            className="w-full bg-brand-card border-2 border-brand-border text-gray-400
                       font-semibold py-4 rounded-2xl text-base active:scale-95 transition-transform"
          >
            Try Demo (no account needed)
          </button>
        </div>
      )}
    </div>
  );
}
