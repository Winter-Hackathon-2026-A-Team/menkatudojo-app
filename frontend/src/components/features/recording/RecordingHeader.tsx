import { RecordingState } from '@/types/recording';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Skeleton, Stack, Typography } from '@mui/material';

interface Props {
  state: RecordingState;
  isLoading: boolean;
  onClose: () => void;
}

export const RecordingHeader = ({ state, isLoading, onClose }: Props) => {
  return (
    <Box sx={{ flexShrink: 0, p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.05)',
              p: 2,
              borderRadius: 2,
              minWidth: '400px',
              maxWidth: '600px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {isLoading ? (
              <Skeleton
                variant="rounded"
                width="100%"
                height={24}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
              />
            ) : (
              <Typography variant="body1" textAlign="center">
                {'question' in state && state.question
                  ? state.question.questionContent
                  : '準備中...'}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Stack>
    </Box>
  );
};
