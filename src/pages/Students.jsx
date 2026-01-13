import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const Students = () => {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        document.title = t('pageTitles.students');
    }, [t, i18n.language]);

    return (
        <>
            <Helmet defer={false}>
                <title>{t('pageTitles.students')}</title>
            </Helmet>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    {t('sidebar.students')}
                </h1>
            </div>
        </>
    );
};

export default Students;
