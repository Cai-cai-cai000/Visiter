import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusSquare, List, QrCode, Bell, User, X, Clock } from 'lucide-react';
import VisitorForm from './components/VisitorForm';
import VisitorList from './components/VisitorList';
import QRScanner from './components/QRScanner';
import { Application, ApplicationStatus } from './types';

// Mock initial data
const INITIAL_DATA: Application[] = [
    {
        id: 'VS20240613001',
        visitDate: '2024-06-13',
        startTime: '09:00',
        location: '行政楼201',
        duration: 2,
        purpose: '商务洽谈',
        maxVisitors: 5,
        validDays: 1,
        disclaimer: '...',
        visitors: [{ id: '1', name: '王经理', phone: '13800138000', idType: 'id-card', idNumber: '110...' }],
        status: 'pending',
        createdAt: '2024-06-12 10:00',
        aiRiskAnalysis: 'Low Risk: Business meeting context identified.'
    },
    {
        id: 'VS20240613002',
        visitDate: '2024-06-13',
        startTime: '14:00',
        location: '实验室3B',
        duration: 1,
        purpose: '设备维修',
        maxVisitors: 2,
        validDays: 1,
        disclaimer: '...',
        visitors: [{ id: '2', name: '张工', phone: '13900139000', idType: 'id-card', idNumber: '310...' }],
        status: 'approved',
        createdAt: '2024-06-12 11:30'
    }
];

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'new' | 'list' | 'qr'>('list');
    const [applications, setApplications] = useState<Application[]>(INITIAL_DATA);
    const [stats, setStats] = useState({ today: 0, week: 0, pending: 0 });
    const [qrModalApp, setQrModalApp] = useState<Application | null>(null);

    // Calculate stats
    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCount = applications.filter(a => a.visitDate === todayStr).length;
        // Simplified weekly logic for demo
        const weekCount = applications.length; 
        const pendingCount = applications.filter(a => a.status === 'pending').length;

        setStats({ today: todayCount, week: weekCount, pending: pendingCount });
    }, [applications]);

    const handleNewApplication = (app: Application) => {
        setApplications([app, ...applications]);
        setActiveTab('list');
    };

    const handleUpdateStatus = (id: string, status: ApplicationStatus) => {
        setApplications(apps => apps.map(app => 
            app.id === id ? { ...app, status } : app
        ));
    };

    return (
        <div className="min-h-screen bg-surface pb-10">
            {/* Header / Nav */}
            <header className="bg-surface-card shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                S
                            </div>
                            <span className="font-bold text-xl text-text-primary tracking-tight">Sakura<span className="text-primary">Visit</span></span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-text-light hover:text-primary transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
                            </button>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <User size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-surface-card p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">今日访客</p>
                                <h3 className="text-3xl font-bold text-text-primary mt-2">{stats.today}</h3>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <User size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface-card p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">本周访客</p>
                                <h3 className="text-3xl font-bold text-text-primary mt-2">{stats.week}</h3>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                <LayoutDashboard size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface-card p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">待审核</p>
                                <h3 className="text-3xl font-bold text-warning mt-2">{stats.pending}</h3>
                            </div>
                            <div className="p-3 bg-warning/10 rounded-xl text-warning">
                                <Clock size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-surface-card rounded-2xl shadow-card overflow-hidden min-h-[600px]">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 px-6 pt-4 gap-6 overflow-x-auto">
                        <button 
                            onClick={() => setActiveTab('new')}
                            className={`pb-4 px-2 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${
                                activeTab === 'new' 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            <PlusSquare size={18} /> 新增申请
                        </button>
                        <button 
                            onClick={() => setActiveTab('list')}
                            className={`pb-4 px-2 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${
                                activeTab === 'list' 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            <List size={18} /> 申请列表
                        </button>
                        <button 
                            onClick={() => setActiveTab('qr')}
                            className={`pb-4 px-2 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${
                                activeTab === 'qr' 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            <QrCode size={18} /> 二维码核验
                        </button>
                    </div>

                    {/* Content */}
                    <div className="bg-surface-card">
                        {activeTab === 'new' && <VisitorForm onSubmit={handleNewApplication} />}
                        {activeTab === 'list' && (
                            <VisitorList 
                                applications={applications} 
                                onUpdateStatus={handleUpdateStatus} 
                                onViewQr={setQrModalApp} 
                            />
                        )}
                        {activeTab === 'qr' && <QRScanner applications={applications} />}
                    </div>
                </div>
            </main>

            {/* QR Modal */}
            {qrModalApp && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-2xl w-full max-w-sm p-6 relative animate-pulse-fast-none shadow-2xl">
                        <button 
                            onClick={() => setQrModalApp(null)}
                            className="absolute top-4 right-4 text-text-light hover:text-text-secondary"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-text-primary mb-1">访客通行证</h3>
                            <p className="text-sm text-text-secondary mb-6">出示此码给安保人员扫码通行</p>
                            
                            <div className="bg-surface p-4 rounded-xl mb-6 inline-block border-2 border-dashed border-primary/30">
                                {/* Simulated QR Image using API - color 2e7d32 is the new primary hex */}
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrModalApp.id}&color=2e7d32`} 
                                    alt="QR Code" 
                                    className="w-48 h-48 rounded-lg mix-blend-multiply"
                                />
                            </div>

                            <div className="text-left bg-surface p-4 rounded-xl space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">编号</span>
                                    <span className="font-mono font-bold text-text-primary">{qrModalApp.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">主访客</span>
                                    <span className="font-medium text-text-primary">{qrModalApp.visitors[0].name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">有效期至</span>
                                    <span className="font-medium text-primary">{qrModalApp.visitDate}</span>
                                </div>
                            </div>

                            <button className="mt-6 w-full py-2.5 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:bg-primary-dark transition-all">
                                下载通行证
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;