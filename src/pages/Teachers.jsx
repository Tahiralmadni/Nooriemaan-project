import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const Teachers = () => {
    const { t } = useTranslation();

    useEffect(() => {
        document.title = t('pageTitles.teachers');
    }, [t]);

    const staffIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

    const emails = {
        1: 'ishaqakram67@gmail.com',
        2: '-',
        3: 'muneebattari527@gmail.com',
        4: 'mudassirrazachishti@gmail.com',
        5: 'mudassirrazachishti@gmail.com',
        6: 'mudassirrazachishti@gmail.com',
        7: 'ubaidattari0326@gmail.com',
        8: 'ubaidattari0326@gmail.com',
        9: 'ubaidattari0326@gmail.com',
        10: '-',
        11: '-',
        12: '-',
        13: '-',
        14: 'jawadsoomrowork@gmail.com',
        15: 'hanzalahtahir93@gmail.com',
        16: 'balochjuni010@gmail.com',
        17: '-',
        18: 'attaridilawar510@gmail.com',
        19: 'princeShoaibkhan990@gmail.com',
        20: 'aliyn00177@gmail.com',
        21: 'ar8693524@gmail.com',
        22: '-',
    };

    return (
        <>
            <Helmet defer={false}>
                <title>{t('pageTitles.teachers')}</title>
            </Helmet>
            <div>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#1e293b',
                        margin: 0
                    }}>
                        {t('sidebar.teachersList')}
                    </h1>
                    <span style={{
                        background: '#10b981',
                        color: '#fff',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        {staffIds.length} {t('table.members')}
                    </span>
                </div>

                {/* Table */}
                <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                                <th style={{ padding: '16px 20px', color: '#fff', fontWeight: '600', textAlign: 'center', width: '70px' }}>
                                    {t('table.serial')}
                                </th>
                                <th style={{ padding: '16px 20px', color: '#fff', fontWeight: '600' }}>
                                    {t('table.name')}
                                </th>
                                <th style={{ padding: '16px 20px', color: '#fff', fontWeight: '600' }}>
                                    {t('table.email')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffIds.map((id, index) => (
                                <tr
                                    key={id}
                                    style={{ background: index % 2 === 0 ? '#fff' : '#f8fafc' }}
                                >
                                    <td style={{ padding: '14px 20px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', color: '#10b981', fontWeight: '600' }}>
                                        {id}
                                    </td>
                                    <td style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', color: '#1e293b', fontWeight: '500' }}>
                                        {t(`staff.${id}`)}
                                    </td>
                                    <td style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', color: emails[id] === '-' ? '#94a3b8' : '#3b82f6' }}>
                                        {emails[id]}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Teachers;
