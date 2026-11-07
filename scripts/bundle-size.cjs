const { readdirSync, readFileSync, writeFileSync, appendFileSync } = require('node:fs');
const { join, relative } = require('node:path');

function measure(directory) {
  const manifest = JSON.parse(readFileSync(join(directory, '.vite/manifest.json'), 'utf8'));
  const identities = new Map();
  for (const [key, entry] of Object.entries(manifest)) {
    // Shared chunks may have a hashed manifest key; entry.name is stable.
    const identity = entry.src || entry.name || key;
    identities.set(entry.file, identity);
    for (const css of entry.css || []) {
      if (!identities.has(css)) identities.set(css, `${identity} (CSS)`);
    }
  }
  const files = {};
  function visit(path) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const file = join(path, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (/\.(js|css)$/.test(entry.name)) {
        const output = relative(directory, file).replaceAll('\\', '/');
        const identity = identities.get(output) || output;
        // Multiple outputs with one identity must remain separate.
        const key = files[identity] ? `${identity} [${output}]` : identity;
        const bytes = readFileSync(file);
        files[key] = { file: output, raw: bytes.length };
      }
    }
  }
  visit(join(directory, 'assets'));
  return files;
}

function render(base, current, baseSha, headSha) {
  const marker = '<!-- codeforces-bundle-size -->';
  const keys = [...new Set([...Object.keys(base), ...Object.keys(current)])].sort();
  const changed = keys.filter(key => (base[key]?.raw || 0) !== (current[key]?.raw || 0));
  if (!changed.length) return `${marker}\n<!-- bundle-size-unchanged -->\nサイズ変更なし。\n`;
  const kib = value => `${(value / 1024).toFixed(2)} KiB`;
  const change = (before, after) => {
    const delta = after - before;
    const percent = before === 0 ? 'new' : `${(delta / before * 100).toFixed(2)}%`;
    return `${delta > 0 ? '+' : '-'}${kib(Math.abs(delta))}, ${percent}`;
  };
  const total = files => Object.values(files).reduce((sum, file) => sum + file.raw, 0);
  const beforeTotal = total(base), afterTotal = total(current);
  const lines = [marker, '### Bundle size（非圧縮）', '', '```diff'];
  const row = (label, before, after) => {
    // GitHub diff blocks render + lines green and - lines red.
    const color = after < before ? '+' : '-';
    lines.push(`${color} ${label}: ${kib(before)} → ${kib(after)} (${change(before, after)})`);
  };
  for (const key of changed) {
    const before = base[key], after = current[key];
    const label = (after?.file || before?.file || key).replace(/^assets\//, '').replace(/[`\r\n]/g, ' ');
    row(label, before?.raw || 0, after?.raw || 0);
  }
  if (beforeTotal !== afterTotal) row('合計', beforeTotal, afterTotal);
  lines.push('```', '', `比較: base \`${baseSha.slice(0, 7)}\` → PR merge \`${headSha.slice(0, 7)}\``, '',
    'Vite manifest でチャンクを対応付けます。ソースマップ・画像は除外。全 JS/CSS 出力のサイズで、初回ロード量ではありません。');
  return lines.join('\n') + '\n';
}

if (require.main === module) {
  const [baseDir, currentDir, baseSha, headSha, output] = process.argv.slice(2);
  const body = render(measure(baseDir), measure(currentDir), baseSha, headSha);
  writeFileSync(output, body);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, body);
}
module.exports = { measure, render };
