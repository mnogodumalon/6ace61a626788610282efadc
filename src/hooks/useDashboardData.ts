import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Trainer, Trainingsgruppen, Mitglieder, Turniere, Turnieranmeldungen, Platzbuchungen } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { t } from '@/i18n';

/** Dashboard data + the OPTIMISTIC-WRITE API.
 *
 *  The per-entity setters (`set<Entity>`) are exported for exactly one job:
 *  optimistic updates on drag writes (onEventDrop / onEventResize /
 *  onCardMove). Call the setter FIRST — the bar/card lands instantly — then
 *  fire the PATCH in the background and call `fetchAll()` ONLY in the catch.
 *  Never await the PATCH before updating state (the UI freezes for the full
 *  round-trip on every drag) and never refetch after a successful write.
 *  There is no other mechanism (no `__optimistic`, no `mutate`).
 */
/** Entities this hook can load — the same keys the journey layer uses. */
export type DashboardEntity = 'trainer' | 'trainingsgruppen' | 'mitglieder' | 'turniere' | 'turnieranmeldungen' | 'platzbuchungen';

export interface DashboardDataOptions {
  /** Entities this page does NOT need (picked through useRecordSearch instead).
   *  Every flow page mounts this hook on its own route, so without `omit` a
   *  page that searches 3.000 guests server-side would still pull all 3.000
   *  through the side door. */
  omit?: DashboardEntity[];
}

