const express = require('express');
const app = express(); // Webサーバーの土台を作成
const PORT = 3000; // ポート番号

// DB共通モジュールをインポート
const { executeQuery, closePool } = require('./db');

// ミドルウェアでJSON形式のリクエストボディを自動的にパース
app.use(express.json());

// サーバーエラーを処理する共通関数
function handleServerError(res, error, message = 'サーバーエラー') {
  console.error(error);
  res.status(500).json({ error: message });
}

// Create
app.post('/todos', async (req, res) => {
  const { title, priority, status = '未着手' } = req.body;
  try { // INSERT文を実行し、結果をJSON形式で取得
    const result = await executeQuery(
      'INSERT INTO todos (title, priority, status) VALUES (?, ?, ?);',
      [title, priority, status]
    );
    // エラーがなければ成功とみなし、201 Createdとデータ情報を返却
    res.status(201).json({ id: result.insertId, title, priority, status });
  } catch (err) { // エラー処理
    handleServerError(res, err, 'todo 追加に失敗しました');
  }
});

// Read
app.get('/todos', async (req, res) => {
  try { // SELECT文を実行し、結果をJSON形式で取得
    const rows = await executeQuery('SELECT * FROM todos;');

    // ユーザーリストが空でも異常とは言い切れないため、エラーがなければ200 OKを返却
    res.status(200).json(rows);
  } catch (err) { // エラー処理
    handleServerError(res, err);
  }
});

// Read
app.get('/todos/:id', async (req, res) => {
  try { // SELECT文を実行し、結果をJSON形式で取得
    const rows = await executeQuery('SELECT * FROM todos WHERE id = ?;', [req.params.id]);

    // 指定IDのユーザーが存在しない(行数0)なら404 Not Foundを返却
    rows.length === 0
      ? res.status(404).json({ error: 'ユーザーが見つかりません' })
      : res.status(200).json(rows[0]);
  } catch (err) { // エラー処理
    handleServerError(res, err);
  }
});

// Update
app.put('/todos/:id', async (req, res) => {
  const { title, priority, status } = req.body;
  try { // UPDATE文を実行し、結果をJSON形式で取得
    const result = await executeQuery(
      'UPDATE todos SET title = ?, priority = ?, status = ? WHERE id = ?;',
      [title,priority, status, req.params.id]
    );

    // 1行も更新されていなければ404 Not Foundを返却
    result.affectedRows === 0
      ? res.status(404).json({ error: '更新対象のユーザーが見つかりません' })
      : res.status(200).json({ id: req.params.id, title, priority, status });
  } catch (err) { // エラー処理
    handleServerError(res, err, 'ユーザー更新に失敗しました');
  }
});

// Delete
app.delete('/todos/:id', async (req, res) => {
  try { // DELETE文を実行し、結果をJSON形式で取得
    const result = await executeQuery(
      'DELETE FROM todos WHERE id = ?;',
      [req.params.id]
    );

    // 1行も削除されていなければ404 Not Foundを返却
    result.affectedRows === 0
      ? res.status(404).json({ error: '削除対象のユーザーが見つかりません' })
      : res.status(200).json({ message: 'ユーザーを削除しました' });
  } catch (err) { // エラー処理
    handleServerError(res, err, 'ユーザー削除に失敗しました');
  }
});

// アプリ終了時にDB接続プールを安全に破棄する
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
  process.on(signal, async () => {
    console.log(`\n${signal}を受信。アプリケーションの終了処理中...`);
    await closePool();
    process.exit();
  });
});

// Webサーバーを起動
app.listen(PORT, () => {
  console.log(`${PORT}番ポートでWebサーバーが起動しました。`);
});