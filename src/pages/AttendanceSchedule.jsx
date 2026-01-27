import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const AttendanceSchedule = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    // Active tab
    const [activeTab, setActiveTab] = useState('hazri');

    useEffect(() => {
        document.title = t('pageTitles.attendanceSchedule');
    }, [t, i18n.language]);

    // Test staff (1 only)
    const testStaff = {
        id: 1,
        nameUr: 'محمد اکرم عطاری',
        nameEn: 'Muhammad Akram Attari'
    };

    return (
        <>
            <Helmet defer={false}>
                <title>{t('pageTitles.attendanceSchedule')}</title>
            </Helmet>

            <div style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}>
                {/* Page Heading */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    marginBottom: '20px'
                }}>
                    <h1 style={{
                        fontSize: '26px',
                        fontWeight: '700',
                        color: '#1e293b',
                        textAlign: 'center',
                        margin: '0'
                    }}>
                        {isRTL ? 'حاضری جدول' : 'Attendance Schedule'}
                    </h1>
                    <p style={{
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: '14px',
                        marginTop: '8px',
                        marginBottom: '0'
                    }}>
                        {isRTL ? 'عملہ کی حاضری کا انتظام' : 'Manage Staff Attendance'}
                    </p>
                </div>

                {/* Tabs - 26 Jan */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => setActiveTab('hazri')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            backgroundColor: activeTab === 'hazri' ? '#10b981' : '#f1f5f9',
                            color: activeTab === 'hazri' ? '#ffffff' : '#64748b',
                            fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
                        }}
                    >
                        {isRTL ? 'حاضری' : 'Attendance'}
                    </button>
                    <button
                        onClick={() => setActiveTab('hours')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            backgroundColor: activeTab === 'hours' ? '#10b981' : '#f1f5f9',
                            color: activeTab === 'hours' ? '#ffffff' : '#64748b',
                            fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
                        }}
                    >
                        {isRTL ? 'دوران اوقات' : 'Hours'}
                    </button>
                    <button
                        onClick={() => setActiveTab('summary')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            backgroundColor: activeTab === 'summary' ? '#10b981' : '#f1f5f9',
                            color: activeTab === 'summary' ? '#ffffff' : '#64748b',
                            fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
                        }}
                    >
                        {isRTL ? 'مجموعی' : 'Summary'}
                    </button>
                </div>

                {/* Tab Content */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    minHeight: '200px'
                }}>
                    {activeTab === 'hazri' && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            padding: '16px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            flexWrap: 'wrap'
                        }}>
                            {/* Staff Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    backgroundColor: '#10b981',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ffffff',
                                    fontWeight: '600'
                                }}>
                                    {testStaff.id}
                                </div>
                                <span style={{ fontWeight: '500', color: '#1e293b' }}>
                                    {isRTL ? testStaff.nameUr : testStaff.nameEn}
                                </span>
                            </div>

                            {/* Attendance Buttons - 27 Jan */}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#22c55e',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '13px',
                                    fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
                                }}>
                                    {isRTL ? 'حاضر' : 'Present'}
                                </button>
                                <button style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#ef4444',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '13px',
                                    fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
                                }}>
                                    {isRTL ? 'غیر حاضر' : 'Absent'}
                                </button>
                                <button style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#eab308',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '13px',
                                    fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
                                }}>
                                    {isRTL ? 'چھٹی' : 'Leave'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hours' && (
                        <p style={{ textAlign: 'center', color: '#94a3b8' }}>
                            {isRTL ? 'جلد آرہا ہے' : 'Coming Soon'}
                        </p>
                    )}

                    {activeTab === 'summary' && (
                        <p style={{ textAlign: 'center', color: '#94a3b8' }}>
                            {isRTL ? 'جلد آرہا ہے' : 'Coming Soon'}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default AttendanceSchedule;
