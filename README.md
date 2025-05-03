# n8n Docker Compose Setup

このリポジトリは、Docker Compose を使用して n8n を簡単にセットアップするためのファイルを提供します。

This repository provides files to easily set up n8n using Docker Compose.

---

## 日本語 (Japanese)

### 概要

Docker Compose を使用して n8n 環境を構築します。

### 使い方

1.  **リポジトリのクローン:**
    ```bash
    git clone https://github.com/<your-username>/n8n-docker-compose.git
    cd n8n-docker-compose
    ```

2.  **環境変数の設定:**
    `.env_sample` ファイルをコピーして `.env` ファイルを作成します。
    ```bash
    cp .env_sample .env
    ```
    `.env` ファイルを開き、以下の変数を設定します:
    *   `N8N_ENCRYPTION_KEY`: 安全なランダムキーを設定します。キーは以下のコマンドで生成できます (32バイト推奨):
        ```bash
        openssl rand -hex 32
        ```
        **重要:** このキーは n8n の認証情報などを暗号化するために不可欠です。安全な場所に保管してください。
    *   `TZ`: タイムゾーンを設定します (例: `Asia/Tokyo`)。

3.  **Docker コンテナの起動:**
    ```bash
    docker compose up -d
    ```

4.  **n8n へのアクセス:**
    Web ブラウザで `http://localhost:5678` を開きます。

### 設定ファイル

*   `docker-compose.yml`: n8n サービスの設定が含まれています。`image` フィールドで n8n のバージョンを指定できます (例: `n8nio/n8n:1.28.0`)。安定運用のためにバージョンを指定することを推奨します。利用可能なバージョンタグは [Docker Hub](https://hub.docker.com/r/n8nio/n8n/tags) で確認できます。
*   `.env`: 環境変数 (n8n 暗号化キー, タイムゾーン) を定義します。このファイルは Git の管理対象外 (.gitignore) になっています。
*   `volumes`: Docker ボリュームの設定です。
    *   `n8n-storage`: n8n のデータ (Workflow、認証情報など) が永続化される Docker ボリュームです。

---

## English

### Overview

This sets up an n8n environment using Docker Compose.

### Usage

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/<your-username>/n8n-docker-compose.git
    cd n8n-docker-compose
    ```

2.  **Set Up Environment Variables:**
    Copy the `.env_sample` file to create an `.env` file.
    ```bash
    cp .env_sample .env
    ```
    Open the `.env` file and configure the following variables:
    *   `N8N_ENCRYPTION_KEY`: Set a secure random key. You can generate one using `openssl rand -hex 32` (32 bytes recommended).
        **Important:** This key is crucial for encrypting credentials within n8n. Keep it safe.
    *   `TZ`: Set the timezone (e.g., `Asia/Tokyo`).

3.  **Start Docker Containers:**
    ```bash
    docker compose up -d
    ```

4.  **Access n8n:**
    Open `http://localhost:5678` in your web browser.

### Configuration Files

*   `docker-compose.yml`: Contains the configuration for the n8n service. You can specify the n8n version in the `image` field (e.g., `n8nio/n8n:1.28.0`). Specifying a version is recommended for stable operation. Available version tags can be found on [Docker Hub](https://hub.docker.com/r/n8nio/n8n/tags).
*   `.env`: Defines environment variables (n8n encryption key, timezone). This file is ignored by Git (.gitignore).
*   `volumes`:
    *   `n8n-storage`: The Docker volume where n8n data (workflows, credentials, etc.) is persisted.
