import React, { useState, useEffect, useRef } from 'react';
import { StatsCard } from './components/StatsCard';
import { Modal } from './components/Modal';
import { INITIAL_APPLICATIONS } from './constants';
import { Application, ApplicationStatus, Visitor, VerificationLog } from './types';

// --- Tab Components ---

// 1. New Visitor Form (Host View)
const NewVisitorForm: React.FC<{ 
    onSubmit: (app: Application) => void;
    onSimulateLink: (tripDetails: any) => void;
}> = ({ onSubmit, onSimulateLink }) => {
    const DEFAULT_DISCLAIMER = `访客须知：
1. 访客进入校园需佩戴访客证，主动配合安保人员检查。
2. 访客需遵守学校规章制度，保持安静，不影响正常教学秩序。
3. 未经允许，不得进入教学区域和学生宿舍。
4. 严禁携带易燃易爆等危险物品进入校园。
5. 访客需对自身安全负责，学校不承担非学校责任造成的人身财产损失。`;

    const [visitors, setVisitors] = useState<Partial<Visitor>[]>([{ id: Date.now().toString() }]);
    const [formData, setFormData] = useState({
        visitDate: '',
        startTime: '',
        location: '',
        duration: 1,
        purpose: '',
        maxVisitors: 5,
        validDays: 1,
        disclaimer: DEFAULT_DISCLAIMER
    });
    
    // State for Invite Link Modal
    const [inviteLink, setInviteLink] = useState('');
    const [draftTripDetails, setDraftTripDetails] = useState<any>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addVisitor = () => {
        if (visitors.length >= formData.maxVisitors) {
            alert(`已达到访客人数上限 (${formData.maxVisitors})`);
            return;
        }
        setVisitors([...visitors, { id: Date.now().toString() }]);
    };

    const removeVisitor = (index: number) => {
        if (visitors.length <= 1) {
            alert('至少需要一位访客');
            return;
        }
        const newVisitors = [...visitors];
        newVisitors.splice(index, 1);
        setVisitors(newVisitors);
    };

    const updateVisitor = (index: number, field: keyof Visitor, value: string) => {
        const newVisitors = [...visitors];
        newVisitors[index] = { ...newVisitors[index], [field]: value };
        setVisitors(newVisitors);
    };

    const handleGenerateLink = () => {
        if (!formData.visitDate || !formData.startTime || !formData.location || !formData.purpose) {
            alert("请完善拜访日期、时间、地点及事由等基本信息");
            return;
        }
        // Simulate generating a unique link
        const randomId = Math.random().toString(36).substring(2, 10);
        const link = `${window.location.origin}/invite/${randomId}`;
        setInviteLink(link);
        setDraftTripDetails({ ...formData });
    };

    const handleSimulateClick = () => {
        if (draftTripDetails) {
            onSimulateLink(draftTripDetails);
            setInviteLink('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if(!formData.visitDate || !formData.location || !formData.purpose) {
            alert("请填写所有必填字段");
            return;
        }
        const validVisitors = visitors.every(v => v.name && v.phone && v.idNumber);
        if(!validVisitors) {
            alert("请完善所有访客信息");
            return;
        }

        const newApp: Application = {
            id: `VS${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`,
            applicationDate: new Date().toLocaleString(),
            visitDate: formData.visitDate,
            startTime: formData.startTime,
            duration: Number(formData.duration),
            location: formData.location,
            purpose: formData.purpose,
            maxVisitors: Number(formData.maxVisitors),
            validDays: Number(formData.validDays),
            disclaimer: formData.disclaimer,
            status: 'Pending',
            visitors: visitors as Visitor[]
        };

        onSubmit(newApp);
        
        // Reset (simplified)
        alert('申请提交成功！');
        setVisitors([{ id: Date.now().toString() }]);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">拜访日期 <span className="text-red-500">*</span></label>
                    <input type="date" name="visitDate" required value={formData.visitDate} onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">开始时间 <span className="text-red-500">*</span></label>
                    <input type="time" name="startTime" required value={formData.startTime} onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">拜访地点 <span className="text-red-500">*</span></label>
                    <input type="text" name="location" placeholder="例如：行政楼201会议室" required value={formData.location} onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">拜访时长（小时） <span className="text-red-500">*</span></label>
                    <input type="number" name="duration" min="1" max="8" required value={formData.duration} onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">拜访事由 <span className="text-red-500">*</span></label>
                <textarea name="purpose" rows={3} placeholder="请详细描述拜访目的和事由" required value={formData.purpose} onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"></textarea>
            </div>

            <div className="bg-green-50/50 rounded-xl p-4 mb-6 border border-green-100">
                <h3 className="text-sm font-semibold text-green-800 mb-3">参数设置</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">访客人数上限</label>
                        <input type="number" name="maxVisitors" value={formData.maxVisitors} onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">通行证有效期(天)</label>
                        <input type="number" name="validDays" value={formData.validDays} onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">免责申明</label>
                <textarea name="disclaimer" rows={6} value={formData.disclaimer} onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm text-gray-600"></textarea>
            </div>

            {/* Manual Add Visitor Section - Optional if link is used, but kept for direct input */}
            <div className="mb-6 border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">访客信息 (手动登记)</h3>
                    <button type="button" onClick={addVisitor} className="flex items-center px-3 py-1.5 text-xs text-primary border border-primary rounded-lg hover:bg-primary/10 transition-all">
                        <i className="fa fa-plus-circle mr-1"></i> 添加访客
                    </button>
                </div>
                
                <div className="space-y-4">
                    {visitors.map((visitor, index) => (
                        <div key={visitor.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 relative group">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-gray-500">访客 {index + 1}</span>
                                <button type="button" onClick={() => removeVisitor(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <i className="fa fa-trash"></i>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <input type="text" placeholder="姓名" value={visitor.name || ''} 
                                        onChange={(e) => updateVisitor(index, 'name', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <input type="tel" placeholder="手机号码" value={visitor.phone || ''}
                                        onChange={(e) => updateVisitor(index, 'phone', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <select value={visitor.idType || 'id-card'} onChange={(e) => updateVisitor(index, 'idType', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-primary">
                                        <option value="id-card">身份证</option>
                                        <option value="passport">护照</option>
                                        <option value="other">其他</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <input type="text" placeholder="证件号码" value={visitor.idNumber || ''}
                                        onChange={(e) => updateVisitor(index, 'idNumber', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center justify-center w-full h-10 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-white text-gray-400 text-xs transition-colors">
                                        <i className="fa fa-camera mr-2"></i> 上传照片 (模拟)
                                        <input type="file" className="hidden" accept="image/*" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={handleGenerateLink} className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-all font-medium">
                    <i className="fa fa-link mr-1"></i> 生成邀请链接
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-md shadow-primary/30 font-medium">
                    <i className="fa fa-paper-plane mr-1"></i> 提交申请
                </button>
            </div>

            {/* Invite Link Modal */}
            <Modal
                isOpen={!!inviteLink}
                onClose={() => setInviteLink('')}
                title="访客邀请链接"
            >
                <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3">
                        请将此链接发送给访客，访客可通过链接完善个人信息（包括姓名、手机号、照片等）并提交申请。
                    </p>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded border border-gray-200 mb-4">
                        <input 
                            type="text" 
                            readOnly 
                            value={inviteLink} 
                            className="bg-transparent border-none w-full text-sm text-gray-800 focus:outline-none font-mono"
                        />
                        <button 
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText(inviteLink);
                                alert('链接已复制');
                            }}
                            className="text-primary hover:text-primary-dark font-medium text-sm whitespace-nowrap"
                        >
                            复制
                        </button>
                    </div>
                    <div className="flex justify-center mb-4">
                        <button 
                            type="button"
                            onClick={handleSimulateClick}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm shadow-md"
                        >
                            <i className="fa fa-external-link mr-1"></i> 模拟访客点击链接 (演示用)
                        </button>
                    </div>
                    <div className="text-xs text-gray-500">
                        <i className="fa fa-info-circle mr-1"></i>
                        链接有效期为24小时，每个链接最多可登记{formData.maxVisitors}名访客。
                    </div>
                </div>
            </Modal>
        </form>
    );
};

// 2. Guest Registration Form (Visitor View)
const GuestRegistration: React.FC<{
    tripDetails: any;
    onSubmit: (visitors: Visitor[]) => void;
    onCancel: () => void;
}> = ({ tripDetails, onSubmit, onCancel }) => {
    const [visitors, setVisitors] = useState<Partial<Visitor>[]>([{ id: Date.now().toString() }]);
    
    // Auto-fill random data for demo purposes
    const fillDemoData = () => {
         setVisitors([{
             id: Date.now().toString(),
             name: '访客演示',
             phone: '13900000000',
             idType: 'id-card',
             idNumber: '330106199001010000',
             photoUrl: 'simulated'
         }]);
    };

    const addVisitor = () => {
        if (visitors.length >= (tripDetails.maxVisitors || 5)) {
            alert(`最多添加 ${tripDetails.maxVisitors} 位访客`);
            return;
        }
        setVisitors([...visitors, { id: Date.now().toString() }]);
    };

    const removeVisitor = (index: number) => {
        if (visitors.length <= 1) return;
        const newVisitors = [...visitors];
        newVisitors.splice(index, 1);
        setVisitors(newVisitors);
    };

    const updateVisitor = (index: number, field: keyof Visitor, value: string) => {
        const newVisitors = [...visitors];
        newVisitors[index] = { ...newVisitors[index], [field]: value };
        setVisitors(newVisitors);
    };

    const handlePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // Simulate upload
            updateVisitor(index, 'photoUrl', URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valid = visitors.every(v => v.name && v.phone && v.idNumber && v.photoUrl);
        if(!valid) {
            alert("请完善所有访客信息（含照片）");
            return;
        }
        onSubmit(visitors as Visitor[]);
    };

    return (
        <div className="bg-white min-h-screen pb-10">
            {/* Header */}
            <div className="bg-primary p-6 text-white text-center">
                <h1 className="text-xl font-bold mb-2">访客登记</h1>
                <p className="text-primary-light text-sm">请完善您的来访信息</p>
            </div>

            <div className="max-w-xl mx-auto -mt-4 px-4">
                {/* Trip Info Card */}
                <div className="bg-white rounded-xl shadow-lg p-5 mb-6 border border-gray-100">
                    <h2 className="text-gray-800 font-bold border-b border-gray-100 pb-2 mb-3">邀请信息</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">拜访日期</span>
                            <span className="font-medium">{tripDetails.visitDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">时间/时长</span>
                            <span className="font-medium">{tripDetails.startTime} ({tripDetails.duration}小时)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">地点</span>
                            <span className="font-medium">{tripDetails.location}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">事由</span>
                            <span className="font-medium">{tripDetails.purpose}</span>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-orange-50 rounded-xl p-4 mb-6 border border-orange-100">
                    <h3 className="text-orange-800 font-bold text-sm mb-2">
                        <i className="fa fa-exclamation-circle mr-1"></i> 免责申明
                    </h3>
                    <div className="text-xs text-orange-700 whitespace-pre-line leading-relaxed">
                        {tripDetails.disclaimer}
                    </div>
                    <div className="mt-3 flex items-center">
                        <input type="checkbox" id="agree" className="w-4 h-4 text-primary rounded" defaultChecked />
                        <label htmlFor="agree" className="ml-2 text-xs text-gray-600">我已阅读并同意以上内容</label>
                    </div>
                </div>

                {/* Visitor Forms */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 mb-6">
                         <div className="flex justify-between items-center">
                            <h2 className="font-bold text-gray-800">访客信息 ({visitors.length})</h2>
                            <button type="button" onClick={fillDemoData} className="text-xs text-gray-400">填充演示数据</button>
                        </div>
                        
                        {visitors.map((v, i) => (
                            <div key={v.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                                {visitors.length > 1 && (
                                    <button type="button" onClick={() => removeVisitor(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                        <i className="fa fa-times-circle"></i>
                                    </button>
                                )}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">姓名 <span className="text-red-500">*</span></label>
                                            <input type="text" className="w-full text-sm p-2 border rounded focus:border-primary focus:outline-none" 
                                                value={v.name || ''} onChange={e => updateVisitor(i, 'name', e.target.value)} placeholder="真实姓名" required />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">手机号 <span className="text-red-500">*</span></label>
                                            <input type="tel" className="w-full text-sm p-2 border rounded focus:border-primary focus:outline-none" 
                                                value={v.phone || ''} onChange={e => updateVisitor(i, 'phone', e.target.value)} placeholder="联系电话" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">证件号码 <span className="text-red-500">*</span></label>
                                        <div className="flex gap-2">
                                            <select className="text-sm p-2 border rounded bg-white w-24" 
                                                value={v.idType || 'id-card'} onChange={e => updateVisitor(i, 'idType', e.target.value)}>
                                                <option value="id-card">身份证</option>
                                                <option value="passport">护照</option>
                                            </select>
                                            <input type="text" className="flex-1 text-sm p-2 border rounded focus:border-primary focus:outline-none" 
                                                value={v.idNumber || ''} onChange={e => updateVisitor(i, 'idNumber', e.target.value)} placeholder="请输入证件号" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">人脸照片 <span className="text-red-500">*</span></label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white hover:bg-gray-50 transition-colors cursor-pointer relative">
                                            {v.photoUrl ? (
                                                <div className="relative inline-block">
                                                    <img src={v.photoUrl === 'simulated' ? "https://picsum.photos/100/100" : v.photoUrl} className="h-20 w-20 object-cover rounded-full mx-auto" alt="Preview" />
                                                    <span className="block text-xs text-green-500 mt-1"><i className="fa fa-check-circle"></i> 已上传</span>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400">
                                                    <i className="fa fa-camera text-2xl mb-1"></i>
                                                    <div className="text-xs">点击上传照片</div>
                                                </div>
                                            )}
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={e => handlePhotoUpload(i, e)} />
                                            {v.photoUrl === 'simulated' && <input type="hidden" value="simulated" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <button type="button" onClick={addVisitor} className="w-full py-2 border border-dashed border-primary text-primary text-sm rounded-lg hover:bg-primary/5">
                            <i className="fa fa-plus mr-1"></i> 添加同行人员
                        </button>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium">取消</button>
                        <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/30">提交申请</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// 3. Application List
const ApplicationList: React.FC<{ 
    applications: Application[], 
    onAction: (type: 'Approve' | 'Reject' | 'View' | 'QR', app: Application) => void
}> = ({ applications, onAction }) => {
    const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'All'>('All');
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    const filtered = applications.filter(app => filterStatus === 'All' || app.status === filterStatus);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const getStatusColor = (status: ApplicationStatus) => {
        switch(status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            case 'Expired': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: ApplicationStatus) => {
        switch(status) {
            case 'Pending': return '待审核';
            case 'Approved': return '已通过';
            case 'Rejected': return '已拒绝';
            case 'Expired': return '已过期';
            default: return status;
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    {['All', 'Pending', 'Approved', 'Rejected', 'Expired'].map(status => (
                        <button key={status} 
                            onClick={() => { setFilterStatus(status as any); setPage(1); }}
                            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                                filterStatus === status 
                                ? 'bg-primary text-white shadow-sm' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                            {status === 'All' ? '全部' : getStatusLabel(status as ApplicationStatus)}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <input type="text" placeholder="搜索访客..." className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary w-full md:w-64" />
                    <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50/50">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">申请编号</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">拜访日期</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">地点</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">人数</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">状态</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {paginated.map(app => (
                            <tr key={app.id} className="hover:bg-green-50/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{app.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{app.visitDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{app.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{app.visitors.length}人</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                        {getStatusLabel(app.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => onAction('View', app)} className="text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded text-xs">
                                        查看
                                    </button>
                                    {app.status === 'Pending' && (
                                        <>
                                            <button onClick={() => onAction('Approve', app)} className="text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded text-xs">通过</button>
                                            <button onClick={() => onAction('Reject', app)} className="text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded text-xs">拒绝</button>
                                        </>
                                    )}
                                    {(app.status === 'Approved' || app.status === 'Expired') && (
                                        <button onClick={() => onAction('QR', app)} className="text-primary hover:text-primary-dark bg-primary-light/50 px-2 py-1 rounded text-xs">
                                            <i className="fa fa-qrcode mr-1"></i>通行证
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {paginated.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                    暂无相关记录
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                    <span className="text-sm text-gray-500">第 {page} / {totalPages} 页</span>
                    <div className="flex gap-1">
                        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm">上一页</button>
                        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm">下一页</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 4. QR Verification
const QRVerification: React.FC<{ applications: Application[] }> = ({ applications }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<{success: boolean, message: string, detail?: any} | null>(null);
    const [manualCode, setManualCode] = useState('');
    const [logs, setLogs] = useState<VerificationLog[]>([]);

    const scanTimeoutRef = useRef<any>(null);

    const stopScan = () => {
        setIsScanning(false);
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };

    const startScan = () => {
        setIsScanning(true);
        setResult(null);
        // Simulate finding a random application after 2 seconds
        scanTimeoutRef.current = setTimeout(() => {
            const random = Math.random();
            // 70% chance to find a valid approved application, 20% invalid, 10% no find
            let foundApp: Application | undefined;
            
            if (random > 0.3) {
                 const approvedApps = applications.filter(a => a.status === 'Approved');
                 if(approvedApps.length > 0) foundApp = approvedApps[Math.floor(Math.random() * approvedApps.length)];
            } else if (random > 0.1) {
                 const otherApps = applications.filter(a => a.status !== 'Approved');
                 if(otherApps.length > 0) foundApp = otherApps[Math.floor(Math.random() * otherApps.length)];
            }

            if (foundApp) {
                verify(foundApp.id);
            } else {
                 setResult({ success: false, message: '未识别到有效的二维码' });
            }
            setIsScanning(false);
        }, 2000);
    };

    const verify = (code: string) => {
        const appId = code.split('-')[0]; // Assuming format ID-VisitorIndex
        const app = applications.find(a => a.id === appId || a.id === code);

        const newLog: VerificationLog = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleString(),
            applicationId: code,
            visitorName: '未知',
            idNumber: '---',
            status: 'Failed',
            message: ''
        };

        if (!app) {
            newLog.message = '无效的申请编号';
            setResult({ success: false, message: '无效的通行证', detail: { code } });
        } else {
            newLog.visitorName = app.visitors[0].name + (app.visitors.length > 1 ? ` 等${app.visitors.length}人` : '');
            newLog.idNumber = app.visitors[0].idNumber;
            newLog.applicationId = app.id;

            if (app.status === 'Approved') {
                newLog.status = 'Success';
                newLog.message = '核验通过';
                setResult({ 
                    success: true, 
                    message: '核验通过', 
                    detail: { 
                        name: newLog.visitorName, 
                        date: app.visitDate, 
                        location: app.location 
                    } 
                });
            } else if (app.status === 'Expired') {
                newLog.message = '通行证已过期';
                setResult({ success: false, message: '通行证已过期' });
            } else {
                newLog.message = `状态异常: ${app.status === 'Pending' ? '待审核' : '已拒绝'}`;
                setResult({ success: false, message: `无法通行: ${newLog.message}` });
            }
        }
        setLogs(prev => [newLog, ...prev]);
    };

    const handleManualVerify = () => {
        if(!manualCode) return;
        verify(manualCode);
        setManualCode('');
    };

    useEffect(() => {
        return () => stopScan();
    }, []);

    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scanner Area */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">二维码扫描</h3>
                
                <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden mb-4 group">
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-80"
                        style={{ backgroundImage: "url('https://picsum.photos/800/450')" }}
                    ></div>
                    {isScanning && (
                         <>
                            <div className="absolute inset-0 bg-black/10 z-10"></div>
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(16,185,129,0.8)] z-20 scan-animation"></div>
                            <div className="absolute inset-0 flex items-center justify-center z-30">
                                <div className="w-48 h-48 border-2 border-primary/50 rounded-lg relative">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-0 w-full text-center text-white text-sm z-30 font-medium tracking-wide">
                                正在扫描...
                            </div>
                         </>
                    )}
                    {!isScanning && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                             <span className="text-white/80"><i className="fa fa-camera mr-2"></i>摄像头已关闭</span>
                         </div>
                    )}
                </div>

                <div className="flex justify-center gap-3 mb-6">
                    {!isScanning ? (
                        <button onClick={startScan} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all flex items-center shadow-lg shadow-primary/30">
                            <i className="fa fa-play mr-2"></i> 开始扫描
                        </button>
                    ) : (
                        <button onClick={stopScan} className="px-6 py-2 bg-danger text-white rounded-lg hover:bg-red-600 transition-all flex items-center shadow-lg shadow-danger/30">
                            <i className="fa fa-stop mr-2"></i> 停止扫描
                        </button>
                    )}
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">手动输入核验</h4>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            placeholder="输入申请编号或核验码" 
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button onClick={handleManualVerify} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all">
                            验证
                        </button>
                    </div>
                </div>
            </div>

            {/* Results & Log */}
            <div className="flex flex-col gap-6">
                {/* Result Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[160px] flex flex-col justify-center">
                    {!result ? (
                        <div className="text-center text-gray-400">
                            <i className="fa fa-qrcode text-4xl mb-3 opacity-20"></i>
                            <p>请扫描或输入验证码</p>
                        </div>
                    ) : (
                        <div className={`text-center ${result.success ? 'text-green-600' : 'text-red-500'}`}>
                            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                                <i className={`fa ${result.success ? 'fa-check' : 'fa-times'} text-3xl`}></i>
                            </div>
                            <h3 className="text-xl font-bold mb-1">{result.message}</h3>
                            {result.detail && (
                                <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg text-left">
                                    {result.detail.name && <p><strong>访客:</strong> {result.detail.name}</p>}
                                    {result.detail.date && <p><strong>日期:</strong> {result.detail.date}</p>}
                                    {result.detail.location && <p><strong>地点:</strong> {result.detail.location}</p>}
                                    {result.detail.code && <p><strong>代码:</strong> {result.detail.code}</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* History Logs */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex-1">
                     <h3 className="text-lg font-semibold text-gray-700 mb-4">最近核验记录</h3>
                     <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                         {logs.length === 0 && <p className="text-gray-400 text-sm text-center py-4">暂无记录</p>}
                         {logs.map(log => (
                             <div key={log.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-transparent hover:border-l-4 hover:border-primary transition-all">
                                 <div className="flex justify-between items-start">
                                     <span className="font-medium text-gray-700">{log.visitorName}</span>
                                     <span className={`text-xs px-2 py-0.5 rounded ${log.status === 'Success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                         {log.status === 'Success' ? '通过' : '失败'}
                                     </span>
                                 </div>
                                 <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                     <span>{log.applicationId}</span>
                                     <span>{log.timestamp.split(' ')[1]}</span>
                                 </div>
                                 {log.status === 'Failed' && <div className="text-xs text-red-400 mt-1">{log.message}</div>}
                             </div>
                         ))}
                     </div>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'new' | 'list' | 'verify'>('new');
    const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
    
    // Modals state
    const [qrModalApp, setQrModalApp] = useState<Application | null>(null);
    const [viewApp, setViewApp] = useState<Application | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ id: string, status: ApplicationStatus, title: string, message: string } | null>(null);

    // Guest Mode State
    const [guestTripData, setGuestTripData] = useState<any>(null);

    // Derived Stats
    const stats = {
        today: 12, // Simulation
        week: 48,
        pending: applications.filter(a => a.status === 'Pending').length
    };

    const handleNewApplication = (app: Application) => {
        setApplications([app, ...applications]);
        setActiveTab('list');
    };

    const handleGuestSubmit = (visitors: Visitor[]) => {
        if (!guestTripData) return;
        
        const newApp: Application = {
            id: `VS${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`,
            applicationDate: new Date().toLocaleString(),
            visitDate: guestTripData.visitDate,
            startTime: guestTripData.startTime,
            duration: Number(guestTripData.duration),
            location: guestTripData.location,
            purpose: guestTripData.purpose,
            maxVisitors: Number(guestTripData.maxVisitors),
            validDays: Number(guestTripData.validDays),
            disclaimer: guestTripData.disclaimer,
            status: 'Pending',
            visitors: visitors
        };
        
        handleNewApplication(newApp);
        setGuestTripData(null); // Exit guest mode
        alert("访客登记成功，已提交审核！");
    };

    const handleStatusChange = (id: string, status: ApplicationStatus) => {
        setApplications(apps => apps.map(app => 
            app.id === id ? { ...app, status } : app
        ));
    };

    const handleListAction = (type: 'Approve' | 'Reject' | 'View' | 'QR', app: Application) => {
        if (type === 'QR') {
            setQrModalApp(app);
        } else if (type === 'View') {
            setViewApp(app);
        } else if (type === 'Approve') {
            setConfirmAction({
                id: app.id,
                status: 'Approved',
                title: '通过申请',
                message: `确定要通过申请 ${app.id} 吗？`
            });
        } else if (type === 'Reject') {
            setConfirmAction({
                id: app.id,
                status: 'Rejected',
                title: '拒绝申请',
                message: `确定要拒绝申请 ${app.id} 吗？`
            });
        }
    };

    const executeConfirmAction = () => {
        if (confirmAction) {
            handleStatusChange(confirmAction.id, confirmAction.status);
            setConfirmAction(null);
        }
    };

    // Helper to calculate expiry date
    const getExpiryDate = (dateStr: string, days: number) => {
        if(!dateStr) return '';
        const date = new Date(dateStr);
        // Valid days includes the start day, so add (days - 1)
        date.setDate(date.getDate() + (Math.max(1, days) - 1));
        return date.toLocaleDateString().replace(/\//g, '-');
    };

    // Render Guest View if active
    if (guestTripData) {
        return (
            <GuestRegistration 
                tripDetails={guestTripData} 
                onSubmit={handleGuestSubmit} 
                onCancel={() => setGuestTripData(null)} 
            />
        );
    }

    // Render Admin View
    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20">
            {/* Header / Breadcrumb */}
            <div className="mb-8">
                <nav className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                     <i className="fa fa-home"></i> 首页 
                     <i className="fa fa-angle-right text-gray-300"></i> 学校管理 
                     <i className="fa fa-angle-right text-gray-300"></i> <span className="text-primary font-medium">访客申请管理</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-800">生态校园访客系统</h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatsCard 
                    title="今日访客" 
                    value={stats.today} 
                    icon="fa-user" 
                    bgClass="bg-primary/10" 
                    colorClass="text-primary" 
                />
                <StatsCard 
                    title="本周访客" 
                    value={stats.week} 
                    icon="fa-calendar" 
                    bgClass="bg-blue-50" 
                    colorClass="text-blue-500" 
                />
                <StatsCard 
                    title="待审核申请" 
                    value={stats.pending} 
                    icon="fa-clock-o" 
                    bgClass="bg-yellow-50" 
                    colorClass="text-yellow-500" 
                />
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-card min-h-[500px] border border-gray-100 overflow-hidden">
                {/* Tabs Header */}
                <div className="border-b border-gray-100 px-6 pt-4 flex gap-6 overflow-x-auto">
                    {[
                        { id: 'new', label: '新增访客申请' },
                        { id: 'list', label: '访客申请列表' },
                        { id: 'verify', label: '二维码核验' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 px-2 text-sm font-medium transition-all relative ${
                                activeTab === tab.id 
                                ? 'text-primary' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-surface/30 min-h-[600px]">
                    {activeTab === 'new' && (
                        <NewVisitorForm 
                            onSubmit={handleNewApplication} 
                            onSimulateLink={(details) => setGuestTripData(details)}
                        />
                    )}
                    {activeTab === 'list' && (
                        <ApplicationList 
                            applications={applications} 
                            onAction={handleListAction}
                        />
                    )}
                    {activeTab === 'verify' && <QRVerification applications={applications} />}
                </div>
            </div>

            {/* View Detail Modal */}
            <Modal
                isOpen={!!viewApp}
                onClose={() => setViewApp(null)}
                title="访客详情"
            >
                {viewApp && (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">基本信息</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">申请编号：</span>
                                    <span className="font-medium">{viewApp.id}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">申请时间：</span>
                                    <span className="font-medium">{viewApp.applicationDate}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">状态：</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        viewApp.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                        viewApp.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                        viewApp.status === 'Expired' ? 'bg-gray-100 text-gray-600' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {viewApp.status === 'Pending' ? '待审核' :
                                         viewApp.status === 'Approved' ? '已通过' :
                                         viewApp.status === 'Rejected' ? '已拒绝' :
                                         viewApp.status === 'Expired' ? '已过期' : viewApp.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Visit Info */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">拜访信息</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">拜访日期：</span>
                                    <span className="font-medium">{viewApp.visitDate}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">开始时间：</span>
                                    <span className="font-medium">{viewApp.startTime}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">拜访地点：</span>
                                    <span className="font-medium">{viewApp.location}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">预计时长：</span>
                                    <span className="font-medium">{viewApp.duration} 小时</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500 block mb-1">拜访事由：</span>
                                    <p className="font-medium text-gray-800 bg-white p-2 rounded border border-gray-100">{viewApp.purpose}</p>
                                </div>
                                {viewApp.disclaimer && (
                                    <div className="col-span-2 mt-2">
                                        <span className="text-gray-500 block mb-1">免责申明：</span>
                                        <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded whitespace-pre-line">{viewApp.disclaimer}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Visitor List */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">访客名单 ({viewApp.visitors.length}人)</h4>
                            <div className="overflow-hidden border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">证件号码</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {viewApp.visitors.map((v) => (
                                            <tr key={v.id}>
                                                <td className="px-4 py-2 text-sm text-gray-900">{v.name}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{v.phone}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500">{v.idNumber}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                title={confirmAction?.title || '确认'}
                footer={
                    <>
                        <button onClick={() => setConfirmAction(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">取消</button>
                        <button onClick={executeConfirmAction} className={`px-4 py-2 text-white rounded-lg transition-colors shadow-md ${
                            confirmAction?.status === 'Approved' ? 'bg-primary hover:bg-primary-dark shadow-primary/30' : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                        }`}>确定</button>
                    </>
                }
            >
                <div className="py-4 text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${
                        confirmAction?.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                        <i className={`fa ${confirmAction?.status === 'Approved' ? 'fa-check' : 'fa-exclamation'} text-xl`}></i>
                    </div>
                    <p className="text-gray-700 font-medium">{confirmAction?.message}</p>
                </div>
            </Modal>

            {/* QR Code Modal */}
            <Modal 
                isOpen={!!qrModalApp} 
                onClose={() => setQrModalApp(null)} 
                title="访客通行证"
                footer={
                    <button className="text-primary hover:text-primary-dark font-medium text-sm">
                        <i className="fa fa-download mr-1"></i> 下载通行证
                    </button>
                }
            >
                {qrModalApp && (
                    <div className="flex flex-col items-center py-4">
                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm mb-6">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrModalApp.id}&color=10-185-129`} 
                                alt="QR Code" 
                                className="w-48 h-48"
                            />
                        </div>
                        <div className="text-center w-full">
                            <h2 className="text-xl font-bold text-gray-800 mb-1">
                                {qrModalApp.visitors[0].name}
                                {qrModalApp.visitors.length > 1 && <span className="text-sm font-normal text-gray-500 ml-2">(+{qrModalApp.visitors.length -1}人)</span>}
                            </h2>
                            <p className="text-gray-500 text-sm mb-4">{qrModalApp.visitors[0].idNumber}</p>
                            
                            <div className="bg-gray-50 rounded-lg p-4 w-full text-left space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>申请编号:</span>
                                    <span className="font-medium text-gray-800">{qrModalApp.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>拜访日期:</span>
                                    <span className="font-medium text-gray-800">{qrModalApp.visitDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>有效期至:</span>
                                    <span className="font-medium text-gray-800">
                                        {getExpiryDate(qrModalApp.visitDate, qrModalApp.validDays)} 23:59
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>拜访地点:</span>
                                    <span className="font-medium text-gray-800">{qrModalApp.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default App;