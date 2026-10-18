# Ứng Dụng Quản Lý Khóa Học (Course Management App)

> **Môn học**: Phát triển ứng dụng di động  
> **Nền tảng**: React Native (Expo SDK 57 + TypeScript + Expo Router)  
> **Backend REST API**: [MockAPI.io](https://mockapi.io)  

---

## 1. Thông Tin Dự Án & MockAPI Endpoint

- **MockAPI Base URL**:  
  `https://6ad53af748476c0785d97013.mockapi.io/api/v1`
- **Tài nguyên (Resources)**:
  - `GET/POST /categories`: Danh sách & thêm danh mục
  - `GET/PUT/DELETE /categories/:id`: Chi tiết, sửa & xóa danh mục
  - `GET/POST /courses`: Danh sách & thêm khóa học
  - `GET/PUT/DELETE /courses/:id`: Chi tiết, sửa & xóa khóa học

---

## 2. Cấu Trúc Mã Nguồn

```text
buoi 5/
├── assets/                    # Biểu tượng, hình ảnh ứng dụng, splash screen
├── src/
│   ├── app/                   # Các màn hình ứng dụng (Expo Router)
│   │   ├── _layout.tsx        # Cấu hình Stack Navigation & Header chung
│   │   ├── index.tsx          # (1) Màn hình Danh sách khóa học (Search, Filter, List)
│   │   ├── categories/
│   │   │   └── index.tsx      # (4) Màn hình Quản lý danh mục (CRUD + Ràng buộc xóa)
│   │   └── course/
│   │       ├── [id].tsx       # (2) Màn hình Chi tiết khóa học & Phát video trailer
│   │       └── form.tsx       # (3) Màn hình Form Thêm / Sửa khóa học
│   ├── components/            # Các component tái sử dụng
│   │   ├── CategoryModal.tsx  # Modal thêm/sửa danh mục
│   │   ├── CategoryPills.tsx  # Thanh cuộn ngang lọc khóa học theo danh mục
│   │   ├── CourseCard.tsx     # Card hiển thị khóa học trong danh sách
│   │   ├── EmptyState.tsx     # Trạng thái danh sách rỗng
│   │   ├── ErrorView.tsx      # Giao diện thông báo lỗi kết nối & nút Thử lại
│   │   ├── ImageWithFallback.tsx # Hiển thị ảnh bìa từ URL với loading & fallback
│   │   ├── LoadingIndicator.tsx # Vòng xoay tải dữ liệu
│   │   └── VideoPlayerModal.tsx # Trình phát video trailer (MP4 trực tiếp & YouTube)
│   ├── constants/             # Hằng số hệ thống
│   │   ├── api.ts             # Cấu hình MockAPI URL và endpoints
│   │   ├── colors.ts          # Bảng màu sắc & theme danh mục
│   │   └── sampleMedia.ts     # Danh sách ảnh & video trailer mẫu để test nhanh
│   ├── services/
│   │   └── api.ts             # ApiService xử lý toàn bộ các hàm gọi REST API (CRUD)
│   └── types/
│       └── index.ts           # Định nghĩa kiểu dữ liệu Category, Course, FormData
├── app.json                   # Cấu hình dự án Expo
├── metro.config.js            # Cấu hình Metro Bundler
├── package.json               # Thư viện và kịch bản chạy ứng dụng
└── tsconfig.json              # Cấu hình TypeScript
```

---

## 3. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu cầu hệ thống:
- Đã cài đặt **Node.js** (khuyến nghị phiên bản 18+ hoặc 20+)
- Đã cài đặt **npm** hoặc **yarn**

### Các bước khởi chạy:

1. **Mở terminal** và di chuyển vào thư mục `buoi 5`:
   ```bash
   cd "buoi 5"
   ```

2. **Cài đặt thư viện** (nếu chưa có `node_modules`):
   ```bash
   npm install
   ```

3. **Chạy ứng dụng**:
   - **Chạy trên Trình duyệt Web (khuyến nghị để test và chấm nhanh)**:
     ```bash
     npm run web
     ```
     Trình duyệt sẽ tự động mở tại địa chỉ `http://localhost:8081`.

   - **Chạy trên Máy ảo Android (Android Studio Emulator)**:
     ```bash
     npm run android
     ```

   - **Chạy bằng Expo Go trên điện thoại thật**:
     ```bash
     npm run start
     ```
     Sau đó dùng ứng dụng **Expo Go** trên điện thoại quét mã QR hiển thị trong terminal.

---

## 4. Chi Tiết Các Chức Năng Đạt Được

### 4.1. Màn hình Danh sách khóa học (`/`)
- Gọi REST API `GET /courses` và `GET /categories` để lấy dữ liệu thời gian thực từ MockAPI.
- Mỗi khóa học hiển thị: Ảnh bìa (URL thực tế), Tiêu đề, Tên giảng viên, Tên danh mục (lấy động từ API theo `categoryId`, không hardcode), Thời lượng học và Học phí định dạng tiền tệ VNĐ (`formatPrice`).
- **Tìm kiếm**: Tìm kiếm khóa học theo tên tức thời (real-time filtering), có nút xóa nhanh từ khóa (✕).
- **Lọc theo danh mục**: Thanh cuộn Category Pills hiển thị danh mục "Tất cả" kèm số lượng và từng danh mục được tải từ API.
- **Kéo để làm mới (Pull to refresh)**: Vuốt xuống để đồng bộ lại dữ liệu mới nhất từ MockAPI.
- **Xử lý trạng thái**: Có spinner Loading, màn hình báo lỗi khi mất kết nối có nút "Thử lại", và trạng thái Empty khi không có kết quả phù hợp.
- Nút bấm truy cập nhanh:
  - Nút **"📁 Danh mục"** trên thanh tiêu đề để mở màn hình Quản lý danh mục.
  - Nút **"＋" (Floating Action Button)** góc dưới để thêm khóa học mới.

### 4.2. Màn hình Chi tiết khóa học (`/course/[id]`)
- Gọi API `GET /courses/:id` và tra cứu danh mục tương ứng qua `categoryId`.
- Hiển thị đầy đủ thông tin: Ảnh bìa lớn, Tiêu đề, Học phí, Giảng viên, Thời lượng, Ngày tạo, Mô tả chi tiết khóa học và thông tin danh mục.
- **Phát video trailer**: Nút **"▶ Xem Video Trailer"** mở modal phát video trực tiếp trong ứng dụng:
  - Hỗ trợ xem các video MP4 trực tiếp (HTML5 video player).
  - Hỗ trợ nhúng và phát video YouTube (thông qua link YouTube dạng `watch?v=...` hoặc `youtu.be/...`).
  - Hỗ trợ liên kết mở nguồn ngoài.
- **Thao tác Sửa**: Chuyển hướng sang màn hình Form để cập nhật thông tin.
- **Thao tác Xóa**: Có hộp thoại xác nhận (Alert / Confirm) trước khi gửi yêu cầu `DELETE /courses/:id`, thông báo kết quả và tự động điều hướng về danh sách khóa học.

### 4.3. Màn hình Form Thêm / Sửa khóa học (`/course/form`)
- Tự động nhận diện chế độ **Thêm mới** hoặc **Chỉnh sửa** dựa vào query param `id`.
- Danh mục khóa học được tải từ API `GET /categories` và hiển thị dưới dạng nút chọn trực quan (không hardcode).
- **Xem trước ảnh bìa (Live Preview)**: Hiển thị ngay ảnh xem trước khi người dùng nhập hoặc thay đổi URL ảnh.
- **Gợi ý nhanh dữ liệu mẫu**: Cung cấp các nút chọn nhanh ảnh Unsplash chất lượng cao và các URL trailer MP4 / YouTube hợp lệ để kiểm thử thuận tiện.
- **Kiểm tra dữ liệu hợp lệ (Validation)**:
  - Bắt buộc nhập đầy đủ tất cả các trường.
  - Học phí phải là số không âm (`>= 0 VNĐ`).
  - Thời lượng học phải là số lớn hơn 0 (`> 0 giờ`).
  - `categoryId` phải tồn tại trong danh sách danh mục của hệ thống.
  - URL ảnh và video phải hợp lệ (bắt đầu bằng `http://` hoặc `https://`).
- Gửi `POST /courses` (thêm mới) hoặc `PUT /courses/:id` (cập nhật) và tự động đồng bộ lại danh sách.

### 4.4. Màn hình Quản lý danh mục (`/categories`)
- Hiển thị danh sách tất cả các danh mục từ `GET /categories`.
- Hiển thị số lượng khóa học hiện thuộc về từng danh mục (ví dụ: `4 khóa học`).
- **Thêm danh mục mới**: Nút "➕ Thêm mới" mở modal nhập Tên và Mô tả danh mục, gửi `POST /categories`.
- **Sửa danh mục**: Nút "✏️ Chỉnh sửa" mở modal với dữ liệu điền sẵn, gửi `PUT /categories/:id`.
- **Xóa danh mục & RÀNG BUỘC TOÀN VẸN**:
  - Theo yêu cầu đề bài: **"Không cho xóa danh mục đang có khóa học"**.
  - Ứng dụng kiểm tra phía client: Nếu danh mục có `courseCount > 0`, ứng dụng hiển thị cảnh báo từ chối xóa và yêu cầu xóa hoặc chuyển danh mục các khóa học đó trước.
  - Nếu danh mục không có khóa học nào (`courseCount === 0`), ứng dụng hiển thị hộp thoại xác nhận và gửi `DELETE /categories/:id`.

---

## 5. Danh Sách REST API Sử Dụng

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/categories` | Lấy toàn bộ danh sách danh mục khóa học |
| `GET` | `/categories/:id` | Lấy chi tiết một danh mục theo ID |
| `POST` | `/categories` | Tạo mới một danh mục khóa học |
| `PUT` | `/categories/:id` | Cập nhật thông tin danh mục theo ID |
| `DELETE` | `/categories/:id` | Xóa một danh mục theo ID (chỉ khi không có khóa học) |
| `GET` | `/courses` | Lấy toàn bộ danh sách khóa học |
| `GET` | `/courses/:id` | Lấy chi tiết một khóa học theo ID |
| `POST` | `/courses` | Tạo mới một khóa học |
| `PUT` | `/courses/:id` | Cập nhật thông tin khóa học theo ID |
| `DELETE` | `/courses/:id` | Xóa một khóa học theo ID |

---

## 6. Hướng Dẫn Thuyết Trình Video (Theo Yêu Cầu Đề Bài)

Khi quay video thuyết trình nộp bài, nên thực hiện theo thứ tự sau:
1. **Giới thiệu**: Tên đề tài, sinh viên thực hiện, công nghệ sử dụng (React Native Expo + TypeScript) và mở MockAPI dashboard cho thấy 2 resources `categories` và `courses`.
2. **Chức năng 1 - Danh sách & Tìm kiếm**: Mở ứng dụng, thao tác tìm kiếm khóa học theo tên, bấm các nút danh mục để lọc, vuốt kéo để refresh.
3. **Chức năng 2 - Chi tiết khóa học & Video**: Bấm vào một khóa học xem đầy đủ chi tiết, mở video trailer MP4/YouTube phát thử trong modal.
4. **Chức năng 3 - Thêm & Sửa khóa học**: Thêm một khóa học mới, nhập URL ảnh xem preview trực tiếp, chọn danh mục từ dropdown, kiểm tra validation khi để trống, lưu và chứng minh khóa học mới xuất hiện trong danh sách và trên MockAPI.
5. **Chức năng 4 - Quản lý danh mục & Ràng buộc**:
   - Mở màn hình Quản lý danh mục.
   - Thử bấm xóa một danh mục đang có khóa học -> chỉ ra cảnh báo không cho xóa.
   - Thêm một danh mục mới (chưa có khóa học nào) -> xóa thành công danh mục mới này.
6. **Mở DevTools Network tab hoặc Console**: Chỉ ra các request HTTP `GET`, `POST`, `PUT`, `DELETE` gửi lên MockAPI và dữ liệu JSON phản hồi về.
