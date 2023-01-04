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
import SearchIcon from '@mui/icons-material/FindInPage';
import CodeIcon from '@mui/icons-material/Code';
import PrintIcon from '@mui/icons-material/Print';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import i18n from './i18n';

const MainMenu: React.FC<{
  toggleViewSource: () => void;
  isFilterVisible: boolean;
  setFilterVisible: (isFilterVisible: boolean) => void;
  mode: string;
}> = ({ toggleViewSource, isFilterVisible, setFilterVisible, mode }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [isAboutDialogOpened, setAboutDialogOpened] = useState<boolean>(false);

  const handleFabClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const actions = [
    {
      icon: <CodeIcon />,
      name: mode === 'Milkdown' ? 'View Markdown' : 'View Editor',
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
      icon: <PrintIcon />,
      name: i18n.t('print'),
      action: () => {
        setAnchorEl(null);
        window.print();
      }
    },
    {
      icon: <AboutIcon />,
      name: i18n.t('about'),
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
            <MenuItem key={action.name} onClick={action.action}>
              <ListItemIcon>{action.icon}</ListItemIcon>
              <ListItemText>{action.name}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      )}
      <Fab
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
        <DialogTitle id="dialog-title">{i18n.t('aboutTitle')}</DialogTitle>
        <DialogContent>
          Please visit the dedicated&nbsp;
          <Link
            href="#"
            variant="body2"
            onClick={(event: React.SyntheticEvent) => {
              event.preventDefault();
              window.parent.postMessage(
                JSON.stringify({
                  command: 'openLinkExternally',
                  link: 'https://docs.tagspaces.org/extensions/md-editor/'
                }),
                '*'
              );
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
    </ThemeProvider>
  );
};

export default MainMenu;
