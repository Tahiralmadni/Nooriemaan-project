import { useTranslation } from 'react-i18next';
import i18n from '../config/i18n';
import DigitalClock from '../components/DigitalClock';

const Dashboard = () => {
    const { t } = useTranslation();
    const isRTL = i18n.language === 'ur';

    // Simplified Stats data matching the original "clear" layout
    const stats = [
        { label: t('dashboard.presentToday'), val: '15', col: '#3b82f6' },
    ];

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Digital Clock */}
            <DigitalClock />

            {/* Simple Green Banner */}
            <div style={{
                background: '#10b981',
                color: '#fff',
                padding: '24px',
                borderRadius: '10px',
                textAlign: 'center',
                marginBottom: '20px',
                fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
            }}>
                <h1 style={{ margin: 0, fontSize: isRTL ? '22px' : '24px', fontWeight: 'bold' }}>
                    {t('dashboard.welcomeToDashboard')}
                </h1>
                <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '14px' }}>
                    {t('dashboard.admin')}
                </p>
            </div>

            {/* Simple Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '15px'
            }}>
                {stats.map((s, i) => (
                    <div key={i} style={{
                        background: '#fff',
                        padding: '16px',
                        borderRadius: '8px',
                        borderTop: `3px solid ${s.col}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>{s.label}</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{s.val}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
