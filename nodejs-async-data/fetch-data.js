// 外部データを取得
async function fetchData() {
  // console.log('ユーザーデータの取得を開始します。');

  try {
    await new Promise(resolve => setTimeout(resolve, 350));

    // ユーザーデータ取得
    const response = await fetch(
      'https://jsonplaceholder.typicode.com/users'
    );

    const data = await response.json();

    console.log(`データ取得が完了しました。取得件数 ${data.length}件`);
    console.log('ユーザー一覧：');

    for (let i = 0; i < data.length; i++) {
      console.log(data[i].name);
    }

    // console.log('ユーザーデータの取得が終了しました。');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 外部データを取得
console.log('fetchData()関数を実行します。');
fetchData();

// 100ミリ秒ごとにメッセージを表示
let count = 1;
const interval = setInterval(() => {
  console.log(`別の処理を実行中... ${count++}`);

  if (count > 10) {
    clearInterval(interval);
  }
}, 100);

console.log('fetchData()関数を実行しました。');