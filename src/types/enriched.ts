import type { Mitglieder, Platzbuchungen, Trainingsgruppen, Turnieranmeldungen } from './app';

export type EnrichedTrainingsgruppen = Trainingsgruppen & {
  trainerName: string;
};

export type EnrichedMitglieder = Mitglieder & {
  trainingsgruppeName: string;
};

export type EnrichedTurnieranmeldungen = Turnieranmeldungen & {
  turnierName: string;
};

export type EnrichedPlatzbuchungen = Platzbuchungen & {
  mitgliedName: string;
};
