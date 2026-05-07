import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { isDemo, disableDemo } from '../demo';

export default function NavBar() {
  const navigate = useNavigate();

  async function signOut() {
    if (isDemo()) {
      disableDemo();
    } else {
      await supabase.auth.signOut();
    }
    navigate('/login');
  }

  return (
    <nav className="bg-brand-card border-b border-brand-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <Link to="/report" className="text-xl font-black tracking-tight text-brand-red">
        DriverShame
      </Link>
      <div className="flex gap-3">
        <Link
          to="/reports"
          className="text-gray-300 text-sm font-medium px-3 py-2 rounded-lg bg-brand-border active:bg-gray-600"
        >
          Reports
        </Link>
        <Link
          to="/report"
          className="text-white text-sm font-bold px-3 py-2 rounded-lg bg-brand-red active:opacity-80"
        >
          + Report
        </Link>
        <button
          onClick={signOut}
          className="text-gray-500 text-sm px-3 py-2 rounded-lg active:text-white transition-colors"
        >
          Out
        </button>
      </div>
    </nav>
  );
}
