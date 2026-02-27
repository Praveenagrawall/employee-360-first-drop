// App-wide constants

export const APP_NAME = 'Employee 360';
export const DEFAULT_PAGE_SIZE = 20;
export const API_BASE_URL = 'http://localhost:8080/api/v1';

export const NAV_ITEMS = [
    { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
    { label: 'Employees', path: '/employees', icon: 'Users' },
    { label: 'Projects', path: '/projects', icon: 'FolderKanban' },
    { label: 'Search', path: '/search', icon: 'Search' },
    { label: 'Org Chart', path: '/org-chart', icon: 'GitBranch' },
] as const;
