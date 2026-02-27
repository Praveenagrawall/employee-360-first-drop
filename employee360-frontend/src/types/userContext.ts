export interface UserContext {
    employeeId: number;
    fullName: string;
    empCode: string;
    email: string;
    designation: string;
    designationLevel: number;
    dashboardType: 'INDIVIDUAL' | 'MANAGER' | 'LEADERSHIP';
    department: string;
    location: string;
    profilePicUrl: string | null;
    permissions: string[];
    isActive: boolean;
}
