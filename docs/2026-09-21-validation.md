# 2026-09-21 検証結果

## useInView

jsdom上でReactをマウントする動作テストを10件追加。表示開始・終了、指定表示率、`all`、`once`、監視設定変更、アンマウント、IntersectionObserver非対応、対象要素なし、表示率の範囲制限、Strict Modeを検証した。

指定表示率未満でも`isIntersecting`だけで表示扱いになるケースをテストで確認し、`intersectionRatio >= threshold`も判定するよう修正した。サーバー用68件と合わせて78件成功。lint・本番ビルドも成功。

## Lighthouse

ローカルの本番ビルドに対し、既存の`lighthouserc.json`を使って実行。Lighthouse CI 0.15.1 / Lighthouse 12.6.1、デスクトップ設定、各URLを1回測定。Node.js 24.21.0、WSL上のPlaywright Chromiumを使用した。

実行時はmicroCMS・note・Prometheusの接続設定を空にしている。記事一覧の空状態とホームラボのデモ表示が対象であり、実データ・公開サーバー・モバイルでの性能を保証する結果ではない。E2E用の記事モックも使用していない。

| ページ | 性能 | アクセシビリティ | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| `/` | 65 | 100 | 96 | 63 |
| `/projects` | 96 | 100 | 96 | 63 |
| `/about` | 100 | 100 | 96 | 63 |
| `/notes` | 100 | 100 | 96 | 63 |
| `/contact` | 98 | 100 | 96 | 63 |

必須のアクセシビリティ基準（90点以上）は全ページで通過し、autorunは終了コード0。以下の警告は残っている。

- トップの性能が基準80点未満。TBTは1,000ms、LCPは1.0秒、CLSは0。メインスレッド処理時間は4.7秒。次の性能改善では同じ条件で複数回測定し、初回応答とJavaScript処理を切り分ける。
- SEOは全ページで基準70点未満。失敗項目は意図した`noindex`による`is-crawlable`。個別監査を`off`にしてもカテゴリ全体のスコアには影響する。検索非掲載の方針と監査基準は変更していない。

HTML・JSONの詳細レポートは`.lighthouseci/`に保存（Git管理外）。再実行は`npm run build`後に`npm run test:lighthouse`。Chrome/Chromiumが必要で、自動検出できない場合は`CHROME_PATH`を指定する。既存の3000番ポートのサーバーを停止してから実行する。

## E2E

修正後の本番ビルドで、固定記事データを使うデスクトップ・モバイルのE2Eを再実行。リトライなしで27件成功、既存の条件付きスキップ1件。レポートは`playwright-report/`に保存（Git管理外）。

## Docker

この環境にDocker CLI・デーモンがないため、ユーザーの指示でビルド実行をスキップ。Dockerの検証済みとは扱わない。
