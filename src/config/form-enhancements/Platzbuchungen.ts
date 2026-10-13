// Auto-generated. Per-entity form-enhancements config for "Platzbuchungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["mitglied", {"row": ["platz", "platzart"], "cols": "1fr 1fr"}, {"row": ["beginn", "ende"]}, "buchungsart", "bemerkung"],
  defaults: {
    'beginn': { kind: 'today', withTime: true },
    'buchungsart': { kind: 'lookup', key: 'freies_spiel', label: 'Freies Spiel' },
  },
  computed: {
    '_buchung_dauer_stunden': { kind: 'dateDiff', from: 'beginn', to: 'ende', unit: 'hours' },
  },
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
