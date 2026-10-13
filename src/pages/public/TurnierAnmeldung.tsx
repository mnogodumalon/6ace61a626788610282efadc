import { useEffect, useMemo, useState } from 'react';
import { PublicShell } from '@/components/PublicShell';
import {
  loadPublicPagesConfig,
  type PublicPagesConfig,
  type PublicPageConfig,
} from '@/lib/publicClient';
import {
  useStepForm,
  useJourneySubmit,
  useRecordSearch,
  fieldText,
  fieldDate,
  fieldNumber,
  fieldLookups,
  formatFieldValue,
} from '@/lib/journey';
import { createPublicPort } from '@/lib/journey/publicPort';
import { IntentWizardShell, type WizardStep } from '@/components/blocks/IntentWizardShell';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { tx } from '@/i18n';

const SLUG = 'turnier-anmeldung';


export default function TurnierAnmeldung() {
  const [cfg, setCfg] = useState<PublicPagesConfig | null>(null);
  const [page, setPage] = useState<PublicPageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicPagesConfig(SLUG).then(c => {
      setCfg(c);
      setPage(c?.pages[SLUG] ?? null);
      setLoading(false);
    });
  }, []);

  if (loading || !cfg || !page) {
    return <PublicShell loading={loading} unavailable={!loading} />;
  }
  return (
    <PublicShell title={page.title || tx('Turnieranmeldung')} description={page.description}>
      <Wizard cfg={cfg} page={page} />
    </PublicShell>
  );
}

function Wizard({ cfg, page }: { cfg: PublicPagesConfig; page: PublicPageConfig }) {
  const [step, setStep] = useState(1);
  const port = useMemo(() => createPublicPort(cfg, page), [cfg, page]);

  const form = useStepForm('turnieranmeldungen', {
    fields: [
  'turnier',
  'teilnehmer_vorname',
  'teilnehmer_nachname',
  'teilnehmer_email',
  'telefon',
  'teilnehmer_geburtsdatum',
  'vereinsmitglied',
  'verein',
  'wettbewerb_wunsch',
  'anmerkung',
  'einwilligung',
    ],
    autoComplete: true,
    steps: {
      turnier: 1,
      teilnehmer_vorname: 2,
      teilnehmer_nachname: 2,
      teilnehmer_email: 2,
      telefon: 2,
      teilnehmer_geburtsdatum: 2,
      vereinsmitglied: 2,
      verein: 2,
      wettbewerb_wunsch: 2,
      anmerkung: 2,
      einwilligung: 2,
    },
  });

  const turniere = useRecordSearch(port, 'turniere', {
    searchFields: ['turniername', 'austragungsort'],
    orderby: ['turnierbeginn'],
    toItem: r => {
      const von = fieldDate(r, 'turnierbeginn');
      const bis = fieldDate(r, 'turnierende');
      const ort = fieldText(r, 'austragungsort');
      const klasse = fieldText(r, 'altersklasse');
      const geld = fieldNumber(r, 'startgeld');
      const wb = fieldLookups(r, 'wettbewerb').map(l => l.label).join(', ');
      const zeit = von
        ? bis && bis !== von
          ? `${formatFieldValue('turniere', 'turnierbeginn', von)} – ${formatFieldValue('turniere', 'turnierende', bis)}`
          : formatFieldValue('turniere', 'turnierbeginn', von)
        : '';
      return {
        id: r.id,
        title: fieldText(r, 'turniername'),
        subtitle: [zeit, ort, klasse, wb].filter(Boolean).join(' · '),
        stats: [
          ...(geld != null ? [{ label: tx('Startgeld'), value: formatFieldValue('turniere', 'startgeld', geld) }] : []),
          {
            label: tx('Meldeschluss'),
            value: formatFieldValue('turniere', 'meldeschluss', fieldDate(r, 'meldeschluss')),
          },
        ],
      };
    },
  });

  const submit = useJourneySubmit(
    port,
    [{ key: 'anmeldung', entity: 'turnieranmeldungen', form, primary: true }],
    { draftKey: SLUG },
  );

  const steps: WizardStep[] = [
    { label: tx('Turnier'), heading: tx('Turnier wählen'), description: tx('Wähle das Turnier, zu dem du dich anmelden möchtest.') },
    { label: tx('Deine Daten'), heading: tx('Deine Daten'), description: tx('Wer nimmt teil und in welchem Wettbewerb?') },
    { label: tx('Prüfen'), heading: tx('Alles richtig?') },
  ];

  return (
    <IntentWizardShell
      steps={steps}
      currentStep={step}
      onStepChange={setStep}
      back={false}
      forms={[form]}
      draftKey={SLUG}
    >
      {step === 1 && (
        <>
          <Field form={form} name="turnier">
          <EntitySelectStep
            {...turniere.select}
            {...form.record('turnier')}
            avatar="none"
            emptyText={tx('Aktuell sind keine Turniere zur Anmeldung geöffnet.')}
            selectedId={form.get('turnier') as string | null}
            onSelect={id => form.set('turnier', id, turniere.labelOf(id))}
          />
          </Field>
          <StepNav
            hideBack
            onNext={() => form.validate(['turnier'])}
            nextStepLabel={tx('Deine Daten')}
          />
        </>
      )}
      {step === 2 && (
        <>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Bound form={form} name="teilnehmer_vorname" />
              <Bound form={form} name="teilnehmer_nachname" />
            </div>
            <Bound form={form} name="teilnehmer_email" />
            <Bound form={form} name="telefon" />
            <Bound form={form} name="teilnehmer_geburtsdatum" />
            <Bound form={form} name="wettbewerb_wunsch" />
            <Bound form={form} name="vereinsmitglied" />
            {!form.get('vereinsmitglied') && <Bound form={form} name="verein" />}
            <Bound form={form} name="anmerkung" />
            <Bound form={form} name="einwilligung" />
          </div>
          <StepNav
            onBack={() => setStep(1)}
            onNext={() =>
              form.validate([
                'teilnehmer_vorname',
                'teilnehmer_nachname',
                'teilnehmer_email',
                'telefon',
                'teilnehmer_geburtsdatum',
                'wettbewerb_wunsch',
                'einwilligung',
              ])
            }
            nextStepLabel={tx('Prüfen')}
          />
        </>
      )}
      {step === 3 && !submit.done && (
        <SummaryStep
          forms={[form]}
          submit={submit}
          whatHappensNext={tx('Der Verein prüft deine Anmeldung und meldet sich per E-Mail bei dir.')}
        />
      )}
      {submit.result && (
        <SuccessStep
          result={submit.result}
          forms={[form]}
          submit={submit}
          title={tx('Anmeldung eingegangen')}
          whatHappensNext={tx('Der Verein prüft deine Anmeldung und meldet sich per E-Mail bei dir.')}
        />
      )}
    </IntentWizardShell>
  );
}
