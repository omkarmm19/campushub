import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

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
              <Route path="/housing" element={<div className="p-8 text-center text-slate-500">Housing Module Coming Soon</div>} />
              <Route path="/marketplace" element={<div className="p-8 text-center text-slate-500">Marketplace Module Coming Soon</div>} />
              <Route path="/lost-found" element={<div className="p-8 text-center text-slate-500">Lost & Found Module Coming Soon</div>} />
              <Route path="/opportunities" element={<div className="p-8 text-center text-slate-500">Opportunities Module Coming Soon</div>} />
              <Route path="/events" element={<div className="p-8 text-center text-slate-500">Events Module Coming Soon</div>} />
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
