import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import ProButton from '@/components/ui/ProButton';
import { Input } from '@/components/ui/Input';
import { ArrowRight, Mail, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      await login({ email, password });
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Đăng nhập thất bại, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Chào mừng trở lại! "
      subtitle={
        <>
          Bạn chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 underline decoration-2 decoration-transparent hover:decoration-primary-500 transition-all">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
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

        <div className="space-y-1">
          <Input
            id="password"
            name="password"
            type="password"
            label="Mật khẩu"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            startIcon={Lock}
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors">
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 animate-pulse">
            <div className="flex">
              <div className="text-sm font-bold text-red-600">{error}</div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <ProButton type="submit" variant="primary" className="w-full shadow-glow-primary h-14 text-lg" icon={ArrowRight} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </ProButton>
        </div>
      </form>
    </AuthLayout>
  );
}
