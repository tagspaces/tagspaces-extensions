import React, { useState } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  Link,
} from '@material-ui/core';
import MoreIcon from '@material-ui/icons/More';
import AboutIcon from '@material-ui/icons/Info';
import PrintIcon from '@material-ui/icons/Print';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      transform: 'translateZ(0px)',
      flexGrow: 1,
    },
    exampleWrapper: {
      position: 'relative',
      marginTop: theme.spacing(3),
      height: 380,
    },
    radioGroup: {
      margin: theme.spacing(1, 0),
    },
    speedDial: {
      position: 'absolute',
      '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
        bottom: theme.spacing(2),
        right: theme.spacing(2),
      },
      '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': {
        top: theme.spacing(2),
        left: theme.spacing(2),
      },
    },
  })
);

const FAB: React.FC = () => {
  const [isAboutDialogOpened, setAboutDialogOpened] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const classes = useStyles();
  // const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const actions = [
    {
      icon: <AboutIcon />,
      name: 'About',
      action: () => setAboutDialogOpened(true),
    },
    { icon: <PrintIcon />, name: 'Print', action: () => window.print() },
  ];

  return (
    <>
      {/*<Fab
        color="primary"
        aria-label="add"
        style={{ position: "absolute", right: 20, bottom: 20 }}
        onClick={() => setAboutDialogOpened(true)}
      >
        <MoreIcon />
      </Fab>*/}
      <SpeedDial
        ariaLabel="SpeedDial example"
        className={classes.speedDial}
        hidden={false}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction={'up'}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </SpeedDial>
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
                  link: 'https://github.com/tagspaces/tagspaces-extensions/tree/main/md-editor',
                }),
                '*'
              );
            }}
          >
            &nbsp; project page
          </Link>
          on GitHub for details about this extension.
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FAB;
