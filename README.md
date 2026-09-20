# NAGANUMA Portfolio

Next.jsで実装したポートフォリオサイトです。トップページにはProjectsとNotesの新着を各最大3件表示します。`/projects` と `/notes` はそれぞれ6件ずつページを切り替えて表示します。

表示確認用のサンプルを追加するには、`.env.local` に `SHOW_SAMPLE_CONTENT=true` を設定してサーバーを再起動します。`/projects` と `/notes` では取得済みの記事の後ろにサンプルを各6件追加し、`/about` ではサンプル職歴を表示します。Homeでは実データが3件未満の場合に限り、空いた枠をサンプルで補います。サンプルカードにはリンクを付けません。`false` に戻すと追加表示を停止します。サンプル職歴は開発環境だけで表示され、本番では設定値にかかわらず非表示になります。

## 検索非掲載・SNS共有・セキュリティヘッダー

正式URLは `lib/site-metadata.ts` の `https://naganuma-web.com` に統一しています。各ページに固有のタイトル・説明・canonical・Open Graph・Twitter Cardを設定し、共通画像は `/og` で1200×630のPNGを生成します。プロジェクト記事は、画像があればその画像と公開日時を使用します。

現在は検索非掲載の方針です。全ページのrobotsメタタグと全レスポンスの `X-Robots-Tag` に `noindex, nofollow` を維持しています。サイトマップやクローラーを遮断するrobots.txtは追加していません。検索公開へ変更する際は、メタタグとヘッダーの両方を見直してください。

`next.config.ts` から `X-Content-Type-Options: nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`、`Permissions-Policy: camera=(), microphone=(), geolocation=()` を配信します。HSTSはTLS終端側の設定確認後に対応します。

本番ビルドには `Content-Security-Policy-Report-Only` を追加しています。これは違反を観測するための設定で、リソースをブロックしません。収集サーバーは設けていないため、確認はブラウザの開発者ツールのConsoleで行います。`npm run build` → `npm start` で起動し、初回・再訪問時のログイン演出、ページ遷移、記事画像、Analyticsを確認してください。開発サーバーではHMRのノイズを避けるためCSPを配信しません。

現状の候補ポリシーでは、ログイン演出・Next.jsの初期化・Google Analyticsのインラインスクリプトが違反として報告される想定です。これらはReport-Onlyなので実行されます。強制適用は、nonce/hash方式と静的ページへの影響を検討し、違反を解消してから行ってください。スタイルは既存のアニメーションに合わせてインラインを許可し、記事内画像はサニタイズと同様にHTTPSを許可しています。

参考: [Next.js CSPガイド](https://nextjs.org/docs/app/guides/content-security-policy)、[GoogleのCSPガイド](https://developers.google.com/tag-platform/security/guides/csp)。

## microCMSで記事を管理する

[接続手順・APIスキーマ](docs/microcms.md)を参照してください。未接続時のサンプル記事は開発環境だけで表示します。本番で認証情報がない場合は読み込み失敗として扱います。

環境変数の見本は [`.env.example`](.env.example) にあります。APIキーはサーバー側だけで使用します。

## noteの記事を表示する

`.env.local` の `NOTE_USER_ID` に、noteプロフィールURL末尾のクリエイターIDを設定します。

```env
NOTE_USER_ID=your_creator_id
```

トップページのNOTES欄に、RSSから取得した最新3記事が表示されます。取得結果は最大5分間キャッシュします。

## HOMELAB STATUSをPrometheusに接続する

Kubernetesにデプロイするコンテナには、`HOMELAB_PROMETHEUS_URL=http://192.168.20.130:9090` を設定しています。サイトのサーバー側だけがPrometheusへ問い合わせ、ProxmoxノードのCPU・メモリ・ディスク使用率と、VM/LXCの受信・送信速度（Mb/s）および直近10分間の推移を表示します。画面を開いている間は30秒ごとに更新し、非表示のタブでは更新を止めます。サーバー側では結果を25秒間キャッシュします。CPU使用率はノードのCPU数で重み付けし、メモリとディスクは全ノードの使用量を合計して計算します。複数のProxmox exporterを収集している場合は、`HOMELAB_PROMETHEUS_INSTANCE` で対象の `instance` ラベルを指定できます。

接続できない場合は `OFFLINE` と `--` を表示します。URLを設定しないローカル開発環境では、デザイン用のサンプル値を表示します。必要な環境変数は [`.env.example`](.env.example) を参照してください。

Podからの接続確認は、`kubectl` が使える端末で実行できます。

```bash
kubectl exec deployment/next-app -- node -e 'fetch("http://192.168.20.130:9090/api/v1/query?query=up", {signal: AbortSignal.timeout(5000)}).then(async r => console.log(r.status, (await r.json()).status)).catch(e => {console.error(e.message); process.exit(1)})'
```

`200 success` 以外やタイムアウトなら、Kubernetes側のPodまたはノードから `192.168.20.130` の TCP 9090 への通信経路とファイアウォールを確認してください。

## Kubernetesへのデプロイ

`naganuma-web` リポジトリの GitHub Actions Secrets に `MICROCMS_SERVICE_DOMAIN`、`MICROCMS_API_KEY`、`NOTE_USER_ID`、`INFRA_REPO_PAT` を設定します。`MICROCMS_PROJECTS_ENDPOINT` は省略時に `projects` を使用します。Google Analytics を使う場合は `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` も設定します。

`INFRA_REPO_PAT` は `proxmox-iac-project` にアクセスできるトークンが必要です。Fine-grained PAT の場合、同リポジトリへの `Contents: write`（デプロイ通知）と `Secrets: write`（実行時設定の同期）を付与してください。権限が不足すると `Sync runtime secrets to infra repository` が失敗します。

`main` への push 時にサイトのワークフローがイメージをビルドし、実行時設定をインフラリポジトリの Actions Secrets に暗号化して同期してからデプロイを通知します。インフラ側のワークフローが同じ namespace の Kubernetes Secret `next-app-runtime` を更新し、Deployment の Pod に環境変数として渡します。APIキーはイメージやデプロイ通知のペイロードには含めません。インフラ側のワークフローとマニフェストを先に反映してください。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses `next/font` to load Oswald, Shippori Mincho, and Silkscreen.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
