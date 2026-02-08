// TODO：アプリロゴを押下→ダッシュボードへ遷移、ハンバーガーメニュー押下→リスト表示
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Container, IconButton, Toolbar } from '@mui/material';

export const Header = () => {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'background.default',
        color: 'text.primary',
        borderBottom: '2px solid',
        borderColor: 'primary.main',
      }}
    >
      <Container maxWidth="lg" sx={{ maxWidth: { lg: '1000px' }, px: { xs: 2, lg: 0 } }}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* 左端：ロゴ */}
          <Box
            component="img"
            src="/logo.svg"
            alt="タイトルロゴ"
            sx={{ height: 60, width: 'auto' }}
          />

          {/* 右端：ハンバーガーメニュー */}
          <IconButton size="large" edge="end" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
