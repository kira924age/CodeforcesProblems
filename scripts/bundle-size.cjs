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
  const total = files => Object.values(files).reduce((sum, file) => sum + file.raw, 0);
  const beforeTotal = total(base), afterTotal = total(current);
  const lines = [marker, '### バンドルサイズの変化', '',
    'PR のベースと、この PR をマージした場合の JS・CSS サイズを比較しています。',
    '非圧縮サイズを KiB（1 KiB = 1,024 bytes）で表示し、変更のあるファイルだけを掲載しています。増減は「変更後 − 変更前」です。', '',
    '| ファイル | 変更前（base） | 変更後（PR） | 増減 | 増減率 |',
    '| --- | ---: | ---: | ---: | ---: |'];
  const row = (label, before, after) => {
    const delta = after - before;
    const sign = delta > 0 ? '+' : '-';
    const color = delta < 0 ? 'green' : 'red';
    // GitHub supports MathJax inline text color; HTML style attributes are stripped.
    const amount = '$`' + String.raw`\textcolor{${color}}{${sign}${(Math.abs(delta) / 1024).toFixed(2)}\ \mathrm{KiB}}` + '`$';
    const percent = before === 0 ? '—' : '$`' + String.raw`\textcolor{${color}}{${sign}${(Math.abs(delta) / before * 100).toFixed(2)}\%}` + '`$';
    lines.push(`| ${label} | ${kib(before)} | ${kib(after)} | ${amount} | ${percent} |`);
  };
  for (const key of changed) {
    const before = base[key], after = current[key];
    const label = (after?.file || before?.file || key).replace(/^assets\//, '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('|', '&#124;').replace(/[`\r\n]/g, ' ');
    row(label, before?.raw || 0, after?.raw || 0);
  }
  if (beforeTotal !== afterTotal) row('**合計**', beforeTotal, afterTotal);
  lines.push('', `比較コミット: base \`${baseSha.slice(0, 7)}\` → PR merge \`${headSha.slice(0, 7)}\``, '',
    'ハッシュが変わったファイルは Vite manifest で対応付けています。ソースマップ・画像は対象外。',
    '全 JS/CSS チャンクの出力サイズのため、初回アクセス時の通信量とは異なります。新規ファイルの増減率は — です。');
  return lines.join('\n') + '\n';
}

if (require.main === module) {
  const [baseDir, currentDir, baseSha, headSha, output] = process.argv.slice(2);
  const body = render(measure(baseDir), measure(currentDir), baseSha, headSha);
  writeFileSync(output, body);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, body);
}
module.exports = { measure, render };
