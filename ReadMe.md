# メールでGemini

メールで環境はあるけど、ブラウザーやスマホが使えない時、
自分宛てにメールをすると、Geminiの応答をメールしてもらえます。

## 使い方

メールの件名に "AskGemini" を追加して、本文に聞きたい内容を書いてください。
回答時間は設定しだいですが、Geminiの応答が本文に書かれて返ってきます。

## 仕様

Google Apps Script (GAS) を使って、受信メールの件名に "AskGemini" が含まれていたら Gemini API に問い合わせ、その結果をメールで返信するスクリプトです。
GmailApp と UrlFetchApp を使い、Gemini API（Google Generative AI API）を呼び出します。
Gemini API の利用には Google AI Studio で API キーを取得しておく必要があります。

## 設定手順

1. [Google AI Studio](https://ai.google.dev/aistudio) で API キーを取得します。
2. [Google Apps Script](https://script.google.com/) で新しいプロジェクトを作成し、スクリプトを貼り付けます。
3. **スクリプトプロパティの設定**:
   * 左側のサイドバーの「プロジェクトの設定」（歯車アイコン）をクリック。
   * 「スクリプト プロパティ」セクションで「スクリプト プロパティを編集」をクリック。
   * プロパティ名に `GEMINI_API_KEY`、値に取得した API キーを入力して保存します。

## サービスの有効化

* **トリガー設定**: 左側の「トリガー」（時計アイコン）から `checkAndReplyWithGemini` を「時間主導型」で 5分ごとなどに実行するよう追加します。
* **初回実行**: エディタで関数を手動実行し、Gmail へのアクセス権限を承認してください。

## 動作の流れ

未読メールの件名に "AskGemini" が含まれるものを検索
最新メールの本文を Gemini API に送信
Gemini の応答をメールで返信
スレッドを既読にして二重処理を防止
