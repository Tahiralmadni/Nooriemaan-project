import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const Teachers = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    useEffect(() => {
        document.title = t('pageTitles.teachers');
    }, [t, i18n.language]);

    // Staff Data - Basic
    const staffData = [
        { id: 1, name: 'Muhammad Akram Attari', email: 'ishaqakram67@gmail.com' },
        { id: 2, name: 'Qari Syed Umair Attari', email: '-' },
        { id: 3, name: 'Muhammad Muneeb Sabir', email: 'muneebattari527@gmail.com' },
        { id: 4, name: 'Mudassir Raza', email: 'mudassirrazachishti@gmail.com' },
        { id: 5, name: 'Ubaid Raza', email: 'ubaidattari0326@gmail.com' },
        { id: 6, name: 'Muhammad Rizwan Hussain', email: '-' },
        { id: 7, name: 'Muhammad Kashif Attari', email: '-' },
        { id: 8, name: 'Muhammad Hashim', email: '-' },
        { id: 9, name: 'Ahmed Shah', email: '-' },
        { id: 10, name: 'Jawad', email: 'jawadsoomrowork@gmail.com' },
        { id: 11, name: 'Hanzalah Tahir', email: 'hanzalahtahir93@gmail.com' },
    ];

    return (
        <>
            <Helmet defer={false}>
                <title>{t('pageTitles.teachers')}</title>
            </Helmet>
            <div style={{
                fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)',
                direction: isRTL ? 'rtl' : 'ltr'
            }}>
                <h2 style={{ marginBottom: '16px' }}>{t('sidebar.teachers')}</h2>

                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr style={{ background: '#f0f0f0' }}>
                            <th style={{ border: '1px solid #ccc', padding: '10px' }}>{t('table.serial')}</th>
                            <th style={{ border: '1px solid #ccc', padding: '10px' }}>{t('table.name')}</th>
                            <th style={{ border: '1px solid #ccc', padding: '10px' }}>{t('table.email')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffData.map((staff) => (
                            <tr key={staff.id}>
                                <td style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>{staff.id}</td>
                                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{staff.name}</td>
                                <td style={{ border: '1px solid #ccc', padding: '10px' }}>{staff.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Teachers;
