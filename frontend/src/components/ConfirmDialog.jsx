// ConfirmDialog.jsx
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

const ConfirmDialog = ({
    open,
    title = "Xác nhận",
    content = "Bạn có chắc chắn muốn thực hiện hành động này?",
    onOk,
    onCancel,
    okText = "Đồng ý",
    cancelText = "Hủy",
    okButtonProps = {},
    cancelButtonProps = {},
}) => (
    <Dialog open={open} onClose={onCancel} aria-labelledby="confirm-dialog-title">
        <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
        <DialogContent>
            <DialogContentText>{content}</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel} color="primary" {...cancelButtonProps}>
                {cancelText}
            </Button>
            <Button onClick={onOk} color="error" variant="contained" {...okButtonProps}>
                {okText}
            </Button>
        </DialogActions>
    </Dialog>
);

export default ConfirmDialog;

