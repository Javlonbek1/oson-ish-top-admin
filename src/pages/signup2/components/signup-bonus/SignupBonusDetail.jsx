import { useParams, useNavigate } from 'react-router-dom';
import { Paper, Typography, Button, Box, CircularProgress } from '@mui/material';
import { useSignupBonus } from '../../hooks/useSignupBonus';
import { formatAmount, formatDate, formatDateTime } from '../../utils/format';
import CancelCampaignDialog from './CancelCampaignDialog';
import { useState } from 'react';

export default function SignupBonusDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cancelOpen, setCancelOpen] = useState(false);
    const { detailQuery, cancel } = useSignupBonus();
    const { data: data, isLoading } = detailQuery(id);
    console.log(data);
    
    const campaign = data?.data;

    if (isLoading) return <CircularProgress />;

    if (!campaign) return <Typography>Kampaniya topilmadi</Typography>;

    console.log(campaign);
    

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>{campaign.promoCode || 'GENERAL'} #{campaign.id}</Typography>
            <Button variant="outlined" onClick={() => navigate(-1)} style={{ marginBottom: 15 }}>  {/* <-- Yangi "Orqaga" tugmasi */}
                Orqaga
            </Button>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Typography><strong>Status:</strong> {campaign.status}</Typography>
                <Typography><strong>Promo kod:</strong> {campaign.promoCode || '-'}</Typography>
                <Typography><strong>Miqdor:</strong> {formatAmount(campaign.amountMinor)}</Typography>
                <Typography><strong>Faol:</strong> {campaign.isActive ? 'Ha' : 'Yo‘q'}</Typography>
                <Typography><strong>Boshlanish:</strong> {formatDate(campaign.startDate)}</Typography>
                <Typography><strong>Tugash:</strong> {campaign.endDate ? formatDate(campaign.endDate) : '-'}</Typography>
                <Typography><strong>Yaratilgan:</strong> {formatDateTime(campaign.createdDate)}</Typography>
                <Typography><strong>Bekor qilingan:</strong> {campaign.canceledDate ? formatDate(campaign.canceledDate) : '-'}</Typography>
            </Box>

            {campaign.isActive && (
                <Button variant="contained" color="error" sx={{ mt: 3 }} onClick={() => setCancelOpen(true)}>
                    Bekor qilish
                </Button>
            )}

            <CancelCampaignDialog
                open={cancelOpen}
                campaign={campaign}
                onConfirm={(data) => cancel.mutate(data, { onSuccess: () => setCancelOpen(false) })}
                onClose={() => setCancelOpen(false)}
            />
        </Paper>
    );
}