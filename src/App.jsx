import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

// Pages
import Navbar from './Pages/Navbar';
import Footer from './Pages/Footer';
import Home from './Pages/Home';
import Movies from './Pages/Movies';
import MovieDetails from './Pages/MovieDetails';
import Booking from './Pages/Booking';
import MyBookings from './Pages/MyBookings';
import Confirmation from './Pages/Confirmation';
import Login from './Pages/Login';
import Register from './Pages/Register';

// Context & Data
import { AuthProvider } from './Context/authcontext';
import { seedFirestore } from './seed/seedData';

// Styles
import './index.css';

/**
 * App Component
 * Handles Routing, Authentication Context, and Initial Data Seeding
 */
export default function App() {

  useEffect(() => {
    // This runs once when the app mounts.
    // The seedFirestore function in seedData.js handles the logic 
    // to check if data already exists before writing.
    const initializeApp = async () => {
      try {
        await seedFirestore();
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initializeApp();
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        {/* Navigation bar stays visible on all pages */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            {/* Standard Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            
            {/* Dynamic Routes */}
            <Route path="/movies/:id" element={<MovieDetails />} />
            <Route path="/booking/:id" element={<Booking />} />
            
            {/* User Specific Routes */}
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/confirmation" element={<Confirmation />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 404 Catch-all */}
            <Route path="*" element={<div className="p-20 text-center text-slate-400">Page Not Found</div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}