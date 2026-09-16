# NAGANUMA Portfolio

Next.jsで実装したポートフォリオサイトです。トップページには新着3件、`/projects` には全プロジェクトを表示し、カードから記事ページを開けます。

## microCMSで記事を管理する

[接続手順・APIスキーマ](docs/microcms.md)を参照してください。未接続時はサンプル記事を表示します。

環境変数の見本は [`.env.example`](.env.example) にあります。APIキーはサーバー側だけで使用します。

## noteの記事を表示する

`.env.local` の `NOTE_USER_ID` に、noteプロフィールURL末尾のクリエイターIDを設定します。

```env
NOTE_USER_ID=your_creator_id
```

トップページのBLOG欄に、RSSから取得した最新3記事が表示されます。取得結果は最大5分間キャッシュします。

## Kubernetesへのデプロイ

`my-kubernetes` リポジトリの GitHub Actions Secrets に `MICROCMS_SERVICE_DOMAIN`、`MICROCMS_API_KEY`、`NOTE_USER_ID`、`INFRA_REPO_PAT` を設定します。`MICROCMS_PROJECTS_ENDPOINT` は省略時に `projects` を使用します。Google Analytics を使う場合は `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` も設定します。

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
