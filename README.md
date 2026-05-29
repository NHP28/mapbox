# 🚦 Traffic Sign Intelligence Dashboard

Hệ thống giám sát và quản trị biển báo giao thông trực quan thời gian thực, được xây dựng trên nền tảng **Next.js (App Router)**, **Mapbox-GL** và **Supabase PostgreSQL (với PostGIS)**.

Giao diện được thiết kế tối giản, hiện đại theo phong cách **Mapbox Console & Google Maps** bản sáng (light theme), hỗ trợ Việt hóa bản đồ 100% cực kỳ chuyên nghiệp.

---

## 🏗️ Cấu Trúc Thư Mục Chuẩn Hóa

Hệ thống được tổ chức logic nhằm tối đa hóa khả năng bảo mật thông tin cơ sở dữ liệu và phân tách rõ ràng trách nhiệm giữa Frontend và Backend:

```text
src/
├── 📂 db/
│   └── 📄 index.ts          # Cấu hình khởi tạo kết nối Drizzle ORM tới Supabase/Postgres
│
├── 📂 services/
│   └── 📄 trafficSigns.ts   # Tầng truy vấn trực tiếp DB bằng SQL/Drizzle (Chỉ chạy trên Server)
│
├── 📂 app/
│   ├── 📂 api/
│   │   └── 📂 traffic-signs/
│   │       └── 📄 route.ts  # Next.js API Route đóng vai trò cổng bảo mật & trung chuyển dữ liệu
│   ├── 📄 page.tsx          # Trang chủ chính tối giản, gọi hiển thị TrafficMap
│   ├── 📄 layout.tsx        # Cấu trúc layout toàn bộ ứng dụng
│   └── 📄 globals.css       # Định nghĩa màu sắc, thanh cuộn & hiệu ứng PIN Mapbox
│
├── 📂 api/                  # 📂 Tách biệt hoàn toàn ngoài app/
│   └── 📄 trafficSigns.ts   # Helper frontend gọi fetch() an toàn tới API route
│
├── 📂 components/
│   └── 📄 TrafficMap.tsx    # Giao diện chính: Sidebar danh sách biển báo & Mapbox full-screen
│
└── 📂 lib/
    └── 📄 supabase.ts       # Supabase JS client dự phòng (hỗ trợ Realtime, Storage)
```

---

## ⚡ Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Chuẩn bị biến môi trường
Tạo file `.env.local` ở thư mục gốc của dự án với nội dung sau:

```env
# Kết nối an toàn đến database Supabase
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:6543/postgres

# Cấu hình Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token_here

# Cấu hình Supabase Client (Dự phòng)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
```

### 2. Cài đặt các thư viện phụ thuộc
Chạy lệnh sau tại thư mục gốc:
```bash
npm install
```

### 3. Nạp dữ liệu mẫu (Seeding)
Để kiểm tra bản đồ ngay lập tức với 5 biển báo mẫu định vị tại trung tâm TP. Hồ Chí Minh:
```bash
node seed.js
```

### 4. Khởi chạy môi trường phát triển (Local Development)
```bash
npm run dev
```
Mở trình duyệt truy cập vào: **[http://localhost:3000](http://localhost:3000)** để xem thành quả!

### 5. Kiểm tra chất lượng mã nguồn (Linting)
Để đảm bảo code sạch sẽ, không có lỗi tiềm ẩn:
```bash
npm run lint
```

---

## 🗄️ Quản Lý Cấu Trúc Database (Migrations)

Dự án sử dụng **Supabase CLI** để tự động hóa quá trình di chuyển cấu trúc bảng (database migration) và đồng bộ schema giữa local và remote:

### 1. Liên kết dự án với Supabase Remote
Chạy lệnh sau để đăng nhập và liên kết dự án với Supabase:
```bash
supabase link --project-ref opavoctswledukleijpi
```
*(CLI sẽ yêu cầu nhập mật khẩu database đã tạo trên Supabase)*

### 2. Tạo một file migration mới
Khi cần thay đổi cấu trúc bảng (thêm cột, tạo bảng mới, đổi kiểu dữ liệu...):
```bash
supabase migration new ten_file_migration_cua_ban
```
File SQL mới sẽ được tạo trong thư mục `supabase/migrations/`. Bạn chỉ cần viết lệnh SQL của mình vào đó.

### 3. Đẩy tất cả thay đổi lên Supabase Database
Đẩy các migration mới nhất lên cơ sở dữ liệu trên cloud:
```bash
supabase db push
```

---

## 💡 Các Tính Năng Nổi Bật Đã Triển Khai

* **Bảo mật tuyệt đối**: Dữ liệu Postgres được gọi thông qua API Route an toàn, không bao giờ lộ password database ra client.
* **Tự động Việt hóa bản đồ**: Sử dụng biểu thức `coalesce` để tự động dịch tất cả các nhãn (labels) trên Mapbox sang tiếng Việt (`name_vi`).
* **Bố cục Google Maps**: Sidebar danh sách biển báo hiển thị gọn gàng, bản đồ tự động co giãn 100% kích thước (Anti-collapse) nhờ hệ thống lắng nghe kích thước `ResizeObserver`.
* **Detail Card trực quan**: Hỗ trợ hiển thị chỉ số chính xác YOLO, Cosine Similarity và tọa độ GPS của biển báo khi người dùng click vào điểm mốc.
