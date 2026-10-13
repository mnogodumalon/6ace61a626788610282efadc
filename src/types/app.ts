import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Trainer {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    trainerlizenz?: string;
  };
}

export interface Trainingsgruppen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    gruppenname?: string;
    trainer?: RecordUrl; // applookup -> URL zu 'Trainer' Record
    wochentag?: LookupValue;
    beginn?: string;
    ende?: string;
    bemerkung?: string;
  };
}

export interface Mitglieder {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    geburtsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    mitglied_seit?: string; // Format: YYYY-MM-DD oder ISO String
    beitragsart?: LookupValue;
    trainingsgruppe?: RecordUrl; // applookup -> URL zu 'Trainingsgruppen' Record
  };
}

export interface Turniere {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    turniername?: string;
    turnierbeginn?: string; // Format: YYYY-MM-DD oder ISO String
    turnierende?: string; // Format: YYYY-MM-DD oder ISO String
    meldeschluss?: string; // Format: YYYY-MM-DD oder ISO String
    wettbewerb?: LookupValue[];
    altersklasse?: string;
    austragungsort?: string;
    startgeld?: number;
    beschreibung?: string;
  };
}

export interface Turnieranmeldungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    einwilligung?: boolean;
    teilnehmer_geburtsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    vereinsmitglied?: boolean;
    verein?: string;
    wettbewerb_wunsch?: string;
    anmerkung?: string;
    turnier?: RecordUrl; // applookup -> URL zu 'Turniere' Record
    teilnehmer_vorname?: string;
    teilnehmer_nachname?: string;
    teilnehmer_email?: string;
    telefon?: string;
  };
}

export interface Platzbuchungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    mitglied?: RecordUrl; // applookup -> URL zu 'Mitglieder' Record
    platz?: LookupValue;
    platzart?: LookupValue;
    beginn?: string; // Format: YYYY-MM-DD oder ISO String
    ende?: string; // Format: YYYY-MM-DD oder ISO String
    buchungsart?: LookupValue;
    bemerkung?: string;
  };
}

