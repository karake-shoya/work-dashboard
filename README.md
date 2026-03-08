# Work Dashboard

Google OAuth認証付きの個人用業務ダッシュボード。招待制アクセス制御により、許可したユーザーのみ利用可能。

## 機能

### 時間管理
- リアルタイム時計表示
- 勤務開始時刻の記録・稼働時間・実働時間の計算
- 終了予定時刻の算出（+オフセット調整）
- ブラウザ通知によるリマインダー（1時間ごと・終了時刻）
- ポモドーロタイマー（25分作業 / 5分休憩、完了時ブラウザ通知）

### タスク・進捗管理
- 基準日からの経過日数カウンター（プロジェクト開始日など）
- Todoリスト（追加・完了・削除）

### ツール
- **天気ウィジェット**: 現在地の天気・気温・風速と3日間予報（Open-Meteo API使用、認証不要）
- **DeepL翻訳**: テキストを貼り付けると言語を自動判定して即翻訳
- **Qiitaトレンド**: 過去7日間の人気記事を表示（ダッシュボード3件 / 専用ページ20件）

### メモ
- Markdown対応エディタ（編集/プレビュー切り替え）
- ブラウザのlocalStorageに自動保存

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: Auth.js v5 (Google OAuth)
- **UI Icons**: lucide-react
- **Utility**: date-fns
- **Markdown**: react-markdown + @tailwindcss/typography

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` を作成して以下を設定:

```env
# DeepL API
DEEPL_API_KEY=your_deepl_api_key

# Auth.js
AUTH_SECRET=           # npx auth secret で生成
AUTH_GOOGLE_ID=        # Google Cloud Console で取得
AUTH_GOOGLE_SECRET=    # Google Cloud Console で取得

# アクセス許可するメールアドレス（カンマ区切り）
ALLOWED_EMAILS=you@gmail.com,friend@gmail.com
```

### 3. Google OAuth の設定

[Google Cloud Console](https://console.cloud.google.com/) で OAuth 2.0 クライアントIDを作成し、承認済みリダイレクトURIに以下を追加:

```
http://localhost:3000/api/auth/callback/google   # ローカル
https://<your-domain>/api/auth/callback/google   # 本番
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開く。

## Vercel へのデプロイ

1. リポジトリを Vercel に接続
2. Dashboard > Settings > Environment Variables に `.env.local` の内容を設定
3. Google Cloud Console のリダイレクトURIに本番URLを追加

## データの永続化

ユーザーデータ（Todo・稼働時間・基準日など）はブラウザの localStorage に保存されます。サーバーへのデータ送信はありません。
