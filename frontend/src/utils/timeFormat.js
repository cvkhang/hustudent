/**
 * Smart timestamp formatting like Messenger
 */

/**
 * Format time for message bubble (short format)
 */
export const formatMessageTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format relative time (vừa xong, 5 phút trước, etc.)
 */
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 30) return 'Vừa xong';
  if (diffSeconds < 60) return `${diffSeconds} giây trước`;
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

/**
 * Format date divider (Hôm nay, Hôm qua, Thứ X, DD/MM)
 */
export const formatDateDivider = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today - messageDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  }

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Check if two dates are on different days
 */
export const isDifferentDay = (date1, date2) => {
  if (!date1 || !date2) return true;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toDateString() !== d2.toDateString();
};

/**
 * Check if messages are far apart (> 5 minutes)
 */
export const isTimestampGap = (date1, date2, gapMinutes = 5) => {
  if (!date1 || !date2) return true;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2 - d1);
  return diffMs > gapMinutes * 60 * 1000;
};
