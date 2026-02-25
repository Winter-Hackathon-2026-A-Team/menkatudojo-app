export const getGradeColor = (grade: string): string => {
  const colors: Record<string, string> = {
    A: 'primary.main',
    B: 'warning.main',
    C: 'error.main',
  };
  return colors[grade] || 'grey.500';
};