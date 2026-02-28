// 各ページのアナウンス部分
import { Box, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

interface PageHeaderProps {
  leftSlot?: ReactNode; // 左側に置くもの（タイトル、戻るボタンなど）
  rightSlot?: ReactNode; // 右側に置くもの（作成ボタン、編集ボタンなど）
  sx?: SxProps<Theme>;
}

export const PageHeader = ({ leftSlot, rightSlot, sx }: PageHeaderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{leftSlot}</Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{rightSlot}</Box>
    </Box>
  );
};
