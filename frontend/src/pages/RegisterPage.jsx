import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import ProButton from '@/components/ui/ProButton';
import { Input } from '@/components/ui/Input';
import { Zap, User, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      setIsLoading(false);
      return;
    }

    try {
      await register({ fullName, email, password });
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Tạo tài khoản mới "
      subtitle={
        <>
          Bạn đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500 underline decoration-2 decoration-transparent hover:decoration-primary-500 transition-all">
            Đăng nhập ngay
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          label="Họ và tên"
          required
          placeholder="Nguyễn Văn A"
          startIcon={User}
        />

        <Input
          id="email"
          name="email"
          type="email"
          label="Email sinh viên"
          autoComplete="email"
          required
          placeholder="student@sis.hust.edu.vn"
          startIcon={Mail}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="password"
            name="password"
            type="password"
            label="Mật khẩu"
            required
            minLength={6}
            startIcon={Lock}
            placeholder="••••••"
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Xác nhận"
            required
            minLength={6}
            startIcon={Lock}
            placeholder="••••••"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 animate-pulse">
            <div className="text-sm font-bold text-red-600">{error}</div>
          </div>
        )}

        <div className="pt-2">
          <ProButton type="submit" variant="accent" className="w-full shadow-glow-accent h-14 text-lg" icon={Zap} disabled={isLoading}>
            {isLoading ? 'Đang tạo tài khoản...' : 'Đăng Ký Ngay'}
          </ProButton>
        </div>

        <p className="text-xs text-center text-slate-400 font-medium px-4">
          Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của chúng tôi.
        </p>
      </form>
    </AuthLayout>
  );
}
