import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

export default function ConfirmDialog({ open, title, children, onConfirm, onCancel }) {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{children}</DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Bekor qilish</Button>
                <Button onClick={onConfirm} variant="contained" color="primary">
                    Tasdiqlash
                </Button>
            </DialogActions>
        </Dialog>
    );
}