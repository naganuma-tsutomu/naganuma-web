# PROJECTSの記事をmicroCMSで管理する

カードから `/projects/{コンテンツID}` の記事ページを開きます。カードの見た目はそのまま、タイトル・説明文・サムネイル・本文をmicroCMSで編集できます。

## 1. サービスとAPIを作成する

[microCMS](https://app.microcms.io/) でサービスを作り、**リスト形式**のAPIを追加します。

- API名：`Projects`（任意）
- エンドポイント：`projects`（既定値。別の名前で作成済みなら環境変数で指定できます）

次のAPIスキーマを設定してください。

| フィールドID | 表示名 | 種類 | 必須 |
| --- | --- | --- | --- |
| `title` | タイトル | テキストフィールド | はい |
| `description` | 一覧用の説明文 | テキストエリア | はい |
| `thumbnail` | サムネイル | 画像 | いいえ |
| `content` | 本文 | リッチエディタ | はい |

`description` はカードで最大3行表示します。`thumbnail` がない記事は既定の画像を表示します。本文は見出し・リスト・リンク・画像・コードブロック・表に対応します。スクリプト、イベント属性、iframe、任意の装飾スタイルは除去します。

記事URLにはmicroCMSが発行するコンテンツIDを使います。公開後にIDを変更するとURLも変わります。独自の `slug` フィールドは不要です。

## 2. APIキーと環境変数を設定する

microCMSのサービス設定で、`projects` APIの **GETだけ** を許可するAPIキーを用意します。下書き全取得や書き込みの権限は不要です。

プロジェクト直下に `.env.local` を作成し、以下を設定します。`.env.example` も参考にできます。

```dotenv
MICROCMS_SERVICE_DOMAIN=your-service-id
MICROCMS_API_KEY=your-read-only-api-key
MICROCMS_PROJECTS_ENDPOINT=projects
```

- `your-service-id.microcms.io` の `your-service-id` 部分だけを設定してください。
- キーはサーバーでのみ使用します。`NEXT_PUBLIC_` を付けないでください。
- `.env.local` はGitの対象外です。APIキーをソースコードに書く必要はありません。
- 設定後、開発サーバーを再起動します。

### 接続時に404が出る場合

一覧取得時の404は、サービスIDやAPIのエンドポイントが一致していない可能性があります。microCMSのAPI設定／APIプレビューに表示されるURLと比較してください。

例えば接続先が `https://your-service-id.microcms.io/api/v1/blogs` なら、`MICROCMS_SERVICE_DOMAIN=your-service-id`、`MICROCMS_PROJECTS_ENDPOINT=blogs` と設定します。APIの表示名とエンドポイントは別の値です。

`MICROCMS_PROJECTS_ENDPOINT` を省略した場合は `projects` にアクセスします。APIキーを作っただけではAPIは作成されないため、リスト形式のAPIも作成されているか確認してください。

## 3. 記事を公開して確認する

1. `projects` APIに記事を追加します。
2. タイトル・説明文・本文を入力し、任意でサムネイルを設定します。
3. 記事を**公開**します。下書きは表示されません。
4. トップのPROJECTSにカードが追加され、クリックで本文が開きます。

一覧は公開日時の新しい順です。トップと `/projects` のカードにはmicroCMSが自動で付ける公開日時を表示します。取得時に100件ずつページ送りするため、100件を超えた記事も取得します。

APIレスポンスはNext.jsで60秒キャッシュします。期限後のアクセスで更新する方式なので、公開・編集直後は以前の内容が表示される場合があります。初回アクセスが更新を開始し、更新後のアクセスから新しい内容になります。Webhookによる即時更新、下書きプレビューは未実装です。

## 接続前・エラー時の表示

- 開発環境で環境変数が**両方未設定**：既存の6枚のカードとサンプル記事を表示します。サンプルには公開日時がないため、カードの日付は表示しません。サンプル記事には `SAMPLE` を表示し、検索エンジン向けに `noindex` を指定します。
- 本番環境で環境変数が**両方未設定**：サンプル記事は表示せず、一覧に読み込み失敗を表示します。記事ページも読み込み失敗として扱います。サーバーログには設定不足を記録します。
- 設定が片方だけ、APIエラー：一覧に読み込み失敗を表示します。接続エラーをサンプル記事で隠すことはしません。
- 公開記事が0件：記事準備中と表示します。
- 存在しない記事、削除済み・非公開の記事：記事が見つからない画面を表示します。

サムネイルは標準の `images.microcms-assets.io/assets/` 配下に対応しています。メディア用カスタムドメインを使う場合は、`next.config.ts` と `lib/projects.ts` の画像URL設定も変更してください。

## Docker / Kubernetes

認証用の2つの環境変数と、任意の `MICROCMS_PROJECTS_ENDPOINT` はコンテナ起動時に渡せます。APIキーをDockerのビルド引数にする必要はありません。KubernetesではSecret経由で環境変数へ渡してください。

ページはリクエスト時に設定を読むため、microCMS未接続で作ったイメージにも起動時の設定を適用できます。複数Podではそれぞれがキャッシュを持つため、更新のタイミングに差が出る場合があります。

## 検証

```bash
npm run lint
npm test
npm run build
```

テストはNode.js 22.6以降のTypeScript型除去機能を利用します。API認証、設定不足、APIエラー、本文HTMLのサニタイズをモックで確認します。実サービスとの接続は環境変数を設定してから確認してください。

公式ドキュメント：[一覧取得](https://document.microcms.io/content-api/get-list-contents) / [記事取得](https://document.microcms.io/content-api/get-content)
