/**
 * Application Constants
 * Centralized constants for the app
 */

// Work Types
export const WORK_TYPES = [
    { label: 'Tất cả', value: '' },
    { label: 'Toàn thời gian', value: 'Full-time' },
    { label: 'Bán thời gian', value: 'Part-time' },
    { label: 'Thực tập', value: 'Internship' },
    { label: 'Freelance', value: 'Freelance' },
    { label: 'Hợp đồng', value: 'Contract' },
];

// Job Categories
export const JOB_CATEGORIES = [
    { label: 'Tất cả', value: '' },
    { label: 'IT & Công nghệ', value: 'IT' },
    { label: 'Kinh doanh', value: 'Business' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Thiết kế', value: 'Design' },
    { label: 'Giáo dục', value: 'Education' },
    { label: 'Y tế', value: 'Healthcare' },
    { label: 'Dịch vụ khách hàng', value: 'Customer Service' },
    { label: 'Kế toán', value: 'Accounting' },
    { label: 'Nhân sự', value: 'HR' },
    { label: 'Khác', value: 'Other' },
];

// Application Status
export const APPLICATION_STATUS = {
    PENDING: 'Pending',
    REVIEWING: 'Reviewing',
    SHORTLISTED: 'Shortlisted',
    INTERVIEWING: 'Interviewing',
    OFFERED: 'Offered',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
    EXPIRED: 'Expired',
};

// Application Status Colors
export const STATUS_COLORS = {
    'Pending': '#FFA500',        // Orange
    'Reviewing': '#2196F3',      // Blue
    'Shortlisted': '#9C27B0',    // Purple
    'Interviewing': '#00BCD4',   // Cyan
    'Offered': '#8BC34A',        // Light Green
    'Accepted': '#4CAF50',       // Green
    'Rejected': '#F44336',       // Red
    'Withdrawn': '#9E9E9E',      // Grey
    'Expired': '#607D8B',        // Blue Grey
};

// Application Status Vietnamese
export const STATUS_LABELS = {
    'Pending': 'Đang chờ',
    'Reviewing': 'Đang xem xét',
    'Shortlisted': 'Lọt vòng trong',
    'Interviewing': 'Đang phỏng vấn',
    'Interview Scheduled': 'Đang phỏng vấn', // Backward compatibility
    'Offered': 'Đề nghị việc làm',
    'Accepted': 'Đã nhận việc',
    'Rejected': 'Bị từ chối',
    'Withdrawn': 'Đã rút',
    'Expired': 'Hết hạn',
};

// Map ID to Status Name
export const STATUS_MAPPING = {
    1: 'Pending',
    2: 'Reviewing',
    3: 'Shortlisted',
    4: 'Interviewing',
    5: 'Offered',
    6: 'Accepted',
    7: 'Rejected',
    8: 'Withdrawn',
    9: 'Expired',
};

// Salary Periods
export const SALARY_PERIODS = [
    { label: 'Tháng', value: 'Monthly' },
    { label: 'Giờ', value: 'Hourly' },
    { label: 'Ngày', value: 'Daily' },
    { label: 'Dự án', value: 'Project' },
];

// Gender Options
export const GENDER_OPTIONS = [
    { label: 'Nam', value: 0 },
    { label: 'Nữ', value: 1 },
    { label: 'Khác', value: 2 },
];

// Year of Study Options
export const YEAR_OF_STUDY_OPTIONS = [
    { label: 'Năm 1', value: 1 },
    { label: 'Năm 2', value: 2 },
    { label: 'Năm 3', value: 3 },
    { label: 'Năm 4', value: 4 },
    { label: 'Năm 5', value: 5 },
];

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 1;

// API
export const API_TIMEOUT = 10000;
