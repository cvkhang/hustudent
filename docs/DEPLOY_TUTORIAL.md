# 🎓 Hướng dẫn Deploy Full-Stack (Từ A-Z cho người mới bắt đầu)

Tài liệu này không chỉ chỉ bạn **cách làm** (How), mà còn giải thích **tại sao** (Why) để bạn hiểu bản chất hệ thống.

---

## 🏗 Kiến trúc hệ thống

Chúng ta sẽ xây dựng mô hình **Client-Server Decoupled** (Tách biệt Frontend/Backend):

1.  **Frontend (ReactJS)**:
    *   **Vấn đề**: Code React sau khi build chỉ là file HTML/CSS/JS tĩnh. Thuê server chạy Nginx để serve file này thì phí tiền và chậm.
    *   **Giải pháp**: Dùng **AWS S3** (Lưu trữ file giá rẻ) + **Cloudflare** (CDN - phân phối nội dung toàn cầu).
    *   **Lợi ích**: Tốc độ tải trang siêu nhanh, không lo sập server khi nhiều người vào.

2.  **Backend (NodeJS)**:
    *   **Vấn đề**: Cần máy tính chạy liên tục để xử lý Logic, Database.
    *   **Giải pháp**: Dùng **AWS EC2** (Máy chủ ảo) cài **Docker**.
    *   **Lợi ích**: Docker giúp môi trường trên Server giống hệt máy bạn, không lo lỗi "máy tôi chạy được mà máy server không chạy".

3.  **Điều phối (Cloudflare)**:
    *   Đứng giữa người dùng và hệ thống. Bảo vệ hệ thống khỏi tấn công và cấp ổ khóa bảo mật (HTTPS).

---

## ✅ Chuẩn bị

1.  **AWS Account**: Đã có EC2 (Ubuntu).
2.  **Tên miền**: Đã mua (ví dụ `hustudent.com`).
3.  **Cloudflare**: Đã tạo tài khoản và trỏ Nameserver của tên miền về Cloudflare.

---

## PHẦN 1: BACKEND (Trái tim hệ thống)

Chúng ta deploy Backend trước để lấy địa chỉ IP cung cấp cho Frontend.

### Bước 1.1: Chuẩn bị Server EC2
*(Nếu đã làm ở file trước thì bỏ qua, nhưng hãy đọc để hiểu)*

1.  **SSH vào Server**:
    ```bash
    ssh -i "key.pem" ubuntu@1.2.3.4
    ```
    *   *Tại sao cần lệnh này?*: Đây là cách chúng ta điều khiển máy chủ từ xa an toàn qua mã hóa.
    *   *Tại sao `chmod 400`?*: File key rất quan trọng, nếu để quyền `read/write` cho người lạ, SSH sẽ từ chối kết nối để bảo mật.

2.  **Cài Docker**:
    Docker giúp đóng gói code vào các "container" độc lập.
    ```bash
    curl -fsSL https://get.docker.com | sudo sh
    ```

### Bước 1.2: Đưa code lên và chạy

1.  **Clone code**:
    ```bash
    git clone https://github.com/cvkhang/hustudent.git
    cd hustudent
    ```

2.  **Thiết lập môi trường (.env)**:
    Docker cần biết các bí mật (mật khẩu DB, khóa API) qua file `.env`.
    ```bash
    cd backend
    nano .env  # Paste nội dung .env của bạn vào đây
    ```
    *Mẹo: Nhấn `Ctrl+O` Enter để lưu, `Ctrl+X` để thoát.*

3.  **Khởi chạy**:
    ```bash
    cd .. # Ra thư mục gốc
    docker compose up -d backend
    ```
    *   `up`: Dựng container.
    *   `-d`: Detached (Chạy ngầm). Nếu không có cờ này, tắt terminal là server tắt luôn.

👉 **Chốt lại P1**: Backend đang chạy tại IP `1.2.3.4` (ví dụ), Port `3000`.

---

## PHẦN 2: TÊN MIỀN & HTTPS (Cổng vào)

Người dùng không thể nhớ IP `1.2.3.4`, họ cần `api.hustudent.com`.

### Bước 2.1: Cấu hình Cloudflare cho Backend

