
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const AttendanceSummaryChart = ({ present, absent, leave, holiday }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    const data = [
        { name: t('reports.chart.present'), value: present, color: '#10b981' }, // Emerald-500
        { name: t('reports.chart.absent'), value: absent, color: '#ef4444' },  // Red-500
        { name: t('reports.chart.leave'), value: leave, color: '#f59e0b' },   // Amber-500
        { name: t('reports.chart.holiday'), value: holiday, color: '#3b82f6' } // Blue-500
    ];

    // Filter out zero values to avoid empty segments taking space (optional, but cleaner)
    const activeData = data.filter(item => item.value > 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm p-3 border border-gray-100 shadow-lg rounded-xl text-xs">
                    <p className="font-bold text-gray-700 mb-1">{payload[0].name}</p>
                    <p className="text-gray-500">
                        {t('reports.chart.days')}: <span className="font-bold" style={{ color: payload[0].payload.color }}>{payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // Calculate total for percentage
    const total = present + absent + leave + holiday;
    const attendancePercentage = total > 0 ? Math.round(((present + leave) / total) * 100) : 0;

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm h-full relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />

            <h3 className="text-lg font-bold text-gray-700 mb-6 z-10 w-full text-center border-b border-gray-50 pb-2">
                {t('reports.chart.title')}
            </h3>

            <div className="w-full h-[220px] relative">
                {/* Center Stats */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-700 block">{attendancePercentage}%</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">{t('reports.chart.attendance')}</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={activeData.length > 0 ? activeData : [{ name: 'No Data', value: 1, color: '#e5e7eb' }]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {activeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            {activeData.length === 0 && <Cell fill="#f3f4f6" />}
                        </Pie>
                    </PieChart>
                    {activeData.length > 0 && <Tooltip content={<CustomTooltip />} cursor={false} />}
                </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-4 w-full">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-medium text-gray-600">{item.name}</span>
                        <span className="text-xs font-bold text-gray-800 ml-1">({item.value})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttendanceSummaryChart;
