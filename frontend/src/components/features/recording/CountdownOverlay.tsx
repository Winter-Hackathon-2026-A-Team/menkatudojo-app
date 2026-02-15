import { Box, Typography } from '@mui/material';
import { INTERVIEWERS } from '@/constants/interviewers';

// INTERVIEWERS配列の要素1つ分の型を抽出
type Interviewer = typeof INTERVIEWERS[number];

interface CountdownOverlayProps {
  count: number;
  interviewer: Interviewer;
}

export const CountdownOverlay = ({ count, interviewer }: CountdownOverlayProps) => (
  <Box sx={{
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'rgba(0,0,0,0.85)',
    zIndex: 15,
    px: 4,
    textAlign: 'center',
    animation: 'fadeIn 0.3s ease-out',
    '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
  }}>
    <Typography variant="h1" sx={{ 
      fontSize: '10rem', 
      fontWeight: 'bold', 
      color: 'primary.main', 
      mb: 2,
    }}>
      {count}
    </Typography>

    <Typography variant="h6" sx={{ color: 'primary.light', fontWeight: 'bold', mb: 1 }}>
      {interviewer.name}
    </Typography>

    <Typography variant="h5" sx={{ 
      color: 'white', 
      maxWidth: '700px', 
      lineHeight: 1.6,
    }}>
      {interviewer.message}
    </Typography>
  </Box>
);