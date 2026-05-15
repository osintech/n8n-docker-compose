# n8n Docker Compose 設定

このリポジトリは、本番 n8n サーバーの Docker Compose 設定と、Git 管理するワークフロー定義を管理します。

## 本番環境

- ホスト: `process-01.rulewatcher.server-on.net`
- EC2: `998-Process-01-xbridge`
- 配置先: `/srv/projects/n8n-docker-compose`
- Compose project: `n8n-docker-compose`
- n8n URL: `http://process-01.rulewatcher.server-on.net:5678`

## 起動方法

1. 環境変数を用意します。

   ```bash
   cp .env.sample .env
   ```

2. `.env` に `N8N_ENCRYPTION_KEY` と `N8N_HOST` を設定します。

   `N8N_ENCRYPTION_KEY` は n8n の認証情報を復号するために必要です。本番で一度使い始めた値は変更しないでください。

3. コンテナを起動します。

   ```bash
   docker compose up -d
   ```

## n8n のバージョン更新

本番では Docker image のタグを固定します。タグなしの `n8nio/n8n` は、再 pull や再作成のタイミングで意図せず n8n のバージョンが変わるため使いません。

更新する場合は、`docker-compose.yml` の `image` を明示的なタグへ変更して PR を作ります。反映前に n8n のデータをバックアップし、更新後にワークフローの手動実行で主要な通知経路を確認します。

現在の指定:

```yaml
image: docker.n8n.io/n8nio/n8n:2.20.8
```

## ワークフロー管理

`workflows/` に n8n ワークフローの JSON エクスポートを保存します。

現在管理しているワークフロー:

- `workflows/sentry-issue-to-mattermost-notification.json`

このワークフローは Sentry issue webhook を受け取り、Sentry latest event の `environment` を優先して Mattermost に通知します。`baggage` の `sentry-environment` は trace 由来で実 event とずれることがあるため、最後の fallback としてのみ使います。

## テスト

Sentry environment の解決順序は、ワークフロー JSON 内の `Resolve Environment` Code node を直接実行する Node.js テストで固定しています。

```bash
npm test
```

または Node.js だけで実行できます。

```bash
node --test test/*.test.js
```

## 運用方針

- n8n UI でワークフローを変更したら、JSON エクスポートを `workflows/` に反映して PR を作ります。
- 認証情報そのものは JSON に含めません。ワークフロー JSON には credential の名前や ID の参照だけを残します。
- 本番反映前に、可能な限り n8n の手動実行で対象ノードの出力を確認します。
- Mattermost など外部投稿を含むワークフローは、重複投稿を避けるため必要最小限の実行にします。
