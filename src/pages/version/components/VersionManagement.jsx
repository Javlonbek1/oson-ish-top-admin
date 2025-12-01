import React, { useState, useEffect } from 'react';

const VersionManagement = ({ baseUrl = '', axiosInstance }) => {
    const API_BASE_URL = baseUrl;
    const ax = axiosInstance || (typeof window !== "undefined" && window.axios);

    // State for versions list
    const [versions, setVersions] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        titleUz: '',
        titleEn: '',
        titleRu: '',
        descriptionUz: '',
        descriptionEn: '',
        descriptionRu: '',
        andiroidVersion: '',
        andiroidIsUpdate: false,
        iosVersion: '',
        iosIsUpdate: false
    });

    // Load versions on mount and when page changes
    useEffect(() => {
        loadVersions(page);
    }, [page]);

    // Fetch versions list
    const loadVersions = async (currentPage) => {
        if (!ax) {
            setError('Axios instance topilmadi');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = {
                page: currentPage,
                size: size
            };

            const res = await ax.get(`${API_BASE_URL}/version`, { params });

            if (res.status !== 200) throw new Error(`API failed: HTTP ${res.status}`);

            const result = res.data;

            if (result.success && result.data) {
                setVersions(result.data.content || []);
                setTotalPages(result.data.totalPages || 0);
            } else {
                setError(result.message || 'Failed to load versions');
            }
        } catch (err) {
            console.error('Version list error:', err);
            setError('Network error: ' + (err?.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submission
    const handleCreateVersion = async (e) => {
        e.preventDefault();
        if (!ax) {
            setError('Axios instance topilmadi');
            return;
        }

        if (!formData.titleUz.trim()) {
            alert('Title (Uz) is required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await ax.post(`${API_BASE_URL}/version`, formData);

            if (res.status !== 200 && res.status !== 201) throw new Error(`API failed: HTTP ${res.status}`);

            const result = res.data;

            if (result.success) {
                alert('Version created successfully');
                // Reset form
                setFormData({
                    titleUz: '',
                    titleEn: '',
                    titleRu: '',
                    descriptionUz: '',
                    descriptionEn: '',
                    descriptionRu: '',
                    andiroidVersion: '',
                    andiroidIsUpdate: false,
                    iosVersion: '',
                    iosIsUpdate: false
                });
                // Reset to first page and reload
                setPage(0);
                loadVersions(0);
            } else {
                setError(result.message || 'Failed to create version');
            }
        } catch (err) {
            console.error('Create version error:', err);
            setError('Network error: ' + (err?.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    // Format date to readable string
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // Pagination handlers
    const handlePrevPage = () => {
        if (page > 0) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page + 1 < totalPages) setPage(page + 1);
    };

    const handleFirstPage = () => {
        setPage(0);
    };

    const handleLastPage = () => {
        if (totalPages > 0) setPage(totalPages - 1);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                Version Management
            </h1>

            {/* Error Display */}
            {error && (
                <div style={{
                    padding: '12px',
                    marginBottom: '20px',
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '4px',
                    color: '#c00'
                }}>
                    {error}
                </div>
            )}

            {/* Create Version Form */}
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '30px'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Add New Version
                </h2>

                <form onSubmit={handleCreateVersion}>
                    {/* Title Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                                Title (Uz) <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="titleUz"
                                value={formData.titleUz}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                                Title (En)
                            </label>
                            <input
                                type="text"
                                name="titleEn"
                                value={formData.titleEn}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                                Title (Ru)
                            </label>
                            <input
                                type="text"
                                name="titleRu"
                                value={formData.titleRu}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Description Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                                Description (Uz)
                            </label>
                            <textarea
                                name="descriptionUz"
                                value={formData.descriptionUz}
                                onChange={handleInputChange}
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                                Description (En)
                            </label>
                            <textarea
                                name="descriptionEn"
                                value={formData.descriptionEn}
                                onChange={handleInputChange}
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                                Description (Ru)
                            </label>
                            <textarea
                                name="descriptionRu"
                                value={formData.descriptionRu}
                                onChange={handleInputChange}
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>

                    {/* Android and iOS Version Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        {/* Android Section */}
                        <div style={{ border: '1px solid #e0e0e0', padding: '12px', borderRadius: '4px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Android</h3>
                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                                    Version
                                </label>
                                <input
                                    type="text"
                                    name="andiroidVersion"
                                    value={formData.andiroidVersion}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 1.0.0"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    name="andiroidIsUpdate"
                                    checked={formData.andiroidIsUpdate}
                                    onChange={handleInputChange}
                                    id="andiroidIsUpdate"
                                    style={{ marginRight: '8px', width: '16px', height: '16px' }}
                                />
                                <label htmlFor="andiroidIsUpdate" style={{ fontSize: '14px', cursor: 'pointer' }}>
                                    Force Update
                                </label>
                            </div>
                        </div>

                        {/* iOS Section */}
                        <div style={{ border: '1px solid #e0e0e0', padding: '12px', borderRadius: '4px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>iOS</h3>
                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                                    Version
                                </label>
                                <input
                                    type="text"
                                    name="iosVersion"
                                    value={formData.iosVersion}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 1.0.0"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    name="iosIsUpdate"
                                    checked={formData.iosIsUpdate}
                                    onChange={handleInputChange}
                                    id="iosIsUpdate"
                                    style={{ marginRight: '8px', width: '16px', height: '16px' }}
                                />
                                <label htmlFor="iosIsUpdate" style={{ fontSize: '14px', cursor: 'pointer' }}>
                                    Force Update
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: isLoading ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'Creating...' : 'Create Version'}
                    </button>
                </form>
            </div>

            {/* Version List */}
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Version List
                </h2>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        Loading versions...
                    </div>
                ) : versions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        No versions found
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Created Date</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Title (Uz)</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Description (Uz)</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Android Version</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>iOS Version</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {versions.map((version, index) => (
                                        <tr key={version.id || index} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>{formatDate(version.createdDate)}</td>
                                            <td style={{ padding: '12px', fontWeight: '500' }}>{version.titleUz || '-'}</td>
                                            <td style={{ padding: '12px', fontWeight: '500' }}>{version.descriptionUz || '-'}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    backgroundColor: version.andiroidIsUpdate ? '#d4edda' : '#f8d7da',
                                                    color: version.andiroidIsUpdate ? '#155724' : '#721c24'
                                                }}>
                                                    {version.andiroidIsUpdate ? 'Yes' : 'No'}
                                                </span> {' '}
                                                {version.andiroidVersion || '-'}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    backgroundColor: version.iosIsUpdate ? '#d4edda' : '#f8d7da',
                                                    color: version.iosIsUpdate ? '#155724' : '#721c24'
                                                }}>
                                                    {version.iosIsUpdate ? 'Yes' : 'No'}
                                                </span> {' '}
                                                {version.iosVersion || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div style={{
                            marginTop: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                                Page {page + 1} of {totalPages || 1}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handleFirstPage}
                                    disabled={page === 0}
                                    style={{
                                        padding: '6px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: page === 0 ? '#f5f5f5' : 'white',
                                        cursor: page === 0 ? 'not-allowed' : 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    First
                                </button>
                                <button
                                    onClick={handlePrevPage}
                                    disabled={page === 0}
                                    style={{
                                        padding: '6px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: page === 0 ? '#f5f5f5' : 'white',
                                        cursor: page === 0 ? 'not-allowed' : 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={page + 1 >= totalPages}
                                    style={{
                                        padding: '6px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: page + 1 >= totalPages ? '#f5f5f5' : 'white',
                                        cursor: page + 1 >= totalPages ? 'not-allowed' : 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Next
                                </button>
                                <button
                                    onClick={handleLastPage}
                                    disabled={page + 1 >= totalPages}
                                    style={{
                                        padding: '6px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: page + 1 >= totalPages ? '#f5f5f5' : 'white',
                                        cursor: page + 1 >= totalPages ? 'not-allowed' : 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Last
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VersionManagement;