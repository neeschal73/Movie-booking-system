import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'

import Navbar from './Pages/Navbar'
import MoviesDetails from './Pages/MovieDetails'
import BookingSystem from "./Pages/MyBookings"
import Login from './Pages/Login'
import Register from './Pages/Register'
import Home from './Pages/Home'
import Movies from './Pages/Movies'

import { seedFirestore } from './seed/seedData'
import './index.css'

export default function App() {

  useEffect(() => {
    seedFirestore();
  }, []);

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MoviesDetails />} />
        <Route path="/booking" element={<BookingSystem />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}
