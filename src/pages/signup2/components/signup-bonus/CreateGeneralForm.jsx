import { useState } from 'react';
import {
    TextField, Button, Box, Alert, Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ConfirmDialog from '../common/ConfirmDialog';
import { useSignupBonus } from '../../hooks/useSignupBonus';

export default function CreateGeneralForm({ onSuccess }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [formData, setFormData] = useState(null);
    const { createGeneral } = useSignupBonus();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm();

    const endDate = watch('endDate');

    // 1. Form submit → confirm dialog
    const onSubmit = (data) => {
        setFormData(data);
        setConfirmOpen(true);
    };

    // 2. Confirm → API chaqirish
    const handleConfirm = () => {
        if (!formData) return;

        // backend‑ga mos payload
        const payload = {
            amountSom: Number(formData.amountSom),               // so‘m (major)
            endDate: formData.endDate
                ? dayjs(formData.endDate).format('YYYY-MM-DD')
                : null,
        };

        createGeneral.mutate(payload, {
            onSuccess: () => {
                onSuccess?.();
                reset();
                setFormData(null);
            },
        });

        setConfirmOpen(false);
    };

    const handleCancel = () => {
        setConfirmOpen(false);
        setFormData(null);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        Yangi GENERAL yaratilganda, barcha faol GENERAL kampaniyalar avtomatik deaktivatsiya qilinadi.
                    </Typography>
                </Alert>

                {/* amountSom – so‘m (major) */}
                <TextField
                    label="Miqdor (so‘m)"
                    fullWidth
                    margin="normal"
                    type="number"
                    inputProps={{ min: 1 }}
                    {...register('amountSom', {
                        required: 'Miqdor kiritilishi shart',
                        min: { value: 1, message: 'Miqdor 1 dan kichik bo‘lmasligi kerak' },
                    })}
                    error={!!errors.amountSom}
                    helperText={errors.amountSom?.message}
                />

                {/* endDate – ixtiyoriy */}
                <DatePicker
                    label="Tugash sanasi (ixtiyoriy)"
                    value={endDate ? dayjs(endDate) : null}
                    onChange={(date) => setValue('endDate', date)}
                    format="YYYY-MM-DD"
                    slotProps={{
                        textField: { fullWidth: true, margin: 'normal' },
                    }}
                />

                <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
                    Yaratish
                </Button>
            </Box>

            {/* Confirm dialog */}
            <ConfirmDialog
                open={confirmOpen}
                title="Tasdiqlash"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            >
                <Typography>
                    Yangi GENERAL yaratilsaham, eski faol GENERAL kampaniyalar deaktivatsiya qilinadi. Davom etilsinmi?
                </Typography>
            </ConfirmDialog>
        </LocalizationProvider>
    );
}