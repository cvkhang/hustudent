# ☁️ Hướng dẫn Deploy lên AWS EC2 (Chi tiết cho người mới)

Đây là hướng dẫn "Cầm tay chỉ việc" để bạn đưa web lên Internet dùng AWS EC2. Mình giả định bạn đang dùng **Windows** và chưa từng dùng AWS.

---

## Phần 1: Tạo Server trên AWS (5 phút)

1.  **Đăng ký tài khoản AWS**:
    *   Vào [aws.amazon.com](https://aws.amazon.com/) -> "Create an AWS Account".
    *   Bạn cần thẻ Visa/Mastercard (nó sẽ trừ 1$ để test rồi hoàn lại).
    *   Tài khoản mới được **Free-tier 1 năm** (miễn phí) server nhỏ.

2.  **Đăng nhập & Vào EC2**:
    *   Đăng nhập vào Console.
    *   Ở thanh tìm kiếm trên cùng, gõ `EC2` -> Chọn **EC2**.
    *   Nhìn menu trái, chọn **Instances**.
    *   Bấm nút màu cam **Launch instances** (Góc trên phải).

3.  **Cấu hình Server (Quan trọng)**:
    *   **Name**: Đặt tên gì cũng được, ví dụ `Web-HUST`.
    *   **Application and OS Images (AMI)**: Chọn **Ubuntu**.
        *   Server image: Chọn bản `Ubuntu Server 24.04 LTS (HVM), SSD Volume Type`.
    *   **Instance type**: Chọn **t2.micro** hoặc **t3.micro** (Có chữ **Free tier eligible** màu xanh - Miễn phí).
    *   **Key pair (login)** (Để đăng nhập vào server):
        *   Bấm **Create new key pair**.
        *   Pair name: `hustudent-key`.
        *   Key pair type: `RSA`.
        *   Private key file format: chọn `.pem` (Dễ dùng với OpenSSH/Git Bash).
        *   Bấm **Create key pair**.
        *   ⚠️ **LƯU Ý:** 1 file `hustudent-key.pem` sẽ tự tải về. **Giữ file này siêu cẩn thận, mất là không vào được server nữa.**
    *   **Network settings**:
        *   Ở phần **Firewall (security groups)**, chọn "Create security group".
        *   Tích chọn: ☑️ **Allow SSH traffic from** -> Chọn `Anywhere`.
        *   Tích chọn: ☑️ **Allow HTTPS traffic from the internet**.
        *   Tích chọn: ☑️ **Allow HTTP traffic from the internet**.
    *   **Configure storage**: Để mặc định (thường là 8GB hoặc tăng lên 20GB vẫn free).

4.  **Khởi chạy**:
    *   Bấm nút cam **Launch instance** ở bên phải.
    *   Bấm **View all instances** để quay lại danh sách.
    *   Chờ mục "Instance state" chuyển sang `Running` (màu xanh).

---

## Phần 2: Kết nối vào Server (Từ Windows của bạn)

Cách dễ nhất là dùng **Git Bash** (thường có sẵn khi bạn cài Git).

1.  Mở thư mục chứa file `hustudent-key.pem` bạn vừa tải về.
2.  Chuột phải vào khoảng trắng -> Chọn **Open Git Bash here** (hoặc mở Terminal và `cd` tới đó).
3.  Quay lại trang AWS, click vào Server bạn vừa tạo -> Copy dòng **Public IPv4 address** (Ví dụ: `54.123.45.67`).
4.  Gõ lệnh sau vào Git Bash:

```bash
# Lệnh kết nối: ssh -i [file-key] ubuntu@[địa-chỉ-ip]
ssh -i "hustudent-key.pem" ubuntu@54.123.45.67
```

*Nếu nó hỏi `Are you sure you want to continue connecting (yes/no/[fingerprint])?`, gõ `yes` -> Enter.*

🎉 Nếu hiện dòng `ubuntu@ip-172-x-x-x:~$` là bạn đã vào được server!

---

## Phần 3: Cài đặt môi trường (Trên Server)

Giờ bạn đang điều khiển máy tính của AWS. Hãy chạy lần lượt các lệnh này để cài Docker:

```bash
# 1. Update danh sách phần mềm
sudo apt-get update

# 2. Cài các gói hỗ trợ
sudo apt-get install ca-certificates curl gnupg -y

# 3. Cài Docker tự động bằng script của hãng
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 4. Cho phép user hiện tại dùng Docker (để không phải gõ sudo mãi)
sudo usermod -aG docker $USER
```

⚠️ **Quan trọng:** Sau khi chạy xong bước 4, bạn cần thoát ra và vào lại để server cập nhật quyền.
*   Gõ `exit` để thoát.
*   Gõ lại lệnh `ssh ...` ở Phần 2 để vào lại.

Thử gõ `docker ps`. Nếu không báo lỗi "permission denied" là OK!

---

## Phần 4: Đưa code lên Server

Cách đơn giản nhất là dùng Git.

**Trên máy tính của bạn:**
1.  Đảm bảo code đã được push lên GitHub.
2.  Kiểm tra file `docker-compose.yml` đã có trên GitHub chưa.

**Trên Server AWS:**
```bash
# 1. Clone code về (Thay link bằng link repo của bạn)
git clone https://github.com/Tên-Github-Của-Bạn/hustudent.git

# 2. Vào thư mục code
cd hustudent
```

### Thiết lập File .env
Vì file `.env` chứa mật khẩu nên không được up lên Git. Bạn phải tạo thủ công trên server.

```bash
# Vào thư mục backend
cd backend

# Tạo file .env
nano .env
```

*   Màn hình sẽ chuyển sang trình soạn thảo Nano.
*   Copy nội dung file `.env` ở máy bạn, **Paste** vào cửa sổ Terminal (Chuột phải -> Paste).
*   Sửa lại các thông tin nếu cần (Ví dụ Database Host nếu dùng database riêng, nhưng nếu dùng SQLite thì không cần).
*   Lưu: Bấm `Ctrl + O` -> `Enter`.
*   Thoát: Bấm `Ctrl + X`.

---

## Phần 5: Chạy ứng dụng 🚀

Vẫn trên Server, quay lại thư mục gốc dự án (nơi có `docker-compose.yml`):

```bash
# Quay lại thư mục cha
cd ..

# Chạy Docker Compose
docker compose up -d --build
```

*   Giải thích:
    *   `up`: Chạy container.
    *   `-d`: Detached mode (Chạy ngầm, không chiếm màn hình).
    *   `--build`: Build lại image nếu code thay đổi.

Đợi nó chạy 1 lúc... (Lần đầu sẽ hơi lâu để tải Nodejs).

Khi xong, gõ `docker compose ps` để xem. Nếu thấy `frontend`, `backend` trạng thái `Up` là thành công!

---

## Phần 6: Xem kết quả

Mở trình duyệt trên máy tính của bạn, nhập địa chỉ IP của server AWS (Public IPv4):
`http://54.123.45.67` (Thay bằng IP thật của bạn)

---

## Các lỗi thường gặp

**1. Không truy cập được web (Trang web cứ quay vòng vòng)**
*   Lý do: Chưa mở cổng 80 (HTTP) ở Security Group.
*   Khắc phục:
    *   Vào AWS Console -> EC2 -> Instances -> Click vào server.
    *   Tab "Security" -> Click vào Link dưới chữ `Security groups`.
    *   Chọn tab "Inbound rules" -> "Edit inbound rules".
    *   Bấm "Add rule" -> Type: `HTTP` -> Source: `Anywhere-IPv4`.
    *   Save rules.

**2. Lỗi "Permission denied (publickey)" khi SSH**
*   Lý do: Chọn sai file key hoặc sai user.
*   Khắc phục: Đảm bảo user là `ubuntu` (nếu dùng Ubuntu) và đường dẫn file `.pem` đúng.

**3. App chạy nhưng báo lỗi kết nối Backend**
*   Kiểm tra log: `docker compose logs backend`
*   Xem backend có đang báo lỗi Database hay gì không.
