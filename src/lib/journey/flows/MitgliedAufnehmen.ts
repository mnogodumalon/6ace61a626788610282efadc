/**
 * useMitgliedAufnehmenFlow — the plumbing of the flow « Mitglied aufnehmen », generated from the plan.
 *
 * Writes `mitglieder`: asks `email`, `telefon`, `vorname`, `nachname`, `beitragsart`, `geburtsdatum`, `trainingsgruppe`; sets `mitglied_seit` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 3)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useMitgliedAufnehmenFlow({
 *     steps: { trainingsgruppe: 1, email: 2, telefon: 2, vorname: 2, nachname: 2, beitragsart: 2, geburtsdatum: 2 },
 *     items: { trainingsgruppe: r => ({ id: r.id, title: fieldText(r, 'gruppenname') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.trainingsgruppe.select} {...flow.pick('trainingsgruppe')} />
 *     <Bound form={flow.forms.mitglieder} name="email" />
 *     <Bound form={flow.forms.mitglieder} name="telefon" />
 *     <Bound form={flow.forms.mitglieder} name="vorname" />
 *     <Bound form={flow.forms.mitglieder} name="nachname" />
 *     <Bound form={flow.forms.mitglieder} name="beitragsart" />
 *     <Bound form={flow.forms.mitglieder} name="geburtsdatum" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
export type MitgliedAufnehmenFieldKey = 'beitragsart' | 'email' | 'geburtsdatum' | 'nachname' | 'telefon' | 'trainingsgruppe' | 'vorname';

export interface MitgliedAufnehmenForms {
  mitglieder: StepForm<'mitglieder'>;
}

// Alias so the option generics stay readable.
type Key = MitgliedAufnehmenFieldKey;

export interface MitgliedAufnehmenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    trainingsgruppe?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"beitragsart": 2, "email": 2, "geburtsdatum": 2, "nachname": 2, "telefon": 2, "trainingsgruppe": 1, "vorname": 2};
export const MITGLIEDAUFNEHMEN_REVIEW_STEP = 3;

function fromPick<T>(pick: { recordOf(id: string): JourneyRecord | undefined }, form: StepForm, field: string, read: (r: JourneyRecord) => T): T | undefined {
  const id = form.get(field);
  const rec = typeof id === 'string' && id ? pick.recordOf(id) : undefined;
  return rec ? read(rec) : undefined;
}
function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}

export function useMitgliedAufnehmenFlow(options: MitgliedAufnehmenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const mitglieder = useStepForm('mitglieder', {
    fields: ["email", "telefon", "vorname", "nachname", "beitragsart", "geburtsdatum", "trainingsgruppe"],
    steps: only(steps, ["email", "telefon", "vorname", "nachname", "beitragsart", "geburtsdatum", "trainingsgruppe"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["email", "telefon", "vorname", "nachname", "beitragsart", "geburtsdatum", "trainingsgruppe"]),
    messages: only(options.messages as Record<string, string> | undefined, ["email", "telefon", "vorname", "nachname", "beitragsart", "geburtsdatum", "trainingsgruppe"]),
  });
  const forms: MitgliedAufnehmenForms = { mitglieder };
  const formList: StepForm[] = [mitglieder];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    trainingsgruppe: useRecordSearch(servicePort, 'trainingsgruppen', withPickPolicy('trainingsgruppe', {
      searchFields: ["gruppenname", "beginn", "ende"] as never,
      toItem: options.items?.trainingsgruppe as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:mitglied-aufnehmen:read:${entity}`);
  const picks = {
    trainingsgruppe: { ...searches.trainingsgruppe, select: { ...searches.trainingsgruppe.select, create: false as boolean, hint: hintFor('trainingsgruppe', 'trainingsgruppen', null as PickWhere | null) } },
  };

  const plan: PlanStep[] = [
    {
      key: 'mitglieder', entity: 'mitglieder', form: mitglieder, primary: true,
      values: (): FormValues => ({
        mitglied_seit: policyFixedValue('mitglieder', 'mitglied_seit') ?? todayIso(),
      }),

      // the planner's assumptions that first act here — shown once with „Passt“ / „ändern“
      notices: () => [{"assumed": "heutiges Datum", "id": "mitglied-seit-datum", "question": "Welches Datum gilt als Mitglied seit?"}],
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'mitglied-aufnehmen' });

  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: MitgliedAufnehmenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id)),
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: MitgliedAufnehmenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)));
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); };

  return {
    slug: 'mitglied-aufnehmen' as const,
    draftKey: 'mitglied-aufnehmen' as const,
    entity: 'mitglieder' as const,
    form: mitglieder,
    forms, formList, picks, submit, steps,    reviewStep: MITGLIEDAUFNEHMEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type MitgliedAufnehmenFlow = ReturnType<typeof useMitgliedAufnehmenFlow>;
