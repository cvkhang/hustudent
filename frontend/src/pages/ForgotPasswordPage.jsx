import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import ProButton from '@/components/ui/ProButton';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // Assuming the endpoint is /api/auth/forgot-password based on standard practices
      // Will verify exact path with grep_search results
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setStatus('success');
      setMessage('Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu vào email của bạn. Vui lòng kiểm tra hộp thư đến (và cả mục Spam).');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage(err.response?.data?.error?.message || 'Có lỗi xảy ra. Vui lòng kiểm tra lại email hoặc thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Quên mật khẩu?"
      subtitle="Đừng lo, hãy nhập email để chúng tôi hỗ trợ bạn lấy lại mật khẩu."
    >
      {status === 'success' ? (
        <div className="space-y-6 text-center animate-fade-in-up">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Đã gửi email!</h3>
          <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
          <div className="pt-4">
            <Link to="/login">
              <ProButton variant="primary" className="w-full">
                Quay lại Đăng nhập
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
            label="Email sinh viên"
            autoComplete="email"
            required
            placeholder="student@sis.hust.edu.vn"
            startIcon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {status === 'error' && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 animate-pulse flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm font-medium text-red-600 leading-tight">{message}</div>
            </div>
          )}

          <div className="pt-2 space-y-4">
            <ProButton
              type="submit"
              variant="primary"
              className="w-full h-12 text-base shadow-glow-primary"
              disabled={isLoading}
              isLoading={isLoading}
            >
              Gửi yêu cầu
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
