/**
 * App Component
 * 
 * Main application component with routing
 * Sets up React Router for navigation
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Schedules from './pages/Schedules';
import Runs from './pages/Runs';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/runs" element={<Runs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
