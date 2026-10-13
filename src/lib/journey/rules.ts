/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'trainer' | 'trainingsgruppen' | 'mitglieder' | 'turniere' | 'turnieranmeldungen' | 'platzbuchungen';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "trainer": "vorname" | "nachname" | "email" | "telefon" | "trainerlizenz";
  "trainingsgruppen": "gruppenname" | "beginn" | "ende" | "bemerkung";
  "mitglieder": "vorname" | "nachname" | "email" | "telefon";
  "turniere": "turniername" | "altersklasse" | "austragungsort" | "beschreibung";
  "turnieranmeldungen": "verein" | "wettbewerb_wunsch" | "anmerkung" | "teilnehmer_vorname" | "teilnehmer_nachname" | "teilnehmer_email" | "telefon" | "leistungsklasse";
  "platzbuchungen": "bemerkung";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "trainer": never;
  "trainingsgruppen": "trainer";
  "mitglieder": "trainingsgruppe";
  "turniere": never;
  "turnieranmeldungen": "turnier";
  "platzbuchungen": "mitglied";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "trainer": {
    "key": "trainer",
    "appId": "6ace6181153521bfe0aabae6",
    "label": "Trainer",
    "pascal": "Trainer",
    "single": "TrainerEntry"
  },
  "trainingsgruppen": {
    "key": "trainingsgruppen",
    "appId": "6ace6186c78c00a580e1588d",
    "label": "Trainingsgruppen",
    "pascal": "Trainingsgruppen",
    "single": "TrainingsgruppenEntry"
  },
  "mitglieder": {
    "key": "mitglieder",
    "appId": "6ace618620506088bc02c2fe",
    "label": "Mitglieder",
    "pascal": "Mitglieder",
    "single": "MitgliederEntry"
  },
  "turniere": {
    "key": "turniere",
    "appId": "6ace618783f5be52d7c5586a",
    "label": "Turniere",
    "pascal": "Turniere",
    "single": "TurniereEntry"
  },
  "turnieranmeldungen": {
    "key": "turnieranmeldungen",
    "appId": "6ace618775a3808a07815853",
    "label": "Turnieranmeldungen",
    "pascal": "Turnieranmeldungen",
    "single": "TurnieranmeldungenEntry"
  },
  "platzbuchungen": {
    "key": "platzbuchungen",
    "appId": "6ace618877128e91c2bd28f6",
    "label": "Platzbuchungen",
    "pascal": "Platzbuchungen",
    "single": "PlatzbuchungenEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "trainer": {
    "vorname": {
      "key": "vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "nachname": {
      "key": "nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": false,
      "label": "E-Mail",
      "writable": true,
      "autoComplete": "email"
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefon",
      "writable": true,
      "autoComplete": "tel"
    },
    "trainerlizenz": {
      "key": "trainerlizenz",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Trainerlizenz",
      "writable": true,
      "maxLength": 4000
    }
  },
  "trainingsgruppen": {
    "max_teilnehmer": {
      "key": "max_teilnehmer",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Maximale Teilnehmerzahl",
      "writable": true
    },
    "gruppenname": {
      "key": "gruppenname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Gruppenname",
      "writable": true,
      "maxLength": 4000
    },
    "trainer": {
      "key": "trainer",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Trainer",
      "writable": true,
      "targetAppId": "6ace6181153521bfe0aabae6",
      "targetEntity": "trainer"
    },
    "wochentag": {
      "key": "wochentag",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Wochentag",
      "writable": true,
      "options": [
        "montag",
        "dienstag",
        "mittwoch",
        "donnerstag",
        "freitag",
        "samstag",
        "sonntag"
      ]
    },
    "beginn": {
      "key": "beginn",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Beginn (Uhrzeit)",
      "writable": true,
      "maxLength": 4000
    },
    "ende": {
      "key": "ende",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Ende (Uhrzeit)",
      "writable": true,
      "maxLength": 4000
    },
    "bemerkung": {
      "key": "bemerkung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bemerkung",
      "writable": true
    }
  },
  "mitglieder": {
    "vorname": {
      "key": "vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "nachname": {
      "key": "nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": true,
      "label": "E-Mail",
      "writable": true,
      "autoComplete": "email"
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefon",
      "writable": true,
      "autoComplete": "tel"
    },
    "geburtsdatum": {
      "key": "geburtsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": true,
      "label": "Geburtsdatum",
      "writable": true,
      "autoComplete": "bday"
    },
    "mitglied_seit": {
      "key": "mitglied_seit",
      "fulltype": "date/date",
      "kind": "date",
      "required": true,
      "label": "Mitglied seit",
      "writable": true
    },
    "beitragsart": {
      "key": "beitragsart",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Beitragsart",
      "writable": true,
      "options": [
        "erwachsener",
        "jugendlicher",
        "familie"
      ]
    },
    "trainingsgruppe": {
      "key": "trainingsgruppe",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Trainingsgruppe",
      "writable": true,
      "targetAppId": "6ace6186c78c00a580e1588d",
      "targetEntity": "trainingsgruppen"
    }
  },
  "turniere": {
    "turniername": {
      "key": "turniername",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Turniername",
      "writable": true,
      "maxLength": 4000
    },
    "turnierbeginn": {
      "key": "turnierbeginn",
      "fulltype": "date/date",
      "kind": "date",
      "required": true,
      "label": "Turnierbeginn",
      "writable": true
    },
    "turnierende": {
      "key": "turnierende",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Turnierende",
      "writable": true
    },
    "meldeschluss": {
      "key": "meldeschluss",
      "fulltype": "date/date",
      "kind": "date",
      "required": true,
      "label": "Meldeschluss",
      "writable": true
    },
    "wettbewerb": {
      "key": "wettbewerb",
      "fulltype": "multiplelookup/checkbox",
      "kind": "multilookup",
      "required": false,
      "label": "Wettbewerbe",
      "writable": true,
      "options": [
        "herren_einzel",
        "damen_einzel",
        "herren_doppel",
        "damen_doppel",
        "mixed",
        "jugend"
      ]
    },
    "altersklasse": {
      "key": "altersklasse",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Altersklasse",
      "writable": true,
      "maxLength": 4000
    },
    "austragungsort": {
      "key": "austragungsort",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Austragungsort",
      "writable": true,
      "maxLength": 4000
    },
    "startgeld": {
      "key": "startgeld",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Startgeld in Euro",
      "writable": true,
      "format": "currency"
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    }
  },
  "turnieranmeldungen": {
    "einwilligung": {
      "key": "einwilligung",
      "fulltype": "bool",
      "kind": "bool",
      "required": true,
      "label": "Ich stimme der Verarbeitung meiner Daten zur Turnierorganisation zu",
      "writable": true
    },
    "teilnehmer_geburtsdatum": {
      "key": "teilnehmer_geburtsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": true,
      "label": "Geburtsdatum",
      "writable": true,
      "autoComplete": "bday"
    },
    "vereinsmitglied": {
      "key": "vereinsmitglied",
      "fulltype": "bool",
      "kind": "bool",
      "required": false,
      "label": "Mitglied im TC Grünweiß",
      "writable": true
    },
    "verein": {
      "key": "verein",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Verein (für Gäste)",
      "writable": true,
      "maxLength": 4000
    },
    "wettbewerb_wunsch": {
      "key": "wettbewerb_wunsch",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Wettbewerb und Altersklasse",
      "writable": true,
      "maxLength": 4000
    },
    "anmerkung": {
      "key": "anmerkung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bemerkung",
      "writable": true
    },
    "turnier": {
      "key": "turnier",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Turnier",
      "writable": true,
      "targetAppId": "6ace618783f5be52d7c5586a",
      "targetEntity": "turniere"
    },
    "teilnehmer_vorname": {
      "key": "teilnehmer_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "teilnehmer_nachname": {
      "key": "teilnehmer_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "teilnehmer_email": {
      "key": "teilnehmer_email",
      "fulltype": "string/email",
      "kind": "email",
      "required": true,
      "label": "E-Mail",
      "writable": true,
      "autoComplete": "email"
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefon",
      "writable": true,
      "autoComplete": "tel"
    },
    "leistungsklasse": {
      "key": "leistungsklasse",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Leistungsklasse (LK)",
      "writable": true,
      "maxLength": 4000
    }
  },
  "platzbuchungen": {
    "mitglied": {
      "key": "mitglied",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Mitglied",
      "writable": true,
      "targetAppId": "6ace618620506088bc02c2fe",
      "targetEntity": "mitglieder"
    },
    "platz": {
      "key": "platz",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Platz",
      "writable": true,
      "options": [
        "platz_1",
        "platz_2",
        "platz_3",
        "platz_4",
        "platz_5",
        "platz_6"
      ]
    },
    "platzart": {
      "key": "platzart",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Platzart",
      "writable": true,
      "options": [
        "halle",
        "aussenplatz"
      ]
    },
    "beginn": {
      "key": "beginn",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": true,
      "label": "Beginn",
      "writable": true
    },
    "ende": {
      "key": "ende",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": true,
      "label": "Ende",
      "writable": true
    },
    "buchungsart": {
      "key": "buchungsart",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Buchungsart",
      "writable": true,
      "options": [
        "freies_spiel",
        "training",
        "turnier"
      ]
    },
    "bemerkung": {
      "key": "bemerkung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bemerkung",
      "writable": true
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "trainer": [],
  "trainingsgruppen": [
    {
      "kind": "record",
      "field": "trainer",
      "targetEntity": "trainer"
    }
  ],
  "mitglieder": [
    {
      "kind": "choice",
      "field": "beitragsart",
      "count": 3
    },
    {
      "kind": "record",
      "field": "trainingsgruppe",
      "targetEntity": "trainingsgruppen"
    }
  ],
  "turniere": [],
  "turnieranmeldungen": [
    {
      "kind": "record",
      "field": "turnier",
      "targetEntity": "turniere"
    }
  ],
  "platzbuchungen": [
    {
      "kind": "range",
      "from": "beginn",
      "to": "ende"
    },
    {
      "kind": "choice",
      "field": "platz",
      "count": 6
    },
    {
      "kind": "choice",
      "field": "platzart",
      "count": 2
    },
    {
      "kind": "choice",
      "field": "buchungsart",
      "count": 3
    },
    {
      "kind": "record",
      "field": "mitglied",
      "targetEntity": "mitglieder"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "trainer": [
    "vorname",
    "nachname"
  ],
  "trainingsgruppen": [
    "gruppenname"
  ],
  "mitglieder": [
    "vorname",
    "nachname"
  ],
  "turniere": [
    "turniername"
  ],
  "turnieranmeldungen": [
    "teilnehmer_vorname"
  ],
  "platzbuchungen": [
    "bemerkung"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
