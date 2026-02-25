import { PERSONALITIES } from '@/constants/personalities';
import { HistoryItem } from '@/types/recording';
import { getGradeColor } from '@/utils/gradeColor';
import { Avatar, Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const HistoryCard = ({ item }: { item: HistoryItem }) => {
  const navigate = useNavigate();
  const avatar = PERSONALITIES.find((p) => p.avatarId === item.characterConfig.avatarId);
  const avatarImage = avatar?.avatarUrl || '/path/to/default-avatar.png';

  return (
    <Card
      sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 }, height: '100%' }}
      onClick={() => navigate(`/analysis-result/${item.answerId}`)}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          // sx={{ mb: 1 }}
        >
          <Chip label={item.categoryName} size="small" color="primary" variant="outlined" />
          <Avatar
            sx={{
              bgcolor: getGradeColor(item.feedback.grade),
              color: '#fff',
              fontWeight: 'bold',
              width: 32,
              height: 32,
              fontSize: '1rem',
            }}
          >
            {item.feedback.grade}
          </Avatar>
        </Stack>
        <Typography variant="body1" sx={{ mb: 1, fontWeight: '500' }} noWrap>
          {item.questionContent}
        </Typography>
        <Box
          sx={{
            width: '100%',
            aspectRatio: '2.5 / 1',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderBottom: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Box
            component="img"
            src={avatarImage}
            alt={avatar?.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 20%',
            }}
          />
        </Box>
        <Typography variant="caption" color="text.primary" sx={{ mt: 1, display: 'block' }}>
          実施日: {new Date(item.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
};
