/**
 * Trainingsgruppe anlegen — 4-Schritt-Wizard.
 * Steps: 1) Gruppenname eingeben → 2) Trainer wählen → 3) Wochentag, Beginn und Ende → 4) Prüfen & speichern.
 * Reads: trainer. Writes: trainingsgruppen (via useTrainingsgruppeAnlegenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText } from '@/lib/journey';
import { useTrainingsgruppeAnlegenFlow } from '@/lib/journey/flows/TrainingsgruppeAnlegen';
import { tx } from '@/i18n';

export default function TrainingsgruppeAnlegenPage() {
  const [step, setStep] = useState(1);
  const flow = useTrainingsgruppeAnlegenFlow({
    steps: { gruppenname: 1, trainer: 2, wochentag: 3, beginn: 3, ende: 3, bemerkung: 3 },
    items: {
      trainer: r => ({
        id: r.id,
        title: `${fieldText(r, 'vorname')} ${fieldText(r, 'nachname')}`.trim(),
        subtitle: fieldText(r, 'trainerlizenz'),
      }),
    },
  });
  const form = flow.forms.trainingsgruppen;

  return (
    <IntentWizardShell
      title={tx('Trainingsgruppe anlegen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine neue Trainingsgruppe mit Trainer, Wochentag und Uhrzeiten einrichten.'),
        needs: [tx('Name der Gruppe'), tx('Trainer'), tx('Trainingszeit')],
      }}
    >
      <WizardStep label={tx('Gruppenname')} description={tx('Wie soll die Trainingsgruppe heißen?')}>
        <div className="space-y-4">
          <Bound form={form} name="gruppenname" placeholder={tx('z. B. Jugend Anfänger')} />
          <StepNav hideBack onNext={() => flow.validateStep(1)} nextStepLabel={tx('Trainer')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Trainer')} description={tx('Wer leitet das Training?')} needs={['gruppenname']}>
        <EntitySelectStep
          {...flow.picks.trainer.select}
          {...flow.pick('trainer')}
          avatar="initials"
          searchPlaceholder={tx('Name suchen …')}
        />
      </WizardStep>
      <WizardStep label={tx('Zeit')} description={tx('Wann findet das Training statt?')} needs={['trainer']}>
        <div className="space-y-4">
          <Bound form={form} name="wochentag" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Bound form={form} name="beginn" placeholder="17:00" />
            <Bound form={form} name="ende" placeholder="18:30" />
          </div>
          <Bound form={form} name="bemerkung" rows={3} />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Die Trainingsgruppe steht danach bei der Aufnahme neuer Mitglieder zur Auswahl.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Mitglied aufnehmen'), href: '#/intents/mitglied-aufnehmen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