export const APP_IDS = {
  TRAINER: '6ace6181153521bfe0aabae6',
  TRAININGSGRUPPEN: '6ace6186c78c00a580e1588d',
  MITGLIEDER: '6ace618620506088bc02c2fe',
  TURNIERE: '6ace618783f5be52d7c5586a',
  TURNIERANMELDUNGEN: '6ace618775a3808a07815853',
  PLATZBUCHUNGEN: '6ace618877128e91c2bd28f6',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'trainingsgruppen': {
    wochentag: [{ key: "montag", get label() { return lookupLabel('trainingsgruppen', 'wochentag', "montag") ?? "Montag"; } }, { key: "dienstag", get label() { return lookupLabel('trainingsgruppen', 'wochentag', "dienstag") ?? "Dienstag"; } }, { key: "mittwoch", get label() { return lookupLabel('trainingsgruppen', 'wochentag', "mittwoch") ?? "Mittwoch"; } }, { key: "donnerstag", get label() { return lookupLabel('trainingsgruppen', 'wochentag', "donnerstag") ?? "Donnerstag"; } }, { key: "freitag", get label() { return lookupLabel('trainingsgruppen', 'wochentag', "freitag") ?? "Freitag"; } }, { key: "samstag", get label() { return lookupLabel('trainingsgruppen', 'wochentag', "samstag") ?? "Samstag"; } }, { key: "sonntag", get label() { return lookupLabel('trainingsgruppen', 'wochentag', "sonntag") ?? "Sonntag"; } }],
  },
  'mitglieder': {
    beitragsart: [{ key: "jugendlicher", get label() { return lookupLabel('mitglieder', 'beitragsart', "jugendlicher") ?? "Jugendlicher"; } }, { key: "familie", get label() { return lookupLabel('mitglieder', 'beitragsart', "familie") ?? "Familie"; } }, { key: "erwachsener", get label() { return lookupLabel('mitglieder', 'beitragsart', "erwachsener") ?? "Erwachsener"; } }],
  },
  'turniere': {
    wettbewerb: [{ key: "herren_einzel", get label() { return lookupLabel('turniere', 'wettbewerb', "herren_einzel") ?? "Herren Einzel"; } }, { key: "damen_einzel", get label() { return lookupLabel('turniere', 'wettbewerb', "damen_einzel") ?? "Damen Einzel"; } }, { key: "herren_doppel", get label() { return lookupLabel('turniere', 'wettbewerb', "herren_doppel") ?? "Herren Doppel"; } }, { key: "damen_doppel", get label() { return lookupLabel('turniere', 'wettbewerb', "damen_doppel") ?? "Damen Doppel"; } }, { key: "mixed", get label() { return lookupLabel('turniere', 'wettbewerb', "mixed") ?? "Mixed"; } }, { key: "jugend", get label() { return lookupLabel('turniere', 'wettbewerb', "jugend") ?? "Jugend"; } }],
  },
  'platzbuchungen': {
    platz: [{ key: "platz_1", get label() { return lookupLabel('platzbuchungen', 'platz', "platz_1") ?? "Platz 1"; } }, { key: "platz_2", get label() { return lookupLabel('platzbuchungen', 'platz', "platz_2") ?? "Platz 2"; } }, { key: "platz_3", get label() { return lookupLabel('platzbuchungen', 'platz', "platz_3") ?? "Platz 3"; } }, { key: "platz_4", get label() { return lookupLabel('platzbuchungen', 'platz', "platz_4") ?? "Platz 4"; } }, { key: "platz_5", get label() { return lookupLabel('platzbuchungen', 'platz', "platz_5") ?? "Platz 5"; } }, { key: "platz_6", get label() { return lookupLabel('platzbuchungen', 'platz', "platz_6") ?? "Platz 6"; } }],
    platzart: [{ key: "halle", get label() { return lookupLabel('platzbuchungen', 'platzart', "halle") ?? "Halle"; } }, { key: "aussenplatz", get label() { return lookupLabel('platzbuchungen', 'platzart', "aussenplatz") ?? "Außenplatz"; } }],
    buchungsart: [{ key: "freies_spiel", get label() { return lookupLabel('platzbuchungen', 'buchungsart', "freies_spiel") ?? "Freies Spiel"; } }, { key: "training", get label() { return lookupLabel('platzbuchungen', 'buchungsart', "training") ?? "Training"; } }, { key: "turnier", get label() { return lookupLabel('platzbuchungen', 'buchungsart', "turnier") ?? "Turnier"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'trainer': {
    'vorname': 'string/text',
    'nachname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'trainerlizenz': 'string/text',
  },
  'trainingsgruppen': {
    'gruppenname': 'string/text',
    'trainer': 'applookup/select',
    'wochentag': 'lookup/select',
    'beginn': 'string/text',
    'ende': 'string/text',
    'bemerkung': 'string/textarea',
  },
  'mitglieder': {
    'vorname': 'string/text',
    'nachname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'geburtsdatum': 'date/date',
    'mitglied_seit': 'date/date',
    'beitragsart': 'lookup/radio',
    'trainingsgruppe': 'applookup/select',
  },
  'turniere': {
    'turniername': 'string/text',
    'turnierbeginn': 'date/date',
    'turnierende': 'date/date',
    'meldeschluss': 'date/date',
    'wettbewerb': 'multiplelookup/checkbox',
    'altersklasse': 'string/text',
    'austragungsort': 'string/text',
    'startgeld': 'number',
    'beschreibung': 'string/textarea',
  },
  'turnieranmeldungen': {
    'einwilligung': 'bool',
    'teilnehmer_geburtsdatum': 'date/date',
    'vereinsmitglied': 'bool',
    'verein': 'string/text',
    'wettbewerb_wunsch': 'string/text',
    'anmerkung': 'string/textarea',
    'turnier': 'applookup/select',
    'teilnehmer_vorname': 'string/text',
    'teilnehmer_nachname': 'string/text',
    'teilnehmer_email': 'string/email',
    'telefon': 'string/tel',
  },
  'platzbuchungen': {
    'mitglied': 'applookup/select',
    'platz': 'lookup/select',
    'platzart': 'lookup/radio',
    'beginn': 'date/datetimeminute',
    'ende': 'date/datetimeminute',
    'buchungsart': 'lookup/radio',
    'bemerkung': 'string/textarea',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateTrainer = StripLookup<Trainer['fields']>;
export type CreateTrainingsgruppen = StripLookup<Trainingsgruppen['fields']>;
export type CreateMitglieder = StripLookup<Mitglieder['fields']>;
export type CreateTurniere = StripLookup<Turniere['fields']>;
export type CreateTurnieranmeldungen = StripLookup<Turnieranmeldungen['fields']>;
export type CreatePlatzbuchungen = StripLookup<Platzbuchungen['fields']>;