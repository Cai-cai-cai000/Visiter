import React from 'react';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: string;
    colorClass: string;
    bgClass: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, colorClass, bgClass }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all border border-green-100">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <h3 className={`text-2xl font-bold mt-1 ${colorClass}`}>{value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center ${colorClass}`}>
                    <i className={`fa ${icon}`}></i>
                </div>
            </div>
        </div>
    );
};
