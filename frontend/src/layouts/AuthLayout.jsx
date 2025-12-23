import React from 'react';
import { Zap, Star, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClayCard from '../components/ui/ClayCard';
import Logo from '../components/ui/Logo';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-body bg-clay-bg bg-gradient-mesh overflow-hidden relative">

      {/* Absolute Home Link */}
      <Link to="/" className="absolute top-6 left-6 z-50 lg:hidden text-slate-700">
        <div className="bg-white/50 backdrop-blur rounded-xl flex items-center justify-center text-slate-700 shadow-clay-btn p-2">
          <Logo size="sm" />
        </div>
      </Link>

      {/* Left: Form */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10 w-full lg:w-full">
        <div className="mx-auto w-full max-w-[420px] space-y-8 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <Link to="/" className="inline-flex items-center justify-center lg:justify-start gap-3 mb-8 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Zap size={28} fill="currentColor" />
              </div>
              <span className="font-heading font-black text-3xl text-slate-800 tracking-tight">
                HUST<span className="text-primary-600">UDENT</span>
              </span>
            </Link>

            <h2 className="text-4xl font-black tracking-tight text-slate-800 mb-3">
              {title}
            </h2>
            <div className="text-base text-slate-500 font-bold">
              {subtitle}
            </div>
          </div>

          <div className="mt-8 bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-clay-card border border-white/60 relative overflow-hidden">
            {/* Subtle internal shine */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Premium Visuals */}
      <div className="relative hidden lg:flex items-center justify-center bg-transparent w-full h-full">
        {/* Animated Background blobs specific to right side */}
        <div className="absolute inset-0 overflow-hidden rounded-l-[3rem] bg-white/30 backdrop-blur-sm border-l border-white/40 ml-12 shadow-2xl">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-primary-200 to-indigo-200 rounded-full blur-[80px] opacity-60 animate-morph mix-blend-multiply" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-secondary-200 to-pink-200 rounded-full blur-[80px] opacity-60 animate-morph animation-delay-2000 mix-blend-multiply" />

          {/* Visual Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-10 text-center">

            {/* Floating Cards Composition */}
            <div className="relative w-full max-w-md h-[400px] [perspective:1000px]">

              {/* Main Card */}
              <ClayCard className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-6 !rounded-[2rem] z-20 animate-float-slow bg-white/80">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-yellow to-orange-400 p-1 shadow-lg">
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="Student" className="w-full h-full bg-white rounded-full" />
                  </div>
                  <div className="space-y-2 w-full flex flex-col items-center">
                    <div className="bg-slate-200 h-3 w-32 rounded-full" />
                    <div className="bg-slate-100 h-2 w-20 rounded-full" />
                  </div>
                  <div className="flex gap-2 w-full pt-2">
                    <div className="h-8 flex-1 bg-primary-100/50 rounded-lg" />
                    <div className="h-8 flex-1 bg-secondary-100/50 rounded-lg" />
                  </div>
                </div>
              </ClayCard>

              {/* Floating Badges */}
              <div className="absolute top-0 right-0 animate-float-delayed z-30">
                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-clay-card-sm flex items-center gap-2 border border-white/50">
                  <div className="bg-green-100 p-1.5 rounded-lg text-green-600"><Star size={16} fill="currentColor" /></div>
                  <span className="font-bold text-slate-700 text-sm">GPA 4.0</span>
                </div>
              </div>

              <div className="absolute bottom-10 -left-4 animate-float z-30">
                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-clay-card-sm flex items-center gap-2 border border-white/50">
                  <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><BookOpen size={16} /></div>
                  <span className="font-bold text-slate-700 text-sm">Đã ôn 50+ đề</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 mt-12 relative z-20">
              <h3 className="text-4xl font-black text-slate-800 leading-tight drop-shadow-sm">
                Học tập <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Hiệu Quả</span> <br />
                Kết nối <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-red-500">Đam Mê</span>
              </h3>
              <p className="text-slate-600 font-medium text-lg max-w-sm mx-auto">
                Tham gia cùng 15,000+ sinh viên HUST và chinh phục mục tiêu học tập của bạn ngay hôm nay.
              </p>

              <div className="flex items-center justify-center gap-2 pt-4 opacity-70">
                <Users size={20} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-500">Tin tưởng bởi sinh viên Bách Khoa</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
