import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';
import { MAJORS, ACADEMIC_YEARS, INTERESTS } from '@/lib/constants';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  MapPin,
  Edit3,
  Camera,
  Award,
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  Users,
  Zap,
  FileText,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <ClayCard className="!p-5 hover:scale-[1.02] transition-transform cursor-pointer">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
        <Icon size={24} />
      </div>
      <div>
        <h4 className="text-2xl font-black text-slate-800 leading-none mb-1">{value}</h4>
        <p className="text-sm font-bold text-slate-400">{label}</p>
      </div>
    </div>
  </ClayCard>
);

const AchievementBadge = ({ icon: Icon, title, description, unlocked }) => (
  <ClayCard className={`!p-4 ${unlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'opacity-50'} transition-all hover:scale-[1.02] cursor-pointer`}>
    <div className="flex flex-col items-center text-center gap-2">
      <div className={`p-3 rounded-full ${unlocked ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
        <Icon size={28} />
      </div>
      <h5 className="font-black text-slate-800 text-sm">{title}</h5>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  </ClayCard>
);

export default function ProfilePage() {
  const { user, refreshProfile, setUser } = useAuth();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const avatarInputRef = React.useRef(null);
  const coverInputRef = React.useRef(null);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    major: user?.major || '',
    academic_year: user?.academic_year || '',
    university: user?.university || '',
    interests: user?.interests || [],
    goals: user?.goals || '',
    bio: user?.bio || ''
  });

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('File quá lớn (max 5MB)', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append(type === 'avatar' ? 'avatar' : 'cover', file);

      const endpoint = type === 'avatar' ? '/upload/avatar' : '/upload/cover';
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update local user state immediately with new URL
      const newUrl = type === 'avatar' ? res.data.data.avatarUrl : res.data.data.coverUrl;
      setUser(prev => ({
        ...prev,
        [type === 'avatar' ? 'avatar_url' : 'cover_photo_url']: newUrl
      }));

      addToast(`Cập nhật ${type === 'avatar' ? 'ảnh đại diện' : 'ảnh bìa'} thành công!`, 'success');
      refreshProfile(); // Sync with server fully
    } catch (error) {
      console.error('Upload failed:', error);
      addToast('Lỗi khi tải ảnh lên. Vui lòng thử lại.', 'error');
    }
  };

  // Stats derived from user data (relevant to app features)
  const stats = [
    { icon: Zap, label: 'Flashcards đã học', value: user?.stats?.flashcards_learned || 0, color: 'from-yellow-400 to-orange-500' },
    { icon: BookOpen, label: 'Quiz hoàn thành', value: user?.stats?.quizzes_completed || 0, color: 'from-blue-400 to-indigo-600' },
    { icon: Users, label: 'Nhóm tham gia', value: user?.stats?.groups_joined || 0, color: 'from-green-400 to-emerald-600' },
    { icon: FileText, label: 'Tài liệu đã đóng góp', value: user?.stats?.posts_uploaded || 0, color: 'from-purple-400 to-violet-600' },
    { icon: HelpCircle, label: 'Câu hỏi', value: user?.stats?.questions_asked || 0, color: 'from-cyan-400 to-blue-500' },
    { icon: MessageSquare, label: 'Câu trả lời', value: user?.stats?.answers_count || 0, color: 'from-pink-400 to-rose-600' }
  ];

  // Dynamic Achievements logic
  const achievements = [
    { icon: Trophy, title: 'Người mới', description: 'Hoàn thành hồ sơ', unlocked: !!user?.full_name },
    { icon: Zap, title: 'Học siêng', description: '100+ flashcards', unlocked: (user?.stats?.flashcards_learned || 0) >= 100 },
    { icon: Target, title: 'Chính xác', description: 'Quiz completed', unlocked: (user?.stats?.quizzes_completed || 0) >= 1 },
    { icon: Award, title: 'Đội trưởng', description: 'Tạo 3 nhóm học', unlocked: false }, // Need group ownership count
    { icon: Users, title: 'Kết nối', description: 'Tham gia 5 nhóm', unlocked: (user?.stats?.groups_joined || 0) >= 5 },
    { icon: BookOpen, title: 'Tri thức', description: '200+ flashcards', unlocked: (user?.stats?.flashcards_learned || 0) >= 200 }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { email, interests, ...rest } = formData;
      const updateData = {
        ...rest,
        interests: typeof interests === 'string' ? interests.split(',').map(s => s.trim()).filter(Boolean) : interests
      };

      const res = await api.patch('/me', updateData);

      // 1. Optimistic Update: Update UI immediately so user sees changes instantly
      setUser(prev => ({ ...prev, ...updateData }));

      // 2. Fetch fresh data from server (background sync) to ensure consistency (e.g. stats)
      await refreshProfile();

      setIsEditing(false);
      addToast('Cập nhật hồ sơ thành công!', 'success');
    } catch (error) {
      console.error('Failed to update profile:', error);
      addToast('Cập nhật thất bại. Vui lòng thử lại.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden File Inputs */}
      <input type="file" ref={avatarInputRef} onChange={(e) => handleFileUpload(e, 'avatar')} hidden accept="image/*" />
      <input type="file" ref={coverInputRef} onChange={(e) => handleFileUpload(e, 'cover')} hidden accept="image/*" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <User className="text-indigo-500" size={20} />
            Hồ sơ cá nhân
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Quản lý thông tin và theo dõi tiến độ học tập
          </p>
        </div>
        <ProButton
          variant={isEditing ? 'outline' : 'primary'}
          icon={Edit3}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Hủy' : 'Chỉnh sửa'}
        </ProButton>
      </div>

      {/* Profile Card */}
      <ClayCard className="!p-0 overflow-hidden">
        {/* Cover Image */}
        <div className="h-48 relative bg-slate-100 group">
          {user?.cover_photo_url ? (
            <img src={user.cover_photo_url} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-purple relative">
              <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>
            </div>
          )}

          {(isEditing || !user?.cover_photo_url) && (
            <button
              onClick={() => coverInputRef.current.click()}
              className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-md rounded-xl text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 border border-white/20"
              title="Thay đổi ảnh bìa"
            >
              <Camera size={20} />
            </button>
          )}
        </div>

        <div className="p-8 relative">
          {/* Avatar */}
          <div className="absolute -top-16 left-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-white p-1 shadow-2xl ring-4 ring-white/50">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-full h-full rounded-full object-cover bg-slate-100"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-primary-600 font-black text-4xl">
                    {user?.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current.click()}
                className="absolute bottom-1 right-1 p-2.5 bg-slate-800 text-white rounded-full shadow-lg hover:bg-black transition-all border-2 border-white cursor-pointer hover:scale-110 active:scale-95 z-10"
                title="Thay đổi ảnh đại diện"
              >
                <Camera size={16} />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-14">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Trường học</label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-bold"
                      placeholder="VD: Đại học Bách khoa Hà Nội"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-500 cursor-not-allowed"
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SearchableSelect
                    label="Ngành học"
                    value={formData.major}
                    onChange={(val) => setFormData({ ...formData, major: val })}
                    options={MAJORS}
                    placeholder="Chọn ngành học"
                  />
                  <SearchableSelect
                    label="Niên khóa"
                    value={formData.academic_year}
                    onChange={(val) => setFormData({ ...formData, academic_year: val })}
                    options={ACADEMIC_YEARS}
                    placeholder="Chọn khóa"
                  />
                </div>

                <div>
                  <div>
                    <SearchableSelect
                      label="Sở thích"
                      value={Array.isArray(formData.interests) ? formData.interests : []}
                      onChange={(val) => setFormData({ ...formData, interests: val })}
                      options={INTERESTS}
                      placeholder="Chọn sở thích"
                      multiple={true}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mục tiêu học tập</label>
                  <textarea
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-bold resize-none"
                    placeholder="VD: Đạt CPA 3.6, Học bổng kỳ tới..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Giới thiệu</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 font-bold resize-none"
                    placeholder="Giới thiệu bản thân..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <ProButton type="submit" variant="primary">Lưu thay đổi</ProButton>
                  <ProButton type="button" variant="outline" onClick={() => setIsEditing(false)}>Hủy</ProButton>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 mb-1">{user?.full_name}</h2>
                  <div className="flex items-center gap-2 text-slate-500 font-bold">
                    <Mail size={16} />
                    {user?.email}
                  </div>
                  {/* University */}
                  <div className="flex items-center gap-2 text-slate-500 font-bold mt-1">
                    <MapPin size={16} />
                    {user?.university || 'Đại học Bách khoa Hà Nội'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${user?.major ? 'bg-primary-50 border-primary-100 text-primary-700' : 'bg-slate-50 border-slate-100 text-slate-400 border-dashed'}`}>
                    <GraduationCap size={18} />
                    <span className="font-bold">{user?.major || 'Chưa cập nhật ngành'}</span>
                  </div>

                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${user?.academic_year ? 'bg-secondary-50 border-secondary-100 text-secondary-700' : 'bg-slate-50 border-slate-100 text-slate-400 border-dashed'}`}>
                    <Calendar size={18} />
                    <span className="font-bold">{user?.academic_year ? `Khóa ${user.academic_year}` : 'Chưa cập nhật khóa'}</span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Bio */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-2">
                      <User size={18} className="text-primary-500" /> Giới thiệu
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                      {user?.bio || 'Chưa có thông tin giới thiệu.'}
                    </p>
                  </div>

                  {/* Goals */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-2">
                      <Target size={18} className="text-accent-orange" /> Mục tiêu
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                      {user?.goals || 'Chưa đặt mục tiêu.'}
                    </p>
                  </div>
                </div>

                {/* Interests */}
                {user?.interests && user?.interests.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Trophy size={18} className="text-accent-yellow" /> Sở thích
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 shadow-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </ClayCard>

      {/* Stats Grid */}
      <div>
        <h3 className="text-2xl font-black text-slate-800 mb-4">Thống kê học tập</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-2xl font-black text-slate-800 mb-4">Thành tích</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {achievements.map((achievement, idx) => (
            <AchievementBadge key={idx} {...achievement} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-2xl font-black text-slate-800 mb-4">Hoạt động gần đây</h3>
        <div className="space-y-3">
          {(!user?.recent_activity || user.recent_activity.length === 0) ? (
            <p className="text-slate-500 italic">Chưa có hoạt động gần đây.</p>
          ) : (
            user.recent_activity.map((activity, idx) => {
              // Icon mapping based on string from backend
              const icons = { Trophy, Zap, Users, BookOpen, Target };
              const Icon = icons[activity.icon] || Zap;

              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600',
                green: 'bg-green-50 text-green-600',
                orange: 'bg-orange-50 text-orange-600'
              };

              const timeAgo = (dateStr) => {
                const date = new Date(dateStr);
                const now = new Date();
                const diff = (now - date) / 1000;
                if (diff < 60) return 'Vừa xong';
                if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
                if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
                return `${Math.floor(diff / 86400)} ngày trước`;
              };

              return (
                <ClayCard key={idx} className="flex items-center gap-4 !p-4">
                  <div className={`p-2 rounded-lg ${colorClasses[activity.color] || 'bg-slate-100'}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-slate-800">{activity.action}</h5>
                    <p className="text-sm text-slate-500">{activity.subject}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{timeAgo(activity.time)}</span>
                </ClayCard>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
