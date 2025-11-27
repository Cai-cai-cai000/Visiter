import React, { useState } from 'react';
import { PlusCircle, Trash2, Calendar, Clock, MapPin, AlertCircle, Sparkles, User, FileText, Upload } from 'lucide-react';
import { Application, Visitor } from '../types';
import { analyzeSecurityRisk } from '../services/geminiService';

interface VisitorFormProps {
    onSubmit: (application: Application) => void;
}

const VisitorForm: React.FC<VisitorFormProps> = ({ onSubmit }) => {
    const [loading, setLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string>('');
    const [formData, setFormData] = useState({
        visitDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        location: '',
        duration: 1,
        purpose: '',
        maxVisitors: 5,
        validDays: 1,
        disclaimer: `访客须知：\n1. 访客进入校园需佩戴访客证，主动配合安保人员检查。\n2. 访客需遵守学校规章制度，保持安静。\n3. 严禁携带易燃易爆等危险物品。`
    });

    const [visitors, setVisitors] = useState<Omit<Visitor, 'id'>[]>([{
        name: '',
        phone: '',
        idType: 'id-card',
        idNumber: '',
        photoUrl: '' // In a real app, this would be a file blob/url
    }]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVisitorChange = (index: number, field: keyof Omit<Visitor, 'id'>, value: string) => {
        const newVisitors = [...visitors];
        newVisitors[index] = { ...newVisitors[index], [field]: value };
        setVisitors(newVisitors);
    };

    const addVisitor = () => {
        if (visitors.length >= formData.maxVisitors) {
            alert(`已达到人数上限 (${formData.maxVisitors}人)`);
            return;
        }
        setVisitors([...visitors, { name: '', phone: '', idType: 'id-card', idNumber: '' }]);
    };

    const removeVisitor = (index: number) => {
        if (visitors.length <= 1) return;
        const newVisitors = visitors.filter((_, i) => i !== index);
        setVisitors(newVisitors);
    };

    const handleAIAnalysis = async () => {
        if (!formData.purpose || !formData.location) {
            alert("请先填写拜访地点和事由");
            return;
        }
        setLoading(true);
        try {
            const analysis = await analyzeSecurityRisk(formData.purpose, formData.location, visitors.length);
            setAiAnalysis(analysis);
        } catch (error) {
            console.error(error);
            setAiAnalysis("分析失败，请稍后重试。");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Simple Validation
        if (!formData.visitDate || !formData.purpose || !formData.location) {
            alert("请填写必填项");
            return;
        }

        const newApp: Application = {
            id: `VS${new Date().getFullYear()}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
            ...formData,
            visitors: visitors.map((v, i) => ({ ...v, id: `v-${Date.now()}-${i}` })),
            status: 'pending',
            createdAt: new Date().toLocaleString(),
            aiRiskAnalysis: aiAnalysis
        };

        onSubmit(newApp);
        
        // Reset (Optional, simplistic reset)
        setAiAnalysis('');
        setFormData(prev => ({...prev, location: '', purpose: ''}));
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">拜访日期 <span className="text-danger">*</span></label>
                    <div className="relative">
                        <input type="date" name="visitDate" value={formData.visitDate} onChange={handleInputChange} required className="w-full px-4 py-2 bg-surface-card border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">开始时间 <span className="text-danger">*</span></label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required className="w-full px-4 py-2 bg-surface-card border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">拜访地点 <span className="text-danger">*</span></label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="例如：行政楼201" required className="w-full pl-10 pr-4 py-2 bg-surface-card border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">时长（小时） <span className="text-danger">*</span></label>
                    <input type="number" name="duration" min="1" max="8" value={formData.duration} onChange={handleInputChange} required className="w-full px-4 py-2 bg-surface-card border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                </div>
            </div>

            {/* Purpose & AI */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-text-secondary mb-1">拜访事由 <span className="text-danger">*</span></label>
                <div className="relative">
                    <textarea name="purpose" rows={3} value={formData.purpose} onChange={handleInputChange} placeholder="请详细描述拜访目的" required className="w-full px-4 py-2 bg-surface-card border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none mb-2"></textarea>
                    
                    <button 
                        type="button" 
                        onClick={handleAIAnalysis}
                        disabled={loading}
                        className="absolute bottom-4 right-2 text-xs bg-primary text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-primary-dark transition-colors"
                    >
                        <Sparkles size={12} />
                        {loading ? 'AI分析中...' : 'AI安全评估'}
                    </button>
                </div>
                {aiAnalysis && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800 flex items-start gap-2">
                         <AlertCircle size={16} className="mt-0.5 shrink-0" />
                         <div>
                            <span className="font-semibold block mb-1">AI 评估报告:</span>
                            {aiAnalysis}
                         </div>
                    </div>
                )}
            </div>

            {/* Visitors */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-text-secondary">访客信息 ({visitors.length})</h3>
                    <button type="button" onClick={addVisitor} className="flex items-center px-3 py-1.5 text-xs text-primary border border-primary rounded-lg hover:bg-primary/10 transition-all">
                        <PlusCircle size={14} className="mr-1" />
                        添加访客
                    </button>
                </div>

                <div className="space-y-4">
                    {visitors.map((visitor, idx) => (
                        <div key={idx} className="bg-surface rounded-lg p-4 relative border border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-gray-500">访客 #{idx + 1}</span>
                                {visitors.length > 1 && (
                                    <button type="button" onClick={() => removeVisitor(idx)} className="text-danger hover:bg-danger/10 p-1 rounded">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-text-light">姓名</label>
                                    <input type="text" value={visitor.name} onChange={(e) => handleVisitorChange(idx, 'name', e.target.value)} required className="w-full mt-1 px-3 py-2 bg-surface-card border border-gray-300 rounded focus:border-primary outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-light">手机号</label>
                                    <input type="tel" value={visitor.phone} onChange={(e) => handleVisitorChange(idx, 'phone', e.target.value)} required className="w-full mt-1 px-3 py-2 bg-surface-card border border-gray-300 rounded focus:border-primary outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-light">证件号</label>
                                    <input type="text" value={visitor.idNumber} onChange={(e) => handleVisitorChange(idx, 'idNumber', e.target.value)} required className="w-full mt-1 px-3 py-2 bg-surface-card border border-gray-300 rounded focus:border-primary outline-none text-sm" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark shadow-md hover:shadow-lg transition-all font-medium">
                    提交申请
                </button>
            </div>
        </form>
    );
};

export default VisitorForm;