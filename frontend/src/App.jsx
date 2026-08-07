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
import MarketplaceEdit from './pages/marketplace/MarketplaceEdit';
import { LostFoundList, LostFoundDetail, LostFoundCreate, LostFoundEdit } from './pages/lostfound/LostFound';
import { OpportunitiesList, OpportunityDetail, OpportunityCreate, OpportunityEdit } from './pages/opportunities/Opportunities';
import { EventsList, EventDetail, EventCreate, EventEdit } from './pages/events/Events';
import Dashboard from './pages/dashboard/Dashboard';
import AdminPanel from './pages/admin/AdminPanel';

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
              <Route path="/marketplace/:id/edit" element={<ProtectedRoute><MarketplaceEdit /></ProtectedRoute>} />
              <Route path="/marketplace/:id" element={<MarketplaceDetail />} />
              <Route path="/lost-found" element={<LostFoundList />} />
              <Route path="/lost-found/create" element={<ProtectedRoute><LostFoundCreate /></ProtectedRoute>} />
              <Route path="/lost-found/:id/edit" element={<ProtectedRoute><LostFoundEdit /></ProtectedRoute>} />
              <Route path="/lost-found/:id" element={<LostFoundDetail />} />
              <Route path="/opportunities" element={<OpportunitiesList />} />
              <Route path="/opportunities/create" element={<ProtectedRoute><OpportunityCreate /></ProtectedRoute>} />
              <Route path="/opportunities/:id/edit" element={<ProtectedRoute><OpportunityEdit /></ProtectedRoute>} />
              <Route path="/opportunities/:id" element={<OpportunityDetail />} />
              <Route path="/events" element={<EventsList />} />
              <Route path="/events/create" element={<ProtectedRoute><EventCreate /></ProtectedRoute>} />
              <Route path="/events/:id/edit" element={<ProtectedRoute><EventEdit /></ProtectedRoute>} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/saved" element={<div className="p-8 text-center text-slate-500">Saved Posts Coming Soon</div>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
              <Route path="*" element={
                <div className="py-20 flex flex-col items-center text-center">
                  <div className="text-7xl font-black text-slate-200 mb-4">404</div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Page not found</h2>
                  <p className="text-slate-500 mb-6 text-sm">The page you're looking for doesn't exist.</p>
                  <a href="/" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition">← Go Home</a>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
