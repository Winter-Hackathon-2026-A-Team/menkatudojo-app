import axios from 'axios';

// 今後の構成によってはbaseURLを.envから取得、およびDockerfileの修正が必要
const client = axios.create({
  baseURL: '/api',
  withCredentials: true,

  // TODO：backendとの疎通確認の際はコメントアウトを外す
  // backendの記述にあわせる
  // Backendが「Set-Cookie」で送ってくる名前
//   xsrfCookieName: 'csrftoken',
  // 次回以降、フロントがリクエストヘッダーに載せる名前
//   xsrfHeaderName: 'X-XSRF-TOKEN',
});

export default client;
