const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { measure, render } = require('./bundle-size.cjs');

test('uses manifest identity across hash changes and excludes maps/images', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bundle-size-'));
  try {
    mkdirSync(join(dir, 'assets'));
    mkdirSync(join(dir, '.vite'));
    writeFileSync(join(dir, 'assets/index-old.js'), 'const a = 1;');
    writeFileSync(join(dir, 'assets/style.css'), 'body{}');
    writeFileSync(join(dir, 'assets/index.js.map'), 'ignore me');
    writeFileSync(join(dir, 'assets/logo.svg'), 'ignore me');
    const manifest = { 'index.html': { file: 'assets/index-old.js', src: 'index.html', css: ['assets/style.css'] } };
    writeFileSync(join(dir, '.vite/manifest.json'), JSON.stringify(manifest));
    const result = measure(dir);
    assert.equal(result['index.html'].raw, 12);
    assert.equal(result['index.html (CSS)'].raw, 6);
    assert.equal(Object.keys(result).length, 2);
    const next = { ...result, 'index.html': { ...result['index.html'], file: 'assets/index-new.js' } };
    const text = render(result, next, 'base', 'head');
    assert.ok(!text.includes('🆕') && !text.includes('🗑️'));
    assert.ok(!text.includes('brotli'));
  } finally { rmSync(dir, { recursive: true }); }
});

test('shows only changed files; reductions are green and growth is red', () => {
  const base = { 'main.js': { raw: 2048 }, 'removed.js': { raw: 1024 }, 'same.css': { raw: 10 } };
  const next = { 'main.js': { raw: 1024 }, 'new.js': { raw: 512 }, 'same.css': { raw: 10 } };
  const text = render(base, next, 'base', 'head');
  assert.ok(text.includes('+ main.js:'));
  assert.ok(text.includes('- new.js:'));
  assert.ok(text.includes('+ removed.js:'));
  assert.ok(text.includes('-1.00 KiB, -50.00%'));
  assert.ok(text.includes(', new)'));
  assert.ok(!text.includes('same.css'));
  assert.ok(!text.includes('削減') && !text.includes('増加'));
  assert.ok(!text.includes('gzip') && !text.includes('brotli'));
  assert.ok(!text.includes('NaN') && !text.includes('Infinity'));
});

test('marks identical sizes for comment removal, despite changed hashes', () => {
  const text = render({main: {file:'old.js', raw:100}}, {main: {file:'new.js', raw:100}}, 'base', 'head');
  assert.ok(text.includes('<!-- bundle-size-unchanged -->'));
  assert.ok(!text.includes('```diff'));
});

test('omits unchanged total when file increases and reductions cancel out', () => {
  const text = render({a:{raw:100}, b:{raw:200}}, {a:{raw:200}, b:{raw:100}}, 'base', 'head');
  assert.ok(!text.includes('合計'));
  assert.ok(text.includes('- a:') && text.includes('+ b:'));
});
