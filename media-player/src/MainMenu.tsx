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
import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Divider, Typography } from '@mui/material';
import { sendMessageToHost } from './utils';

const MainMenu: React.FC<{
  autoPlay: boolean;
  setAutoPlay: (autoPlay: boolean) => void;
  loop: string;
  setLoop: (loop: string) => void;
  enableVideoOutput: boolean;
  setVideoOutput: (video: boolean) => void;
  setThumbnail: () => void;
  loading: boolean;
}> = ({
  autoPlay,
  setAutoPlay,
  loop,
  setLoop,
  enableVideoOutput,
  setVideoOutput,
  setThumbnail,
  loading,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [isAboutDialogOpened, setAboutDialogOpened] = useState<boolean>(false);

  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const autoPlayRef = React.useRef<boolean>(autoPlay);
  const loopRef = React.useRef<string>(loop);

  const handleFabClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  // const theme = document.documentElement.getAttribute('data-theme');

  const primaryBackgroundColor = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color')
    .trim();
  const primaryTextColor = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-text-color')
    .trim();

  const tsTheme = createTheme({
    palette: {
      primary: {
        main: primaryBackgroundColor || '#222222',
        contrastText: primaryTextColor || '#ffffff',
      },
      secondary: {
        main: '#11cb5f',
        contrastText: '#ffffff',
      },
    },
  });

  return (
    <ThemeProvider theme={tsTheme}>
      <Menu
        id="fab-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            autoPlayRef.current = !autoPlayRef.current;
            setAutoPlay(autoPlayRef.current);
            forceUpdate();
          }}
        >
          <ListItemIcon>
            {autoPlayRef.current ? <CheckBox /> : <CheckBoxOutlineBlank />}
          </ListItemIcon>
          <ListItemText>
            {'Auto-Play ' + (autoPlayRef.current ? 'Enabled' : 'Disabled')}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setVideoOutput(!enableVideoOutput);
          }}
        >
          <ListItemIcon>
            {enableVideoOutput ? <CheckBox /> : <CheckBoxOutlineBlank />}
          </ListItemIcon>
          <ListItemText>
            {'Video Output ' + (enableVideoOutput ? 'Enabled' : 'Disabled')}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            loopRef.current = 'loopAll';
            setLoop(loopRef.current);
            forceUpdate();
          }}
        >
          <ListItemIcon>
            {loopRef.current === 'loopAll' ? (
              <CheckCircleOutlineIcon />
            ) : (
              <RadioButtonUncheckedIcon />
            )}
          </ListItemIcon>
          <ListItemText>Loop All</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            loopRef.current = 'loopOne';
            setLoop(loopRef.current);
            forceUpdate();
          }}
        >
          <ListItemIcon>
            {loopRef.current === 'loopOne' ? (
              <CheckCircleOutlineIcon />
            ) : (
              <RadioButtonUncheckedIcon />
            )}
          </ListItemIcon>
          <ListItemText>Loop One</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            loopRef.current = 'noLoop';
            setLoop(loopRef.current);
            forceUpdate();
          }}
        >
          <ListItemIcon>
            {loopRef.current === 'noLoop' ? (
              <CheckCircleOutlineIcon />
            ) : (
              <RadioButtonUncheckedIcon />
            )}
          </ListItemIcon>
          <ListItemText>No Loop</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          disabled={loading}
          data-tid="mediaPlayerThumbnailTID"
          onClick={() => {
            setAnchorEl(null);
            setThumbnail();
          }}
        >
          <ListItemIcon>
            <AboutIcon />
          </ListItemIcon>
          <ListItemText>Set Thumbnail</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          data-tid="mediaPlayerAboutTID"
          onClick={() => {
            setAnchorEl(null);
            setAboutDialogOpened(true);
          }}
        >
          <ListItemIcon>
            <AboutIcon />
          </ListItemIcon>
          <ListItemText>About</ListItemText>
        </MenuItem>
      </Menu>
      <Fab
        data-tid="mediaPlayerMenuTID"
        color="primary"
        aria-label="open extension menu"
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          width: 50,
          height: 50,
        }}
        onClick={handleFabClick}
      >
        <MoreIcon />
      </Fab>
      <Dialog
        data-tid="AboutDialogTID"
        open={isAboutDialogOpened}
        onClose={() => {
          setAboutDialogOpened(false);
        }}
        aria-labelledby="simple-dialog-title"
      >
        <DialogTitle id="simple-dialog-title">About this extension</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">
            Please visit the dedicated&nbsp;
            <Link
              href="#"
              variant="body2"
              onClick={(event: React.SyntheticEvent) => {
                event.preventDefault();
                sendMessageToHost({
                  command: 'openLinkExternally',
                  link: 'https://docs.tagspaces.org/extensions/media-player',
                });
              }}
            >
              project page
            </Link>
            &nbsp; in the TagSpaces' documentation for more details.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            data-tid="AboutDialogOkTID"
            onClick={() => setAboutDialogOpened(false)}
            color="primary"
            variant="contained"
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default MainMenu;
