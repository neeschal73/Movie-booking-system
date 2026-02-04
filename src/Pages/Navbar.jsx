import React from "react"
import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="bg-black text-white px-6 py-4 flex justify-between items-center shadow-lg">
      <Link to="/home" className="text-2xl font-bold text-red-500">
        CineBook
      </Link>

      <div className="space-x-6 hidden md:block">
        <Link to="/home" className="hover:text-red-400">Home</Link>
        <Link to="/movies" className="hover:text-red-400">Movies</Link>
        <Link to="/booking" className="hover:text-red-400">Bookings</Link>
      </div>

      <div className="space-x-3">
        <Link to="/login" className="border px-3 py-1 rounded hover:bg-red-500">Login</Link>
        <Link to="/register" className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Register</Link>
      </div>
    </nav>
  )
}
