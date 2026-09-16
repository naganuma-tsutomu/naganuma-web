# NAGANUMA Portfolio

Next.jsで実装したポートフォリオサイトです。PROJECTSのカードから記事ページを開けます。

## microCMSで記事を管理する

[接続手順・APIスキーマ](docs/microcms.md)を参照してください。未接続時はサンプル記事を表示します。

環境変数の見本は [`.env.example`](.env.example) にあります。APIキーはサーバー側だけで使用します。

## noteの記事を表示する

`.env.local` の `NOTE_USER_ID` に、noteプロフィールURL末尾のクリエイターIDを設定します。

```env
NOTE_USER_ID=your_creator_id
```

トップページのBLOG欄に、RSSから取得した最新3記事が表示されます。取得結果は最大5分間キャッシュします。

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
