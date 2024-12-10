import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import StudyGroups from './components/StudyGroups/StudyGroups';
import MainLayout from '@/layouts/MainLayout';

const FlashcardDashboard = lazy(() => import('@/pages/flashcards/FlashcardDashboard'));

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/study-groups">Study Groups & Scheduling</Link></li>
            <li><Link to="/flashcards">Flashcards</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/study-groups" element={<StudyGroups />} />
          <Route path="/flashcards" element={
          <MainLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>}>
              <FlashcardDashboard />
            </Suspense>
          </MainLayout>
        } />
        </Routes>
      </div>
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
