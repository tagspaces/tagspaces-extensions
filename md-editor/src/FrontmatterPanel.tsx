import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

interface Props {
  frontmatter: string;
  isEditMode: boolean;
  theme?: string;
  onChange?: (value: string) => void;
  onSave?: () => void;
}

const FrontmatterPanel: React.FC<Props> = ({
  frontmatter,
  isEditMode,
  theme,
  onChange,
  onSave,
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
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
              e.preventDefault();
              e.stopPropagation();
              onSave?.();
            }
          }}
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

  // Viewer mode: parse key: value pairs, including YAML list items and block scalars (> / |)
  const fields: Array<[string, string | string[]]> = [];
  let inBlockScalar = false;
  for (const line of frontmatter.split('\n')) {
    const isIndented = /^\s/.test(line) && line.trim() !== '';
    const listMatch = line.match(/^\s+-\s+(.*)/);

    if (inBlockScalar) {
      if (isIndented && !listMatch) {
        // Continuation line of a block scalar — append to last field's text
        const last = fields[fields.length - 1];
        if (last && typeof last[1] === 'string') {
          const text = line.trim();
          fields[fields.length - 1] = [last[0], (last[1] ? last[1] + ' ' : '') + text];
        }
        continue;
      } else {
        inBlockScalar = false;
      }
    }

    if (listMatch) {
      const last = fields[fields.length - 1];
      if (last) {
        if (Array.isArray(last[1])) {
          (last[1] as string[]).push(listMatch[1].trim());
        } else {
          fields[fields.length - 1] = [last[0], [last[1], listMatch[1].trim()].filter(Boolean)];
        }
      }
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (value === '>' || value === '|') {
      inBlockScalar = true;
      fields.push([key, '']);
    } else {
      fields.push([key, value]);
    }
  }

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
          {Array.isArray(value) ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {value.map((item) => (
                <Typography
                  key={item}
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    borderRadius: 1,
                    px: 0.75,
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.primary', wordBreak: 'break-word' }}>
              {value}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default FrontmatterPanel;
