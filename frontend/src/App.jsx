import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudyGroups from './components/StudyGroups/StudyGroups';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/study-groups">Study Groups & Scheduling</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/study-groups" element={<StudyGroups />} />
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
