import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../Context/authcontext"
import { db } from "../config/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import ProtectedRoute from "../components/ProtectedRoute"

export default function MyBookings() {
  const { currentUser } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [currentUser])

  const fetchBookings = async () => {
    if (!currentUser) return
    
    setLoading(true)
    try {
      const q = query(collection(db, "bookings"), where("userId", "==", currentUser.uid))
      const bookingsSnapshot = await getDocs(q)
      const bookingsData = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setBookings(bookingsData)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="bg-gray-950 min-h-screen pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-white mb-8">
            My <span className="text-red-500">Bookings</span>
          </h1>

          {bookings.length === 0 ? (
            <div className="bg-gray-900/50 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No Bookings Yet</h2>
              <p className="text-gray-400 mb-6">You haven't booked any tickets yet. Start exploring movies!</p>
              <Link
                to="/movies"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
              >
                Browse Movies
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        {booking.poster_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${booking.poster_path}`}
                            alt={booking.movieTitle}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{booking.movieTitle}</h3>
                        <p className="text-gray-400 text-sm">{booking.theatreId}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-300">
                            <span className="text-gray-500">Show:</span> {booking.showtime}
                          </span>
                          <span className="text-gray-300">
                            <span className="text-gray-500">Seats:</span> {booking.seats?.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === "confirmed" 
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {booking.status?.toUpperCase()}
                      </span>
                      <p className="text-red-500 font-bold text-xl">₹{booking.totalPrice}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                    <p className="text-gray-500 text-sm">Booking ID: {booking.id}</p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                        Download Ticket
                      </button>
                      <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
