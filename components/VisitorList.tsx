import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, QrCode, MoreHorizontal, Eye } from 'lucide-react';
import { Application, FilterType, ApplicationStatus } from '../types';

interface VisitorListProps {
    applications: Application[];
    onUpdateStatus: (id: string, status: ApplicationStatus) => void;
    onViewQr: (app: Application) => void;
}

const VisitorList: React.FC<VisitorListProps> = ({ applications, onUpdateStatus, onViewQr }) => {
    const [filter, setFilter] = useState<FilterType>('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    const filteredApps = applications.filter(app => {
        const matchesStatus = filter === 'all' || app.status === filter;
        const matchesSearch = app.id.toLowerCase().includes(search.toLowerCase()) || 
                              app.visitors.some(v => v.name.includes(search));
        return matchesStatus && matchesSearch;
    });

    const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
    const currentApps = filteredApps.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const getStatusStyle = (status: ApplicationStatus) => {
        switch (status) {
            case 'approved': return 'bg-success/10 text-success';
            case 'rejected': return 'bg-danger/10 text-danger';
            case 'pending': return 'bg-warning/10 text-warning';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    const getStatusLabel = (status: ApplicationStatus) => {
        switch (status) {
            case 'approved': return '已通过';
            case 'rejected': return '已拒绝';
            case 'pending': return '待审核';
            case 'expired': return '已过期';
            default: return status;
        }
    };

    return (
        <div className="p-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    {(['all', 'pending', 'approved', 'rejected', 'expired'] as FilterType[]).map(status => (
                        <button
                            key={status}
                            onClick={() => { setFilter(status); setPage(1); }}
                            className={`px-3 py-1.5 text-xs rounded-full capitalize transition-colors ${
                                filter === status 
                                    ? 'bg-primary/10 text-primary font-bold' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {status === 'all' ? '全部' : getStatusLabel(status as ApplicationStatus)}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="搜索编号或姓名..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-surface border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" 
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface-card rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-surface">
                            <tr>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-text-light uppercase">申请编号</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-text-light uppercase">日期</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-text-light uppercase">访客</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-text-light uppercase">状态</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-text-light uppercase">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentApps.length > 0 ? currentApps.map(app => (
                                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary text-center">{app.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary text-center">
                                        {app.visitDate} <span className="text-xs text-text-light block">{app.startTime}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-medium">{app.visitors[0]?.name}</span>
                                            {app.visitors.length > 1 && <span className="text-xs text-text-light">+{app.visitors.length - 1} 人</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(app.status)}`}>
                                            {getStatusLabel(app.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            {app.status === 'pending' && (
                                                <>
                                                    <button onClick={() => onUpdateStatus(app.id, 'approved')} className="p-1.5 text-success hover:bg-success/10 rounded" title="通过">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button onClick={() => onUpdateStatus(app.id, 'rejected')} className="p-1.5 text-danger hover:bg-danger/10 rounded" title="拒绝">
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {app.status === 'approved' && (
                                                <button onClick={() => onViewQr(app)} className="p-1.5 text-primary hover:bg-primary/10 rounded" title="二维码">
                                                    <QrCode size={18} />
                                                </button>
                                            )}
                                            <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded" title="详情">
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-text-light">
                                        暂无数据
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 text-sm text-text-secondary">
                    <span>显示 {(page - 1) * itemsPerPage + 1} 至 {Math.min(page * itemsPerPage, filteredApps.length)} 条，共 {filteredApps.length} 条</span>
                    <div className="flex gap-1">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border border-gray-200 rounded hover:bg-surface disabled:opacity-50"
                        >
                            上一页
                        </button>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border border-gray-200 rounded hover:bg-surface disabled:opacity-50"
                        >
                            下一页
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitorList;