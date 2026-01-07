/**
 * DỮ LIỆU GIẢ LẬP ĐỂ TEST CHAT
 * Sử dụng file này để test giao diện chat khi không có backend
 */

export const MOCK_CONVERSATIONS = [
    {
        id: 'conv_1',
        participant_id: 'user_2',
        participant_name: 'Công ty ABC Technology',
        participant_avatar: null,
        last_message: 'Chúng tôi rất quan tâm đến hồ sơ của bạn và muốn mời bạn tham gia phỏng vấn.',
        last_message_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        unread_count: 3,
        is_online: true,
    },
    {
        id: 'conv_2',
        participant_id: 'user_3',
        participant_name: 'Nguyễn Văn Minh - HR Manager',
        participant_avatar: null,
        last_message: 'Bạn có thể tham gia phỏng vấn vào thứ 5 tuần sau không?',
        last_message_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        unread_count: 0,
        is_online: false,
    },
    {
        id: 'conv_3',
        participant_id: 'user_4',
        participant_name: 'XYZ Corporation',
        participant_avatar: null,
        last_message: 'Cảm ơn bạn đã ứng tuyển. Chúng tôi sẽ liên hệ lại trong vòng 3 ngày.',
        last_message_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        unread_count: 0,
        is_online: false,
    },
    {
        id: 'conv_4',
        participant_id: 'user_5',
        participant_name: 'Trần Thị Lan - Recruiter',
        participant_avatar: null,
        last_message: 'Xin chào! Tôi có một cơ hội việc làm phù hợp với bạn.',
        last_message_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        unread_count: 1,
        is_online: true,
    },
];

export const MOCK_MESSAGES = {
    conv_1: [
        {
            id: 'msg_1',
            conversation_id: 'conv_1',
            sender_id: 'user_2',
            message: 'Xin chào! Tôi là HR của công ty ABC Technology.',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_read: true,
        },
        {
            id: 'msg_2',
            conversation_id: 'conv_1',
            sender_id: 'current_user',
            message: 'Chào anh! Em rất vui được nhận được tin nhắn từ anh.',
            created_at: new Date(Date.now() - 3500000).toISOString(),
            is_read: true,
        },
        {
            id: 'msg_3',
            conversation_id: 'conv_1',
            sender_id: 'user_2',
            message: 'Chúng tôi rất ấn tượng với hồ sơ của bạn, đặc biệt là kinh nghiệm về React Native.',
            created_at: new Date(Date.now() - 3400000).toISOString(),
            is_read: true,
        },
        {
            id: 'msg_4',
            conversation_id: 'conv_1',
            sender_id: 'user_2',
            message: 'Bạn có thể sắp xếp thời gian để tham gia một buổi phỏng vấn online không?',
            created_at: new Date(Date.now() - 3300000).toISOString(),
            is_read: true,
        },
        {
            id: 'msg_5',
            conversation_id: 'conv_1',
            sender_id: 'current_user',
            message: 'Dạ em hoàn toàn có thể ạ. Em có thể linh hoạt thời gian trong tuần này.',
            created_at: new Date(Date.now() - 3200000).toISOString(),
            is_read: true,
        },
        {
            id: 'msg_6',
            conversation_id: 'conv_1',
            sender_id: 'user_2',
            message: 'Tuyệt vời! Chúng tôi sẽ gửi lịch phỏng vấn chi tiết qua email. Bạn hãy kiểm tra email nhé.',
            created_at: new Date(Date.now() - 3100000).toISOString(),
            is_read: false,
        },
        {
            id: 'msg_7',
            conversation_id: 'conv_1',
            sender_id: 'user_2',
            message: 'Chúng tôi rất quan tâm đến hồ sơ của bạn và muốn mời bạn tham gia phỏng vấn.',
            created_at: new Date(Date.now() - 1800000).toISOString(),
            is_read: false,
        },
    ],
    conv_2: [
        {
            id: 'msg_8',
            conversation_id: 'conv_2',
            sender_id: 'user_3',
            message: 'Chào bạn! Tôi là Minh, HR Manager tại công ty.',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            is_read: true,
        },
        {
            id: 'msg_9',
            conversation_id: 'conv_2',
            sender_id: 'current_user',
            message: 'Chào anh Minh! Em rất vui được làm quen.',
            created_at: new Date(Date.now() - 86300000).toISOString(),
            is_read: true,
        },
        {
            id: 'msg_10',
            conversation_id: 'conv_2',
            sender_id: 'user_3',
            message: 'Bạn có thể tham gia phỏng vấn vào thứ 5 tuần sau không?',
            created_at: new Date(Date.now() - 7200000).toISOString(),
            is_read: true,
        },
    ],
};

