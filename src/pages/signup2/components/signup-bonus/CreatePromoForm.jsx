import { TextField, Button, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useSignupBonus } from '../../hooks/useSignupBonus';

export default function CreatePromoForm({ onSuccess }) {
    const { createPromo } = useSignupBonus();
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

    const endDate = watch('endDate');

    const onSubmit = (data) => {
        // ✅ Params format – startDate yo'q
        const params = {
            promoCode: data.promoCode.toUpperCase(),
            amountSom: Number(data.amountSom),  // <-- amountMinor → amountSom
            endDate: data.endDate ? dayjs(data.endDate).format('YYYY-MM-DD') : undefined,
        };
        createPromo.mutate(params, { onSuccess });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
                <TextField
                    label="Promo kod"
                    fullWidth
                    margin="normal"
                    {...register('promoCode', { required: true })}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                    error={!!errors.promoCode}
                    helperText={errors.promoCode && 'Promo kod kiritilishi shart'}
                />

                <TextField
                    label="Miqdor (minor)"
                    fullWidth
                    margin="normal"
                    type="number"
                    {...register('amountSom', { required: true, min: 1 })}  // <-- amountMinor → amountSom
                    error={!!errors.amountSom}
                />

                {/* ✅ startDate olib tashlandi */}

                <DatePicker
                    label="Tugash (ixtiyoriy)"
                    value={endDate ? dayjs(endDate) : null}
                    onChange={(v) => setValue('endDate', v)}
                    format="YYYY-MM-DD"
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                />

                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                    PROMO yaratish
                </Button>
            </Box>
        </LocalizationProvider>
    );
}