export function useDashboardData(options: DashboardDataOptions = {}) {
  // A string key, not the array: an inline `omit={['gaeste']}` is a new array
  // on every render and would restart the fetch forever.
  const omitKey = (options.omit ?? []).slice().sort().join('|');
  const [trainer, setTrainer] = useState<Trainer[]>([]);
  const [trainingsgruppen, setTrainingsgruppen] = useState<Trainingsgruppen[]>([]);
  const [mitglieder, setMitglieder] = useState<Mitglieder[]>([]);
  const [turniere, setTurniere] = useState<Turniere[]>([]);
  const [turnieranmeldungen, setTurnieranmeldungen] = useState<Turnieranmeldungen[]>([]);
  const [platzbuchungen, setPlatzbuchungen] = useState<Platzbuchungen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  /** Lists the signed-in user may not read (403 on the platform). They load as
   *  empty and the rest of the page loads normally — one forbidden list used to
   *  empty the whole dashboard (05.10.2026). Hide a block whose list is here. */
  const [forbidden, setForbidden] = useState<DashboardEntity[]>([]);

  // Every list on its own: a 403 is „not yours“, any other failure is an error.
  const settle = useCallback((settled: PromiseSettledResult<unknown>[]) => {
    const denied: DashboardEntity[] = [];
    let failure: unknown = null;
    // null = this list failed for another reason: its current data stays
    const pick = <T,>(i: number, key: DashboardEntity): T[] | null => {
      const s = settled[i];
      if (s.status === 'fulfilled') return s.value as T[];
      if ((s.reason as { status?: number } | null)?.status === 403) { denied.push(key); return []; }
      failure = failure ?? s.reason;
      return null;
    };
    { const rows = pick<Trainer>(0, 'trainer'); if (rows) setTrainer(rows); }
    { const rows = pick<Trainingsgruppen>(1, 'trainingsgruppen'); if (rows) setTrainingsgruppen(rows); }
    { const rows = pick<Mitglieder>(2, 'mitglieder'); if (rows) setMitglieder(rows); }
    { const rows = pick<Turniere>(3, 'turniere'); if (rows) setTurniere(rows); }
    { const rows = pick<Turnieranmeldungen>(4, 'turnieranmeldungen'); if (rows) setTurnieranmeldungen(rows); }
    { const rows = pick<Platzbuchungen>(5, 'platzbuchungen'); if (rows) setPlatzbuchungen(rows); }
    setForbidden(prev => (prev.join('|') === denied.join('|') ? prev : denied));
    return failure;
  }, []);

  const fetchAll = useCallback(async () => {
    setError(null);
    const omit = new Set(omitKey ? omitKey.split('|') : []);
    try {
      const failure = settle(await Promise.allSettled([
        omit.has('trainer') ? Promise.resolve([] as Trainer[]) : LivingAppsService.getTrainer(),
        omit.has('trainingsgruppen') ? Promise.resolve([] as Trainingsgruppen[]) : LivingAppsService.getTrainingsgruppen(),
        omit.has('mitglieder') ? Promise.resolve([] as Mitglieder[]) : LivingAppsService.getMitglieder(),
        omit.has('turniere') ? Promise.resolve([] as Turniere[]) : LivingAppsService.getTurniere(),
        omit.has('turnieranmeldungen') ? Promise.resolve([] as Turnieranmeldungen[]) : LivingAppsService.getTurnieranmeldungen(),
        omit.has('platzbuchungen') ? Promise.resolve([] as Platzbuchungen[]) : LivingAppsService.getPlatzbuchungen(),
      ]));
      if (failure) throw failure;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(t('data_load_failed')));
    } finally {
      setLoading(false);
    }
  }, [omitKey, settle]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    const omit = new Set(omitKey ? omitKey.split('|') : []);
    async function silentRefresh() {
      try {
        // a failed list keeps its stale data out of the way: settle() only
        // replaces what loaded or was refused
        settle(await Promise.allSettled([
          omit.has('trainer') ? Promise.resolve([] as Trainer[]) : LivingAppsService.getTrainer(),
          omit.has('trainingsgruppen') ? Promise.resolve([] as Trainingsgruppen[]) : LivingAppsService.getTrainingsgruppen(),
          omit.has('mitglieder') ? Promise.resolve([] as Mitglieder[]) : LivingAppsService.getMitglieder(),
          omit.has('turniere') ? Promise.resolve([] as Turniere[]) : LivingAppsService.getTurniere(),
          omit.has('turnieranmeldungen') ? Promise.resolve([] as Turnieranmeldungen[]) : LivingAppsService.getTurnieranmeldungen(),
          omit.has('platzbuchungen') ? Promise.resolve([] as Platzbuchungen[]) : LivingAppsService.getPlatzbuchungen(),
        ]));
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    // assistant:data-changed comes from the assistant (<la-klar-assistant>)
    // after every mutation. The element additionally fires the legacy
    // dashboard-refresh event for OLD deployed bundles — do NOT subscribe to
    // both here, or every mutation fetches twice.
    window.addEventListener('assistant:data-changed', handleRefresh);
    return () => window.removeEventListener('assistant:data-changed', handleRefresh);
  }, [omitKey, settle]);

  const trainerMap = useMemo(() => {
    const m = new Map<string, Trainer>();
    trainer.forEach(r => m.set(r.record_id, r));
    return m;
  }, [trainer]);

  const trainingsgruppenMap = useMemo(() => {
    const m = new Map<string, Trainingsgruppen>();
    trainingsgruppen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [trainingsgruppen]);

  const mitgliederMap = useMemo(() => {
    const m = new Map<string, Mitglieder>();
    mitglieder.forEach(r => m.set(r.record_id, r));
    return m;
  }, [mitglieder]);

  const turniereMap = useMemo(() => {
    const m = new Map<string, Turniere>();
    turniere.forEach(r => m.set(r.record_id, r));
    return m;
  }, [turniere]);

  return { trainer, setTrainer, trainingsgruppen, setTrainingsgruppen, mitglieder, setMitglieder, turniere, setTurniere, turnieranmeldungen, setTurnieranmeldungen, platzbuchungen, setPlatzbuchungen, loading, error, fetchAll, forbidden, trainerMap, trainingsgruppenMap, mitgliederMap, turniereMap };
}

/** The hook's return — the `data` prop of DashboardOverview in the Ready-Wrapper form. */
export type DashboardData = ReturnType<typeof useDashboardData>;