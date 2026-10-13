// Auto-generated. Per-entity form-enhancements config for "Turnieranmeldungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["turnier", {"row": ["teilnehmer_vorname", "teilnehmer_nachname"]}, "teilnehmer_geburtsdatum", {"row": ["teilnehmer_email", "telefon"], "cols": "1fr 1fr"}, "wettbewerb_wunsch", "vereinsmitglied", "verein", "einwilligung", "anmerkung"],
  defaults: {},
  computed: {
    '_startgeld': { kind: 'applookup', ownKey: 'turnier', lookupKey: 'startgeld' },
  },
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
