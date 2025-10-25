import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useEffect } from 'react';

export default function CancelCampaignDialog({
    open,
    campaign,
    onConfirm,
    onClose,               // <-- faqat tashqaridan chaqiriladi
}) {
    // 1. open boʻlsa lekin campaign yoʻq → dialogni yopamiz,
    //     lekin buni render ichida emas, useEffect orqali qilamiz
    useEffect(() => {
        if (open && !campaign) {
            // render tugagandan keyin yopamiz → React qoidasiga mos
            onClose();
        }
    }, [open, campaign, onClose]);

    // 2. Agar hali open boʻlmasa yoki campaign null boʻlsa – hech narsa koʻrsatmaymiz
    if (!open || !campaign) return null;

    const handleConfirm = () => {
        onConfirm(campaign.id);
        onClose();               // dialog yopiladi
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>Kampaniyani bekor qilish</DialogTitle>

                <DialogContent dividers>
                    <Typography gutterBottom>
                        <strong>{campaign.promoCode || 'GENERAL'}</strong> kampaniyasini bekor
                        qilmoqchimisiz?
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>Bekor</Button>
                    <Button onClick={handleConfirm} color="error" variant="contained">
                        Bekor qilish
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}