import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2E6B5A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5D4037',
    },
    background: {
      default: '#FAF9F6', // 画面全体のバックグラウンド
      paper: '#E8F5E9',   // カード等の背景色（薄い緑）
    },
    text: {
      primary: '#333333',
    },
  },
  // ボタンの角丸など、道場の「堅実さ」を出すための設定
  shape: {
    borderRadius: 8,
  },
});
  // フォントなどもここで共通化できる
