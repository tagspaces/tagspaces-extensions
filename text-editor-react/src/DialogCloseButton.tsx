import React from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  onClick: () => void;
}

function DialogCloseButton(props: Props) {
  const { onClick } = props;
  return (
    <IconButton
      // title={i18n.t('closeButtonDialog')}
      aria-label="close"
      style={{
        position: 'absolute',
        right: 5,
        top: 5
      }}
      onClick={e => onClick()}
      size="large"
    >
      <CloseIcon />
    </IconButton>
  );
}

export default DialogCloseButton;
