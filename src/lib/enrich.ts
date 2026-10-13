import type { EnrichedMitglieder, EnrichedPlatzbuchungen, EnrichedTrainingsgruppen, EnrichedTurnieranmeldungen } from '@/types/enriched';
import type { Mitglieder, Platzbuchungen, Trainer, Trainingsgruppen, Turnieranmeldungen, Turniere } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface TrainingsgruppenMaps {
  trainerMap: Map<string, Trainer>;
}

export function enrichTrainingsgruppen(
  trainingsgruppen: Trainingsgruppen[],
  maps: TrainingsgruppenMaps
): EnrichedTrainingsgruppen[] {
  return trainingsgruppen.map(r => ({
    ...r,
    trainerName: resolveDisplay(r.fields.trainer, maps.trainerMap, 'vorname', 'nachname'),
  }));
}

interface MitgliederMaps {
  trainingsgruppenMap: Map<string, Trainingsgruppen>;
}

export function enrichMitglieder(
  mitglieder: Mitglieder[],
  maps: MitgliederMaps
): EnrichedMitglieder[] {
  return mitglieder.map(r => ({
    ...r,
    trainingsgruppeName: resolveDisplay(r.fields.trainingsgruppe, maps.trainingsgruppenMap, 'gruppenname'),
  }));
}

interface TurnieranmeldungenMaps {
  turniereMap: Map<string, Turniere>;
}

export function enrichTurnieranmeldungen(
  turnieranmeldungen: Turnieranmeldungen[],
  maps: TurnieranmeldungenMaps
): EnrichedTurnieranmeldungen[] {
  return turnieranmeldungen.map(r => ({
    ...r,
    turnierName: resolveDisplay(r.fields.turnier, maps.turniereMap, 'turniername'),
  }));
}

interface PlatzbuchungenMaps {
  mitgliederMap: Map<string, Mitglieder>;
}

export function enrichPlatzbuchungen(
  platzbuchungen: Platzbuchungen[],
  maps: PlatzbuchungenMaps
): EnrichedPlatzbuchungen[] {
  return platzbuchungen.map(r => ({
    ...r,
    mitgliedName: resolveDisplay(r.fields.mitglied, maps.mitgliederMap, 'vorname', 'nachname'),
  }));
}