1.  Vào Cloudflare -> Chọn tên miền -> **DNS**.
2.  Thêm bản ghi (Record):
    *   **Type**: `A` (Address - trỏ tên miền về IP v4).
    *   **Name**: `api` (tiền tố).
    *   **IPv4**: `1.2.3.4` (IP EC2 của bạn).
    *   **Proxy**: ✅ **Proxied** (Đám mây cam).
        *   *Tại sao Cam?*: Để Cloudflare giấu IP thật của EC2, hacker ping vào chỉ thấy IP Cloudflare -> Server an toàn (chống DDoS).

### Bước 2.2: Cấu hình SSL (Ổ khóa)

1.  Vào Cloudflare -> **SSL/TLS**.
2.  Chọn chế độ: **Flexible**.
    *   *Giải thích*:
        *   User <---> Cloudflare: **HTTPS** (An toàn).
        *   Cloudflare <---> EC2/S3: **HTTP** (Nhanh, dễ cấu hình).
    *   *Tại sao không dùng Full?*: Vì S3 Website Hosting không hỗ trợ HTTPS gốc, dùng Full sẽ bị lỗi 522. Flexible là lựa chọn "mì ăn liền" tốt nhất lúc này.

👉 **Chốt lại P2**: API đã sẵn sàng tại `https://api.hustudent.com`.

---

## PHẦN 3: FRONTEND (Giao diện)

### Bước 3.1: Build Code (Tại máy bạn)

React không chạy trực tiếp file `.jsx` được, phải "dịch" (build) ra HTML/JS thường.

1.  Vào folder `frontend`.
2.  Tạo file `.env.production` (Biến môi trường cho bản thật):
    ```env
    # Trỏ về API mình vừa tạo ở Phần 2
    VITE_API_URL=https://api.hustudent.com/api
    VITE_SOCKET_URL=https://api.hustudent.com
    ```
3.  Chạy lệnh: `npm run build`.
    *   Nó sẽ tạo ra thư mục `dist`. Đây là "sản phẩm cuối cùng" để đem đi bán.

### Bước 3.2: Upload lên "Kho" S3

1.  **Tạo Bucket**:
    *   Vào AWS S3 -> Create bucket.
    *   **Tên Bucket**: `www.hustudent.com` (⚠️ Bắt buộc trùng tên miền bạn định dùng).
    *   **Bỏ chọn** "Block all public access" (Để công khai cho mọi người xem web).

2.  **Upload**:
    *   Upload **toàn bộ file bên trong** folder `dist` vào Bucket.

3.  **Bật chế độ Web**:
    *   Vào tab **Properties** -> Kéo xuống cuối **Static website hosting** -> Enable.
    *   Index document: `index.html`.
    *   Error document: `index.html` (Để khi F5 ở trang con không bị lỗi 404 - vì React là Single Page App, mọi đường dẫn đều do index.html xử lý).

### Bước 3.3: Gắn tên miền cho Frontend

1.  Vào Cloudflare DNS.
2.  Thêm bản ghi:
    *   **Type**: `CNAME` (Canonical Name - trỏ tên này sang tên khác).
    *   **Name**: `www` (hoặc `@` nếu muốn trỏ hustudent.com).
    *   **Target**: Link **S3 Website Endpoint** (Copy trong Properties của S3, *bỏ đoạn http:// đi*).
    *   **Proxy**: ✅ **Proxied**.

---

## PHẦN 4: KẾT NỐI & BẢO MẬT (Mảnh ghép cuối)

Hiện tại User vào Web OK, nhưng khi Web gọi API sẽ bị chặn vì Browser thấy tên miền lạ gọi API.

1.  **Cập nhật CORS (Cross-Origin Resource Sharing)**:
    *   SSH vào EC2.
    *   Sửa file `.env` của Backend:
        ```env
        # Cho phép tên miền frontend gọi tôi
        FRONTEND_URL=https://www.hustudent.com
        ```
    *   Khởi động lại Backend để nhận cấu hình mới:
        ```bash
        docker compose restart backend
        ```

2.  **(Test)**: Vào `https://www.hustudent.com`, đăng nhập thử. Nếu thành công -> **DONE!** 🎉

---

## TỔNG KẾT
Bạn vừa xây dựng một hệ thống chuẩn kỹ sư DevOps:
1.  **Code**: Tách biệt Frontend/Backend.
2.  **Infrastructure**: Docker hóa Backend, Hosting Frontend serverless (S3).
3.  **Network**: Dùng Cloudflare làm Proxy & SSL Gateway.

Chúc mừng bạn! 🚀
