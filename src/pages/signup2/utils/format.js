import dayjs from 'dayjs';

export const formatAmount = (minor) => {
    const sum = minor;
    return new Intl.NumberFormat('uz-UZ').format(sum) + ' so‘m';
};

export const formatDate = (date) => {
    return dayjs(date).format('DD.MM.YYYY');
};

export const formatDateTime = (date) => {
    return dayjs(date).format('DD.MM.YYYY HH:mm');
};