# 🤖 Hướng dẫn Cài đặt CI/CD (GitHub Secrets)

Để GitHub có quyền truy cập vào AWS và Server của bạn để deploy tự động, bạn cần cung cấp các "chìa khóa" bí mật.

---

## Bước 1: Vào nơi cài đặt Secret

1.  Vào Repo GitHub của bạn.
2.  Chọn tab **Settings**.
3.  Menu trái chọn **Secrets and variables** -> **Actions**.
4.  Bấm nút xanh **New repository secret**.

---

## Bước 2: Tạo các Secret (Bắt buộc)

Bạn cần tạo lần lượt các secret sau (Tên phải viết HOA đúng y hệt):

### Nhóm 1: Cho Frontend (AWS S3)

Để lấy `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY`, bạn làm như sau:
1.  Vào AWS Console -> Tìm dịch vụ **IAM**.
2.  Vào **Users** -> **Create user** -> Đặt tên (vd: `github-cicd`) -> Next.
3.  Chọn **Attach policies directly** -> Gõ tìm `AmazonS3FullAccess` và tích vào ô đó -> Next -> Create user.
4.  Bấm vào user vừa tạo -> Tab **Security credentials**.
5.  Kéo xuống **Access keys** -> **Create access key** -> Chọn **Command Line Interface (CLI)** -> Next -> Create.
6.  Copy 2 dòng `Access key` và `Secret access key` (Lưu kỹ vì nó chỉ hiện một lần).

| Tên Secret | Giá trị |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Key ID bạn vừa copy. |
| `AWS_SECRET_ACCESS_KEY` | Secret Key bạn vừa copy. |
| `AWS_S3_BUCKET` | Tên bucket S3 (ví dụ: `www.hustudent.id.vn`). |
| `VITE_API_URL` | Check kỹ link này: `https://api.hustudent.id.vn/api` |
| `VITE_SOCKET_URL` | `https://api.hustudent.id.vn` |

### Nhóm 2: Cho Backend (Docker & EC2)

| Tên Secret | Giá trị (Lấy ở đâu?) |
| :--- | :--- |
| `DOCKER_USERNAME` | Tên đăng nhập Docker Hub của bạn. |
| `DOCKER_PASSWORD` | Mật khẩu Docker Hub (hoặc Access Token). |
| `EC2_HOST` | IP Public của EC2 (ví dụ: `54.123.45.67`). |
| `EC2_SSH_KEY` | Nội dung file `.pem`. **(Mở file .pem bằng Notepad, copy toàn bộ từ `-----BEGIN...` đến `...END-----`)**. |

---

## Bước 3: Kiểm tra

Sau khi điền đủ, mỗi khi bạn push code lên nhánh `main`, bạn vào tab **Actions** trên GitHub sẽ thấy nó tự chạy:
*   Frontend: Sẽ tự build và đẩy file mới vào S3.
*   Backend: Sẽ tự đóng gói Docker và ra lệnh cho EC2 cập nhật.

🎉 **Vậy là xong! Từ giờ bạn chỉ cần code, việc deploy để Robot lo.**
