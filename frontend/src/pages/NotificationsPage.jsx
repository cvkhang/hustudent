import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Users,
  HelpCircle,
  CheckCircle,
  Calendar,
  Trash2,
  Check,
  MoreHorizontal
} from 'lucide-react';

// API
const notificationsAPI = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data.data || res.data;
  },
  markAsRead: async (notificationId) => {
    const res = await api.post(`/notifications/${notificationId}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },
  deleteNotification: async (notificationId) => {
    const res = await api.delete(`/notifications/${notificationId}`);
    return res.data;
  }
};

// Icon mapping for notification types
const notificationIcons = {
  friend_request: { icon: UserPlus, color: 'bg-blue-500' },
  friend_accepted: { icon: Users, color: 'bg-green-500' },
  like: { icon: Heart, color: 'bg-red-500' },
  comment: { icon: MessageCircle, color: 'bg-purple-500' },
  answer: { icon: HelpCircle, color: 'bg-orange-500' },
  question: { icon: HelpCircle, color: 'bg-amber-500' },
  session: { icon: Calendar, color: 'bg-teal-500' },
  group: { icon: Users, color: 'bg-indigo-500' },
  default: { icon: Bell, color: 'bg-slate-500' }
};

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const iconConfig = notificationIcons[notification.type] || notificationIcons.default;
  const Icon = iconConfig.icon;

  const getNotificationText = () => {
    switch (notification.type) {
      case 'friend_request':
        return <><strong>{notification.sender?.full_name}</strong> đã gửi lời mời kết bạn</>;
      case 'friend_accepted':
        return <><strong>{notification.sender?.full_name}</strong> đã chấp nhận lời mời kết bạn</>;
      case 'like':
        return <><strong>{notification.sender?.full_name}</strong> đã thích bài viết của bạn</>;
      case 'comment':
        return <><strong>{notification.sender?.full_name}</strong> đã bình luận bài viết của bạn</>;
      case 'answer':
        return <><strong>{notification.sender?.full_name}</strong> đã trả lời câu hỏi của bạn</>;
      case 'session':
        return <>Buổi học <strong>{notification.session?.title}</strong> sắp diễn ra</>;
      case 'group':
        return <>Hoạt động mới trong nhóm <strong>{notification.group?.name}</strong></>;
      default:
        return notification.message || 'Bạn có thông báo mới';
    }
  };

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${notification.read_at ? 'bg-white' : 'bg-primary-50'
      }`}>
      {/* Icon */}
      <div className={`p-2 rounded-xl ${iconConfig.color} text-white flex-shrink-0`}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700">{getNotificationText()}</p>
        <p className="text-xs text-slate-400 mt-1">
          {new Date(notification.created_at).toLocaleString('vi-VN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {!notification.read_at && (
          <ProButton
            variant="ghost"
            className="!p-2 text-green-600 hover:bg-green-50"
            onClick={() => onMarkRead(notification.id)}
            title="Đánh dấu đã đọc"
          >
            <Check size={16} />
          </ProButton>
        )}
        <ProButton
          variant="ghost"
          className="!p-2 text-red-500 hover:bg-red-50"
          onClick={() => onDelete(notification.id)}
          title="Xóa"
        >
          <Trash2 size={16} />
        </ProButton>
      </div>
    </div>
  );
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  // Query
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsAPI.getNotifications,
    enabled: !!user
  });

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: notificationsAPI.markAsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsAPI.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsAPI.deleteNotification,
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read_at;
    return true;
  });

  // Group by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at).toLocaleDateString('vi-VN');
    if (!groups[date]) groups[date] = [];
    groups[date].push(notification);
    return groups;
  }, {});

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <ClayCard className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Bell size={24} className="text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800">Thông báo</h1>
              <p className="text-sm text-slate-500">
                {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <ProButton
              variant="secondary"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isLoading}
            >
              <CheckCircle size={16} />
              <span className="ml-2">Đọc tất cả</span>
            </ProButton>
          )}
        </div>
      </ClayCard>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <ProButton
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </ProButton>
        <ProButton
          variant={filter === 'unread' ? 'primary' : 'secondary'}
          onClick={() => setFilter('unread')}
        >
          Chưa đọc
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </ProButton>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <ClayCard className="text-center py-12">
          <Bell size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">
            {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo'}
          </h3>
          <p className="text-slate-400">Các thông báo mới sẽ xuất hiện ở đây</p>
        </ClayCard>
      ) : (
        Object.entries(groupedNotifications).map(([date, items]) => (
          <div key={date} className="mb-6">
            <h3 className="text-sm font-bold text-slate-500 mb-3 px-2">{date}</h3>
            <ClayCard className="!p-2 space-y-1">
              {items.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={(id) => markReadMutation.mutate(id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </ClayCard>
          </div>
        ))
      )}
    </div>
  );
}
