import { Personality } from '@/types/personality';
import { Avatar, Card, CardActionArea, Grid, Radio, Typography } from '@mui/material';

// 1. 親から渡されるデータの「型」を定義する
interface Props {
  personalities: Personality[]; // 師範リスト
  selectedAvatarId: number; // 選択中の数値
  onSelect: (id: number) => void; // 選択した時の動き
}

export const PersonalitySelector = ({ personalities, selectedAvatarId, onSelect }: Props) => {
  return (
    <Grid container direction="row" sx={{ height: '100%' }} spacing={1}>
      {personalities.map((p) => (
        <Grid size={{ xs: 4 }} key={p.avatarId}>
          <Card
            variant="outlined"
            sx={{
              bgcolor: selectedAvatarId === p.avatarId ? '#FFFFFF' : 'background.paper',
              borderColor: selectedAvatarId === p.avatarId ? 'primary.main' : 'divider',
              borderWidth: selectedAvatarId === p.avatarId ? 2 : 1,
              boxShadow: selectedAvatarId === p.avatarId ? 4 : 0,
              transition: 'background-color 0.2s, border-color 0.2s',
              height: '100%',
              display: 'flex',
            }}
          >
            <CardActionArea
              onClick={() => onSelect(p.avatarId)}
              sx={{
                p: 1,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Typography variant="caption" display="block" noWrap>
                {p.name}
              </Typography>
              <Avatar
                src={p.avatarUrl}
                variant="rounded"
                sx={{ flexGrow: 1, width: '100%', height: 'auto' }}
              />
              <Radio checked={selectedAvatarId === p.avatarId} size="small" />
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
