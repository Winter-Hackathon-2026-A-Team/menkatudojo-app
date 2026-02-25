import { ProfileEditModal } from '@/components/auth/ProfileEditModal';
import { useAuth } from '@/contexts/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  AppBar,
  Box,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const menuItems = [
    { text: 'ダッシュボード', icon: <DashboardIcon />, path: '/dashboard' },
    { text: '練習を始める', icon: <PlayArrowIcon />, path: '/questions' },
    { text: '履歴一覧', icon: <HistoryIcon />, path: '/history' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setIsDrawerOpen(false);
  };

  const handleOpenProfile = () => {
    setIsDrawerOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleLogout = async () => {
    if (!window.confirm('ログアウトしますか？')) return;
    try {
      await logout();
      navigate('/login', { replace: true });
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('ログアウト失敗:', error);
    }
  };

  return (
    <>
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
            <Box
              component="img"
              src="/logo.svg"
              alt="タイトルロゴ"
              onClick={() => navigate('/dashboard')}
              sx={{ height: 60, width: 'auto', cursor: 'pointer' }}
            />
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={() => setIsDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>

        <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
          <Box sx={{ width: 250 }} role="presentation">
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton onClick={() => handleNav(item.path)}>
                    <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
              <Divider />
              <ListItem disablePadding>
                <ListItemButton onClick={handleOpenProfile}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="プロフィール変更" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon sx={{ color: 'error.main' }}>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="ログアウト" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      </AppBar>

      <ProfileEditModal open={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
};
