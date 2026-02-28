import { Box, Button, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const TopPage = () => (
  <Box
    sx={{
      minHeight: '100vh',
      backgroundImage: 'url(/toppage-image.png)',
      backgroundSize: 'cover',
      backgroundPosition: '50% 20%',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      backgroundBlendMode: 'darken',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      textAlign: 'center',
    }}
  >
    <Typography
      variant="h5"
      component="h2"
      sx={{
        color: 'white',
        mb: 1,
        textShadow: `
      1px 1px 0 #666,
      -1px 1px 0 #666,
      1px -1px 0 #666,
      -1px -1px 0 #666
    `,
      }}
    >
      面接練習を
    </Typography>

    <Button
      type="submit"
      variant="contained"
      size="large"
      component={RouterLink}
      to="/signup"
      sx={{
        mb: 1,
        px: 8,
        py: 1,
        maxWidth: '90%',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.7)',
        // ホバーした時にさらに浮き上がる
        '&:hover': {
          boxShadow: '0px 12px 25px rgba(0, 0, 0, 0.7)',
          transform: 'translateY(-2px)', // 少し上に
        },
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      今すぐ始める
    </Button>
    <Link
      component={RouterLink}
      to="/login"
      sx={{
        color: 'white',
        textDecoration: 'underline',
        mb: 14,
        textShadow: `
      1px 1px 0 #666,
      -1px 1px 0 #666,
      1px -1px 0 #666,
      -1px -1px 0 #666
    `,
      }}
    >
      ログインはこちら
    </Link>

    {/* 開発時のみ、コメントアウトを外すと疎通確認のリンクが出る */}
    {/* <Link component={RouterLink} to="/dev/health" sx={{ color: 'white' }}>
      疎通確認
    </Link> */}
  </Box>
);
