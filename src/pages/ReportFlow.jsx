import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import StepState from './steps/StepState';
import StepPlate from './steps/StepPlate';
import StepMake from './steps/StepMake';
import StepModel from './steps/StepModel';
import StepColor from './steps/StepColor';
import StepOffense from './steps/StepOffense';
import StepConfirm from './steps/StepConfirm';

const STEP_STATE   = 1;
const STEP_PLATE   = 2;
const STEP_MAKE    = 3;
const STEP_MODEL   = 4;
const STEP_COLOR   = 5;
const STEP_OFFENSE = 6;
const STEP_CONFIRM = 7;

const blank = {
  plate_state:    '',
  plate_number:   '',
  vehicle_make:   '',
  vehicle_model:  '',
  vehicle_color:  '',
  offense_types:  [],
  notes:          '',
};

export default function ReportFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP_STATE);
  const [report, setReport] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function set(field) {
    return (val) => setReport((r) => ({ ...r, [field]: val }));
  }

  function next() { setStep((s) => s + 1); }
  function back() { setStep((s) => s - 1); }

  async function submit() {
    setSubmitting(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: err } = await supabase.from('reports').insert({
        ...report,
        user_id: user.id,
        reporter_email: user.email,
      });
      if (err) throw err;
      navigate('/reports');
    } catch (e) {
      setError(e.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === STEP_STATE)
    return <StepState value={report.plate_state} onChange={set('plate_state')} onNext={next} />;

  if (step === STEP_PLATE)
    return (
      <StepPlate
        value={report.plate_number}
        plateState={report.plate_state}
        onChange={set('plate_number')}
        onNext={next}
        onBack={back}
      />
    );

  if (step === STEP_MAKE)
    return <StepMake value={report.vehicle_make} onChange={set('vehicle_make')} onNext={next} onBack={back} />;

  if (step === STEP_MODEL)
    return (
      <StepModel
        value={report.vehicle_model}
        make={report.vehicle_make}
        onChange={set('vehicle_model')}
        onNext={next}
        onBack={back}
      />
    );

  if (step === STEP_COLOR)
    return <StepColor value={report.vehicle_color} onChange={set('vehicle_color')} onNext={next} onBack={back} />;

  if (step === STEP_OFFENSE)
    return (
      <StepOffense
        selectedOffenses={report.offense_types}
        notes={report.notes}
        onChangeOffenses={set('offense_types')}
        onChangeNotes={set('notes')}
        onNext={next}
        onBack={back}
      />
    );

  if (step === STEP_CONFIRM)
    return (
      <>
        {error && (
          <p className="text-brand-red text-center font-semibold py-2 px-4">{error}</p>
        )}
        <StepConfirm report={report} onSubmit={submit} onBack={back} submitting={submitting} />
      </>
    );

  return null;
}
