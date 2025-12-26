# ☁️ Cấu hình Cloudflare với AWS (Full Option)

Hướng dẫn này giúp bạn kết nối Tên miền (Domain) của bạn với AWS thông qua Cloudflare để có HTTPS (ổ khóa xanh) và bảo mật chuyên nghiệp.

> **Giả sử tên miền của bạn là:** `hustudent.com`

---

## Bước 1: Chuẩn bị Bucket S3 (Quan trọng)

Để chạy được với tên miền riêng, tên Bucket S3 **BẮT BUỘC** phải trùng hệt với tên miền bạn muốn dùng cho Frontend.

1.  Quyết định tên miền cho web: Ví dụ `www.hustudent.com` hoặc `app.hustudent.com`.
2.  Tạo lại (hoặc đổi tên) S3 Bucket thành tên y hệt vậy:
    *   **Bucket Name**: `www.hustudent.com` (Nếu bạn muốn web chạy ở link này).
    *   Upload code `dist` vào bucket này như hướng dẫn trước.
    *   Bật **Static Website Hosting**.

---

## Bước 2: Cấu hình DNS trên Cloudflare

Đăng nhập Cloudflare, thêm tên miền của bạn vào và vào mục **DNS** -> **Records**.

### 1. Trỏ Frontend (Web React)
Tạo bản ghi để người dùng truy cập web:

*   **Type**: `CNAME`
*   **Name**: `www` (hoặc `app`)
*   **Target**: Dán cái link **S3 Website Endpoint** vào (Cái link dài dài có đuôi `amazonaws.com` ở phần Properties của S3 ấy).
    *   *Lưu ý: Bỏ đoạn `http://` đi, chỉ lấy từ tên bucket trở đi.*
*   **Proxy status**: ✅ **Proxied** (Đám mây màu cam).

### 2. Trỏ Backend (API NodeJS)
Tạo bản ghi để Frontend gọi API bảo mật:

*   **Type**: `A`
*   **Name**: `api` (Tức là API sẽ chạy ở `api.hustudent.com`)
*   **IPv4 address**: Dán **Public IP** của máy EC2 vào (Ví dụ: `54.123.45.67`).
*   **Proxy status**: ✅ **Proxied** (Đám mây màu cam).

---

## Bước 3: Cấu hình SSL/TLS trên Cloudflare

Để đảm bảo kết nối giữa Cloudflare và AWS không bị lỗi:

1.  Vào mục **SSL/TLS** -> **Overview**.
2.  Chọn chế độ **Full**.
    *   (Không chọn *Full (Strict)* trừ khi bạn đã cài chứng chỉ xịn lên EC2, bước này phức tạp nên chọn *Full* là đủ an toàn và dễ chạy nhất).

---

## Bước 4: Cập nhật biến môi trường (Lần cuối)

Bây giờ bạn đã có domain xịn, hãy cập nhật lại code để chúng nhận ra nhau.

**1. Sửa Frontend (Máy của bạn):**
Mở file `.env.production` (hoặc `.env` lúc build):
```bash
# Trỏ về tên miền API mới
VITE_API_URL=https://api.hustudent.com/api
VITE_SOCKET_URL=https://api.hustudent.com
```
👉 Sau đó chạy `npm run build` và Upload lại folder `dist` lên S3 Bucket `www.hustudent.com` mới.

**2. Sửa Backend (SSH vào EC2):**
```bash
nano backend/.env
```
Cập nhật CORS để cho phép tên miền mới gọi API:
```bash
# Cho phép frontend mới gọi vào
FRONTEND_URL=https://www.hustudent.com
```
Lưu lại và khởi động lại Backend:
```bash
docker compose restart backend
```

---

## 🎉 Tận hưởng thành quả

Mở trình duyệt và vào: `https://www.hustudent.com`

*   Ổ khóa xanh an toàn.
*   API gọi ngầm qua `https://api.hustudent.com` (Được ẩn IP thật).
*   Hệ thống chuẩn kiến trúc Production!
