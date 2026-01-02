import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import ProButton from '@/components/ui/ProButton';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');

    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (tokenParam) setToken(tokenParam);

    // If no token provided, show error
    if (!tokenParam) {
      setStatus('error');
      setMessage('Link đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu link mới.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        email,
        token,
        newPassword
      });
      setStatus('success');
      setMessage('Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập với mật khẩu mới.');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage(err.response?.data?.error?.message || 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle="Nhập mật khẩu mới cho tài khoản của bạn."
    >
      {status === 'success' ? (
        <div className="space-y-6 text-center animate-fade-in-up">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Thành công!</h3>
          <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
          <div className="pt-4">
            <Link to="/login">
              <ProButton variant="primary" className="w-full">
                Đăng nhập ngay
              </ProButton>
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
            className="bg-slate-100"
          />

          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              startIcon={Lock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu mới"
            startIcon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {status === 'error' && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm font-medium text-red-600 leading-tight">{message}</div>
            </div>
          )}

          <div className="pt-2 space-y-4">
            <ProButton
              type="submit"
              variant="primary"
              className="w-full h-12 text-base shadow-glow-primary"
              disabled={isLoading || !token}
              isLoading={isLoading}
            >
              Đặt lại mật khẩu
            </ProButton>

            <Link to="/login" className="block w-full">
              <ProButton variant="ghost" className="w-full h-12 text-base text-slate-500 hover:text-slate-700" icon={ArrowLeft} iconPosition="left">
                Quay lại đăng nhập
              </ProButton>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
