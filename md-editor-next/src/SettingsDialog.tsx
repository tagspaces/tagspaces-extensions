import React from 'react';
import i18n from './i18n';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Slider from '@mui/material/Slider';
import DialogCloseButton from './DialogCloseButton';

interface Props {
  open: boolean;
  onClose: () => void;
  handleSpeedChange: (speed: number) => void;
  handleVoiceChange: (voice: string) => void;
  handleLanguageChange: (lang: string) => void;
  voice: string;
  voices: SpeechSynthesisVoice[] | null;
  languages: string[] | null;
  language: string;
  speed: number;
}

function SettingsDialog(props: Props) {
  const { open, onClose } = props;

  const handleSpeedChange = (event: Event, newValue: number | number[]) => {
    props.handleSpeedChange(newValue as number);
  };

  const handleVoiceChange = (event: SelectChangeEvent) => {
    props.handleVoiceChange(event.target.value as string);
  };

  const handleLanguageChange = (event: SelectChangeEvent) => {
    props.handleLanguageChange(event.target.value as string);
  };

  function getDisplayName(lang){
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
      return '- ' + displayNames.of(lang)
    } catch (error) {
      console.error('Invalid argument for Intl.DisplayNames:', error);
    }
    return '';
  }

  return (
    <Dialog
      open={open}
      fullScreen={true}
      onClose={onClose}
      aria-labelledby="settings-dialog-title"
    >
      <DialogTitle id="md-editor-settings-title">
        {i18n.t('settings')}
        <DialogCloseButton onClick={onClose} />
      </DialogTitle>
      <DialogContent
        style={{
          minWidth: 250
        }}
      >
        <InputLabel shrink htmlFor="languages">
          {i18n.t('speechSpeed')}
        </InputLabel>
        <div style={{ marginTop: 40 }}>
          <Slider
            defaultValue={props.speed}
            onChange={handleSpeedChange}
            step={0.05}
            min={0.05}
            max={10}
            valueLabelDisplay="on"
          />
        </div>
        <InputLabel shrink htmlFor="languages">
          {i18n.t('languages')}
        </InputLabel>
        <Select
          onChange={handleLanguageChange}
          input={<OutlinedInput id="languages" />}
          displayEmpty
          fullWidth
          value={props.language}
        >
          <MenuItem value={''} style={{ display: 'none' }} />
          {props.languages?.map(lang => (
            <MenuItem key={lang} value={lang}>
              <span style={{ width: '100%' }}>
                {lang} {getDisplayName(lang)}
              </span>
            </MenuItem>
          ))}
        </Select>
        <InputLabel style={{ marginTop: 15 }} shrink htmlFor="voices">
          {i18n.t('voices')}
        </InputLabel>
        <Select
          onChange={handleVoiceChange}
          input={<OutlinedInput id="voices" />}
          displayEmpty
          fullWidth
          value={props.voice}
        >
          <MenuItem value={''} style={{ display: 'none' }} />
          {props.voices?.map(voice => (
            <MenuItem key={voice.name} value={voice.name}>
              <span style={{ width: '100%' }}>
                {voice.name} {voice.lang}
              </span>
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button data-tid="settingsOkTID" onClick={onClose} color="primary">
          {i18n.t('ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SettingsDialog;
