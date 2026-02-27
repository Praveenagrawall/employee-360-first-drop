import React, { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { Modal, Button, SearchBar } from '../common';
import { useCreateProject } from '../../hooks/useProject';
import { useEmployeeFilter } from '../../hooks/useEmployee';
import { PROJECT_TYPE, PROJECT_STATUS } from '../../types/enums';
import toast from 'react-hot-toast';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const createProjectMutation = useCreateProject();
    const [managerSearch, setManagerSearch] = useState('');

    // Fetch potential managers (Level 4+)
    const { data: managersData } = useEmployeeFilter({
        query: managerSearch,
        minLevel: 4
    }, 0, 10);
    const managers = managersData?.content || [];

    const [form, setForm] = useState({
        projectCode: '',
        name: '',
        description: '',
        type: PROJECT_TYPE.CLIENT,
        status: PROJECT_STATUS.ACTIVE,
        clientName: '',
        startDate: '',
        endDate: '',
        engagementManagerId: 0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        const newErrors: Record<string, string> = {};
        if (!form.projectCode) newErrors.projectCode = 'Project code is required';
        if (!form.name) newErrors.name = 'Project name is required';
        if (!form.startDate) newErrors.startDate = 'Start date is required';
        if (form.engagementManagerId === 0) newErrors.engagementManagerId = 'Engagement manager is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await createProjectMutation.mutateAsync({
                ...form,
                endDate: form.endDate || undefined,
                description: form.description || undefined,
                clientName: form.clientName || undefined
            });
            toast.success('Project created successfully');
            onClose();
            // Reset form
            setForm({
                projectCode: '',
                name: '',
                description: '',
                type: PROJECT_TYPE.CLIENT,
                status: PROJECT_STATUS.ACTIVE,
                clientName: '',
                startDate: '',
                endDate: '',
                engagementManagerId: 0
            });
        } catch (error) {
            console.error('Failed to create project:', error);
            toast.error('Failed to create project');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Project Code *</label>
                        <input
                            type="text"
                            className={cn(
                                "w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-brand-500 transition-all outline-none",
                                errors.projectCode ? "border-red-500" : "border-gray-200"
                            )}
                            placeholder="e.g. KPMG-IND-001"
                            value={form.projectCode}
                            onChange={e => setForm({ ...form, projectCode: e.target.value })}
                        />
                        {errors.projectCode && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.projectCode}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Project Name *</label>
                        <input
                            type="text"
                            className={cn(
                                "w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-brand-500 transition-all outline-none",
                                errors.name ? "border-red-500" : "border-gray-200"
                            )}
                            placeholder="e.g. KPMG Digital Transformation"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                        {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Project Type *</label>
                        <select
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value as any })}
                        >
                            {Object.values(PROJECT_TYPE).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Client Name</label>
                        <input
                            type="text"
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                            placeholder="e.g. KPMG International"
                            value={form.clientName}
                            onChange={e => setForm({ ...form, clientName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Start Date *</label>
                        <input
                            type="date"
                            className={cn(
                                "w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-brand-500 transition-all outline-none",
                                errors.startDate ? "border-red-500" : "border-gray-200"
                            )}
                            value={form.startDate}
                            onChange={e => setForm({ ...form, startDate: e.target.value })}
                        />
                        {errors.startDate && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.startDate}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">End Date (Optional)</label>
                        <input
                            type="date"
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                            value={form.endDate}
                            onChange={e => setForm({ ...form, endDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Engagement Manager *</label>
                    <div className="space-y-2">
                        <SearchBar
                            placeholder="Search for a manager..."
                            onSearch={setManagerSearch}
                            className="mb-2"
                        />
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                            {managers.map(m => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setForm({ ...form, engagementManagerId: m.id })}
                                    className={cn(
                                        "flex flex-col items-start p-2 border rounded-lg text-left transition-all",
                                        form.engagementManagerId === m.id
                                            ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                                            : "border-gray-100 hover:border-gray-300"
                                    )}
                                >
                                    <span className="text-sm font-bold text-gray-900">{m.fullName}</span>
                                    <span className="text-xs text-gray-500">{m.designationName}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    {errors.engagementManagerId && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.engagementManagerId}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Description</label>
                    <textarea
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 transition-all outline-none min-h-[100px]"
                        placeholder="Provide a brief overview of the project..."
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={createProjectMutation.isPending}
                        className="bg-brand-600 hover:bg-brand-700 text-white"
                        leftIcon={<Save className="w-4 h-4" />}
                    >
                        Create Project
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

// Helper function to concatenate classes (assuming cn utility exists)
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
