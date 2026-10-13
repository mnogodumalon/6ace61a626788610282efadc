/**
 * Platz buchen — 5-Schritt-Wizard.
 * Steps: 1) Mitglied auswählen → 2) Platz und Platzart wählen → 3) Beginn und Ende angeben
 *        → 4) Buchungsart und Bemerkung ergänzen → 5) Prüfen (Doppelbelegung) & speichern.
 * Reads: mitglieder, platzbuchungen (Belegung per Platz). Writes: platzbuchungen (über usePlatzBuchenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, Field, AvailabilityRangePicker, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { AvailabilityRangePicker } from '@/components/blocks/AvailabilityRangePicker';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, useOccupancy } from '@/lib/journey';
import { usePlatzBuchenFlow } from '@/lib/journey/flows/PlatzBuchen';
import { tx } from '@/i18n';

export default function PlatzBuchenPage() {
  const [step, setStep] = useState(1);
  const flow = usePlatzBuchenFlow({
    steps: { mitglied: 1, platz: 2, platzart: 2, beginn: 3, ende: 3, buchungsart: 4, bemerkung: 4 },
    items: {
      mitglied: m => ({
        id: m.id,
        title: `${fieldText(m, 'vorname')} ${fieldText(m, 'nachname')}`.trim(),
        subtitle: fieldText(m, 'email'),
      }),
    },
  });
  const f = flow.forms.platzbuchungen;
  const platz = (f.get('platz') as string | null) || null;
  const belegung = useOccupancy(flow.port, 'platzbuchungen', { resource: platz });

  return (
    <IntentWizardShell
      title={tx('Platz buchen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Buche einen Platz für einen Zeitraum – ohne Überschneidung mit anderen Buchungen.'),
        needs: [tx('Mitglied'), tx('Platz'), tx('Beginn und Ende')],
      }}
    >
      <WizardStep label={tx('Mitglied')} description={tx('Für wen soll der Platz gebucht werden?')}>
        <EntitySelectStep
          {...flow.picks.mitglied.select}
          {...flow.pick('mitglied')}
          avatar="initials"
          searchPlaceholder={tx('Name oder E-Mail …')}
        />
      </WizardStep>

      <WizardStep label={tx('Platz')} description={tx('Welcher Platz und welche Platzart?')} needs={['mitglied']}>
        <div className="space-y-4">
          <Bound form={f} name="platz" />
          <Bound form={f} name="platzart" />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Zeitraum')}
          />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Zeitraum')}
        description={tx('Beginn und Ende wählen — bereits gebuchte Tage sind ausgegraut.')}
        needs={['platz']}
      >
        <div className="space-y-4">
          <Field form={f} name="beginn">
            <AvailabilityRangePicker
              unit="days"
              {...f.range('beginn', 'ende', { blocked: belegung.blocked, unit: 'days' })}
            />
          </Field>
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Buchungsart')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Details')} description={tx('Wofür wird der Platz gebucht?')}>
        <div className="space-y-4">
          <Bound form={f} name="buchungsart" allowClear />
          <Bound form={f} name="bemerkung" rows={3} />
          <StepNav
            onBack={() => setStep(3)}
            onNext={() => flow.validateStep(4)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Vor dem Speichern wird geprüft, dass sich der Platz nicht mit einer anderen Buchung überschneidet.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Der Platz ist im gewählten Zeitraum für dich reserviert.')}
          next={[
            { label: tx('Weiteren Platz buchen'), onClick: () => flow.reset() },
            { label: tx('Mitglied aufnehmen'), href: '#/intents/mitglied-aufnehmen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
