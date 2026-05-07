import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { isDemo, demoInsertReport } from '../demo';
import StepType from './steps/StepType';
import StepState from './steps/StepState';
import StepPlate from './steps/StepPlate';
import StepMake from './steps/StepMake';
import StepModel from './steps/StepModel';
import StepColor from './steps/StepColor';
import StepOffense from './steps/StepOffense';
import StepPhoto from './steps/StepPhoto';
import StepConfirm from './steps/StepConfirm';

const STEP_TYPE    = 0;
const STEP_STATE   = 1;
const STEP_PLATE   = 2;
const STEP_MAKE    = 3;
const STEP_MODEL   = 4;
const STEP_COLOR   = 5;
const STEP_OFFENSE = 6;
const STEP_PHOTO   = 7;
const STEP_CONFIRM = 8;

const blank = {
  report_type:   '',
  plate_state:   '',
  plate_number:  '',
  vehicle_make:  '',
  vehicle_model: '',
  vehicle_color: '',
  offense_types: [],
  notes:         '',
  photo:         null,  // { file, preview } — not persisted to DB directly
};

export default function ReportFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP_TYPE);
  const [report, setReport] = useState(blank);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function set(field) {
    return (val) => setReport((r) => ({ ...r, [field]: val }));
  }

  function next() { setStep((s) => s + 1); }
  function back() { setStep((s) => s - 1); }

  function selectType(type) {
    set('report_type')(type);
    next();
  }

  async function uploadPhoto(file, userId) {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('report-photos')
      .upload(path, file, { upsert: false, contentType: file.type });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from('report-photos').getPublicUrl(path);
    return data.publicUrl;
  }

  async function submit() {
    setSubmitting(true);
    setError('');
    try {
      if (isDemo()) {
        demoInsertReport({
          ...report,
          photo_url: report.photo?.preview ?? null,
        });
      } else {
        const { data: { user } } = await supabase.auth.getUser();

        let photo_url = null;
        if (report.photo?.file) {
          photo_url = await uploadPhoto(report.photo.file, user.id);
        }

        const { error: err } = await supabase.from('reports').insert({
          report_type:   report.report_type,
          plate_state:   report.plate_state,
          plate_number:  report.plate_number,
          vehicle_make:  report.vehicle_make,
          vehicle_model: report.vehicle_model,
          vehicle_color: report.vehicle_color,
          offense_types: report.offense_types,
          notes:         report.notes,
          photo_url,
          user_id:       user.id,
          reporter_email: user.email,
        });
        if (err) throw err;
      }
      navigate('/reports');
    } catch (e) {
      setError(e.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === STEP_TYPE)
    return <StepType onChange={selectType} />;

  if (step === STEP_STATE)
    return <StepState value={report.plate_state} onChange={set('plate_state')} onNext={next} onBack={back} />;

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
        reportType={report.report_type}
        selectedOffenses={report.offense_types}
        notes={report.notes}
        onChangeOffenses={set('offense_types')}
        onChangeNotes={set('notes')}
        onNext={next}
        onBack={back}
      />
    );

  if (step === STEP_PHOTO)
    return <StepPhoto value={report.photo} onChange={set('photo')} onNext={next} onBack={back} />;

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
