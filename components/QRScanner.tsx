import React, { useState, useEffect, useRef } from 'react';
import { Camera, StopCircle, RefreshCw, Keyboard, Search, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Application } from '../types';

interface QRScannerProps {
    applications: Application[];
}

const QRScanner: React.FC<QRScannerProps> = ({ applications }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string; app?: Application } | null>(null);
    const [manualCode, setManualCode] = useState('');
    const [cameraMode, setCameraMode] = useState<'front' | 'environment'>('environment');
    
    // Mock video ref (in a real implementation, this would attach to a stream)
    const videoRef = useRef<HTMLDivElement>(null);

    const handleStartScan = () => {
        setIsScanning(true);
        setScanResult(null);
        // Simulate a successful scan after 3 seconds for demonstration
        // In reality, this would be `jsQR` logic on a canvas
        setTimeout(() => {
             // Find a random approved application to simulate a scan
             const randomApp = applications.find(a => a.status === 'approved');
             if (randomApp && isScanning) {
                 validateCode(randomApp.id);
                 setIsScanning(false);
             } else if (isScanning) {
                 // No approved apps found in mock data
                 setIsScanning(false);
                 setScanResult({ success: false, message: "未检测到有效的访客记录" });
             }
        }, 3000);
    };

    const handleStopScan = () => {
        setIsScanning(false);
    };

    const validateCode = (code: string) => {
        // Code format expected: APP_ID (e.g., VS2024...)
        // In real world, might include visitor index like VS2024...-1
        const cleanCode = code.split('-')[0]; 
        const app = applications.find(a => a.id === cleanCode);

        if (!app) {
            setScanResult({ success: false, message: "无效的二维码: 未找到申请记录" });
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (app.status === 'rejected') {
             setScanResult({ success: false, message: "验证失败: 申请已被拒绝", app });
        } else if (app.status === 'expired' || (app.status === 'approved' && app.visitDate < today)) {
             setScanResult({ success: false, message: "验证失败: 访客证已过期", app });
        } else if (app.status === 'pending') {
             setScanResult({ success: false, message: "验证失败: 申请尚未审核通过", app });
        } else {
             setScanResult({ success: true, message: "验证通过: 允许通行", app });
        }
    };

    const handleManualVerify = () => {
        if (!manualCode) return;
        validateCode(manualCode);
    };

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scanner Area */}
            <div className="bg-surface-card rounded-xl border border-gray-200 p-6 flex flex-col h-full">
                <h3 className="text-lg font-semibold text-text-secondary mb-4 flex items-center gap-2">
                    <Camera size={20} className="text-primary" />
                    二维码扫描核验
                </h3>

                <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                    {isScanning ? (
                        <>
                            <div className="absolute inset-0 bg-black/40 z-10">
                                <div className="w-full h-1 bg-primary shadow-[0_0_10px_#2e7d32] animate-scan-line absolute top-0"></div>
                            </div>
                             {/* Placeholder for video stream */}
                            <div className="text-white z-0 w-full h-full bg-[url('https://picsum.photos/800/450?grayscale')] bg-cover opacity-50"></div>
                            <div className="absolute z-20 text-white font-medium bg-black/60 px-3 py-1 rounded">正在扫描...</div>
                        </>
                    ) : (
                        <div className="text-gray-500 flex flex-col items-center">
                            <Camera size={48} className="mb-2 opacity-50" />
                            <span>相机已关闭</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-center gap-3 mb-6">
                    {!isScanning ? (
                        <button onClick={handleStartScan} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2 transition-all">
                            <Camera size={18} /> 开始扫描
                        </button>
                    ) : (
                        <button onClick={handleStopScan} className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/80 flex items-center gap-2 transition-all">
                            <StopCircle size={18} /> 停止扫描
                        </button>
                    )}
                </div>
                
                <div className="border-t border-gray-100 pt-6 mt-auto">
                    <h4 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                         <Keyboard size={16} /> 手动输入核验码
                    </h4>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            placeholder="输入申请编号 (例如: VS2024...)"
                            className="flex-1 px-4 py-2 bg-surface border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button onClick={handleManualVerify} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-all">
                            验证
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <div className="bg-surface-card rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-text-secondary mb-4">验证结果</h3>
                
                {scanResult ? (
                    <div className={`rounded-xl p-6 border-2 ${scanResult.success ? 'border-success bg-green-50' : 'border-danger bg-red-50'}`}>
                        <div className="flex flex-col items-center text-center mb-4">
                            {scanResult.success ? (
                                <CheckCircle size={64} className="text-success mb-2" />
                            ) : (
                                <XCircle size={64} className="text-danger mb-2" />
                            )}
                            <h4 className="text-xl font-bold text-gray-800">{scanResult.success ? '允许通行' : '禁止通行'}</h4>
                            <p className={`font-medium ${scanResult.success ? 'text-success' : 'text-danger'}`}>{scanResult.message}</p>
                        </div>

                        {scanResult.app && (
                            <div className="bg-white/60 rounded-lg p-4 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">申请人:</span>
                                    <span className="font-medium">{scanResult.app.visitors[0].name} 等 {scanResult.app.visitors.length} 人</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">拜访时间:</span>
                                    <span className="font-medium">{scanResult.app.visitDate} {scanResult.app.startTime}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">地点:</span>
                                    <span className="font-medium">{scanResult.app.location}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">事由:</span>
                                    <span className="font-medium">{scanResult.app.purpose}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-text-light bg-surface rounded-lg border-2 border-dashed border-gray-200">
                        <Search size={48} className="mb-2 opacity-30" />
                        <p>请扫描二维码或手动输入</p>
                    </div>
                )}

                {/* Recent History Placeholder */}
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-semibold text-text-secondary">最近核验记录</h4>
                        <button className="text-xs text-primary hover:underline">查看全部</button>
                    </div>
                    <div className="space-y-2">
                        <div className="p-3 bg-surface rounded flex justify-between items-center text-sm">
                            <span>张* (VS...992)</span>
                            <span className="text-success flex items-center gap-1"><CheckCircle size={12}/> 通过</span>
                        </div>
                        <div className="p-3 bg-surface rounded flex justify-between items-center text-sm">
                            <span>李* (VS...112)</span>
                            <span className="text-danger flex items-center gap-1"><XCircle size={12}/> 拒绝</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;