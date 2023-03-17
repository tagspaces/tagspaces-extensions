/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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
import Typography from '@mui/material/Typography';
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

  const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="settings-dialog-title"
    >
      <DialogTitle id="settings-dialog-title">
        {i18n.t('settingsTitle')}
        <DialogCloseButton onClick={onClose} />
      </DialogTitle>
      <DialogContent
        style={{
          minWidth: 400
        }}
      >
        <Typography gutterBottom>{i18n.t('speechSpeed')}</Typography>
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
          input={<OutlinedInput id="languages" label={i18n.t('languages')} />}
          displayEmpty
          fullWidth
          value={props.language}
        >
          <MenuItem value={''} style={{ display: 'none' }} />
          {props.languages?.map(lang => (
            <MenuItem key={lang} value={lang}>
              <span style={{ width: '100%' }}>
                {lang} - {displayNames.of(lang)}
              </span>
            </MenuItem>
          ))}
        </Select>

        <InputLabel shrink htmlFor="voices">
          {i18n.t('voices')}
        </InputLabel>
        <Select
          onChange={handleVoiceChange}
          input={<OutlinedInput id="voices" label={i18n.t('voices')} />}
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
        <Button onClick={onClose} color="primary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SettingsDialog;
