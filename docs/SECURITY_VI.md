# Hướng dẫn Bảo mật HUStudent - Tài liệu Tiếng Việt

## 🔒 Tổng quan

Tài liệu này mô tả các biện pháp bảo mật đã được triển khai trong ứng dụng HUStudent để bảo vệ khỏi các lỗ hổng web phổ biến.

## 📋 Mục lục

1. [Các lỗ hổng được bảo vệ](#các-lỗ-hổng-được-bảo-vệ)
2. [Cấu hình bảo mật](#cấu-hình-bảo-mật)
3. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
4. [Kiểm tra bảo mật](#kiểm-tra-bảo-mật)

---

## Các lỗ hổng được bảo vệ

### ✅ SQL Injection (Tấn công tiêm nhiễm SQL)

**Vấn đề:** Hacker có thể chèn mã SQL độc vào input để truy cập hoặc xóa database.

**Giải pháp:**
- Sử dụng **Sequelize ORM** - tự động parameterize queries
- Kiểm tra kỹ các raw queries có sử dụng `replacements`

```javascript
// ✅ AN TOÀN
await User.findOne({ where: { email: userEmail } });

// ✅ AN TOÀN với raw query
await sequelize.query('SELECT * FROM users WHERE id = :id', {
  replacements: { id: userId }
});

// ❌ NGUY HIỂM - KHÔNG BAO GIỜ LÀM THẾ NÀY
await sequelize.query(`SELECT * FROM users WHERE id = ${userId}`);
```

### ✅ XSS (Cross-Site Scripting)

**Vấn đề:** Hacker chèn JavaScript độc hại vào website, đánh cắp cookies, session.

**Giải pháp Backend:**
```javascript
// Middleware tự động loại bỏ:
- <script> tags
- Event handlers (onclick, onerror, ...)
- javascript: protocol
```

**Giải pháp Frontend:**
```javascript
import { sanitizeHtml, sanitizeUserInput } from '../lib/sanitize';

// Hiển thị tên người dùng
const safeName = sanitizeUserInput(userName);

// Hiển thị HTML content (bài post, comment)
const safeContent = sanitizeHtml(richContent);
<div dangerouslySetInnerHTML={{ __html: safeContent }} />
```

### ✅ CSRF (Cross-Site Request Forgery)

**Vấn đề:** Website giả mạo gửi request dưới danh nghĩa người dùng đã đăng nhập.

**Giải pháp:**
- Cookie với `SameSite: strict` (production)
- CORS chỉ cho phép `FRONTEND_URL`
- Khuyến nghị: Thêm CSRF token cho các thao tác quan trọng

### ✅ NoSQL Injection

**Vấn đề:** Tấn công tương tự SQL injection nhưng với NoSQL databases.

**Giải pháp:**
```javascript
// Middleware tự động loại bỏ ký tự $ và . trong input
app.use(sanitizeNoSQL);
```

### ✅ Brute Force (Tấn công vét cạn mật khẩu)

**Giải pháp:**
```javascript
Rate Limiting (Giới hạn số lần thử):
- Đăng nhập: 5 lần / 15 phút
- Đăng ký: 3 lần / 1 giờ
- Đổi mật khẩu: 3 lần / 15 phút
- API chung: 2000 requests / 15 phút
```

### ✅ Clickjacking

**Vấn đề:** Website độc đặt trang web của bạn trong iframe và lừa user click.

**Giải pháp:**
```
Header: X-Frame-Options: DENY
→ Không cho phép trang web được nhúng trong iframe
```

### ✅ MIME Sniffing

**Vấn đề:** Trình duyệt đoán sai kiểu file, thực thi file độc.

**Giải pháp:**
```
Header: X-Content-Type-Options: nosniff
→ Bắt buộc trình duyệt tuân theo Content-Type header
```

---

## Cấu hình bảo mật

### Backend Security Headers

File: `backend/app.js`

```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: { /* Chống XSS */ },
  frameguard: { action: 'deny' }, /* Chống Clickjacking */
  noSniff: true, /* Chống MIME sniffing */
  hsts: { /* Force HTTPS trong production */ }
}));
```

### Input Validation

File: `backend/middleware/security.js`

**Các validator có sẵn:**

```javascript
validateEmail()           // Kiểm tra email hợp lệ
validatePassword()        // Mật khẩu mạnh (cần chữ hoa, thường, số)
validatePasswordSimple()  // Mật khẩu đơn giản (tối thiểu 6 ký tự)
validateName()            // Tên (2-100 ký tự, chỉ chữ cái)
validateId()              // ID số nguyên
validateString()          // Chuỗi với độ dài tùy chỉnh
validatePagination()      // Trang và limit
```

**Cách sử dụng trong routes:**

```javascript
import { 
  validateEmail, 
  validatePasswordSimple,
  handleValidationErrors 
} from '../middleware/security.js';

router.post('/login',
  validateEmail(),
  validatePasswordSimple(),
  handleValidationErrors,  // Bắt buộc để trả về lỗi validation
  controller.login
);
```

### Rate Limiting

File: `backend/middleware/rateLimits.js`

**Cách sử dụng:**

```javascript
import { loginLimiter, createLimiter } from '../middleware/rateLimits.js';

router.post('/login', loginLimiter, controller.login);
router.post('/posts', createLimiter, controller.createPost);
```

**Các limiter có sẵn:**
- `apiLimiter` - API chung (2000 req/15min)
- `loginLimiter` - Đăng nhập (5 req/15min)
- `registerLimiter` - Đăng ký (3 req/1h)
- `passwordChangeLimiter` - Đổi mật khẩu (3 req/15min)
- `uploadLimiter` - Upload file (50 req/15min)
- `createLimiter` - Tạo nội dung (50 req/15min)

### Frontend Sanitization

File: `frontend/src/lib/sanitize.js`

**Các hàm có sẵn:**

```javascript
import {
  sanitizeHtml,        // HTML với các tag an toàn
  sanitizeText,        // Plain text (loại bỏ tất cả HTML)
  sanitizeUserInput,   // Escape HTML entities
  sanitizeUrl,         // URL an toàn
  createSafeHtml       // Cho dangerouslySetInnerHTML
} from '../lib/sanitize';

// Ví dụ sử dụng
<h1>{sanitizeUserInput(userName)}</h1>
<div dangerouslySetInnerHTML={createSafeHtml(post.content)} />
```

---

## Hướng dẫn sử dụng

### Cho Backend Developers

#### 1. Thêm validation vào route mới

```javascript
// routes/exampleRoutes.js
import express from 'express';
import { 
  validateString,
  validateId,
  handleValidationErrors 
} from '../middleware/security.js';
import { createLimiter } from '../middleware/rateLimits.js';

const router = express.Router();

router.post('/items',
  createLimiter,                    // Rate limiting
  validateString('title', 3, 100),  // Title 3-100 ký tự
  validateString('description', 0, 500),
  handleValidationErrors,           // Bắt lỗi validation
  controller.createItem
);

router.get('/items/:id',
  validateId('id'),                 // ID phải là số nguyên
  handleValidationErrors,
  controller.getItem
);

export default router;
```

#### 2. Tạo validator tùy chỉnh

```javascript
// middleware/security.js

import { body } from 'express-validator';

export const validatePhoneNumber = () =>
  body('phone')
    .trim()
    .matches(/^(84|0[3|5|7|8|9])+([0-9]{8})$/)
    .withMessage('Số điện thoại không hợp lệ');
```

#### 3. Xử lý file upload

```javascript
import { uploadLimiter } from '../middleware/rateLimits.js';
import upload from '../middleware/upload.js';

router.post('/upload',
  uploadLimiter,
  upload.single('file'),  // Middleware upload đã có validation
  controller.handleUpload
);
```

### Cho Frontend Developers

#### 1. Sanitize user-generated content

```javascript
// components/Post.jsx
import { sanitizeHtml } from '../lib/sanitize';

function Post({ post }) {
  const safeContent = sanitizeHtml(post.content);
  
  return (
    <div>
      <h2>{post.title}</h2> {/* React tự động escape */}
      <div dangerouslySetInnerHTML={{ __html: safeContent }} />
    </div>
  );
}
```

#### 2. Sanitize trong form input

```javascript
// components/CommentForm.jsx
import { useState } from 'react';
import { sanitizeText } from '../lib/sanitize';

function CommentForm({ onSubmit }) {
  const [comment, setComment] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Backend cũng sẽ sanitize, nhưng làm ở frontend để UX tốt hơn
    const cleanComment = sanitizeText(comment);
    await onSubmit(cleanComment);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea 
        value={comment} 
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
      />
      <button type="submit">Gửi</button>
    </form>
  );
}
```

---

## Kiểm tra bảo mật

### 1. Kiểm tra Security Headers

```bash
# Kiểm tra API có security headers
curl -I https://api.hustudent.id.vn/api/health

# Phải thấy các headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Content-Security-Policy: ...
```

### 2. Thử XSS Attack

```javascript
// Test trong form
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<a href="javascript:alert('XSS')">Click</a>

// Kết quả mong đợi:
// - Backend loại bỏ script tags
// - Frontend escape HTML entities
// - Không thấy popup alert
```

### 3. Thử SQL Injection

```bash
# Test login với payload SQL
curl -X POST https://api.hustudent.id.vn/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com OR 1=1--","password":"anything"}'

# Kết quả mong đợi: 401 Unauthorized (không bypass được)
```

### 4. Test Rate Limiting

```bash
# Thử đăng nhập 10 lần liên tục
for i in {1..10}; do
  curl -X POST https://api.hustudent.id.vn/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}';
done

# Lần thứ 6 phải thấy:
# {"error":{"code":"TOO_MANY_LOGIN_ATTEMPTS","message":"..."}}
```

### 5. Kiểm tra Dependencies

```bash
# Tìm lỗ hổng trong dependencies
cd backend && npm audit
cd frontend && npm audit

# Fix các lỗ hổng tìm thấy
npm audit fix
```

---

## Checklist Bảo mật

### Trước khi Deploy

**Backend:**
- [ ] `NODE_ENV=production` trong .env
- [ ] JWT_SECRET đủ mạnh (256-bit random)
- [ ] Database SSL enabled
- [ ] Helmet.js configured
- [ ] Rate limiting enabled
- [ ] All routes có validation
- [ ] No hardcoded secrets
- [ ] Error messages không lộ thông tin nhạy cảm

**Frontend:**
- [ ] DOMPurify imported và sử dụng
- [ ] Tất cả user input được sanitize
- [ ] No API keys trong code
- [ ] HTTPS enforced
- [ ] CORS configured đúng

**Infrastructure:**
- [ ] EC2 Security Group configured
- [ ] SSH key-based auth
- [ ] Firewall rules
- [ ] Regular backups
- [ ] Monitoring setup

### Hàng tháng

- [ ] Chạy `npm audit` và fix vulnerabilities
- [ ] Update dependencies
- [ ] Review access logs
- [ ] Check rate limit logs
- [ ] Verify backups working

---

## Tài nguyên bổ sung

### Tài liệu

- [📄 SECURITY.md](./SECURITY.md) - Tài liệu bảo mật chi tiết (English)
- [📄 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Hướng dẫn triển khai
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - 10 lỗ hổng web phổ biến nhất

### Tools

```bash
# Security scanning
npm audit                    # Check vulnerabilities
npx snyk test               # Snyk security scan (cần đăng ký)

# Testing
npm test                    # Run tests
```

---

## Câu hỏi thường gặp (FAQ)

**Q: Tôi cần thêm validation cho endpoint mới, làm thế nào?**

A: Import validators từ `middleware/security.js` và thêm vào route:
```javascript
import { validateString, handleValidationErrors } from '../middleware/security.js';

router.post('/endpoint',
  validateString('field', minLength, maxLength),
  handleValidationErrors,
  controller.method
);
```

**Q: Làm sao biết validation đang hoạt động?**

A: Gửi request với dữ liệu không hợp lệ, phải nhận 400 Bad Request với chi tiết lỗi:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{"field": "email", "message": "Invalid email format"}]
  }
}
```

**Q: Rate limiting có ảnh hưởng đến user thật không?**

A: Các giới hạn được thiết lập đủ cao cho usage bình thường. Ví dụ 5 failed login/15min là rất rộng rãi. Nếu cần điều chỉnh, sửa trong `middleware/rateLimits.js`.

**Q: Tôi có cần sanitize cả ở frontend và backend không?**

A: **Backend là bắt buộc** (never trust client). Frontend là optional nhưng nên có để UX tốt hơn và defense in depth.

---

**Cập nhật lần cuối:** 26/12/2024  
**Người bảo trì:** HUStudent Development Team
