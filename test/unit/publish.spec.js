const publish = require('../../tools/publish');

describe('tools/publish.js (decisione della versione)', () => {
  it('compareVersions / bumpVersion', () => {
    expect(publish.compareVersions('4.0.0', '3.0.2')).toBeGreaterThan(0);
    expect(publish.compareVersions('3.0.2', '3.0.2')).toBe(0);
    expect(publish.compareVersions('3.1.0', '3.0.9')).toBeGreaterThan(0);
    expect(publish.bumpVersion('4.2.7', 'patch')).toBe('4.2.8');
    expect(publish.bumpVersion('4.2.7', 'minor')).toBe('4.3.0');
    expect(publish.bumpVersion('4.2.7', 'major')).toBe('5.0.0');
  });

  it('parseCommit riconosce tipo, scope, breaking (! e BREAKING CHANGE) e messaggi non convenzionali', () => {
    expect(publish.parseCommit('feat(ui): nuova opzione')).toEqual({ type: 'feat', scope: 'ui', breaking: false, subject: 'nuova opzione' });
    expect(publish.parseCommit('feat!: rimuove X').breaking).toBe(true);
    expect(publish.parseCommit('fix: a\n\nBREAKING CHANGE: cambia il default').breaking).toBe(true);
    expect(publish.parseCommit('fix').type).toBe('other');
    expect(publish.parseCommit('merge: pippo').type).toBe('merge');
  });

  it('decideBump: breaking -> major, feat -> minor, resto -> patch, nulla -> none', () => {
    const none = { breaking: [], features: [] };
    expect(publish.decideBump(['fix: x', 'feat!: rompe tutto'], none).level).toBe('major');
    expect(publish.decideBump(['fix: x', 'feat: nuova cosa', 'docs: y'], none).level).toBe('minor');
    expect(publish.decideBump(['fix: x', 'docs: y', 'fix'], none).level).toBe('patch');
    expect(publish.decideBump([], none).level).toBe('none');
  });

  it('decideBump considera lo schema: opzione rimossa/default cambiato -> major, nuova opzione -> minor', () => {
    const before = { properties: { ui: { enum: ['none', 'material', 'bootstrap'], default: 'none' }, tests: { enum: ['none', 'jasmine'] } } };
    const removed = { properties: { ui: { enum: ['none', 'material'], default: 'none' }, tests: { enum: ['none', 'jasmine'] } } };
    const changedDefault = { properties: { ui: { enum: ['none', 'material', 'bootstrap'], default: 'material' }, tests: { enum: ['none', 'jasmine'] } } };
    const addedOption = { properties: Object.assign({}, before.properties, { nuova: { type: 'string' } }) };
    const addedValue = { properties: { ui: { enum: ['none', 'material', 'bootstrap', 'tailwind'], default: 'none' }, tests: { enum: ['none', 'jasmine'] } } };
    const droppedOption = { properties: { ui: before.properties.ui } };

    expect(publish.decideBump(['fix: x'], publish.diffSchema(before, removed)).level).toBe('major');
    expect(publish.decideBump(['fix: x'], publish.diffSchema(before, changedDefault)).level).toBe('major');
    expect(publish.decideBump(['fix: x'], publish.diffSchema(before, droppedOption)).level).toBe('major');
    expect(publish.decideBump(['fix: x'], publish.diffSchema(before, addedOption)).level).toBe('minor');
    expect(publish.decideBump(['fix: x'], publish.diffSchema(before, addedValue)).level).toBe('minor');
    expect(publish.decideBump(['fix: x'], publish.diffSchema(before, before)).level).toBe('patch');
    expect(publish.diffSchema(null, before)).toEqual({ breaking: [], features: [] });
  });

  it('buildChangelogSection raggruppa i commit per tipo', () => {
    const text = publish.buildChangelogSection('4.1.0', '2026-11-11', ['feat: a', 'fix: b', 'docs: c', 'feat!: d'], { breaking: [], features: ['nuova opzione: z'] });
    expect(text).toContain('## 4.1.0 (2026-11-11)');
    expect(text).toContain('### BREAKING CHANGE');
    expect(text).toContain('### Aggiunto');
    expect(text).toContain('- schema: nuova opzione: z');
    expect(text).toContain('### Corretto');
    expect(text).toContain('### Altro');
  });

  it('parseArgs valida le opzioni', () => {
    expect(publish.parseArgs(['--yes', '--bump', 'minor']).bump).toBe('minor');
    expect(publish.parseArgs([]).yes).toBe(false);
    expect(() => publish.parseArgs(['--bump', 'enorme'])).toThrow();
    expect(() => publish.parseArgs(['--boh'])).toThrow();
  });
});
