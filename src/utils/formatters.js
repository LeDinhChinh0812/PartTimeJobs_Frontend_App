/**
 * Tiện ích định dạng
 * Các hàm hỗ trợ định dạng dữ liệu
 */

/**
 * Định dạng mức lương
 * @param {number} min - Minimum salary
 * @param {number} max - Maximum salary
 * @param {string} period - Salary period (Monthly, Hourly, etc.)
 * @returns {string} Formatted salary string
 */
export const formatSalary = (min, max, period = 'Monthly') => {
    if (!min && !max) {
        return 'Thỏa thuận';
    }

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(0)}K`;
        }
        return num.toString();
    };

    if (min && max) {
        return `${formatNumber(min)} - ${formatNumber(max)} VNĐ/${period === 'Monthly' ? 'tháng' : 'giờ'}`;
    }
    if (min) {
        return `Từ ${formatNumber(min)} VNĐ/${period === 'Monthly' ? 'tháng' : 'giờ'}`;
    }
    if (max) {
        return `Lên đến ${formatNumber(max)} VNĐ/${period === 'Monthly' ? 'tháng' : 'giờ'}`;
    }
};

/**
 * Định dạng ngày theo chuẩn Việt Nam
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return '';

    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Định dạng thời gian tương đối (VD: "2 ngày trước")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    if (!date) return '';

    const now = new Date();
    const then = new Date(date);
    const diffInMs = now - then;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMinutes < 1) {
        return 'Vừa xong';
    }
    if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
    }
    if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
    }
    if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
    }
    if (diffInWeeks < 4) {
        return `${diffInWeeks} tuần trước`;
    }
    if (diffInMonths < 12) {
        return `${diffInMonths} tháng trước`;
    }
    return formatDate(date);
};

/**
 * Cắt ngắn văn bản theo độ dài tối đa
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

/**
 * Định dạng khoảng thời gian
 * @param {string} startTime - Start time (HH:mm)
 * @param {string} endTime - End time (HH:mm)
 * @returns {string} Formatted time range
 */
export const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    return `${startTime} - ${endTime}`;
};

/**
 * Định dạng các ngày trong tuần
 * @param {Array<string>} days - Array of day names
 * @returns {string} Formatted days string
 */
export const formatDaysOfWeek = (days) => {
    if (!days || days.length === 0) return '';

    const dayMap = {
        'Monday': 'T2',
        'Tuesday': 'T3',
        'Wednesday': 'T4',
        'Thursday': 'T5',
        'Friday': 'T6',
        'Saturday': 'T7',
        'Sunday': 'CN'
    };

    return days.map(day => dayMap[day] || day).join(', ');
};
