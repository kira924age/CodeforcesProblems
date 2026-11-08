# 標準HTMLへの表置き換え：計測・検証結果

計測日: 2026-11-08。提出一覧 (#102)、コンテスト表 (#104)、CSS整理 (#106) の結果。

## 最終出力サイズ

Node.js 26.13.0、同一の依存ロックとコンテストデータで、本番ビルドが出力する
全JS・CSSファイルの非圧縮bytesを比較した。ソースマップ、画像、公開静的ファイルは含めない。
gzip・Brotliは計測しない。1 KiB = 1,024 bytes。

| 状態 | コミット | JS (bytes) | CSS (bytes) | 合計 (bytes) |
| --- | --- | ---: | ---: | ---: |
| 両方ともAnt Table | `025d47a` | 2,368,788 | 11,391 | 2,380,179 |
| 提出一覧のみ標準HTML | `4864961` | 2,369,087 | 12,835 | 2,381,922 |
| 両方とも標準HTML | `09f507e` | 2,160,617 | 14,498 | 2,175,115 |
| CSS整理後 | `8f4b4bd` | 2,160,690 | 13,079 | 2,173,769 |

| 対象 | 最初からの増減 | 増減 (KiB) | 増減率 |
| --- | ---: | ---: | ---: |
| JS | -208,098 bytes | -203.22 | -8.78% |
| CSS | +1,688 bytes | +1.65 | +14.82% |
| 合計 | -206,410 bytes | -201.57 | -8.67% |

片方だけの置き換えではTable本体が残り、標準HTML用のCSSなどが増える。
両方を置き換えることで本体を除外できた。Ant Designの動的なCSS生成コードの削減は
JSの差に含まれる。Ant Design自体はPagination、Radio、Switch、Selectなどで引き続き使う。

4コミットとも `package-lock.json` のGit blobは `0429b1f0a3a23a167306539b6475f524e64a4552`、
`src/utils/contests.json` は `b1f318f35ca722586a51fb816b837e4c278890d6` で一致する。
データ更新や依存更新による増減は混ざっていない。

## Analyzerで確認した依存

`npm run analyze:build` の出力を、モジュールごとの `renderedLength` で集計した。
これは最終minify前のサイズであり、上記の本番出力サイズとは異なる。両者を合算しない。

| モジュール群 | 置き換え前 (bytes) | CSS整理後 (bytes) |
| --- | ---: | ---: |
| `antd/es/table/` | 108,783 | 134 |
| `@rc-component/table/` | 93,760 | 0 |

`Table.js`、`InternalTable.js`、`@rc-component/table` は出力への寄与が0。
残る134 bytesは `TableMeasureRowContext.js` で、Tooltipからも参照される共有コンテキスト。
Analyzerの依存メタデータには除外済みモジュール名も現れるため、名前の有無ではなく、
`nodeMetas.moduleParts` に対応する `nodeParts.renderedLength` を確認する。
Paginationは保持され、`antd/es/pagination/` の寄与は24,209 bytes。

## セル生成と操作の検証

コンテスト表は、カテゴリの絞り込み・表示順の反転後にページを切り出し、
`makeContestTable(visibleContests, isShowDifficulty, submissions)` を呼ぶ。
計測時の全2,142コンテストも、既定の50件表示なら生成対象は50件までとなる。
196件のEducationalも50件まで。最終ページは残件数のみ生成する。
実行時間やメモリ量のベンチマーク値は今回計測していない。

- 全62テストが成功。コンテスト表のテストは生成関数への入力件数も検証する。
- 両表のページ移動、件数変更、データ減少時の最終ページへの補正を確認。
- コンテストの表示件数保存、カテゴリ変更、表示順反転、Q#専用列、複数問題セルを確認。
- AC/NGとコンテスト完了の背景色、難易度色・表示切り替え、提出結果の表記とリンクを確認。
- 明暗テーマの罫線・文字・余白、390px幅でのコンテスト縦並びと提出一覧を確認。
- 行はコンテストIDと提出IDで識別し、旧Ant Table向けセレクタは残っていない。
- lint、整形チェック、型検査、本番ビルド、PR CIが成功。

データ変更と空データ・取得失敗はテスト内の固定データで確認し、実ブラウザーでは
実データでページ操作・件数変更・カテゴリ変更・色分け・明暗テーマ・モバイル表示を確認した。

## 再計測方法

各コミットを別の作業ディレクトリへ展開し、Node.js 26で次を実行する。
同じロックファイルの依存は共有可能だが、異なる場合は各コミットで `npm ci` を行う。

```sh
cd cf-problems-frontend
npm ci
npm run build -- --outDir /tmp/cf-table-measure-output --emptyOutDir --manifest
node - <<'JS'
const fs = require('node:fs');
const path = require('node:path');
const totals = { js: 0, css: 0 };
function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (file.endsWith('.js')) totals.js += fs.statSync(file).size;
    else if (file.endsWith('.css')) totals.css += fs.statSync(file).size;
  }
}
visit('/tmp/cf-table-measure-output/assets');
console.log({ ...totals, total: totals.js + totals.css });
JS
npm run analyze:build
```

一時出力先を指定することで、Git管理された旧 `build/` を変更せずに計測できる。
将来のデータ更新・依存更新後は、今回の絶対サイズとは変わる。
