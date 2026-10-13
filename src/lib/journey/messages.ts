/**
 * Required-field messages — WRITTEN BY THE BUILD AGENT, never by a heuristic.
 *
 * The layer knows two things about an empty required field: that it is
 * required and what its label is. Out of that it can only say „„Anreise" ist
 * ein Pflichtfeld". What the person should do instead („Bitte einen Gast
 * auswählen.") is meaning, and meaning is the agent's: the Phase-2 orchestrator
 * writes one short instruction per required field — what is needed, not why — to
 * `.intents-staging/messages.json`, the integration step validates it against
 * the app metadata and renders it into the block below. Scaffold updates keep
 * the block. Do not edit outside the markers.
 *
 * Every door reads this and nothing else: `useStepForm` (flows and public
 * pages), the generated {Entity}Dialog and the public form's server-error line.
 * A field without a sentence falls back to the label sentence — never to a
 * bare „Dieses Feld ist erforderlich".
 *
 * Required fields per entity (from the base view):
 *   - trainer: vorname (Vorname), nachname (Nachname)
 *   - trainingsgruppen: gruppenname (Gruppenname), trainer (Trainer), wochentag (Wochentag), beginn (Beginn (Uhrzeit)), ende (Ende (Uhrzeit))
 *   - mitglieder: vorname (Vorname), nachname (Nachname), email (E-Mail), geburtsdatum (Geburtsdatum), mitglied_seit (Mitglied seit), beitragsart (Beitragsart)
 *   - turniere: turniername (Turniername), turnierbeginn (Turnierbeginn), meldeschluss (Meldeschluss)
 *   - turnieranmeldungen: einwilligung (Ich stimme der Verarbeitung meiner Daten zur Turnierorganisation zu), teilnehmer_geburtsdatum (Geburtsdatum), wettbewerb_wunsch (Wettbewerb und Altersklasse), turnier (Turnier), teilnehmer_vorname (Vorname), teilnehmer_nachname (Nachname), teilnehmer_email (E-Mail)
 *   - platzbuchungen: mitglied (Mitglied), platz (Platz), platzart (Platzart), beginn (Beginn), ende (Ende)
 */
import { t, tx } from '@/i18n';
import { labelOf, type EntityKey } from './rules';

/** The writable fields of each entity — the keys a message may address (generated). */
export interface MessageFields {
  "trainer": "vorname" | "nachname" | "email" | "telefon" | "trainerlizenz";
  "trainingsgruppen": "gruppenname" | "trainer" | "wochentag" | "beginn" | "ende" | "bemerkung";
  "mitglieder": "vorname" | "nachname" | "email" | "telefon" | "geburtsdatum" | "mitglied_seit" | "beitragsart" | "trainingsgruppe";
  "turniere": "turniername" | "turnierbeginn" | "turnierende" | "meldeschluss" | "wettbewerb" | "altersklasse" | "austragungsort" | "startgeld" | "beschreibung";
  "turnieranmeldungen": "einwilligung" | "teilnehmer_geburtsdatum" | "vereinsmitglied" | "verein" | "wettbewerb_wunsch" | "anmerkung" | "turnier" | "teilnehmer_vorname" | "teilnehmer_nachname" | "teilnehmer_email" | "telefon";
  "platzbuchungen": "mitglied" | "platz" | "platzart" | "beginn" | "ende" | "buchungsart" | "bemerkung";
}
export type MessageFieldKey<E extends EntityKey> = E extends keyof MessageFields ? MessageFields[E] : never;

export const REQUIRED_MESSAGES: { [E in EntityKey]?: Partial<Record<MessageFieldKey<E>, string>> } = {
  // <custom:messages>
  trainer: { vorname: "Bitte den Vornamen eingeben.", nachname: "Bitte den Nachnamen eingeben." },
  trainingsgruppen: { gruppenname: "Bitte einen Gruppennamen eingeben.", trainer: "Bitte einen Trainer auswählen.", wochentag: "Bitte den Wochentag wählen.", beginn: "Bitte die Beginnzeit eingeben.", ende: "Bitte die Endzeit eingeben." },
  mitglieder: { vorname: "Bitte den Vornamen eingeben.", nachname: "Bitte den Nachnamen eingeben.", email: "Bitte die E-Mail-Adresse eingeben.", geburtsdatum: "Bitte das Geburtsdatum wählen.", mitglied_seit: "Bitte das Eintrittsdatum wählen.", beitragsart: "Bitte eine Beitragsart wählen." },
  turniere: { turniername: "Bitte den Turniernamen eingeben.", turnierbeginn: "Bitte den Turnierbeginn wählen.", meldeschluss: "Bitte den Meldeschluss wählen." },
  turnieranmeldungen: { einwilligung: "Bitte der Datenverarbeitung zustimmen.", teilnehmer_geburtsdatum: "Bitte das Geburtsdatum wählen.", wettbewerb_wunsch: "Bitte Wettbewerb und Altersklasse angeben.", turnier: "Bitte ein Turnier auswählen.", teilnehmer_vorname: "Bitte den Vornamen eingeben.", teilnehmer_nachname: "Bitte den Nachnamen eingeben.", teilnehmer_email: "Bitte die E-Mail-Adresse eingeben." },
  platzbuchungen: { mitglied: "Bitte ein Mitglied auswählen.", platz: "Bitte einen Platz wählen.", platzart: "Bitte Halle oder Außenplatz wählen.", beginn: "Bitte den Beginn wählen.", ende: "Bitte das Ende wählen." },
  // </custom:messages>
};

/** The sentence shown when `key` of `entity` is required and empty — the
 *  agent's own text (translated at runtime like every page string), else the
 *  label sentence. Call it while rendering, not at module scope. */
export function requiredMessage(entity: EntityKey, key: string): string {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  if (own && own.trim()) return tx(own);
  return t('v_required', { label: labelOf(entity, key) });
}

/** True when the agent wrote a sentence for the field. */
export function hasOwnMessage(entity: EntityKey, key: string): boolean {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  return Boolean(own && own.trim());
}
