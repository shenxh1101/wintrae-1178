import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BadgeNotification from '@/components/BadgeNotification';
import BooksPage from '@/pages/BooksPage';
import CheckinPage from '@/pages/CheckinPage';
import RewardsPage from '@/pages/RewardsPage';
import StatsPage from '@/pages/StatsPage';
import HistoryPage from '@/pages/HistoryPage';
import ExcerptsPage from '@/pages/ExcerptsPage';
import { useReadingStore } from '@/store/useReadingStore';
import { useEffect } from 'react';

function AppContent() {
  const ensureUser = useReadingStore((s) => s.ensureUser);
  useEffect(() => { ensureUser(); }, [ensureUser]);

  return (
    <>
      <Navbar />
      <BadgeNotification />
      <main className="pb-8">
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/checkin" element={<CheckinPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/excerpts" element={<ExcerptsPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
      <footer className="py-6 text-center text-sm text-gray-400">
        <p>📚 和孩子一起，让阅读成为习惯</p>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <AppContent />
      </div>
    </Router>
  );
}
