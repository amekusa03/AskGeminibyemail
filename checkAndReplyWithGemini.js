/**
 * Gmailの受信トレイから "AskGemini" を含む未読メールを抽出し、
 * Gemini API の回答を返信するメイン関数。
 */
function checkAndReplyWithGemini() {
  // セキュリティのため、APIキーはスクリプトプロパティから取得
  const scriptProperties = PropertiesService.getScriptProperties();
  const API_KEY = scriptProperties.getProperty('GEMINI_API_KEY');
  const MODEL = 'gemini-1.5-flash';

  if (!API_KEY) {
    console.error('エラー: スクリプトプロパティ "GEMINI_API_KEY" が設定されていません。');
    return;
  }

  try {
    // 件名に "AskGemini" を含む未読スレッドを検索
    const threads = GmailApp.search('subject:AskGemini is:unread');
    
    if (threads.length === 0) {
      console.log('対象となる未読メールは見つかりませんでした。');
      return;
    }

    threads.forEach(thread => {
      // スレッド内の全メッセージから最新のものを取得
      const messages = thread.getMessages();
      const lastMessage = messages[messages.length - 1];
      
      // メール本文を抽出（署名や引用が含まれる場合は調整が必要）
      const userPrompt = lastMessage.getPlainBody();
      console.log('処理開始: ' + thread.getFirstMessageSubject());

      // Gemini API を呼び出し
      const geminiResponse = callGeminiAPI(API_KEY, MODEL, userPrompt);

      // スレッドへの返信
      thread.reply(geminiResponse);
      
      // 処理済みとして既読にする（二重送信防止の要）
      thread.markRead();
      
      console.log('返信完了');
    });

  } catch (error) {
    console.error('メイン処理中に例外が発生しました: ' + error.toString());
  }
}

/**
 * Gemini API (v1beta) を呼び出して生成テキストを返す関数
 */
function callGeminiAPI(apiKey, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    // デバッグ用のステータスコード記録
    console.log('API Status Code: ' + responseCode);

    if (responseCode !== 200) {
      console.error('APIエラーレスポンス: ' + responseText);
      return 'APIリクエストに失敗しました（Code: ' + responseCode + '）。';
    }

    const data = JSON.parse(responseText);

    // 指定された構造からテキストを抽出
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.warn('想定外のレスポンス形式です: ' + responseText);
      return 'APIからの回答構造が解析できませんでした。';
    }

  } catch (e) {
    console.error('ネットワーク/パースエラー: ' + e.toString());
    return '通信中にエラーが発生しました。';
  }
}

