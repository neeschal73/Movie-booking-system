import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'

import Navbar from './Pages/Navbar'
import MovieDetails from './Pages/MovieDetails'
import Booking from './Pages/Booking'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Home from './Pages/Home'
import Movies from './Pages/Movies'
import MyBookings from './Pages/MyBookings'
import Confirmation from './Pages/Confirmation'

import { AuthProvider } from './Context/authcontext'
import { seedFirestore } from './seed/seedData'
import './index.css'

export default function App() {

  useEffect(() => {
    seedFirestore();
  }, []);

  return (
    <AuthProvider>
      <>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </>
    </AuthProvider>
  )
}
