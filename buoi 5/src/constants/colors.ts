export const Colors = {
  primary: '#2563EB',        // Royal Blue
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  secondary: '#7C3AED',      // Purple
  secondaryLight: '#F5F3FF',
  success: '#10B981',        // Emerald
  successLight: '#ECFDF5',
  warning: '#F59E0B',        // Amber
  warningLight: '#FFFBEB',
  danger: '#EF4444',         // Red
  dangerLight: '#FEF2F2',
  background: '#F8FAFC',     // Slate 50
  card: '#FFFFFF',
  text: '#0F172A',           // Slate 900
  textMuted: '#64748B',      // Slate 500
  textSubtle: '#94A3B8',     // Slate 400
  border: '#E2E8F0',         // Slate 200
  borderFocus: '#3B82F6',
  badgeBg: '#EEF2F6',
  
  categoryPills: [
    { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
    { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
    { bg: '#FFF7ED', text: '#9A3412', border: '#FFEDD5' },
    { bg: '#FDF2F8', text: '#9D174D', border: '#FCE7F3' },
    { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE' },
    { bg: '#ECFEFF', text: '#155E75', border: '#A5F3FC' },
  ],
};

export const getCategoryColor = (categoryId: string) => {
  const num = parseInt(categoryId, 10);
  const index = isNaN(num) ? 0 : Math.abs(num - 1) % Colors.categoryPills.length;
  return Colors.categoryPills[index];
};
