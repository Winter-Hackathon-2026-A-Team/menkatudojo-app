import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import api from './api'

function App() {
  const [count, setCount] = useState(0)

  //画面に表示するデータを一時的に保存
  const [backendStatus, setBackendStatus] = useState('確認中...')
  const [dbVersion, setDbVersion] = useState('確認中...')

  //疎通確認(レンダリングが終わったタイミングで)
  useEffect(() => {
    //非同期通信
    const checkConnection = async () => {
      try {
        //ヘルスチェック(バックエンド)
        const healthRes = await api.get('/health')
        setBackendStatus(healthRes.data.status)

        //db接続確認
        const dbRes = await api.get('/db-test')
        setDbVersion(dbRes.data.database_version)
      } catch (error) {
        console.error('Backend connection failed:', error)
        setBackendStatus('接続失敗')
        setDbVersion('接続失敗')
      }
    }
    checkConnection()
  }, []) //[]で最初の１回のみの実行

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <p>API Status:{backendStatus}</p>
      <p>db Version:{dbVersion}</p>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
