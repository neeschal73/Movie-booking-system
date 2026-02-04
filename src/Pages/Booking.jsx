import React, { useState, useEffect, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../Context/authcontext"
import { db } from "../config/firebase"
import { doc, getDoc, getDocs, collection, updateDoc, setDoc, serverTimestamp } from "firebase/firestore"

export default function Booking() {
  const { id } = useParams()
  const { currentUser, userData } = useAuth()
  const navigate = useNavigate()
  
  const [movie, setMovie] = useState(null)
  const [selectedTheatre, setSelectedTheatre] = useState("")
  const [selectedShowtime, setSelectedShowtime] = useState("")
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("esewa")
  const [processing, setProcessing] = useState(false)
  const [seatsLoaded, setSeatsLoaded] = useState(false)
  const [bookedSeats, setBookedSeats] = useState({}) // Track booked seats for each showtime

  // Nepal-specific theatres with Nepal addresses
  const NEPALI_THEATRES = [
    { id: "theatre_1", name: "Cineplex Kathmandu", location: "Jamal, Kathmandu", city: "Kathmandu" },
    { id: "theatre_2", name: "Big Movies Nepal", location: "New Road, Kathmandu", city: "Kathmandu" },
    { id: "theatre_3", name: "KTM Cinema Hub", location: "Baneshwor, Kathmandu", city: "Kathmandu" },
    { id: "theatre_4", name: "Pokhara Movie Hub", location: "Lakeside, Pokhara", city: "Pokhara" },
    { id: "theatre_5", name: "Bharatpur Cine World", location: "Bharatpur, Chitwan", city: "Chitwan" },
    { id: "theatre_6", name: "Butwal Multiplex", location: "Butwal, Rupandehi", city: "Rupandehi" },
  ]

  // All available showtimes (can be used for any movie)
  const SHOWTIMES = [
    { id: "show_1", time: "10:00 AM", label: "Morning Show" },
    { id: "show_2", time: "1:00 PM", label: "Afternoon Show" },
    { id: "show_3", time: "4:00 PM", label: "Evening Show" },
    { id: "show_4", time: "7:00 PM", label: "Night Show" },
    { id: "show_5", time: "9:30 PM", label: "Late Night" },
  ]

  // Nepal currency prices (NPR)
  const SEAT_PRICES = {
    VIP: 500,      // NPR - रू500
    Regular: 350   // NPR - रू350
  }

  useEffect(() => {
    fetchMovieData()
  }, [id])

  const fetchMovieData = async () => {
    try {
      const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=80d491707d8cf7b38aa19c7ccab0952f`)
      const tmdbData = await tmdbRes.json()
      
      if (tmdbData.title) {
        setMovie({
          id: id,
          title: tmdbData.title,
          poster_path: tmdbData.poster_path,
          backdrop_path: tmdbData.backdrop_path,
          runtime: tmdbData.runtime,
          release_date: tmdbData.release_date
        })
      }
    } catch (error) {
      console.error("Error fetching movie:", error)
    }
  }

  const generateSeats = useCallback((theatreId, showtimeId) => {
    const seats = []
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    
    rows.forEach((row) => {
      for (let col = 1; col <= 10; col++) {
        seats.push({
          id: `${theatreId}_${showtimeId}_${row}${col}`,
          theatreId: theatreId,
          showTimeID: showtimeId,
          seatId: `${row}${col}`,
          status: "available", // All seats available by default
          type: (row === 'A' || row === 'B') ? 'VIP' : 'Regular',
          price: (row === 'A' || row === 'B') ? SEAT_PRICES.VIP : SEAT_PRICES.Regular
        })
      }
    })
    return seats
  }, [SEAT_PRICES.VIP, SEAT_PRICES.Regular])

  const fetchSeats = useCallback(async (theatreId, showtimeId) => {
    setLoading(true)
    setSeatsLoaded(false)
    try {
      // Check if we already have booked seats cached for this showtime
      const cacheKey = `${theatreId}_${showtimeId}`
      if (bookedSeats[cacheKey]) {
        // Generate fresh seats and mark booked ones
        const freshSeats = generateSeats(theatreId, showtimeId).map(seat => {
          if (bookedSeats[cacheKey].includes(seat.id)) {
            return { ...seat, status: "booked" }
          }
          return seat
        })
        setSeats(freshSeats)
        setSeatsLoaded(true)
        setLoading(false)
        return
      }

      // Fetch from Firebase
      const seatsSnapshot = await getDocs(collection(db, "seats"))
      const seatsData = seatsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(seat => seat.theatreId === theatreId && seat.showTimeID === showtimeId)
      
      if (seatsData.length > 0) {
        setSeats(seatsData)
        // Cache booked seats
        const booked = seatsData.filter(s => s.status === "booked").map(s => s.id)
        setBookedSeats(prev => ({ ...prev, [cacheKey]: booked }))
      } else {
        const generatedSeats = generateSeats(theatreId, showtimeId)
        setSeats(generatedSeats)
      }
      setSeatsLoaded(true)
    } catch (error) {
      console.error("Error fetching seats:", error)
      const generatedSeats = generateSeats(theatreId, showtimeId)
      setSeats(generatedSeats)
      setSeatsLoaded(true)
    } finally {
      setLoading(false)
    }
  }, [generateSeats, bookedSeats])

  // Fetch seats when theatre and showtime are selected
  useEffect(() => {
    if (selectedTheatre && selectedShowtime) {
      fetchSeats(selectedTheatre, selectedShowtime)
    }
  }, [selectedTheatre, selectedShowtime, fetchSeats])

  const handleSeatToggle = (seat) => {
    if (seat.status === "booked") return
    
    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id)
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id)
      } else {
        return [...prev, seat]
      }
    })
  }

  const getTotalPrice = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
  }

  const getTotalWithTax = () => {
    const subtotal = getTotalPrice()
    const tax = Math.round(subtotal * 0.13) // 13% VAT in Nepal
    return subtotal + tax
  }

  const handleContinueToSeats = () => {
    if (selectedTheatre && selectedShowtime) {
      setStep(2)
    }
  }

  const handlePayment = async () => {
    if (!currentUser) {
      navigate("/login")
      return
    }

    if (selectedSeats.length === 0) {
      alert("Please select at least one seat")
      return
    }

    setProcessing(true)

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      // Update seats in Firebase
      for (const seat of selectedSeats) {
        const seatRef = doc(db, "seats", seat.id)
        await updateDoc(seatRef, {
          status: "booked",
          bookedBy: currentUser.uid,
          bookedAt: serverTimestamp()
        })
      }

      // Create booking record
      const theatre = NEPALI_THEATRES.find(t => t.id === selectedTheatre)
      const showtime = SHOWTIMES.find(s => s.id === selectedShowtime)
      
      const bookingData = {
        id: `booking_${Date.now()}`,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userData?.name || currentUser.displayName,
        userAddress: userData?.address || "",
        userPhone: userData?.phone || "",
        movieId: id,
        movieTitle: movie?.title,
        poster_path: movie?.poster_path,
        theatreId: selectedTheatre,
        theatreName: theatre?.name,
        theatreAddress: theatre?.location,
        theatreCity: theatre?.city,
        showtimeId: selectedShowtime,
        showtime: showtime?.time,
        showtimeLabel: showtime?.label,
        seats: selectedSeats.map(s => s.seatId),
        seatTypes: selectedSeats.map(s => ({ seat: s.seatId, type: s.type, price: s.price })),
        subtotal: getTotalPrice(),
        tax: Math.round(getTotalPrice() * 0.13),
        totalPrice: getTotalWithTax(),
        currency: "NPR",
        paymentMethod: paymentMethod,
        paymentStatus: "completed",
        bookingDate: new Date().toISOString(),
        createdAt: serverTimestamp(),
        status: "confirmed"
      }

      await setDoc(doc(db, "bookings", bookingData.id), bookingData)
      
      // Update local booked seats cache
      const cacheKey = `${selectedTheatre}_${selectedShowtime}`
      setBookedSeats(prev => ({
        ...prev,
        [cacheKey]: [...(prev[cacheKey] || []), ...selectedSeats.map(s => s.id)]
      }))
      
      navigate("/confirmation", { state: { booking: bookingData } })
    } catch (error) {
      console.error("Error booking seats:", error)
      alert("Failed to complete booking. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const renderSeatGrid = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    
    if (!seatsLoaded || seats.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading seats...</p>
        </div>
      )
    }
    
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          <div className="relative mb-8">
            <div className="h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 rounded" />
            <p className="text-center text-gray-400 text-sm mt-2">SCREEN</p>
          </div>

          <div className="space-y-2">
            {rows.map((row) => (
              <div key={row} className="flex items-center justify-center gap-2">
                <span className="w-6 text-gray-400 text-sm text-right">{row}</span>
                <div className="flex gap-2 justify-center">
                  {seats
                    .filter(s => s.seatId && s.seatId.startsWith(row))
                    .sort((a, b) => (a.seatId || '').localeCompare(b.seatId || ''))
                    .map((seat) => {
                      const isSelected = selectedSeats.find(s => s.id === seat.id)
                      const isBooked = seat.status === "booked"
                      
                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatToggle(seat)}
                          disabled={isBooked}
                          className={`
                            w-8 h-8 rounded-t-lg text-xs font-medium transition-all duration-200
                            ${isBooked 
                              ? "bg-gray-600 cursor-not-allowed" 
                              : isSelected
                                ? "bg-red-500 text-white scale-110 shadow-lg shadow-red-500/30"
                                : seat.type === "VIP"
                                  ? "bg-yellow-500/30 text-yellow-300 hover:bg-yellow-500/50"
                                  : "bg-blue-500/30 text-blue-300 hover:bg-blue-500/50"
                            }
                          `}
                        >
                          {seat.seatId && seat.seatId.replace(row, "")}
                        </button>
                      )
                    })}
                </div>
                <span className="w-6 text-gray-400 text-sm">{row}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500/30 rounded-t" />
              <span className="text-gray-300">Regular - रू{SEAT_PRICES.Regular}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500/30 rounded-t" />
              <span className="text-gray-300">VIP - रू{SEAT_PRICES.VIP}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded-t" />
              <span className="text-gray-300">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-600 rounded-t" />
              <span className="text-gray-300">Booked</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading && step === 2) {
    return (
      <div className="bg-gray-950 min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading seats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen pt-16">
      {/* Header */}
      <div className="bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <Link to={`/movies/${id}`} className="text-red-400 hover:text-red-300 text-sm flex items-center mb-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Movie
          </Link>
          <h1 className="text-3xl font-bold text-white">{movie?.title || "Booking"}</h1>
          {selectedTheatre && (
            <p className="text-gray-400 mt-1">
              {NEPALI_THEATRES.find(t => t.id === selectedTheatre)?.name} • {SHOWTIMES.find(s => s.id === selectedShowtime)?.time}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[{ num: 1, label: "Theatre" }, { num: 2, label: "Seats" }, { num: 3, label: "Payment" }].map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300
                  ${step >= s.num 
                    ? "bg-red-500 text-white" 
                    : "bg-gray-800 text-gray-400"
                  }
                `}>
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className={`ml-2 hidden sm:inline ${step >= s.num ? "text-white" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={`w-16 sm:w-24 h-1 mx-2 ${step > s.num ? "bg-red-500" : "bg-gray-800"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Select Theatre & Showtime */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Select Theatre & Showtime (नेपाल)</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Theatre Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">🏛️ Select Theatre</h3>
                <div className="space-y-3">
                  {NEPALI_THEATRES.map((theatre) => (
                    <button
                      key={theatre.id}
                      onClick={() => { setSelectedTheatre(theatre.id); setSelectedShowtime(""); }}
                      className={`w-full p-4 rounded-xl border transition-all duration-300 text-left
                        ${selectedTheatre === theatre.id
                          ? "border-red-500 bg-red-500/10"
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                        }
                      `}
                    >
                      <p className="text-white font-semibold">{theatre.name}</p>
                      <p className="text-gray-400 text-sm">{theatre.location}</p>
                      <p className="text-red-400 text-xs mt-1">{theatre.city}, Nepal</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Showtime Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">🎬 Select Showtime</h3>
                {selectedTheatre ? (
                  <div className="grid grid-cols-2 gap-3">
                    {SHOWTIMES.map((show) => (
                      <button
                        key={show.id}
                        onClick={() => setSelectedShowtime(show.id)}
                        className={`p-4 rounded-xl border transition-all duration-300
                          ${selectedShowtime === show.id
                            ? "border-red-500 bg-red-500/10"
                            : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                          }
                        `}
                      >
                        <p className="text-white font-bold text-lg">{show.time}</p>
                        <p className="text-gray-400 text-sm">{show.label}</p>
                        <p className="text-green-400 text-xs mt-1">Available</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800/50 rounded-xl p-8 text-center">
                    <p className="text-gray-400">Please select a theatre first</p>
                  </div>
                )}

                {selectedTheatre && selectedShowtime && (
                  <button
                    onClick={handleContinueToSeats}
                    className="w-full mt-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-red-500/25"
                  >
                    Continue to Seat Selection →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Select Seats */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Select Your Seats</h2>
              <button
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Change Showtime
              </button>
            </div>

            {renderSeatGrid()}

            {selectedSeats.length > 0 && (
              <div className="mt-8 bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Selected Seats</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSeats.map((seat) => (
                    <span key={seat.id} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg">
                      {seat.seatId} ({seat.type}) - रू{seat.price}
                    </span>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-400 text-sm">Subtotal</p>
                      <p className="text-3xl font-bold text-white">रू{getTotalPrice()}</p>
                    </div>
                    <button
                      onClick={() => setStep(3)}
                      className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/25"
                    >
                      Proceed to Payment →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedSeats.length === 0 && seatsLoaded && (
              <div className="mt-8 text-center">
                <p className="text-gray-400 mb-4">Click on seats to select them</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="animate-fadeIn max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Payment (NPR)</h2>

            {/* Booking Summary */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>
              
              <div className="flex gap-4 mb-4">
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie?.poster_path}`}
                  alt={movie?.title}
                  className="w-20 h-28 object-cover rounded-lg"
                />
                <div>
                  <p className="text-white font-semibold">{movie?.title}</p>
                  <p className="text-gray-400 text-sm">
                    {NEPALI_THEATRES.find(t => t.id === selectedTheatre)?.name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {SHOWTIMES.find(s => s.id === selectedShowtime)?.time} ({SHOWTIMES.find(s => s.id === selectedShowtime)?.label})
                  </p>
                  <p className="text-red-400 text-sm">
                    {NEPALI_THEATRES.find(t => t.id === selectedTheatre)?.location}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Seats ({selectedSeats.length})</span>
                  <span>रू{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>VAT (13%)</span>
                  <span>रू{Math.round(getTotalPrice() * 0.13)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-gray-700">
                  <span>Total (NPR)</span>
                  <span className="text-red-500">रू{getTotalWithTax()}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Select Payment Method</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => setPaymentMethod("esewa")}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    paymentMethod === "esewa"
                      ? "border-red-500 bg-red-500/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="text-2xl mb-2">💚</div>
                  <p className="text-white font-semibold">eSewa</p>
                  <p className="text-gray-400 text-xs">Digital Wallet</p>
                </button>
                <button
                  onClick={() => setPaymentMethod("khalti")}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    paymentMethod === "khalti"
                      ? "border-red-500 bg-red-500/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="text-2xl mb-2">💜</div>
                  <p className="text-white font-semibold">Khalti</p>
                  <p className="text-gray-400 text-xs">Digital Wallet</p>
                </button>
              </div>

              {/* Card Payment */}
              <button
                onClick={() => setPaymentMethod("card")}
                className={`w-full p-4 rounded-xl border transition-all duration-300 mb-4 ${
                  paymentMethod === "card"
                    ? "border-red-500 bg-red-500/10"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">💳</div>
                    <p className="text-white font-semibold">Credit/Debit Card</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </button>

              {/* Cash Payment */}
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`w-full p-4 rounded-xl border transition-all duration-300 ${
                  paymentMethod === "cash"
                    ? "border-red-500 bg-red-500/10"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-center">
                  <div className="text-2xl mr-3">💵</div>
                  <p className="text-white font-semibold">Pay at Counter (Cash)</p>
                </div>
              </button>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {processing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing Payment...
                </>
              ) : (
                <>
                  <span className="mr-2">🔒</span>
                  Pay रू{getTotalWithTax()} securely
                </>
              )}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              🔒 Your payment is secure and encrypted
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
