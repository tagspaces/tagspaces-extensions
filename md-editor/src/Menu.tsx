import React, { useState } from 'react';
import { MainMenu } from '@tagspaces/tagspaces-extension-ui';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import TreeIcon from '@mui/icons-material/AccountTree';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import DialogCloseButton from './DialogCloseButton';
import MindMapViewer from './MindMapViewer';
import { sendMessageToHost } from './utils';

const Menu: React.FC<{
  toggleViewSource: () => void;
  readText: () => Promise<boolean>;
  cancelRead: () => void;
  pauseRead: () => void;
  resumeRead: () => void;
  setSettingsDialogOpened: (open: boolean) => void;
  setFilterVisible: (isFilterVisible: boolean) => void;
  getContent: () => string;
  mode: string;
  haveSpeakSupport: boolean;
}> = ({
  toggleViewSource,
  readText,
  cancelRead,
  pauseRead,
  resumeRead,
  setSettingsDialogOpened,
  setFilterVisible,
  getContent,
  mode,
  haveSpeakSupport,
}) => {
  const { t } = useTranslation();
  const isSpeaking = React.useRef<boolean>(false);
  const isPaused = React.useRef<boolean>(false);
  const [isMindMapDialogOpened, setMindMapDialogOpened] =
    useState<boolean>(false);

  const speakButton = {
    id: 'speakID',
    icon: isSpeaking.current ? <StopIcon /> : <PlayArrowIcon />,
    name: t(isSpeaking.current ? 'stopReading' : 'read'),
    action: () => {
      if (isSpeaking.current) {
        cancelRead();
        isSpeaking.current = false;
        isPaused.current = false;
      } else {
        if (isPaused.current === true) {
          isSpeaking.current = true;
          isPaused.current = false;
          resumeRead();
        } else {
          isSpeaking.current = true;
          isPaused.current = false;
          readText().then(() => {
            isSpeaking.current = false;
          });
        }
      }
    },
  };

  const pauseButton = {
    id: 'pauseID',
    icon: <PauseIcon />,
    name: t('pauseReading'),
    action: () => {
      pauseRead();
      isSpeaking.current = false;
      isPaused.current = true;
    },
  };

  return (
    <>
      <MainMenu
        aboutLink={() => {
          sendMessageToHost({
            command: 'openLinkExternally',
            link: 'https://docs.tagspaces.org/extensions/md-editor',
          });
        }}
        menuItems={[
          {
            id: 'switchEditorID',
            icon: <CodeIcon />,
            name: mode === 'Milkdown' ? t('viewEditor') : t('viewMarkdown'),
            action: () => {
              toggleViewSource();
            },
          },
          {
            id: 'findInDocumentID',
            icon: <SearchIcon />,
            name: t('findInDocument'),
            action: () => {
              setFilterVisible(true);
            },
          },
          {
            id: 'viewAsMindMapID',
            icon: <TreeIcon />,
            name: t('viewAsMindMap'),
            action: () => {
              setMindMapDialogOpened(true);
            },
          },
          ...(haveSpeakSupport ? [speakButton] : []),
          ...(haveSpeakSupport && isSpeaking.current ? [pauseButton] : []),
          {
            id: 'settingsID',
            icon: <SettingsIcon />,
            name: t('settings'),
            action: () => {
              setSettingsDialogOpened(true);
            },
          },
          {
            id: 'print',
            name: t('print'),
            action: () => {
              setTimeout(() => window.print(), 100);
            },
          },
          {
            id: 'about',
            name: t('about'),
            action: () => {},
          },
        ]}
      />
      <Dialog
        open={isMindMapDialogOpened}
        onClose={() => {
          setMindMapDialogOpened(false);
        }}
        fullWidth={true}
        maxWidth={false}
        aria-labelledby="dialog-title"
        slotProps={{ paper: { style: { height: '100%' } } }}
      >
        <DialogTitle id="dialog-title">
          {t('Mind Map View')}
          <DialogCloseButton onClick={() => setMindMapDialogOpened(false)} />
        </DialogTitle>
        <DialogContent style={{ height: '100%' }}>
          <MindMapViewer getContent={getContent} />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setMindMapDialogOpened(false)}
            color="primary"
          >
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Menu;
