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
    INTERVIEW_SCHEDULED: 'Interview Scheduled',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
};

// Application Status Colors
export const STATUS_COLORS = {
    'Pending': '#FFA500',
    'Reviewing': '#2196F3',
    'Shortlisted': '#9C27B0',
    'Interview Scheduled': '#00BCD4',
    'Approved': '#4CAF50',
    'Rejected': '#F44336',
    'Withdrawn': '#9E9E9E',
};

// Application Status Vietnamese
export const STATUS_LABELS = {
    'Pending': 'Đang chờ',
    'Reviewing': 'Đang xem xét',
    'Shortlisted': 'Lọt vòng trong',
    'Interview Scheduled': 'Đã hẹn phỏng vấn',
    'Approved': 'Đã chấp nhận',
    'Rejected': 'Bị từ chối',
    'Withdrawn': 'Đã rút',
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
