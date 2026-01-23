import axios from 'axios';

// 今後の構成によってはbaseURLを.envから取得、およびDockerfileの修正が必要
const api = axios.create({
    baseURL: '/api', 
    withCredentials: true,
});

export default api;