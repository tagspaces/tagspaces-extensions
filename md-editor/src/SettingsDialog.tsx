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
import TextField from '@mui/material/TextField';
import DialogCloseButton from './DialogCloseButton';

interface Props {
  open: boolean;
  onClose: () => void;
  handleSpeedChange: (speed: string) => void;
  handleVoiceChange: (voice: string) => void;
  voice: SpeechSynthesisVoice | null;
  voices: SpeechSynthesisVoice[] | null;
  speed: number;
}

function SettingsDialog(props: Props) {
  const { open, onClose } = props;

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
      <DialogContent>
        <TextField
          fullWidth={true}
          margin="dense"
          autoFocus
          label={i18n.t('speechSpeed')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            props.handleSpeedChange(e.target.value)
          }}
          defaultValue={props.speed}
          data-tid="speechSpeedTID"
        />
        <InputLabel shrink htmlFor="voices">
          {i18n.t('voices')}
        </InputLabel>
        <Select
          onChange={(event: SelectChangeEvent) =>
            props.handleVoiceChange(event.target.value as string)
          }
          input={
            <OutlinedInput
              name="savedSearch"
              id="voices"
              label={i18n.t('voices')}
            />
          }
          displayEmpty
          fullWidth
          value={props.voice?.name}
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
        {/*<select onChange={e => props.handleVoiceChange(e.target.value)}>
          {props.voices?.map(voice => (
            <option key={voice.name} value={voice.name}>
              {voice.name} {voice.lang}
            </option>
          ))}
        </select>*/}
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
