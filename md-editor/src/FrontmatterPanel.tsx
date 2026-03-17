import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

interface Props {
  frontmatter: string;
  isEditMode: boolean;
  theme?: string;
  onChange?: (value: string) => void;
}

const FrontmatterPanel: React.FC<Props> = ({
  frontmatter,
  isEditMode,
  theme,
  onChange,
}) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  if (isEditMode) {
    return (
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        }}
      >
        <Typography
          variant="overline"
          sx={{ px: 2, pt: 1, display: 'block', opacity: 0.55, lineHeight: 2 }}
        >
          {t('frontmatter')}
        </Typography>
        <textarea
          value={frontmatter}
          onChange={(e) => onChange?.(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            padding: '4px 16px 12px',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            minHeight: '72px',
            background: 'transparent',
            color: 'inherit',
          }}
        />
      </Box>
    );
  }

  // Viewer mode: parse key: value pairs for display
  const fields: Array<[string, string]> = frontmatter
    .split('\n')
    .filter((line) => line.includes(':'))
    .map((line) => {
      const colonIdx = line.indexOf(':');
      return [
        line.slice(0, colonIdx).trim(),
        line.slice(colonIdx + 1).trim(),
      ] as [string, string];
    });

  return (
    <Box
      sx={{
        margin: '0 auto 0 auto',
        maxWidth: '800px',
        px: 2,
        py: 1.5,
        borderRadius: 0,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
      }}
    >
      <Typography
        variant="overline"
        sx={{ color: 'text.primary', opacity: 0.55, display: 'block', mb: 0.75 }}
      >
        {t('frontmatter')}
      </Typography>
      {fields.map(([key, value]) => (
        <Box key={key} sx={{ display: 'flex', gap: 1.5, mb: 0.5 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 'normal', minWidth: 80, color: 'primary.main' }}
          >
            {key}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', wordBreak: 'break-word' }}>
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default FrontmatterPanel;
