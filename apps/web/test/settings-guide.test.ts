import { PROPERTY_FIELDS, type PropertyField } from '@arch-arena/shared';
import { QUESTIONS } from '@arch-arena/shared/questions';
import { describe, expect, it } from 'vitest';
import { COMPONENT_SETTING_GUIDES, CONNECTION_SETTING_GUIDES, getSettingGuide } from '@/features/learn/content/settings';
import { settingKeysForCheck } from '@/features/learn/related';
import { CONNECTION_FIELDS, COMPONENT_SETTING_KEYS, SETTING_FIELDS, SETTING_GROUPS, getSettingField, groupScope, settingAnchor, type SettingField } from '@/features/learn/settingsCatalog';
import type { Bi, SettingGuide } from '@/features/learn/types';

const ALL_FIELDS: SettingField[] = SETTING_FIELDS.flatMap((g) => g.fields);

function texts(guide: SettingGuide): { path: string; bi: Bi }[] {
  const out = [
    { path: 'what', bi: guide.what },
    { path: 'why', bi: guide.why },
    { path: 'example', bi: guide.example },
    { path: 'inChallenges', bi: guide.inChallenges },
  ];
  if (guide.goodValues) out.push({ path: 'goodValues', bi: guide.goodValues });
  for (const [k, v] of Object.entries(guide.options ?? {})) out.push({ path: `options.${k}`, bi: v });
  return out;
}

describe('configuration guide: coverage', () => {
  it('explains every component setting in the catalog, and nothing else', () => {
    const catalog = Object.keys(PROPERTY_FIELDS).sort();
    expect(COMPONENT_SETTING_GUIDES.map((g) => g.key).sort()).toEqual(catalog);
    expect([...COMPONENT_SETTING_KEYS].sort()).toEqual(catalog);
  });

  it('explains every connection setting', () => {
    expect(CONNECTION_SETTING_GUIDES.map((g) => g.key).sort()).toEqual(CONNECTION_FIELDS.map((f) => f.key).sort());
  });

  it('puts every setting in exactly one group', () => {
    const component = SETTING_GROUPS.filter((g) => groupScope(g) === 'component').flatMap((g) => g.keys);
    const connection = SETTING_GROUPS.filter((g) => groupScope(g) === 'connection').flatMap((g) => g.keys);
    expect(new Set(component).size).toBe(component.length);
    expect([...component].sort()).toEqual(Object.keys(PROPERTY_FIELDS).sort());
    expect([...connection].sort()).toEqual(CONNECTION_FIELDS.map((f) => f.key).sort());
    expect(ALL_FIELDS).toHaveLength(component.length + connection.length);
  });

  it('gives every setting a unique anchor on the page', () => {
    const anchors = ALL_FIELDS.map((f) => settingAnchor(f.key, f.scope));
    expect(new Set(anchors).size).toBe(anchors.length);
  });

  it('lists the components that use each setting', () => {
    for (const f of ALL_FIELDS.filter((x) => x.scope === 'component')) expect(f.usedBy.length, f.key).toBeGreaterThan(0);
    expect(getSettingField('availability')?.usedBy).toContain('load-balancer');
  });
});

describe('configuration guide: every option explained', () => {
  it('explains each option of a select, both states of a switch, and gives examples for free text', () => {
    const problems: string[] = [];
    for (const field of ALL_FIELDS) {
      const guide = getSettingGuide(field.key, field.scope)!;
      const explained = Object.keys(guide.options ?? {}).sort();
      if (field.type === 'select') {
        const expected = (field as PropertyField).options!.map((o) => o.value).sort();
        if (JSON.stringify(explained) !== JSON.stringify(expected)) problems.push(`${field.key}: options ${explained.join(',')} ≠ ${expected.join(',')}`);
      } else if (field.type === 'boolean') {
        if (JSON.stringify(explained) !== JSON.stringify(['false', 'true'])) problems.push(`${field.key}: a switch needs "true" and "false" explanations`);
      } else {
        if (explained.length) problems.push(`${field.key}: free-text settings have no options`);
        if (!guide.goodValues) problems.push(`${field.key}: free-text settings need good example values`);
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('configuration guide: language', () => {
  it('every explanation has English and a different Hinglish version', () => {
    const problems: string[] = [];
    for (const guide of [...COMPONENT_SETTING_GUIDES, ...CONNECTION_SETTING_GUIDES]) {
      for (const { path, bi } of texts(guide)) {
        if (!bi.en.trim() || !bi.hi.trim()) problems.push(`${guide.key}.${path}: empty text`);
        else if (bi.en === bi.hi) problems.push(`${guide.key}.${path}: Hinglish is identical to English`);
      }
      if (guide.what.en.length < 40) problems.push(`${guide.key}.what: too short to be helpful`);
      if (guide.example.en.length < 50) problems.push(`${guide.key}.example: the real-life example is too short`);
    }
    expect(problems).toEqual([]);
  });
});

describe('configuration guide: links from evaluation feedback', () => {
  it('every setting a challenge checks has an explanation', () => {
    const missing = new Set<string>();
    let linked = 0;
    for (const q of QUESTIONS) {
      for (const check of q.rubric.checks) {
        const keys = settingKeysForCheck(q.rubric, check.id, 10);
        if (keys.length) linked++;
        for (const k of keys) if (!getSettingGuide(k)) missing.add(k);
      }
    }
    expect([...missing]).toEqual([]);
    expect(linked).toBeGreaterThan(100);
  });
});
