import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Layout,
  BookOpen,
  Users,
  MessageCircle,
  Zap,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  GraduationCap,
  Calendar,
  UserPlus,
  HelpCircle,
  User,
  Settings,
  FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ClayCard from '@/components/ui/ClayCard';
import Logo from '@/components/ui/Logo';

const SidebarItem = ({ icon: Icon, label, to, isActive, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
      ${isActive
        ? 'bg-primary-500 text-white shadow-glow-primary'
        : 'text-slate-500 hover:bg-white/50 hover:text-primary-600'
      }
    `}
  >
    <Icon size={20} className={isActive ? 'animate-pulse-slow' : 'group-hover:scale-110 transition-transform'} />
    <span className="font-bold">{label}</span>
  </Link>
);

export const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation Items based on HUSTUDENT Context
  // Navigation Groups for organized Sidebar
  const navGroups = [
    {
      title: 'Menu Chính',
      items: [
        { label: 'Tổng quan', icon: Layout, to: '/home' },
      ]
    },
    {
      title: 'Học Tập',
      items: [
        { label: 'Flashcards', icon: Zap, to: '/flashcards' },
        { label: 'Trắc nghiệm', icon: BookOpen, to: '/quizzes' },
        { label: 'Tài liệu', icon: FileText, to: '/posts' },
        { label: 'Hỏi đáp', icon: HelpCircle, to: '/questions' },
        { label: 'Lịch học', icon: Calendar, to: '/schedule' },
      ]
    },
    {
      title: 'Cộng Đồng',
      items: [
        { label: 'Nhóm học tập', icon: Users, to: '/groups' },
        { label: 'Tìm bạn học', icon: Search, to: '/matching' },
        { label: 'Bạn bè', icon: UserPlus, to: '/friends' },
        { label: 'Tin nhắn', icon: MessageCircle, to: '/messages' },
      ]
    }
  ];

  const isMessagesPage = location.pathname.startsWith('/messages');

  return (
    <div className="h-screen bg-clay-bg bg-gradient-mesh font-body flex overflow-hidden">

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full p-6 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 ml-2 mb-10 shrink-0">
            <Logo size="sm" />
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-0 space-y-6 min-h-0">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                {group.title && (
                  <h3 className="px-2 mb-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                    {group.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <SidebarItem
                      key={item.to}
                      icon={item.icon}
                      label={item.label}
                      to={item.to}
                      isActive={location.pathname.startsWith(item.to) && item.to !== '/home' || location.pathname === item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* User Profile Snippet & Logout */}
          <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-1 shrink-0">
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
              <ClayCard className="!p-2 !bg-white/60 cursor-pointer hover:!bg-white/80 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-primary-500 p-0.5">
                    <img
                      src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=random`}
                      alt="User"
                      className="w-full h-full rounded-full bg-white object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{user?.full_name || 'Sinh viên'}</p>
                    <p className="text-slate-500 text-xs truncate">{user?.email || 'student@hust.edu.vn'}</p>
                  </div>
                  <User size={16} className="text-slate-400" />
                </div>
              </ClayCard>
            </Link>



            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors font-bold"
            >
              <LogOut size={20} />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Menu Button - Floating FAB */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-6 right-6 z-30 p-3 bg-white/90 backdrop-blur-lg rounded-full text-slate-600 hover:text-primary-600 hover:bg-white shadow-lg hover:shadow-xl transition-all"
        >
          <Menu size={24} />
        </button>


        {/* Scrollable Page Content */}
        {isMessagesPage ? (
          <div className="flex-1 overflow-hidden p-6 pt-0">
            <div className="h-full w-full">
              {children}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-0 scroll-smooth">
            <div className="max-w-7xl mx-auto w-full pb-10 animate-fade-in-up">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MainLayout;
