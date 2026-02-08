import { Personality } from '@/types/personality';
import { Avatar, Card, CardActionArea, Grid, Radio, Typography } from '@mui/material';

interface Props {
  selectedPersonalityId: number;
  onSelect: (id: number) => void;
}

const PERSONALITIES: Personality[] = [
  { id: 1, name: '優しい', image: '/avatar1.png' },
  { id: 2, name: '熱血', image: '/avatar2.png' },
  { id: 3, name: '論理的', image: '/avatar3.png' },
];

export const PersonalitySelector = ({ selectedPersonalityId, onSelect }: Props) => {
  return (
    <Grid container direction="row" sx={{ height: '100%' }} spacing={1}>
      {PERSONALITIES.map((p) => (
        <Grid size={{ xs: 4 }} key={p.id}>
          <Card
            variant="outlined"
            sx={{
              bgcolor: selectedPersonalityId === p.id? '#FFFFFF' : 'background.paper',
              borderColor: selectedPersonalityId === p.id ? 'primary.main' : 'divider',
              borderWidth: selectedPersonalityId === p.id ? 2 : 1,
              boxShadow: selectedPersonalityId === p.id ? 4 : 0,
              transition: 'background-color 0.2s, border-color 0.2s',
              height: '100%',
              display: 'flex',
            }}
          >
            <CardActionArea
              onClick={() => onSelect(p.id)}
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
                src={p.image}
                variant="rounded"
                sx={{ flexGrow: 1, width: '100%', height: 'auto' }}
              />
              <Radio checked={selectedPersonalityId === p.id} size="small" />
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
