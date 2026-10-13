// Auto-generated. Per-entity form-enhancements config for "Turniere".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["turniername", {"row": ["turnierbeginn", "turnierende"], "cols": "1fr 1fr"}, "meldeschluss", "wettbewerb", {"row": ["altersklasse", "startgeld"], "cols": "2fr 1fr"}, "austragungsort", "beschreibung"],
  defaults: {
    'turnierbeginn': { kind: 'today' },
    'turnierende': { kind: 'todayOffset', days: 1 },
    'meldeschluss': { kind: 'todayOffset', days: 14 },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
