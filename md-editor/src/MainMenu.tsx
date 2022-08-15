import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Fab from '@mui/material/Fab';
import MoreIcon from '@mui/icons-material/MoreVert';
import AboutIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';
import PrintIcon from '@mui/icons-material/Print';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const MainMenu: React.FC<{ toggleViewSource: () => void; mode: string }> = ({
  toggleViewSource,
  mode
}) => {
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
    {
      icon: <PrintIcon />,
      name: 'Print',
      action: () => {
        setAnchorEl(null);
        window.print();
      }
    },
    {
      icon: <AboutIcon />,
      name: 'About',
      action: () => {
        setAnchorEl(null);
        setAboutDialogOpened(true);
      }
    }
  ];

  // const theme = document.documentElement.getAttribute('data-theme');

  const primaryBackgroundColor = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-background-color')
    .trim();
  const primaryTextColor = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-text-color')
    .trim();

  console.log('CSS: ' + primaryBackgroundColor);

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
        aria-label="add"
        style={{ position: 'absolute', right: 20, bottom: 20 }}
        onClick={handleFabClick}
      >
        <MoreIcon />
      </Fab>
      <Dialog
        open={isAboutDialogOpened}
        onClose={() => {
          setAboutDialogOpened(false);
        }}
        aria-labelledby="simple-dialog-title"
      >
        <DialogTitle id="simple-dialog-title">About this extension</DialogTitle>
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
          &nbsp; in our documentation for more details.
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};

export default MainMenu;
