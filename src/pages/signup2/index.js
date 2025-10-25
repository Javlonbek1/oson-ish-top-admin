/// app.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignupBonusAdminPage from './pages/SignupBonusAdminPage';
import SignupBonusDetail from './components/signup-bonus/SignupBonusDetail';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/admin/signup-bonus" element={<SignupBonusAdminPage />} />
                    <Route path="/admin/signup-bonus/:id" element={<SignupBonusDetail />} />
                </Routes>
                <ToastContainer position="top-right" />
            </BrowserRouter>
        </QueryClientProvider>
    );
}