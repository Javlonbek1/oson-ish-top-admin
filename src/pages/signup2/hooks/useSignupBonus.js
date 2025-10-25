import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signupBonusApi } from '../../../api/signupBonusApi';
import { toast } from 'react-toastify';

export const useSignupBonus = () => {
    const queryClient = useQueryClient();

    const listQuery = (filters) =>
        useQuery({
            queryKey: ['signup-bonus', filters],
            queryFn: () => signupBonusApi.list(filters),
            keepPreviousData: true,
        });

    const detailQuery = (id) =>
        useQuery({
            queryKey: ['signup-bonus', id],
            queryFn: () => signupBonusApi.get(id),
            enabled: !!id,
        });

    const createGeneral = useMutation({
        mutationFn: (data) =>
            signupBonusApi.createGeneral(data), // endi {amountSom, endDate}
        onSuccess: () => {
            toast.success('Yangi GENERAL yaratildi');
            queryClient.invalidateQueries(['signup-bonus']);
        },
        onError: (err) => toast.error(err.response?.data?.error || 'Xatolik'),
    });

    const createPromo = useMutation({
        mutationFn: signupBonusApi.createPromo,
        onSuccess: () => {
            toast.success('PROMO yaratildi');
            queryClient.invalidateQueries(['signup-bonus']);
        },
        onError: (err) => toast.error(err.response?.data?.error || 'Xatolik'),
    });

    const cancel = useMutation({
        mutationFn: (campaignId) => signupBonusApi.cancel(campaignId),  // <-- faqat ID
        onSuccess: () => {
            toast.success('Kampaniya bekor qilindi');
            queryClient.invalidateQueries({ queryKey: ['signup-bonus'] });
            queryClient.invalidateQueries({ queryKey: ['signup-bonus-detail'] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
        },
    });

    return { listQuery, detailQuery, createGeneral, createPromo, cancel };
};