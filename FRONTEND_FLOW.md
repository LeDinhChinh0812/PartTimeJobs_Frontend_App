# Tài Liệu Luồng Hoạt Động Frontend (Job Finder App)

Tài liệu này mô tả chi tiết luồng hoạt động, kiến trúc và các điểm kỹ thuật quan trọng của ứng dụng React Native. Dùng để tham khảo và trả lời vấn đáp về đồ án.

---

## 1. Tổng Quan Công Nghệ (Tech Stack) 111

*   **Framework**: React Native (Sử dụng **Expo SDK 50+**).
*   **Ngôn ngữ**: JavaScript (ES6+).
*   **Quản lý Navìgation**: `React Navigation` (Native Stack & Bottom Tabs).
*   **Http Client**: `Axios` (xử lý API).
*   **Lưu trữ Local**: `AsyncStorage` (lưu Token đăng nhập).
*   **Quản lý State**: `React Context API` (`AuthContext`).

---

## 2. Cấu Trúc Dự Án (`src/`)

*   **`config/`**: Chứa cấu hình môi trường (quan trọng nhất là `env.js` chứa `API_BASE_URL` để đổi dynamic URL của backend).
*   **`context/`**: `AuthContext.js` - Quản lý trạng thái đăng nhập toàn cục (biết user là ai, đã login chưa).
*   **`components/`**: Các UI tái sử dụng (Button, Input, JobCard, SearchBar...).
*   **`navigation/`**: `AppNavigator.js` - Nơi định nghĩa các đường dẫn màn hình.
*   **`screens/`**: Chứa giao diện các màn hình chính.
*   **`services/`**: Chứa logic gọi API (tách biệt logic code và logic giao diện).

---

## 3. Luồng Ứng Dụng (User Flow)

### A. Khởi động & Xác thực (Authentication Flow)
1.  **Mở App**: `AppNavigator` kiểm tra `AuthContext`.
    *   Nếu **chưa đăng nhập**: Hiển thị `AuthStack` (Onboarding -> Login/Signup).
    *   Nếu **đã đăng nhập** (Check token trong Storage): Chuyển thẳng vào `MainTabs`.
2.  **Đăng nhập (Login)**:
    *   User nhập Email/Pass -> Gọi API `/api/auth/login`.
    *   Nhận về `AccessToken` và `RefreshToken`.
    *   Lưu vào `AsyncStorage` -> Cập nhật State `isAuthenticated = true`.
3.  **Đăng ký (Signup)**: Gọi API đăng ký -> (Backend tạo user) -> User quay lại Login.

### B. Luồng Chính (Main Features)
Sau khi đăng nhập, App chia làm 4 tab chính:

#### 1. Trang Chủ (Home)
*   **Hiển thị**: Danh mục nghề nghiệp, việc làm nổi bật (Featured), Dashboard nhanh.
*   **Logic**: Gọi API lấy danh sách Job mới nhất.

#### 2. Tìm Việc (Jobs)
*   **Chức năng**: Danh sách việc làm dạng cuộn vô tận (Pagination).
*   **Tìm kiếm & Lọc**:
    *   User gõ từ khóa -> **Debounce** search (đợi ngưng gõ 500ms mới gọi API) để tối ưu hiệu năng.
    *   Bộ lọc (FilterModal): Lọc theo Ngành nghề, Địa điểm, Chuyên môn.

#### 3. Ứng Tuyển (Applications)
*   User xem lại lịch sử ứng tuyển của mình.
*   Trạng thái: *Đang chờ, Đã duyệt, Từ chối*.

#### 4. Hồ Sơ (Profile)
*   **Xem/Sửa thông tin**: Gọi API Profile để lấy data (Học vấn, Kỹ năng...).
*   **CV Preview**:
    *   Tính năng đặc biệt: `CVPreviewScreen`.
    *   Lấy data từ Profile -> Render ra giao diện giống tờ giấy A4 trên Mobile.
    *   Nút "Share": Dùng `Share API` của React Native.

---

## 4. Các Điểm Kỹ Thuật "Ăn Điểm" (Cần nhớ khi vấn đáp)

### 1. Xử lý API ở đâu? (Kiến trúc Layer)
*   **Câu hỏi**: *Code gọi API viết ở đâu?*
*   **Trả lời**: Viết trong thư mục `services/`.
    *   Không viết trực tiếp trong Screen để dễ bảo trì và tái sử dụng code.
    *   Ví dụ: `api.service.js` lo cấu hình, `job.api.js` lo gọi job.

### 2. Axios Interceptors (Quan trọng)
*   **Câu hỏi**: *Làm sao để các request đều có Token mà không cần add thủ công từng cái?*
*   **Trả lời**: Sử dụng **Request Interceptor** trong `api.service.js`.
    *   Tự động chèn `Authorization: Bearer <token>` vào mọi header của request.
*   **Câu hỏi**: *Xử lý khi Token hết hạn (Lỗi 401) thế nào?*
*   **Trả lời**: Sử dụng **Response Interceptor**.
    *   Khi gặp lỗi 401 -> App tự động gọi API `refresh-token` ngầm.
    *   Lấy token mới -> Lưu lại -> Gửi lại request vừa bị lỗi.
    *   User không biết là token đã hết hạn (trải nghiệm mượt mà).

### 3. Tại sao dùng Context API?
*   Để quản lý trạng thái Đăng nhập/User info toàn cục. Bất kỳ màn hình nào (Profile, Home) đều có thể truy cập `user.fullName` mà không cần truyền props qua lại phức tạp.

