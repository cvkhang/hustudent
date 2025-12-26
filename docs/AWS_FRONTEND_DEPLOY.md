# ☁️ Deploy Frontend lên AWS S3 + CloudFront

Hướng dẫn này giúp bạn đưa trang web React lên AWS S3 (Lưu trữ) và CloudFront (CDN tăng tốc độ), đúng chuẩn kiến trúc chuyên nghiệp.

---

## Bước 1: Build Frontend

Trước tiên, bạn cần đóng gói code React thành file tĩnh (HTML, CSS, JS) để up lên S3.

1.  Mở terminal tại máy của bạn.
2.  Di chuyển vào folder `frontend`:
    ```bash
    cd frontend
    ```
3.  Tạo file `.env.production` (nếu chưa có) và trỏ API về IP của server Backend (EC2) mà bạn đã tạo ở hướng dẫn trước:
    ```bash
    # Thay 54.123.45.67 bằng Public IP của EC2 Backend
    VITE_API_URL=http://54.123.45.67:3000/api
    VITE_SOCKET_URL=http://54.123.45.67:3000
    ```
4.  Chạy lệnh build:
    ```bash
    npm install
    npm run build
    ```
    👉 Kết quả sẽ sinh ra folder `dist`. Đây là folder mình sẽ up lên AWS.

---

## Bước 2: Tạo S3 Bucket (Kho chứa web)

1.  Vào AWS Console -> Tìm **S3**.
2.  Bấm **Create bucket**.
3.  **Bucket name**: Đặt tên duy nhất (ví dụ: `hustudent-frontend-khang`).
4.  **Object Ownership**: Chọn *ACLs enabled* -> *Bucket owner preferred*.
5.  **Block Public Access settings for this bucket**:
    *   Bỏ tích chọn **Block all public access**.
    *   Tích vào ô cảnh báo "I acknowledge that...".
    *   (Lý do: Để người dùng truy cập được file web của bạn).
6.  Kéo xuống cuối bấm **Create bucket**.

---

## Bước 3: Upload Code lên S3

1.  Vào Bucket vừa tạo.
2.  Bấm nút **Upload**.
3.  Kéo thả **toàn bộ nội dung bên trong** folder `dist` (không phải kéo cả folder dist, mà là kéo file index.html, assets,...) vào.
4.  Bấm **Upload**.

---

## Bước 4: Cấu hình Static Website Hosting

1.  Vào tab **Properties** của Bucket.
2.  Kéo xuống dưới cùng phần **Static website hosting**.
3.  Bấm **Edit** -> Chọn **Enable**.
4.  **Index document**: Gõ `index.html`.
5.  **Error document**: Gõ `index.html` (Quan trọng với React App để không lỗi khi F5).
6.  Bấm **Save changes**.

👉 Giờ bạn đã có một đường link kiểu `http://hustudent...amazonaws.com`.

---

## Bước 5: Cấu hình CloudFront (CDN & HTTPS)

1.  Vào AWS Console -> Tìm **CloudFront**.
2.  Bấm **Create distribution**.
3.  **Origin domain**: Chọn Bucket S3 bạn vừa tạo.
    *   ⚠️ **LƯU Ý:** Nếu nó hiện cảnh báo "Use website endpoint", hãy bấm vào nút **Use website endpoint** đó.
4.  **Web Application Firewall (WAF)**: Chọn *Do not enable security protections* (để tiết kiệm tiền).
5.  **Viewer Config**:
    *   Viewer protocol policy: Chọn **Redirect HTTP to HTTPS**.
6.  Kéo xuống bấm **Create distribution**.

---

## Bước 6: Hoàn tất

*   Đợi khoảng 5-10 phút để CloudFront triển khai xong (Status: Deployed).
*   Copy **Distribution domain name** (ví dụ: `d123456.cloudfront.net`).
*   Đó chính là trang web của bạn! 🎉

**Lưu ý:**
Do Frontend và Backend giờ đã tách riêng domain (`cloudfront.net` và `IP EC2`), Backend cần cho phép Frontend gọi API.

Bạn cần sửa file `.env` trên EC2 Backend:
```bash
# SSH vào EC2
nano backend/.env
# Sửa dòng này:
FRONTEND_URL=https://d123456.cloudfront.net (Thay bằng link CloudFront của bạn)
```
Sau đó restart backend: `docker compose restart backend`.
