import { useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';


export const AnalysisResultPage = () => {
  const location = useLocation();
  const { feedback } = location.state || {};

  return (
    <Box>
      <Typography>分析結果（開発用）</Typography>
      {feedback ? (
        <Box>{JSON.stringify(feedback, null, 2)}</Box>
      ) : (
        <Typography>データがありません</Typography>
      )}
    </Box>
  );
};