export const MOCK_AI_RESPONSES = {
    'tìm việc': {
        reply: 'Tôi có thể giúp bạn tìm việc làm phù hợp! Để đưa ra gợi ý tốt nhất, bạn có thể cho tôi biết:\n\n1. Lĩnh vực/ngành nghề bạn quan tâm?\n2. Số năm kinh nghiệm của bạn?\n3. Mức lương mong muốn?\n4. Địa điểm làm việc ưa thích?',
        suggestions: [
            'Tôi có 2 năm kinh nghiệm React Native',
            'Tìm việc ở TP.HCM',
            'Full-time developer positions',
        ],
    },
    'cv': {
        reply: 'Tôi có thể giúp bạn cải thiện CV! Một CV tốt cần có:\n\n✅ Thông tin cá nhân rõ ràng\n✅ Tóm tắt nghề nghiệp (Career Summary)\n✅ Kinh nghiệm làm việc với thành tích cụ thể\n✅ Kỹ năng chuyên môn\n✅ Học vấn & chứng chỉ\n✅ Dự án đã thực hiện\n\nBạn muốn tôi tư vấn phần nào?',
        suggestions: [
            'Cách viết Career Summary',
            'Làm nổi bật kỹ năng React Native',
            'Mô tả dự án đã làm',
        ],
    },
    'phỏng vấn': {
        reply: 'Chuẩn bị phỏng vấn hiệu quả:\n\n🎯 Trước phỏng vấn:\n• Tìm hiểu kỹ về công ty\n• Xem lại JD và chuẩn bị câu trả lời\n• Chuẩn bị câu hỏi cho nhà tuyển dụng\n• Ăn mặc phù hợp\n\n💡 Trong phỏng vấn:\n• Tự tin, rõ ràng\n• Đưa ra ví dụ cụ thể\n• Lắng nghe kỹ câu hỏi\n• Body language tích cực\n\n📝 Sau phỏng vấn:\n• Gửi email cảm ơn\n• Follow up sau 3-5 ngày\n\nBạn cần tư vấn cụ thể về mảng nào?',
        suggestions: [
            'Câu hỏi phỏng vấn React Native',
            'Cách trả lời về điểm yếu',
            'Cách đàm phán lương',
        ],
    },
    'default': {
        reply: 'Xin chào! Tôi là AI Assistant của bạn. Tôi có thể giúp bạn:\n\n🔍 Tìm kiếm việc làm phù hợp\n📄 Tư vấn cải thiện CV\n🎯 Chuẩn bị phỏng vấn\n💼 Tư vấn nghề nghiệp\n\nBạn cần hỗ trợ gì?',
        suggestions: [
            'Tìm việc làm phù hợp',
            'Cải thiện CV của tôi',
            'Chuẩn bị phỏng vấn',
        ],
    },
};

// Hàm hỗ trợ lấy phản hồi AI giả lập
export const getMockAIResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('việc') || lowerMessage.includes('job')) {
        return MOCK_AI_RESPONSES['tìm việc'];
    } else if (lowerMessage.includes('cv') || lowerMessage.includes('resume')) {
        return MOCK_AI_RESPONSES['cv'];
    } else if (lowerMessage.includes('phỏng vấn') || lowerMessage.includes('interview')) {
        return MOCK_AI_RESPONSES['phỏng vấn'];
    }

    return MOCK_AI_RESPONSES['default'];
};

// Xuất để sử dụng trong các dịch vụ
export default {
    MOCK_CONVERSATIONS,
    MOCK_MESSAGES,
    MOCK_AI_RESPONSES,
    getMockAIResponse,
};
