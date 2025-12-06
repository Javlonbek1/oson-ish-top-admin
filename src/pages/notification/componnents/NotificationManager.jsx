// NotificationManager.jsx
import { useState, useEffect, useCallback } from 'react';

const DEFAULT_FORM_STATE = {
    titleUz: '',
    titleRu: '',
    titleEn: '',
    descriptionUz: '',
    descriptionRu: '',
    descriptionEn: '',
    status: 'NEWS',
};

const DEFAULT_PAGE_INFO = {
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: false,
};

export default function NotificationManager({ baseUrl = '', axiosInstance }) {
    const API_BASE_URL = baseUrl;
    const ax = axiosInstance || (typeof window !== 'undefined' && window.axios);

    const [activeTab, setActiveTab] = useState('list');

    // Form state
    const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
    const [formLoading, setFormLoading] = useState(false);
    const [formMessage, setFormMessage] = useState({ type: '', text: '' });

    // List state
    const [notifications, setNotifications] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState('');
    const [pageInfo, setPageInfo] = useState(DEFAULT_PAGE_INFO);

    // --- LIST FETCH (GET /all) ---
    const fetchNotifications = useCallback(
        async (page = 0, size = 10) => {
            if (!ax) {
                setListError('Axios instance topilmadi');
                return;
            }

            setListLoading(true);
            setListError('');

            try {
                const params = { page, size };
                const res = await ax.get(`${API_BASE_URL}/all`, { params });

                if (res.status !== 200) {
                    throw new Error(`API failed: HTTP ${res.status}`);
                }

                const result = res.data;

                if (result.success && result.data) {
                    setNotifications(result.data.content || []);
                    setPageInfo({
                        totalElements: result.data.totalElements || 0,
                        totalPages: result.data.totalPages || 0,
                        size: result.data.size || size,
                        number: result.data.number || page,
                        first: result.data.first ?? page === 0,
                        last: result.data.last ?? false,
                    });
                } else {
                    setNotifications([]);
                    setPageInfo(DEFAULT_PAGE_INFO);
                    setListError(result.message || 'Failed to load notifications');
                }
            } catch (err) {
                console.error('Notification list error:', err);
                setNotifications([]);
                setPageInfo(DEFAULT_PAGE_INFO);
                setListError('Network error: ' + (err?.message || 'Unknown error'));
            } finally {
                setListLoading(false);
            }
        },
        [API_BASE_URL, ax]
    );

    useEffect(() => {
        if (activeTab === 'list') {
            fetchNotifications(0, pageInfo.size);
        }
    }, [activeTab, fetchNotifications, pageInfo.size]);

    // --- FORM HANDLERS ---
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const errors = [];

        if (!formData.titleUz.trim()) errors.push('Title (Uz) is required');
        if (!formData.titleRu.trim()) errors.push('Title (Ru) is required');
        if (!formData.titleEn.trim()) errors.push('Title (En) is required');
        if (!formData.descriptionUz.trim()) errors.push('Description (Uz) is required');
        if (!formData.descriptionRu.trim()) errors.push('Description (Ru) is required');
        if (!formData.descriptionEn.trim()) errors.push('Description (En) is required');
        if (!formData.status) errors.push('Status is required');

        if (errors.length > 0) {
            setFormMessage({ type: 'error', text: errors.join(', ') });
            return false;
        }
        return true;
    };

    // --- FORM SUBMIT (POST /send) ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!ax) {
            setFormMessage({ type: 'error', text: 'Axios instance topilmadi' });
            return;
        }

        setFormMessage({ type: '', text: '' });

        if (!validateForm()) {
            return;
        }

        setFormLoading(true);

        const payload = {
            titleUz: formData.titleUz.trim(),
            titleRu: formData.titleRu.trim(),
            titleEn: formData.titleEn.trim(),
            descriptionUz: formData.descriptionUz.trim(),
            descriptionRu: formData.descriptionRu.trim(),
            descriptionEn: formData.descriptionEn.trim(),
            status: formData.status,
        };

        if (formData.usersId.trim()) {
            payload.usersId = formData.usersId.trim();
        }

        if (formData.groupsId.trim()) {
            payload.groupsId = parseInt(formData.groupsId.trim(), 10);
        }

        try {
            const res = await ax.post(`${API_BASE_URL}/send`, payload);
            const data = res.data;

            if (res.status === 200 && data.success) {
                setFormMessage({
                    type: 'success',
                    text: data.message || 'Notification sent successfully!',
                });
                setFormData(DEFAULT_FORM_STATE);

                // xohlasang, yuborgandan keyin ro‘yxatni yangilash:
                if (activeTab === 'list') {
                    fetchNotifications(pageInfo.number, pageInfo.size);
                }
            } else {
                setFormMessage({
                    type: 'error',
                    text: data.message || 'Failed to send notification',
                });
            }
        } catch (error) {
            console.error('Send notification error:', error);
            setFormMessage({
                type: 'error',
                text: 'Network error: ' + (error?.message || 'Unknown error'),
            });
        } finally {
            setFormLoading(false);
        }
    };

    // --- PAGINATION ---
    const handleNextPage = () => {
        if (!pageInfo.last) {
            fetchNotifications(pageInfo.number + 1, pageInfo.size);
        }
    };

    const handlePrevPage = () => {
        if (!pageInfo.first) {
            fetchNotifications(pageInfo.number - 1, pageInfo.size);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
            <h1>Notification Management</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #dee2e6' }}>
                <button
                    onClick={() => setActiveTab('list')}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: activeTab === 'list' ? '#007bff' : '#666',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'list' ? '3px solid #007bff' : '3px solid transparent',
                        cursor: 'pointer',
                        marginBottom: '-2px'
                    }}
                >
                    Notifications List
                </button>
                <button
                    onClick={() => setActiveTab('create')}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: activeTab === 'create' ? '#007bff' : '#666',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'create' ? '3px solid #007bff' : '3px solid transparent',
                        cursor: 'pointer',
                        marginBottom: '-2px'
                    }}
                >
                    Create Notification
                </button>
            </div>

            {/* List Tab */}
            {activeTab === 'list' && (
                <div>
                    {listError && (
                        <div style={{
                            padding: '12px',
                            marginBottom: '20px',
                            borderRadius: '4px',
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            border: '1px solid #f5c6cb'
                        }}>
                            {listError}
                        </div>
                    )}

                    {listLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
                            Loading...
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '20px', color: '#666' }}>
                                Total: {pageInfo.totalElements} notifications | Page {pageInfo.number + 1} of {pageInfo.totalPages}
                            </div>

                            {notifications.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                    No notifications found
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        backgroundColor: '#fff',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Title (Uz)</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Description (Uz)</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Created Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {notifications.map((notification, index) => (
                                                <tr
                                                    key={notification.id || index}
                                                    style={{
                                                        borderBottom: '1px solid #dee2e6',
                                                        backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa'
                                                    }}
                                                >
                                                    <td style={{ padding: '12px' }}>{notification.titleUz || 'N/A'}</td>
                                                    <td style={{ padding: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {notification.descriptionUz || 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            backgroundColor: notification.status === 'PAYMENTS' ? '#d1ecf1' :
                                                                notification.status === 'OPERATIONS' ? '#fff3cd' : '#d4edda',
                                                            color: notification.status === 'PAYMENTS' ? '#0c5460' :
                                                                notification.status === 'OPERATIONS' ? '#856404' : '#155724'
                                                        }}>
                                                            {notification.status || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                                                        {formatDate(notification.createdDate)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                <button
                                    onClick={handlePrevPage}
                                    disabled={pageInfo.first || listLoading}
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        backgroundColor: pageInfo.first || listLoading ? '#6c757d' : '#007bff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: pageInfo.first || listLoading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={handleNextPage}
                                    disabled={pageInfo.last || listLoading}
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        backgroundColor: pageInfo.last || listLoading ? '#6c757d' : '#007bff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: pageInfo.last || listLoading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Create Tab */}
            {activeTab === 'create' && (
                <div>
                    {formMessage.text && (
                        <div style={{
                            padding: '12px',
                            marginBottom: '20px',
                            borderRadius: '4px',
                            backgroundColor: formMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                            color: formMessage.type === 'success' ? '#155724' : '#721c24',
                            border: `1px solid ${formMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                        }}>
                            {formMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Title (Uz) *
                            </label>
                            <input
                                type="text"
                                name="titleUz"
                                value={formData.titleUz}
                                onChange={handleFormChange}
                                style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
                                disabled={formLoading}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Title (Ru) *
                            </label>
                            <input
                                type="text"
                                name="titleRu"
                                value={formData.titleRu}
                                onChange={handleFormChange}
                                style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
                                disabled={formLoading}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Title (En) *
                            </label>
                            <input
                                type="text"
                                name="titleEn"
                                value={formData.titleEn}
                                onChange={handleFormChange}
                                style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
                                disabled={formLoading}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Description (Uz) *
                            </label>
                            <textarea
                                name="descriptionUz"
                                value={formData.descriptionUz}
                                onChange={handleFormChange}
                                rows="3"
                                style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                                disabled={formLoading}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Description (Ru) *
                            </label>
                            <textarea
                                name="descriptionRu"
                                value={formData.descriptionRu}
                                onChange={handleFormChange}
                                rows="3"
                                style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                                disabled={formLoading}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Description (En) *
                            </label>
                            <textarea
                                name="descriptionEn"
                                value={formData.descriptionEn}
                                onChange={handleFormChange}
                                rows="3"
                                style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                                disabled={formLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={formLoading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#fff',
                                backgroundColor: formLoading ? '#6c757d' : '#007bff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: formLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {formLoading ? 'Sending...' : 'Send Notification'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}