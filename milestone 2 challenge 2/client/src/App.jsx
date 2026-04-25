import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Feed from './pages/Feed';
import Issues from './pages/Issues';
import Events from './pages/Events';
import Recommendations from './pages/Recommendations';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/events" element={<Events />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;