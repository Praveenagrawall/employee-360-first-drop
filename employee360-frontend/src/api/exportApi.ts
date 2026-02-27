import axiosInstance from './axiosInstance';

// ─── Triggers a browser download from an API response ─────────────────────────
async function downloadBlob(url: string, filename: string) {
    const response = await axiosInstance.get(url, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
}

export const exportApi = {
    downloadEmployeeReport: (employeeId: number) =>
        downloadBlob(`/employees/${employeeId}/report`, `employee-${employeeId}-report.json`),

    downloadTeamCsv: (managerId: number) =>
        downloadBlob(`/employees/${managerId}/team-csv`, `team-report-${managerId}.csv`),
};
