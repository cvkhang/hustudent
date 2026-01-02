import React, { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { SocketProvider } from '@/context/SocketContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';

// Eager load critical pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';

// Lazy load all other pages for code splitting
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const FlashcardDashboard = lazy(() => import('@/pages/flashcards/FlashcardDashboard'));
const FlashcardStudy = lazy(() => import('@/pages/flashcards/FlashcardStudy'));
const FlashcardMatch = lazy(() => import('@/pages/flashcards/FlashcardMatch'));
const SetDetailPage = lazy(() => import('@/pages/flashcards/SetDetailPage'));
const QuizDashboard = lazy(() => import('@/pages/quizzes/QuizDashboard'));
const TakeQuiz = lazy(() => import('@/pages/quizzes/TakeQuiz'));
const QuizEditor = lazy(() => import('@/pages/quizzes/QuizEditor'));
const GroupListPage = lazy(() => import('./pages/GroupListPage'));
const Matching = lazy(() => import('@/pages/matching/Matching'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const QuestionsPage = lazy(() => import('@/pages/QuestionsPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const PostsPage = lazy(() => import('@/pages/PostsPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const QuestionDetailPage = lazy(() => import('@/pages/QuestionDetailPage'));
const GroupDetailPage = lazy(() => import('./pages/GroupDetailPage'));
import AdminRoute from '@/components/AdminRoute';
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
// const AdminRoute = lazy(() => import('@/components/AdminRoute')); // Removed lazy
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));

// Redirect to Home if already logged in
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // or loading spinner
  if (user) return <Navigate to="/home" replace />;

  return children;
};

// Placeholder components for new routes
const PlaceholderPage = ({ title }) => (
  <div className="p-8">
    <h1 className="text-3xl font-black text-slate-800 mb-4">{title}</h1>
    <p className="text-slate-500">Chức năng đang được phát triển...</p>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes with Redirect if Auth */}
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
            <RegisterPage />
          </Suspense>
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
            <ForgotPasswordPage />
          </Suspense>
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
            <ResetPasswordPage />
          </Suspense>
        </PublicRoute>
      } />

      {/* Protected Routes - All wrapped in Suspense for lazy loading */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <HomePage />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/flashcards" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <FlashcardDashboard />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/flashcards/:id" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <SetDetailPage />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/flashcards/:id/study" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <FlashcardStudy />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/flashcards/:id/match" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <FlashcardMatch />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/quizzes" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <QuizDashboard />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/quizzes/:id/take" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <TakeQuiz />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/quizzes/:id/edit" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <QuizEditor />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/groups" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <GroupListPage />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/groups/:id" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <GroupDetailPage />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/matching" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <Matching />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/friends" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <FriendsPage />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/questions" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <QuestionsPage />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/profile" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <ProfilePage />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/messages" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <MessagesPage />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/posts" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <PostsPage />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/notifications" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <NotificationsPage />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/questions/:questionId" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <QuestionDetailPage />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/schedule" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <SchedulePage />
            </Suspense>
          </MainLayout>
        } />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <AdminDashboardPage />
            </Suspense>
          </MainLayout>
        } />
        <Route path="/admin/users" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <AdminUsersPage />
            </Suspense>
          </MainLayout>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Configure QueryClient with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      retry: 1, // Only retry failed requests once
    },
  },
});

// ...

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <Router>
              <AppRoutes />
              <Toaster position="top-right" richColors />
            </Router>
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
