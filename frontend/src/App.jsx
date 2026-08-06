import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import HousingList from './pages/housing/HousingList';
import HousingDetail from './pages/housing/HousingDetail';
import HousingCreate from './pages/housing/HousingCreate';
import HousingEdit from './pages/housing/HousingEdit';
import ProtectedRoute from './components/common/ProtectedRoute';
import MarketplaceList from './pages/marketplace/MarketplaceList';
import MarketplaceDetail from './pages/marketplace/MarketplaceDetail';
import MarketplaceCreate from './pages/marketplace/MarketplaceCreate';
import { LostFoundList, LostFoundDetail, LostFoundCreate } from './pages/lostfound/LostFound';
import { OpportunitiesList, OpportunityDetail, OpportunityCreate } from './pages/opportunities/Opportunities';
import { EventsList, EventDetail, EventCreate } from './pages/events/Events';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Module routes placeholder - will be added as we build each module */}
              <Route path="/housing" element={<HousingList />} />
              <Route path="/housing/create" element={<ProtectedRoute><HousingCreate /></ProtectedRoute>} />
              <Route path="/housing/:id/edit" element={<ProtectedRoute><HousingEdit /></ProtectedRoute>} />
              <Route path="/housing/:id" element={<HousingDetail />} />
              <Route path="/marketplace" element={<MarketplaceList />} />
              <Route path="/marketplace/create" element={<ProtectedRoute><MarketplaceCreate /></ProtectedRoute>} />
              <Route path="/marketplace/:id" element={<MarketplaceDetail />} />
              <Route path="/lost-found" element={<LostFoundList />} />
              <Route path="/lost-found/create" element={<ProtectedRoute><LostFoundCreate /></ProtectedRoute>} />
              <Route path="/lost-found/:id" element={<LostFoundDetail />} />
              <Route path="/opportunities" element={<OpportunitiesList />} />
              <Route path="/opportunities/create" element={<ProtectedRoute><OpportunityCreate /></ProtectedRoute>} />
              <Route path="/opportunities/:id" element={<OpportunityDetail />} />
              <Route path="/events" element={<EventsList />} />
              <Route path="/events/create" element={<ProtectedRoute><EventCreate /></ProtectedRoute>} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/dashboard" element={<div className="p-8 text-center text-slate-500">Student Dashboard Coming Soon</div>} />
              <Route path="/saved" element={<div className="p-8 text-center text-slate-500">Saved Posts Coming Soon</div>} />
              <Route path="/admin" element={<div className="p-8 text-center text-slate-500">Admin Panel Coming Soon</div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
