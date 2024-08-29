import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const ServerSettingDialog = ({ open, onClose, message }) => {
  const server_url = process.env.REACT_APP_SERVER_URL;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="md"
    >
      <DialogTitle id="alert-dialog-title">Error</DialogTitle>
      <DialogContent>
        {message === "Instruction" ? (
          <DialogContentText id="alert-dialog-description">
            <p>
              <a href={server_url} target="_blank" rel="noreferrer">
                링크
              </a>
              를 따라 들어간 후 아래 이미지와 같이 설정을 완료해주세요. 설정 이후에도 문제가 발생할
              경우 관리자에게 문의해주세요.
            </p>
            <img src="/imgs/instruction.png" alt="instruction" style={{ width: "100%" }} />
          </DialogContentText>
        ) : (
          <DialogContentText id="alert-dialog-description">{message}</DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServerSettingDialog;
