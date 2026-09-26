/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TheoryPage from './pages/TheoryPage';
import GardensPage from './pages/GardensPage';
import ArchivumPage from './pages/ArchivumPage';
import AboutPage from './pages/AboutPage';
import MissionPage from './pages/MissionPage';
import SolutionsPage from './pages/SolutionsPage';
import MultiplicityPage from './pages/MultiplicityPage';
import PhilosophyPage from './pages/PhilosophyPage';
import ConsultationPage from './pages/ConsultationPage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/theory" element={<TheoryPage />} />
          <Route path="/multiplicity" element={<MultiplicityPage />} />
          <Route path="/gardens" element={<GardensPage />} />
          <Route path="/archivum" element={<ArchivumPage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/mission" element={<MissionPage />} />
          <Route path="/philosophy" element={<PhilosophyPage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
