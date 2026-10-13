/**
 * Mitglied aufnehmen — 4-Schritt-Wizard.
 * Steps: 1) Personen- und Kontaktdaten → 2) Beitragsart wählen → 3) Trainingsgruppe wählen → 4) Prüfen & speichern.
 * Reads: trainingsgruppen (inkl. Trainer). Writes: mitglieder (über useMitgliedAufnehmenFlow).
 * Composes: IntentWizardShell, Bound, Field, ChoiceGroup, EntitySelectStep, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { ChoiceGroup } from '@/components/blocks/ChoiceGroup';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useMitgliedAufnehmenFlow } from '@/lib/journey/flows/MitgliedAufnehmen';
import { tx } from '@/i18n';

export default function MitgliedAufnehmenPage() {
  const [step, setStep] = useState(1);
  const flow = useMitgliedAufnehmenFlow({
    steps: {
      vorname: 1, nachname: 1, email: 1, telefon: 1, geburtsdatum: 1,
      beitragsart: 2,
      trainingsgruppe: 3,
    },
    items: {
      trainingsgruppe: (g, ctx) => {
        const tag = fieldLookup(g, 'wochentag')?.label ?? '';
        const zeit = `${fieldText(g, 'beginn')} – ${fieldText(g, 'ende')}`;
        const trainer = ctx.ref('trainer');
        return {
          id: g.id,
          title: fieldText(g, 'gruppenname'),
          subtitle: [trainer ? tx`Trainer: ${trainer}` : '', `${tag} ${zeit}`.trim()].filter(Boolean).join(' · '),
        };
      },
    },
  });
  const f = flow.forms.mitglieder;

  return (
    <IntentWizardShell
      title={tx('Mitglied aufnehmen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Ein neues Mitglied erfassen und direkt einer Trainingsgruppe zuordnen.'),
        needs: [tx('Name und Kontaktdaten'), tx('Geburtsdatum'), tx('Gewünschte Beitragsart')],
      }}
    >
      <WizardStep label={tx('Person')} heading={tx('Personendaten')} description={tx('Name, Kontaktdaten und Geburtsdatum des neuen Mitglieds.')}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Bound form={f} name="vorname" />
            <Bound form={f} name="nachname" />
          </div>
          <Bound form={f} name="email" />
          <Bound form={f} name="telefon" />
          <Bound form={f} name="geburtsdatum" />
          <StepNav hideBack onNext={() => flow.validateStep(1)} nextStepLabel={tx('Beitragsart')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Beitragsart')} description={tx('Welche Beitragsart gilt für das Mitglied?')}>
        <div className="space-y-4">
          <Field form={f} name="beitragsart">
            <ChoiceGroup {...f.choice('beitragsart')} />
          </Field>
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Trainingsgruppe')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Trainingsgruppe')} description={tx('Trainingsgruppe mit Trainer und Zeiten auswählen — oder ohne Gruppe fortfahren.')}>
        <div className="space-y-4">
          <EntitySelectStep
            {...flow.picks.trainingsgruppe.select}
            {...flow.pick('trainingsgruppe')}
            avatar="none"
            searchPlaceholder={tx('Gruppenname suchen …')}
          />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Das Mitglied wird mit dem heutigen Datum als Eintritt angelegt.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Das Mitglied kann jetzt Plätze buchen.')}
          next={[
            { label: tx('Platz buchen'), href: '#/intents/platz-buchen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