### 4. Xử lý URL Backend thay đổi (Localtunnel/Ngrok)
*   **Vấn đề**: Backend chạy local, URL đổi liên tục.
*   **Giải pháp**: Tách biến `API_BASE_URL` ra file `src/config/env.js`. Chỉ cần sửa 1 chỗ, toàn bộ App tự cập nhật theo.

---

## 5. Các Màn Hình Chi Tiết

1.  **JobDetailScreen**:
    *   Hiển thị chi tiết Job.
    *   Nút "Ứng tuyển": Kích hoạt `ApplyJobScreen` (nhập Cover Letter).
    *   Check trạng thái: Nếu đã ứng tuyển rồi -> Disable nút (tránh spam).

2.  **EditProfileScreen**:
    *   Form nhập liệu phức tạp (Ngày sinh, Kỹ năng, Link CV).
    *   Xử lý chuỗi Kỹ năng (String "A, B, C" -> Array `[{name: A}, {name: B}]`) trước khi gửi về Server.

3.  **CVPreviewScreen**:
    *   Là màn hình "Render" view thuần túy từ dữ liệu Profile.
    *   Không gọi API, chỉ nhận data từ màn hình trước.

---
Tài liệu này giải thích chi tiết về các hàm gọi API được sử dụng trong ứng dụng Frontend theo từng Module (Service).

---

## 1. Authentication Service (`services/api.service.js`)
Module chịu trách nhiệm xác thực người dùng.

### `login(email, password)`
*   **Mục đích**: Đăng nhập vào hệ thống.
*   **API Endpoint**: `POST /api/auth/login`
*   **Tham số**:
    *   `email`: Email người dùng.
    *   `password`: Mật khẩu.
*   **Kết quả**: Lưu `AccessToken` và `RefreshToken` vào bộ nhớ máy (AsyncStorage).

### `register(fullName, email, password, confirmPassword, phoneNumber)`
*   **Mục đích**: Đăng ký tài khoản mới cho Sinh viên.
*   **API Endpoint**: `POST /api/auth/register`
*   **Tham số**: Thông tin các nhân cơ bản.

### `refreshToken()`
*   **Mục đích**: Lấy `AccessToken` mới khi token cũ hết hạn (thường xảy ra ngầm khi gặp lỗi 401).
*   **API Endpoint**: `POST /api/auth/refresh`
*   **Cơ chế**: Gửi `RefreshToken` hiện có lên server để đổi lấy cặp token mới.

### `logout()`
*   **Mục đích**: Đăng xuất an toàn.
*   **API Endpoint**: `POST /api/auth/revoke`
*   **Hành động**: Hủy token trên server và xóa toàn bộ dữ liệu xác thực ở local.

---

## 2. Job Service (`services/job.api.js`)
Module quản lý việc tìm kiếm và hiển thị công việc.

### `getAllJobs(pageNumber, pageSize)`
*   **Mục đích**: Lấy danh sách công việc mặc định (thường dùng cho trang chủ hoặc màn hình danh sách ban đầu).
*   **API Endpoint**: `GET /api/JobPosts`

### `searchJobs(searchParams)`
*   **Mục đích**: Tìm kiếm nâng cao vơi bộ lọc.
*   **API Endpoint**: `GET /api/JobPosts/search`
*   **Tham số (`searchParams`)**:
    *   `keyword`: Từ khóa tìm kiếm (tên việc, công ty...).
    *   `location`: Địa điểm.
    *   `category`: Ngành nghề.
    *   `workType`: Loại hình (Full-time, Part-time...).
    *   `salaryMin/Max`: Mức lương.

### `getJobById(id)`
*   **Mục đích**: Xem chi tiết một công việc cụ thể.
*   **API Endpoint**: `GET /api/JobPosts/{id}`

---

## 3. Application Service (`services/application.api.js`)
Module quản lý quy trình ứng tuyển.

### `createApplication(jobPostId, coverLetter, resumeUrl)`
*   **Mục đích**: Nộp đơn ứng tuyển cho một công việc.
*   **API Endpoint**: `POST /api/Applications`
*   **Tham số**:
    *   `jobPostId`: ID công việc muốn ứng tuyển.
    *   `coverLetter`: Thư giới thiệu.
    *   `resumeUrl`: Link CV (tùy chọn, nếu không có sẽ dùng CV từ Profile).

### `getMyApplications(pageNumber, pageSize)`
*   **Mục đích**: Xem lịch sử các đơn đã ứng tuyển của bản thân.
*   **API Endpoint**: `GET /api/Applications/me`

### `withdrawApplication(id)`
*   **Mục đích**: Rút đơn ứng tuyển (nếu chưa được duyệt).
*   **API Endpoint**: `POST /api/Applications/{id}/withdraw`

---

## 4. Profile Service (`services/profile.api.js`)
Module quản lý hồ sơ các nhân.

### `getMyProfile()`
*   **Mục đích**: Lấy thông tin hồ sơ chi tiết của người dùng đang đăng nhập.
*   **API Endpoint**: `GET /api/Profiles/me`
*   **Ghi chú**: Nếu chưa tạo hồ sơ, API này có thể trả về 404.

### `createOrUpdateProfile(profileData)`
*   **Mục đích**: Tạo mới hoặc Cập nhật thông tin hồ sơ.
*   **API Endpoint**: `POST /api/Profiles`
*   **Tham số quan trọng**: `skills` (danh sách kỹ năng), `resumeUrl` (link CV), `education`...

### `getProfileById(id)`
*   **Mục đích**: Xem hồ sơ của người khác (dành cho Nhà tuyển dụng - hiện tại Frontend Student chưa dùng nhiều).
*   **API Endpoint**: `GET /api/Profiles/{id}`
