import { FC } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setDialog } from '../../app/store';
import styles from './GameDialog.module.css';

interface GameDialogProps { }

const GameDialog: FC<GameDialogProps> = () => {
  const dialog = useAppSelector((state) => state.gameActions.dialog);
  const dispatch = useAppDispatch();

  if (dialog === null) return <></>;

  const handleClose = () => {
    dispatch(setDialog(null));
  }

  return <Dialog
    className={styles.GameDialog}
    open={true}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">
      {dialog.title}
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        {dialog.content}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      {dialog.showButtons && <>
        <Button onClick={handleClose}>Disagree</Button>
        <Button onClick={handleClose} autoFocus>
          Agree
        </Button>
      </>}

    </DialogActions>
  </Dialog>
};

export default GameDialog;
