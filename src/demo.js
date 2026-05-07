const DEMO_KEY = 'drivershame_demo_reports';

export function isDemo() {
  return sessionStorage.getItem('demo') === '1';
}

export function enableDemo() {
  sessionStorage.setItem('demo', '1');
}

export function disableDemo() {
  sessionStorage.removeItem('demo');
}

const SEED = [
  {
    id: 'seed-1',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    plate_state: 'CA',
    plate_number: '7ABC123',
    vehicle_make: 'BMW',
    vehicle_model: 'X5',
    vehicle_color: 'Black',
    offense_types: ['tailgating', 'aggressive'],
    notes: 'Weaving between lanes at 90mph on the freeway.',
    reporter_email: 'demo@example.com',
  },
  {
    id: 'seed-2',
    created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    plate_state: 'TX',
    plate_number: 'HBJ4892',
    vehicle_make: 'Ford',
    vehicle_model: 'F-150',
    vehicle_color: 'Red',
    offense_types: ['ran_red', 'speeding'],
    notes: '',
    reporter_email: 'demo@example.com',
  },
  {
    id: 'seed-3',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    plate_state: 'NY',
    plate_number: 'MKZ7731',
    vehicle_make: 'Toyota',
    vehicle_model: 'Camry',
    vehicle_color: 'Silver',
    offense_types: ['phone'],
    notes: 'Swerving badly, clearly on the phone the entire time.',
    reporter_email: 'demo@example.com',
  },
];

function loadReports() {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    return raw ? JSON.parse(raw) : [...SEED];
  } catch {
    return [...SEED];
  }
}

function saveReports(reports) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(reports));
}

export function demoInsertReport(report) {
  const reports = loadReports();
  const newReport = {
    ...report,
    id: `demo-${Date.now()}`,
    created_at: new Date().toISOString(),
    reporter_email: 'demo@example.com',
  };
  reports.unshift(newReport);
  saveReports(reports);
  return newReport;
}

export function demoQueryReports(plateSearch) {
  const reports = loadReports();
  if (!plateSearch.trim()) return reports;
  const q = plateSearch.trim().toUpperCase();
  return reports.filter((r) => r.plate_number.toUpperCase().includes(q));
}
