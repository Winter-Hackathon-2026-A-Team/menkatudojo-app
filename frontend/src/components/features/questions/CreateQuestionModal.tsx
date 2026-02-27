import { useState } from 'react';
import { 
  Modal, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Stack, 
  Autocomplete 
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuestion } from '@/api/questions';
import { useMessage } from '@/contexts/MessageContext';

interface Props {
  open: boolean;
  onClose: () => void;
  categories: string[];
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 450 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export const CreateQuestionModal = ({ open, onClose, categories }: Props) => {
  const queryClient = useQueryClient();
  const { showMessage } = useMessage();
  const [content, setContent] = useState({ categoryName: '', questionContent: '' });

  const { mutate, isPending } = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      // キャッシュ無効化により一覧を最新化
      queryClient.invalidateQueries({ queryKey: ['groupedQuestions'] });
      showMessage('質問を作成しました', 'success');
      setContent({ categoryName: '', questionContent: '' });
      onClose();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || '作成に失敗しました';
      showMessage(msg, 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.categoryName || !content.questionContent) return;
    mutate(content);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={3} fontWeight="bold">
          質問を新規作成
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* サジェスト付きカテゴリ入力 */}
            <Autocomplete
              freeSolo
              options={categories}
              value={content.categoryName}
              // 選択または入力時にステートを更新
              onInputChange={(_, newValue) => 
                setContent(prev => ({ ...prev, categoryName: newValue }))
              }
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="カテゴリ名" 
                  required 
                  placeholder="既存の選択または新規入力"
                />
              )}
            />

            <TextField
              label="質問内容"
              required
              multiline
              rows={4}
              value={content.questionContent}
              onChange={(e) => setContent(prev => ({ ...prev, questionContent: e.target.value }))}
              placeholder="例: あなたのこれまでの経験を教えてください"
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={onClose} color="inherit">
                キャンセル
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isPending}
                sx={{ minWidth: 100 }}
              >
                {isPending ? '保存中...' : '保存'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};