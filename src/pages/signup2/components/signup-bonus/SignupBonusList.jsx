import { useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Paper, TextField, FormControl,
    InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Button, Box, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSignupBonus } from '../../hooks/useSignupBonus';
import { formatAmount, formatDate } from '../../utils/format';
import CancelCampaignDialog from './CancelCampaignDialog';
import debounce from 'lodash/debounce';

export default function SignupBonusList() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({});
    const [cancelDialog, setCancelDialog] = useState({ open: false, campaign: null });

    const { listQuery, cancel } = useSignupBonus();
    const { data, isLoading } = listQuery(filters);

    const debouncedSetFilter = debounce((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    }, 300);

    const handleFilterChange = (key, value) => {
        if (value === '' || value === false || value === null) {
            debouncedSetFilter(key, undefined);
        } else {
            debouncedSetFilter(key, value);
        }
    };

    const openCancel = (campaign) => {
        if (!campaign) {
            console.warn('Kampaniya maʼlumoti yoʻq – bekor qilish bekor qilindi');
            return;
        }
        setCancelDialog({ open: true, campaign });
    };
    const closeCancel = () => setCancelDialog({ open: false, campaign: null });

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select onChange={(e) => handleFilterChange('status', e.target.value)} label="Status">
                        <MenuItem value="">Barchasi</MenuItem>
                        <MenuItem value="GENERAL">GENERAL</MenuItem>
                        <MenuItem value="PROMO">PROMO</MenuItem>
                    </Select>
                </FormControl>

                <TextField label="Promo kod" onChange={(e) => handleFilterChange('promoCode', e.target.value)} />

                <FormControlLabel
                    control={<Checkbox onChange={(e) => handleFilterChange('active', e.target.checked)} />}
                    label="Faol"
                />
                <FormControlLabel
                    control={<Checkbox onChange={(e) => handleFilterChange('cancelled', e.target.checked)} />}
                    label="Bekor qilingan"
                />
                <FormControlLabel
                    control={<Checkbox onChange={(e) => handleFilterChange('onlyCurrentlyValid', e.target.checked)} />}
                    label="Hozirgi faol"
                />
            </Box>

            {isLoading ? (
                <Box display="flex" justifyContent="center"><CircularProgress /></Box>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Promo</TableCell>
                            <TableCell>Miqdor</TableCell>
                            <TableCell>Faol</TableCell>
                            <TableCell>Boshlanish</TableCell>
                            <TableCell>Tugash</TableCell>
                            <TableCell>Yaratilgan</TableCell>
                            <TableCell>Harakatlar</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.data?.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell>{c.id}</TableCell>
                                <TableCell>{c.status}</TableCell>
                                <TableCell>{c.promoCode || '-'}</TableCell>
                                <TableCell>{formatAmount(c.amountMinor)}</TableCell>
                                <TableCell>{c.isActive ? 'Ha' : 'Yo‘q'}</TableCell>
                                <TableCell>{formatDate(c.startDate)}</TableCell>
                                <TableCell>{c.endDate ? formatDate(c.endDate) : '-'}</TableCell>
                                <TableCell>{formatDate(c.createdDate)}</TableCell>
                                <TableCell>
                                    <Button size="small" onClick={() => navigate(`/admin/signup-bonus/${c.id}`)}>Ko‘rish</Button>
                                    {c.isActive && (
                                        <Button size="small" color="error" onClick={() => openCancel(c)}>Bekor</Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <CancelCampaignDialog
                open={cancelDialog.open}
                campaign={cancelDialog.campaign}
                onConfirm={(data) => cancel.mutate(data)}
                onClose={closeCancel}
            />
        </Paper>
    );
}