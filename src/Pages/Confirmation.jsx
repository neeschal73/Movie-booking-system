import React from "react"
import { Link, useLocation } from "react-router-dom"

export default function Confirmation() {
  const location = useLocation()
  const booking = location.state?.booking

  if (!booking) {
    return (
      <div className="bg-gray-950 min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Booking Found</h1>
          <Link to="/movies" className="text-red-400 hover:text-red-300">
            Browse Movies
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen pt-16">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-scaleIn">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 animate-fadeIn">Booking Confirmed!</h1>
          <p className="text-gray-400 animate-fadeIn">Your tickets have been booked successfully</p>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 animate-scaleIn">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
            <span className="text-gray-400">Booking ID</span>
            <span className="text-white font-mono">{booking.id}</span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Movie</span>
              <span className="text-white font-medium">{booking.movieTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Theatre</span>
              <span className="text-white">{booking.showtime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Showtime</span>
              <span className="text-white">{booking.showtime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Seats</span>
              <span className="text-white">{booking.seats?.join(", ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount Paid</span>
              <span className="text-red-500 font-bold">₹{booking.totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300">
            Download Ticket
          </button>
          <Link to="/my-bookings" className="flex-1">
            <button className="w-full py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-300">
              View My Bookings
            </button>
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Want to book more movies?</p>
          <Link
            to="/movies"
            className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            Browse More Movies
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
