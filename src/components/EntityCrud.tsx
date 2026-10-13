/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'trainer'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.trainer.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.trainer.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.trainer.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.trainer              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   trainer: vorname, nachname, email, telefon, trainerlizenz  ·  ← trainingsgruppen (list + contextual +)
 *   trainingsgruppen: max_teilnehmer, gruppenname, trainer, wochentag, beginn, ende, bemerkung  ·  → trainer · ← mitglieder (list + contextual +)
 *   mitglieder: vorname, nachname, email, telefon, geburtsdatum, mitglied_seit, beitragsart, trainingsgruppe  ·  → trainingsgruppen · ← platzbuchungen (list + contextual +)
 *   turniere: turniername, turnierbeginn, turnierende, meldeschluss, wettbewerb, altersklasse, austragungsort, startgeld, …  ·  ← turnieranmeldungen (list + contextual +)
 *   turnieranmeldungen: einwilligung, teilnehmer_geburtsdatum, vereinsmitglied, verein, wettbewerb_wunsch, anmerkung, turnier, teilnehmer_vorname, …  ·  → turniere
 *   platzbuchungen: mitglied, platz, platzart, beginn, ende, buchungsart, bemerkung  ·  → mitglieder
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Trainer, Trainingsgruppen, Mitglieder, Turniere, Turnieranmeldungen, Platzbuchungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { enrichTrainingsgruppen, enrichMitglieder, enrichTurnieranmeldungen, enrichPlatzbuchungen } from '@/lib/enrich';
import type { EnrichedTrainingsgruppen, EnrichedMitglieder, EnrichedTurnieranmeldungen, EnrichedPlatzbuchungen } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { TrainerDialog, type TrainerDialogDefaults } from '@/components/dialogs/TrainerDialog';
import { TrainerDetails } from '@/components/details/TrainerDetails';
import { TrainingsgruppenDialog, type TrainingsgruppenDialogDefaults } from '@/components/dialogs/TrainingsgruppenDialog';
import { TrainingsgruppenDetails } from '@/components/details/TrainingsgruppenDetails';
import { MitgliederDialog, type MitgliederDialogDefaults } from '@/components/dialogs/MitgliederDialog';
import { MitgliederDetails } from '@/components/details/MitgliederDetails';
import { TurniereDialog, type TurniereDialogDefaults } from '@/components/dialogs/TurniereDialog';
import { TurniereDetails } from '@/components/details/TurniereDetails';
import { TurnieranmeldungenDialog, type TurnieranmeldungenDialogDefaults } from '@/components/dialogs/TurnieranmeldungenDialog';
import { TurnieranmeldungenDetails } from '@/components/details/TurnieranmeldungenDetails';
import { PlatzbuchungenDialog, type PlatzbuchungenDialogDefaults } from '@/components/dialogs/PlatzbuchungenDialog';
import { PlatzbuchungenDetails } from '@/components/details/PlatzbuchungenDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'trainer'; record: Trainer }
  | { type: 'trainingsgruppen'; record: EnrichedTrainingsgruppen }
  | { type: 'mitglieder'; record: EnrichedMitglieder }
  | { type: 'turniere'; record: Turniere }
  | { type: 'turnieranmeldungen'; record: EnrichedTurnieranmeldungen }
  | { type: 'platzbuchungen'; record: EnrichedPlatzbuchungen };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
  /** May the signed-in user create/change records of this list? (the
   *  platform's rights — show a „+ Neu“ only when true; openCreate/openEdit
   *  refuse with a notice otherwise). */
  canWrite: boolean;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  trainer: EntityCrudApi<Trainer, TrainerDialogDefaults>;
  trainingsgruppen: EntityCrudApi<Trainingsgruppen, TrainingsgruppenDialogDefaults>;
  mitglieder: EntityCrudApi<Mitglieder, MitgliederDialogDefaults>;
  turniere: EntityCrudApi<Turniere, TurniereDialogDefaults>;
  turnieranmeldungen: EntityCrudApi<Turnieranmeldungen, TurnieranmeldungenDialogDefaults>;
  platzbuchungen: EntityCrudApi<Platzbuchungen, PlatzbuchungenDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { trainer: Trainer[]; trainingsgruppen: EnrichedTrainingsgruppen[]; mitglieder: EnrichedMitglieder[]; turniere: Turniere[]; turnieranmeldungen: EnrichedTurnieranmeldungen[]; platzbuchungen: EnrichedPlatzbuchungen[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  // the platform's rights of the signed-in user (lib/permissions.ts) — unknown = allowed
  const perms = usePermissions();
  const refuse = () => { toast.error(t('perm_denied_title'), { description: t('perm_denied_desc') }); };
  const [trainerDialog, setTrainerDialog] = useState<{ defaults?: TrainerDialogDefaults; editing?: Trainer } | null>(null);
  const [trainingsgruppenDialog, setTrainingsgruppenDialog] = useState<{ defaults?: TrainingsgruppenDialogDefaults; editing?: Trainingsgruppen } | null>(null);
  const [mitgliederDialog, setMitgliederDialog] = useState<{ defaults?: MitgliederDialogDefaults; editing?: Mitglieder } | null>(null);
  const [turniereDialog, setTurniereDialog] = useState<{ defaults?: TurniereDialogDefaults; editing?: Turniere } | null>(null);
  const [turnieranmeldungenDialog, setTurnieranmeldungenDialog] = useState<{ defaults?: TurnieranmeldungenDialogDefaults; editing?: Turnieranmeldungen } | null>(null);
  const [platzbuchungenDialog, setPlatzbuchungenDialog] = useState<{ defaults?: PlatzbuchungenDialogDefaults; editing?: Platzbuchungen } | null>(null);
  const enrichedTrainingsgruppen = useMemo(() => enrichTrainingsgruppen(data.trainingsgruppen, { trainerMap: data.trainerMap }), [data.trainingsgruppen, data.trainerMap]);
  const enrichedMitglieder = useMemo(() => enrichMitglieder(data.mitglieder, { trainingsgruppenMap: data.trainingsgruppenMap }), [data.mitglieder, data.trainingsgruppenMap]);
  const enrichedTurnieranmeldungen = useMemo(() => enrichTurnieranmeldungen(data.turnieranmeldungen, { turniereMap: data.turniereMap }), [data.turnieranmeldungen, data.turniereMap]);
  const enrichedPlatzbuchungen = useMemo(() => enrichPlatzbuchungen(data.platzbuchungen, { mitgliederMap: data.mitgliederMap }), [data.platzbuchungen, data.mitgliederMap]);

  function detailTrainer(record: Trainer, push = false) {
    const item: OverlayItem = { type: 'trainer', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitTrainer(fields: Trainer['fields']) {
    const editing = trainerDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setTrainer(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateTrainerEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('trainer')} — ${t('crud_updated')}`, async () => {
        data.setTrainer(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateTrainerEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createTrainerEntry(fields);
      undoToast(`${appLabel('trainer')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailTrainingsgruppen(record: Trainingsgruppen, push = false) {
    const rec = enrichedTrainingsgruppen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'trainingsgruppen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitTrainingsgruppen(fields: Trainingsgruppen['fields']) {
    const editing = trainingsgruppenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setTrainingsgruppen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateTrainingsgruppenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('trainingsgruppen')} — ${t('crud_updated')}`, async () => {
        data.setTrainingsgruppen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateTrainingsgruppenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createTrainingsgruppenEntry(fields);
      undoToast(`${appLabel('trainingsgruppen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailMitglieder(record: Mitglieder, push = false) {
    const rec = enrichedMitglieder.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'mitglieder', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitMitglieder(fields: Mitglieder['fields']) {
    const editing = mitgliederDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setMitglieder(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateMitgliederEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('mitglieder')} — ${t('crud_updated')}`, async () => {
        data.setMitglieder(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateMitgliederEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createMitgliederEntry(fields);
      undoToast(`${appLabel('mitglieder')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailTurniere(record: Turniere, push = false) {
    const item: OverlayItem = { type: 'turniere', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitTurniere(fields: Turniere['fields']) {
    const editing = turniereDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setTurniere(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateTurniereEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('turniere')} — ${t('crud_updated')}`, async () => {
        data.setTurniere(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateTurniereEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createTurniereEntry(fields);
      undoToast(`${appLabel('turniere')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailTurnieranmeldungen(record: Turnieranmeldungen, push = false) {
    const rec = enrichedTurnieranmeldungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'turnieranmeldungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitTurnieranmeldungen(fields: Turnieranmeldungen['fields']) {
    const editing = turnieranmeldungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setTurnieranmeldungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateTurnieranmeldungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('turnieranmeldungen')} — ${t('crud_updated')}`, async () => {
        data.setTurnieranmeldungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateTurnieranmeldungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createTurnieranmeldungenEntry(fields);
      undoToast(`${appLabel('turnieranmeldungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailPlatzbuchungen(record: Platzbuchungen, push = false) {
    const rec = enrichedPlatzbuchungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'platzbuchungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitPlatzbuchungen(fields: Platzbuchungen['fields']) {
    const editing = platzbuchungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setPlatzbuchungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updatePlatzbuchungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('platzbuchungen')} — ${t('crud_updated')}`, async () => {
        data.setPlatzbuchungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updatePlatzbuchungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createPlatzbuchungenEntry(fields);
      undoToast(`${appLabel('platzbuchungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <TrainerDialog
        open={trainerDialog !== null}
        onClose={() => setTrainerDialog(null)}
        onSubmit={submitTrainer}
        defaultValues={trainerDialog?.defaults}
        recordId={trainerDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Trainer']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Trainer']}
      />
      <TrainingsgruppenDialog
        open={trainingsgruppenDialog !== null}
        onClose={() => setTrainingsgruppenDialog(null)}
        onSubmit={submitTrainingsgruppen}
        defaultValues={trainingsgruppenDialog?.defaults}
        recordId={trainingsgruppenDialog?.editing?.record_id}
        trainerList={data.trainer}
        enablePhotoScan={AI_PHOTO_SCAN['Trainingsgruppen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Trainingsgruppen']}
      />
      <MitgliederDialog
        open={mitgliederDialog !== null}
        onClose={() => setMitgliederDialog(null)}
        onSubmit={submitMitglieder}
        defaultValues={mitgliederDialog?.defaults}
        recordId={mitgliederDialog?.editing?.record_id}
        trainingsgruppenList={data.trainingsgruppen}
        enablePhotoScan={AI_PHOTO_SCAN['Mitglieder']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Mitglieder']}
      />
      <TurniereDialog
        open={turniereDialog !== null}
        onClose={() => setTurniereDialog(null)}
        onSubmit={submitTurniere}
        defaultValues={turniereDialog?.defaults}
        recordId={turniereDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Turniere']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Turniere']}
      />
      <TurnieranmeldungenDialog
        open={turnieranmeldungenDialog !== null}
        onClose={() => setTurnieranmeldungenDialog(null)}
        onSubmit={submitTurnieranmeldungen}
        defaultValues={turnieranmeldungenDialog?.defaults}
        recordId={turnieranmeldungenDialog?.editing?.record_id}
        turniereList={data.turniere}
        enablePhotoScan={AI_PHOTO_SCAN['Turnieranmeldungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Turnieranmeldungen']}
      />
      <PlatzbuchungenDialog
        open={platzbuchungenDialog !== null}
        onClose={() => setPlatzbuchungenDialog(null)}
        onSubmit={submitPlatzbuchungen}
        defaultValues={platzbuchungenDialog?.defaults}
        recordId={platzbuchungenDialog?.editing?.record_id}
        mitgliederList={data.mitglieder}
        enablePhotoScan={AI_PHOTO_SCAN['Platzbuchungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Platzbuchungen']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'trainer') {
            return (
              <>
                <RecordHeader title={top.record.fields.vorname ?? appLabel('trainer')} subtitle={undefined} />
                <TrainerDetails
                  record={top.record}
                  trainingsgruppenList={data.trainingsgruppen}
                  onOpenTrainingsgruppen={(r) => detailTrainingsgruppen(r, true)}
                  onAddTrainingsgruppen={perms.canWrite('trainingsgruppen') ? () => setTrainingsgruppenDialog({ defaults: { trainer: createRecordUrl(APP_IDS.TRAINER, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'trainingsgruppen') {
            return (
              <>
                <RecordHeader title={top.record.fields.gruppenname ?? appLabel('trainingsgruppen')} subtitle={undefined} />
                <TrainingsgruppenDetails
                  record={top.record}
                  trainerList={data.trainer}
                  onOpenTrainer={(r) => detailTrainer(r, true)}
                  mitgliederList={data.mitglieder}
                  onOpenMitglieder={(r) => detailMitglieder(r, true)}
                  onAddMitglieder={perms.canWrite('mitglieder') ? () => setMitgliederDialog({ defaults: { trainingsgruppe: createRecordUrl(APP_IDS.TRAININGSGRUPPEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'mitglieder') {
            return (
              <>
                <RecordHeader title={top.record.fields.vorname ?? appLabel('mitglieder')} subtitle={top.record.fields.geburtsdatum ? formatDate(top.record.fields.geburtsdatum) : undefined} />
                <MitgliederDetails
                  record={top.record}
                  trainingsgruppenList={data.trainingsgruppen}
                  onOpenTrainingsgruppen={(r) => detailTrainingsgruppen(r, true)}
                  platzbuchungenList={data.platzbuchungen}
                  onOpenPlatzbuchungen={(r) => detailPlatzbuchungen(r, true)}
                  onAddPlatzbuchungen={perms.canWrite('platzbuchungen') ? () => setPlatzbuchungenDialog({ defaults: { mitglied: createRecordUrl(APP_IDS.MITGLIEDER, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'turniere') {
            return (
              <>
                <RecordHeader title={top.record.fields.turniername ?? appLabel('turniere')} subtitle={top.record.fields.turnierbeginn ? formatDate(top.record.fields.turnierbeginn) : undefined} />
                <TurniereDetails
                  record={top.record}
                  turnieranmeldungenList={data.turnieranmeldungen}
                  onOpenTurnieranmeldungen={(r) => detailTurnieranmeldungen(r, true)}
                  onAddTurnieranmeldungen={perms.canWrite('turnieranmeldungen') ? () => setTurnieranmeldungenDialog({ defaults: { turnier: createRecordUrl(APP_IDS.TURNIERE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'turnieranmeldungen') {
            return (
              <>
                <RecordHeader title={top.record.fields.verein ?? appLabel('turnieranmeldungen')} subtitle={top.record.fields.teilnehmer_geburtsdatum ? formatDate(top.record.fields.teilnehmer_geburtsdatum) : undefined} />
                <TurnieranmeldungenDetails
                  record={top.record}
                  turniereList={data.turniere}
                  onOpenTurniere={(r) => detailTurniere(r, true)}
                />
              </>
            );
          }
          if (top.type === 'platzbuchungen') {
            return (
              <>
                <RecordHeader title={appLabel('platzbuchungen')} subtitle={top.record.fields.beginn ? formatDate(top.record.fields.beginn) : undefined} />
                <PlatzbuchungenDetails
                  record={top.record}
                  mitgliederList={data.mitglieder}
                  onOpenMitglieder={(r) => detailMitglieder(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        canEdit={(top) => {
          if (top.type === 'trainer') return perms.canWrite('trainer');
          if (top.type === 'trainingsgruppen') return perms.canWrite('trainingsgruppen');
          if (top.type === 'mitglieder') return perms.canWrite('mitglieder');
          if (top.type === 'turniere') return perms.canWrite('turniere');
          if (top.type === 'turnieranmeldungen') return perms.canWrite('turnieranmeldungen');
          if (top.type === 'platzbuchungen') return perms.canWrite('platzbuchungen');
          return true;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'trainer') setTrainerDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'trainingsgruppen') setTrainingsgruppenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'mitglieder') setMitgliederDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'turniere') setTurniereDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'turnieranmeldungen') setTurnieranmeldungenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'platzbuchungen') setPlatzbuchungenDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    trainer: {
      openCreate: (defaults?: TrainerDialogDefaults) => (perms.canWrite('trainer') ? setTrainerDialog({ defaults }) : refuse()),
      openEdit: (record: Trainer) => (perms.canWrite('trainer') ? setTrainerDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Trainer) => detailTrainer(record, false),
      canWrite: perms.canWrite('trainer'),
    },
    trainingsgruppen: {
      openCreate: (defaults?: TrainingsgruppenDialogDefaults) => (perms.canWrite('trainingsgruppen') ? setTrainingsgruppenDialog({ defaults }) : refuse()),
      openEdit: (record: Trainingsgruppen) => (perms.canWrite('trainingsgruppen') ? setTrainingsgruppenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Trainingsgruppen) => detailTrainingsgruppen(record, false),
      canWrite: perms.canWrite('trainingsgruppen'),
    },
    mitglieder: {
      openCreate: (defaults?: MitgliederDialogDefaults) => (perms.canWrite('mitglieder') ? setMitgliederDialog({ defaults }) : refuse()),
      openEdit: (record: Mitglieder) => (perms.canWrite('mitglieder') ? setMitgliederDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Mitglieder) => detailMitglieder(record, false),
      canWrite: perms.canWrite('mitglieder'),
    },
    turniere: {
      openCreate: (defaults?: TurniereDialogDefaults) => (perms.canWrite('turniere') ? setTurniereDialog({ defaults }) : refuse()),
      openEdit: (record: Turniere) => (perms.canWrite('turniere') ? setTurniereDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Turniere) => detailTurniere(record, false),
      canWrite: perms.canWrite('turniere'),
    },
    turnieranmeldungen: {
      openCreate: (defaults?: TurnieranmeldungenDialogDefaults) => (perms.canWrite('turnieranmeldungen') ? setTurnieranmeldungenDialog({ defaults }) : refuse()),
      openEdit: (record: Turnieranmeldungen) => (perms.canWrite('turnieranmeldungen') ? setTurnieranmeldungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Turnieranmeldungen) => detailTurnieranmeldungen(record, false),
      canWrite: perms.canWrite('turnieranmeldungen'),
    },
    platzbuchungen: {
      openCreate: (defaults?: PlatzbuchungenDialogDefaults) => (perms.canWrite('platzbuchungen') ? setPlatzbuchungenDialog({ defaults }) : refuse()),
      openEdit: (record: Platzbuchungen) => (perms.canWrite('platzbuchungen') ? setPlatzbuchungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Platzbuchungen) => detailPlatzbuchungen(record, false),
      canWrite: perms.canWrite('platzbuchungen'),
    },
    enriched: { trainer: data.trainer, trainingsgruppen: enrichedTrainingsgruppen, mitglieder: enrichedMitglieder, turniere: data.turniere, turnieranmeldungen: enrichedTurnieranmeldungen, platzbuchungen: enrichedPlatzbuchungen },
  };
}
