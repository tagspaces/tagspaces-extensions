import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@material-ui/core';
import MoreIcon from '@material-ui/icons/MoreVert';
import AboutIcon from '@material-ui/icons/Info';
import CodeIcon from '@material-ui/icons/Code';
import PrintIcon from '@material-ui/icons/Print';
import { createTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

const lightTheme = createTheme({
  palette: {
    primary: {
      main: '#1dd19f',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#11cb5f',
      contrastText: '#ffffff'
    }
  }
});

const darkTheme = createTheme({
  palette: {
    primary: {
      main: '#ff9abe',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#11cb5f',
      contrastText: '#ffffff'
    }
  }
});

const FAB: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [isAboutDialogOpened, setAboutDialogOpened] = useState<boolean>(false);

  const handleFabClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const actions = [
    {
      icon: <AboutIcon />,
      name: 'About',
      action: () => setAboutDialogOpened(true)
    },
    {
      icon: <CodeIcon />,
      name: 'View Source',
      action: () => setAboutDialogOpened(true)
    },
    {
      icon: <PrintIcon fontSize="small" />,
      name: 'Print',
      action: () => window.print()
    }
  ];

  const theme = document.documentElement.getAttribute('data-theme');

  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
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
        <DialogTitle id="simple-dialog-title">About Title</DialogTitle>
        <DialogContent>
          Please visit the &nbsp;
          <Link
            href="#"
            variant="body2"
            onClick={(event: React.SyntheticEvent) => {
              event.preventDefault();
              window.parent.postMessage(
                JSON.stringify({
                  command: 'openLinkExternally',
                  link:
                    'https://github.com/tagspaces/tagspaces-extensions/tree/main/md-editor'
                }),
                '*'
              );
            }}
          >
            project page
          </Link>
          &nbsp; on GitHub for details about this extension.
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};

export default FAB;
