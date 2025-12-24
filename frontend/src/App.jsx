import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import StudyGroups from './components/StudyGroups/StudyGroups';
import MainLayout from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const FlashcardDashboard = lazy(() => import('@/pages/flashcards/FlashcardDashboard'));
const SetDetailPage = lazy(() => import('@/pages/flashcards/SetDetailPage'));
const FlashcardStudy = lazy(() => import('@/pages/flashcards/FlashcardStudy'));
const FlashcardMatch = lazy(() => import('@/pages/flashcards/FlashcardMatch'));
const QuizDashboard = lazy(() => import('@/pages/quizzes/QuizDashboard'));
const TakeQuiz = lazy(() => import('@/pages/quizzes/TakeQuiz'));
const QuizEditor = lazy(() => import('@/pages/quizzes/QuizEditor'));
const PostsPage = lazy(() => import('@/pages/PostsPage'));
const QuestionsPage = lazy(() => import('@/pages/QuestionsPage'));
const QuestionDetailPage = lazy(() => import('@/pages/QuestionDetailPage'));

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/study-groups" element={<StudyGroups />} />
      <Route element={<ProtectedRoute />}>
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
        <Route path="/posts" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <PostsPage />
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
        <Route path="/questions/:questionId" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <QuestionDetailPage />
            </Suspense>
          </MainLayout>
        } />
      </Route>
      
    </Routes>
  )}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h1>Welcome to Hustudent</h1>
      <p>Navigate to Study Groups & Scheduling.</p>
    </div>
  );
}

export default App;
