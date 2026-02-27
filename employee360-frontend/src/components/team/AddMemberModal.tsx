import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { Modal, Button, SearchBar } from '../common';
import { useEmployeeFilter, useAddTeamMember } from '../../hooks';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: number;
    teamName: string;
}

export function AddMemberModal({ isOpen, onClose, teamId, teamName }: AddMemberModalProps) {
    const addMemberMutation = useAddTeamMember();
    const [search, setSearch] = useState('');
    const { data: employeesData } = useEmployeeFilter({ query: search }, 0, 10);
    const employees = employeesData?.content || [];

    const [form, setForm] = useState({
        employeeId: 0,
        roleInTeam: '',
        allocationPercentage: 100, // Changed from allocation to allocationPercentage
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.employeeId === 0) {
            setErrors({ employeeId: 'Please select an employee' });
            return;
        }

        try {
            await addMemberMutation.mutateAsync({
                teamId,
                employeeId: form.employeeId,
                roleInTeam: form.roleInTeam,
                allocationPercentage: form.allocationPercentage, // Changed from allocation to allocationPercentage
                startDate: form.startDate
            });
            toast.success('Member added successfully');
            onClose();
        } catch (error) {
            console.error('Failed to add member:', error);
            toast.error('Failed to add member');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Add Member to ${teamName}`} size="md">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select Employee *</label>
                        <SearchBar
                            placeholder="Search by name or code..."
                            onSearch={setSearch}
                            className="mb-2"
                        />
                        <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                            {employees.map(emp => (
                                <button
                                    key={emp.id}
                                    type="button"
                                    onClick={() => {
                                        setForm({ ...form, employeeId: emp.id });
                                        setErrors({});
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 transition-all text-left",
                                        form.employeeId === emp.id
                                            ? "bg-brand-50 ring-2 ring-inset ring-brand-500"
                                            : "hover:bg-gray-50"
                                    )}
                                >
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{emp.fullName}</p>
                                        <p className="text-xs text-gray-500">{emp.empCode} • {emp.designationName}</p>
                                    </div>
                                    {form.employeeId === emp.id && (
                                        <div className="w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center">
                                            <X className="w-3 h-3 text-white rotate-45" />
                                        </div>
                                    )}
                                </button>
                            ))}
                            {employees.length === 0 && (
                                <p className="p-4 text-center text-sm text-gray-400 italic">No employees found</p>
                            )}
                        </div>
                        {errors.employeeId && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.employeeId}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Role in Team</label>
                            <input
                                type="text"
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="e.g. Lead Developer"
                                value={form.roleInTeam}
                                onChange={e => setForm({ ...form, roleInTeam: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Allocation %</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                value={form.allocationPercentage} // Changed from allocation to allocationPercentage
                                onChange={e => setForm({ ...form, allocationPercentage: parseInt(e.target.value) || 0 })} // Changed from allocation to allocationPercentage
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Start Date *</label>
                            <input
                                type="date"
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                value={form.startDate}
                                onChange={e => setForm({ ...form, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">End Date</label>
                            <input
                                type="date"
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                value={form.endDate}
                                onChange={e => setForm({ ...form, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={addMemberMutation.isPending}
                        className="bg-brand-600 hover:bg-brand-700 text-white"
                        leftIcon={<UserPlus className="w-4 h-4" />}
                    >
                        Add Member
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
