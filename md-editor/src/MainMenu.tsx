import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Fab from '@mui/material/Fab';
import MoreIcon from '@mui/icons-material/MoreVert';
import AboutIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import StopIcon from '@mui/icons-material/Stop';
import TreeIcon from '@mui/icons-material/AccountTree';
import CodeIcon from '@mui/icons-material/Code';
import PrintIcon from '@mui/icons-material/Print';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MindMapViewer from './MindMapViewer';
import DialogCloseButton from './DialogCloseButton';
import i18n from './i18n';
import { sendMessageToHost } from './utils';

const MainMenu: React.FC<{
  toggleViewSource: () => void;
  readText: () => Promise<boolean>;
  cancelRead: () => void;
  pauseRead: () => void;
  resumeRead: () => void;
  setSettingsDialogOpened: (open: boolean) => void;
  isFilterVisible: boolean;
  setFilterVisible: (isFilterVisible: boolean) => void;
  mdContent: string;
  mode: string;
  haveSpeakSupport: boolean;
}> = ({
  toggleViewSource,
  readText,
  cancelRead,
  pauseRead,
  resumeRead,
  setSettingsDialogOpened,
  isFilterVisible,
  setFilterVisible,
  mdContent,
  mode,
  haveSpeakSupport
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isSpeaking = React.useRef<boolean>(false);
  const isPaused = React.useRef<boolean>(false);
  const [isAboutDialogOpened, setAboutDialogOpened] = useState<boolean>(false);
  const [isMindMapDialogOpened, setMindMapDialogOpened] =
    useState<boolean>(false);

  const handleFabClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const speakButton = {
    icon: isSpeaking.current ? <StopIcon /> : <PlayArrowIcon />,
    name: i18n.t(isSpeaking.current ? 'stopReading' : 'read'),
    dataTID: 'speakTID',
    action: () => {
      setAnchorEl(null);
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
    }
  };

  const pauseButton = {
    icon: <PauseIcon />,
    name: i18n.t('pauseReading'),
    dataTID: 'pauseTID',
    action: () => {
      setAnchorEl(null);
      pauseRead();
      isSpeaking.current = false;
      isPaused.current = true;
    }
  };

  const actions = [
    {
      icon: <CodeIcon />,
      name: mode === 'Milkdown' ? i18n.t('viewEditor') : i18n.t('viewMarkdown'),
      dataTID: 'switchEditorTID',
      action: () => {
        setAnchorEl(null);
        toggleViewSource();
      }
    },
    // {
    //   icon: <SearchIcon />,
    //   name: 'Toggle search filter',
    //   action: () => {
    //     setAnchorEl(null);
    //     setFilterVisible(!isFilterVisible);
    //   }
    // },
    {
      icon: <TreeIcon />,
      name: i18n.t('viewAsMindMap'),
      dataTID: 'viewAsMindMapTID',
      action: () => {
        setAnchorEl(null);
        setMindMapDialogOpened(true);
      }
    },
    ...(haveSpeakSupport ? [speakButton] : []),
    ...(haveSpeakSupport && isSpeaking.current === true ? [pauseButton] : []),
    {
      icon: <PrintIcon />,
      name: i18n.t('print'),
      dataTID: 'printTID',
      action: () => {
        setAnchorEl(null);
        window.print();
      }
    },
    {
      icon: <SettingsIcon />,
      name: i18n.t('settings'),
      dataTID: 'settingsTID',
      action: () => {
        setAnchorEl(null);
        setSettingsDialogOpened(true);
      }
    },
    {
      icon: <AboutIcon />,
      name: i18n.t('about'),
      dataTID: 'aboutTID',
      action: () => {
        setAnchorEl(null);
        setAboutDialogOpened(true);
      }
    }
  ];

  // const theme = document.documentElement.getAttribute('data-theme');

  const primaryBackgroundColor = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color')
    .trim();
  const primaryTextColor = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-text-color')
    .trim();

  // console.log('CSS: ' + primaryBackgroundColor);

  const tsTheme = createTheme({
    palette: {
      primary: {
        main: primaryBackgroundColor,
        contrastText: primaryTextColor
      },
      secondary: {
        main: '#11cb5f',
        contrastText: '#ffffff'
      }
    }
  });

  return (
    <ThemeProvider theme={tsTheme}>
      {Boolean(anchorEl) && (
        <Menu
          id="fab-menu"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {actions.map(action => (
            <MenuItem
              data-tid={action.dataTID}
              key={action.name}
              onClick={action.action}
            >
              <ListItemIcon>{action.icon}</ListItemIcon>
              <ListItemText>{action.name}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      )}
      <Fab
        data-tid="mdEditorMenuTID"
        color="primary"
        aria-label="open extension menu"
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          width: 50,
          height: 50
        }}
        onClick={handleFabClick}
      >
        <MoreIcon />
      </Fab>
      <Dialog
        open={isAboutDialogOpened}
        onClose={() => {
          setAboutDialogOpened(false);
        }}
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">
          {i18n.t('aboutTitle')}
          <DialogCloseButton onClick={() => setAboutDialogOpened(false)} />
        </DialogTitle>
        <DialogContent>
          Please visit the dedicated&nbsp;
          <Link
            href="#"
            variant="body2"
            onClick={(event: React.SyntheticEvent) => {
              event.preventDefault();
              sendMessageToHost({
                command: 'openLinkExternally',
                link: 'https://docs.tagspaces.org/extensions/md-editor/'
              });
            }}
          >
            project page
          </Link>
          &nbsp; in the TagSpaces' documentation for more details.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAboutDialogOpened(false)} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isMindMapDialogOpened}
        onClose={() => {
          setMindMapDialogOpened(false);
        }}
        fullWidth={true}
        maxWidth={false}
        aria-labelledby="dialog-title"
        PaperProps={{ style: { height: '100%' } }}
      >
        <DialogTitle id="dialog-title">
          {i18n.t('Mind Map View')}
          <DialogCloseButton onClick={() => setMindMapDialogOpened(false)} />
        </DialogTitle>
        <DialogContent style={{ height: '100%' }}>
          <MindMapViewer mdContent={mdContent} />
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={() => setMindMapDialogOpened(false)} color="primary">
            Export as SVG
          </Button> */}
          <Button
            onClick={() => setMindMapDialogOpened(false)}
            variant="outlined"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default MainMenu;
