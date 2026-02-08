// カテゴリ・質問のアコーディオン部分を外出し
import { Question } from '@/types/question';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';

interface QuestionListProps {
  groupedQuestions: Record<string, Question[]>;
  questionId: number | null;
  onSelect: (id: number) => void;
}

export const QuestionList = ({ groupedQuestions, questionId, onSelect }: QuestionListProps) => {
  return (
    <>
      {Object.entries(groupedQuestions).map(([category, items]) => (
        <Accordion
          key={category}
          disableGutters
          elevation={0}
          sx={{ borderBottom: '1px solid #e0e0e0' }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 'bold' }}>
              {category} ({items.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List disablePadding>
              {items.map((q) => (
                <ListItem key={q.questionId} disablePadding divider>
                  <ListItemButton onClick={() => onSelect(q.questionId)}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={questionId === q.questionId}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText primary={q.questionContent} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};
