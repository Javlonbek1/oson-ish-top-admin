import React, { useState, useEffect, useCallback } from 'react';

const BASE_URL = 'http://localhost:8080';
const PAGE_SIZE = 10;

// Helper to check if a string is a valid UUID format (basic check)
const isValidUuid = (str) => {
    if (!str) return true; // Optional field is valid if empty
    // Simple UUID pattern check (8-4-4-4-12 hex digits)
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

// Helper to truncate long text
const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const NotificationPage = ({ baseUrl = '', axiosInstance }) => {
    const API_BASE_URL = baseUrl;
    const ax = axiosInstance || window.axios;

    // --- State for Create Notification Form ---
    const initialFormState = {
        titleUz: '',
        titleRu: '',
        titleEn: '',
        descriptionUz: '',
        descriptionRu: '',
        descriptionEn: '',
        usersId: '', // Optional UUID
        groupsId: '', // Optional number (integer)
        status: 'PAYMENTS', // Default to first enum value
    };
    const [formData, setFormData] = useState(initialFormState);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [isSending, setIsSending] = useState(false);

    // --- State for Notifications List ---
    const [notifications, setNotifications] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState('');
    const [currentPage, setCurrentPage] = useState(0); // 0-based index
    const [totalPages, setTotalPages] = useState(0);

    // Enum values for the Status select
    const statusOptions = [
        { value: 'PAYMENTS', label: 'Payments' },
        { value: 'OPERATIONS', label: 'Operations' },
        { value: 'NEWS', label: 'News' },
    ];

    // Validation function
    const validateForm = () => {
        const requiredFields = [
            'titleUz', 'titleRu', 'titleEn',
            'descriptionUz', 'descriptionRu', 'descriptionEn',
            'status',
        ];

        for (const field of requiredFields) {
            if (!formData[field].trim()) {
                return `Required field is missing or empty: ${field}`;
            }
        }

        if (formData.usersId && !isValidUuid(formData.usersId)) {
            return 'User ID must be a valid UUID format or empty.';
        }

        if (formData.groupsId && isNaN(parseInt(formData.groupsId))) {
            return 'Group ID must be a number or empty.';
        }

        return ''; // No error
    };

    // Handle input changes for the form
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear status/error messages on change
        setFormError('');
        setFormSuccess('');
    };

    // Fetch notifications function (memoized to avoid dependency loop in useEffect)
    const fetchNotifications = useCallback(
        async (page) => {
            if (!ax) {
                setListError('Axios instance topilmadi');
                return;
            }

            setListLoading(true);
            setListError('');

            try {
                const params = {
                    page: page,
                    size: PAGE_SIZE,
                };

                const res = await ax.get(`${API_BASE_URL}/all`, { params });

                if (res.status !== 200) {
                    throw new Error(`HTTP error: ${res.status}`);
                }

                const result = res.data;

                if (result.success && result.data) {
                    setNotifications(result.data.content || []);
                    setTotalPages(result.data.totalPages || 0);
                    setCurrentPage(result.data.number || 0);
                } else {
                    setNotifications([]);
                    setTotalPages(0);
                    setListError(result.message || 'Failed to fetch notifications data.');
                }
            } catch (error) {
                console.error('Axios fetch error:', error);
                setListError('Error fetching notifications: ' + (error?.message || 'Unknown error'));
                setNotifications([]);
                setTotalPages(0);
            } finally {
                setListLoading(false);
            }
        },
        [ax, API_BASE_URL, PAGE_SIZE]
    );


    // Initial load and whenever the current page changes
    useEffect(() => {
        fetchNotifications(currentPage);
    }, [currentPage, fetchNotifications]); // Re-run when currentPage changes or on mount

    // Handle form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        const validationMessage = validateForm();
        if (validationMessage) {
            setFormError(validationMessage);
            return;
        }

        setIsSending(true);

        // Prepare payload, converting optional fields to null if empty
        const payload = {
            ...formData,
            usersId: formData.usersId.trim() || null,
            // groupsId should be an integer or null
            groupsId: formData.groupsId.trim() ? parseInt(formData.groupsId) : null,
            // Ensure all required fields are trimmed before sending
            titleUz: formData.titleUz.trim(),
            titleRu: formData.titleRu.trim(),
            titleEn: formData.titleEn.trim(),
            descriptionUz: formData.descriptionUz.trim(),
            descriptionRu: formData.descriptionRu.trim(),
            descriptionEn: formData.descriptionEn.trim(),
        };

        try {
            const response = await fetch(`${BASE_URL}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setFormSuccess(result.message || 'Notification sent successfully!');
                setFormData(initialFormState); // Reset form
                // Reload the list (refetch the first page)
                if (currentPage === 0) {
                    fetchNotifications(0);
                } else {
                    setCurrentPage(0); // Triggers useEffect to fetch page 0
                }
            } else {
                // Handle non-200 responses or success: false
                const errorMsg = result.message || `Failed to send notification. HTTP Status: ${response.status}`;
                setFormError(errorMsg);
            }
        } catch (error) {
            console.error('Send error:', error);
            setFormError(`Network error or request failed: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };

    // Handle pagination control
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="notification-page">
            {/* 🚀 Create Notification Form (Top Section) 🚀 */}
            <section>
                <h2>Create / Send Notification</h2>
                <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '10px', maxWidth: '600px', margin: '0 auto', border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>

                    {/* Title Inputs */}
                    <div><label>Title (Uz)*: <input type="text" name="titleUz" value={formData.titleUz} onChange={handleFormChange} disabled={isSending} required /></label></div>
                    <div><label>Title (Ru)*: <input type="text" name="titleRu" value={formData.titleRu} onChange={handleFormChange} disabled={isSending} required /></label></div>
                    <div><label>Title (En)*: <input type="text" name="titleEn" value={formData.titleEn} onChange={handleFormChange} disabled={isSending} required /></label></div>

                    {/* Description Inputs */}
                    <div><label>Description (Uz)*: <textarea name="descriptionUz" value={formData.descriptionUz} onChange={handleFormChange} disabled={isSending} required /></label></div>
                    <div><label>Description (Ru)*: <textarea name="descriptionRu" value={formData.descriptionRu} onChange={handleFormChange} disabled={isSending} required /></label></div>
                    <div><label>Description (En)*: <textarea name="descriptionEn" value={formData.descriptionEn} onChange={handleFormChange} disabled={isSending} required /></label></div>

                    {/* Optional Targeting */}
                    <div><label>User ID (optional, UUID): <input type="text" name="usersId" value={formData.usersId} onChange={handleFormChange} disabled={isSending} /></label></div>
                    <div><label>Group ID (optional, number): <input type="number" name="groupsId" value={formData.groupsId} onChange={handleFormChange} disabled={isSending} /></label></div>

                    {/* Status Select */}
                    <div>
                        <label>Status*:
                            <select name="status" value={formData.status} onChange={handleFormChange} disabled={isSending} required>
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Submit Button and Messages */}
                    <div style={{ marginTop: '10px' }}>
                        <button type="submit" disabled={isSending}>
                            {isSending ? 'Sending...' : 'Send Notification'}
                        </button>
                        {formError && <p style={{ color: 'red', margin: '5px 0' }}>Error: {formError}</p>}
                        {formSuccess && <p style={{ color: 'green', margin: '5px 0' }}>Success: {formSuccess}</p>}
                    </div>
                </form>
            </section>

            <hr style={{ margin: '30px 0' }} />

            {/* 📜 Notifications List (Bottom Section) 📜 */}
            <section>
                <h2>Notifications List</h2>

                {listLoading && <p>Loading notifications...</p>}
                {listError && <p style={{ color: 'red' }}>Error loading list: {listError}</p>}
                {!listLoading && !listError && notifications.length === 0 && <p>No notifications found.</p>}

                {!listLoading && notifications.length > 0 && (
                    <>
                        {/* Notifications Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                            <thead>
                                <tr style={{ background: '#f2f2f2' }}>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Title (Uz)</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description (Uz)</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notifications.map(notif => (
                                    <tr key={notif.id}>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{notif.titleUz}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{notif.status}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{truncateText(notif.descriptionUz, 50)}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                            {notif.createdDate ? new Date(notif.createdDate).toLocaleString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0 || listLoading}
                                style={{ marginRight: '10px' }}
                            >
                                Previous
                            </button>
                            <span style={{ margin: '0 10px' }}>
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1 || listLoading}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default NotificationPage;