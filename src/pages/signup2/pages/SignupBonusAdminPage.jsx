import { Tabs, Tab, Box } from '@mui/material';
import { useState } from 'react';
import SignupBonusList from '../components/signup-bonus/SignupBonusList';
import CreateGeneralForm from '../components/signup-bonus/CreateGeneralForm';
import CreatePromoForm from '../components/signup-bonus/CreatePromoForm';

export default function SignupBonusAdminPage() {
    const [tab, setTab] = useState(0);

    return (
        <Box sx={{ p: 3 }}>
            <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label="Ro‘yxat" />
                <Tab label="Yangi GENERAL" />
                <Tab label="Yangi PROMO" />
            </Tabs>

            {tab === 0 && <SignupBonusList />}
            {tab === 1 && <CreateGeneralForm onSuccess={() => setTab(0)} />}
            {tab === 2 && <CreatePromoForm onSuccess={() => setTab(0)} />}
        </Box>
    );
}