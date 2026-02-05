import React, { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../Context/authcontext"

export default function MovieDetails() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [credits, setCredits] = useState([])
  const [trailer, setTrailer] = useState(null) // Added for YouTube
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=80d491707d8cf7b38aa19c7ccab0952f`).then(res => res.json()),
      fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=80d491707d8cf7b38aa19c7ccab0952f`).then(res => res.json()),
      fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=80d491707d8cf7b38aa19c7ccab0952f`).then(res => res.json())
    ])
      .then(([movieData, creditsData, videoData]) => {
        setMovie(movieData)
        setCredits(creditsData.cast?.slice(0, 6) || [])
        // Find the first YouTube Trailer
        const youtubeTrailer = videoData.results?.find(v => v.type === "Trailer" && v.site === "YouTube")
        setTrailer(youtubeTrailer)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  const handleBookTicket = () => {
    if (!currentUser) {
      navigate("/login")
      return
    }
    navigate(`/booking/${id}`)
  }

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading movie details...</p>
        </div>
      </div>
    )
  }

  if (!movie) return null

  return (
    <div className="bg-gray-950 min-h-screen text-white pt-16">
      {/* 1. HERO BACKDROP SECTION */}
      <div className="relative h-[40vh] md:h-[60vh] overflow-hidden">
        {movie.backdrop_path && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-300">
             <span className="flex items-center text-yellow-400">★ {movie.vote_average.toFixed(1)}</span>
             <span>• {movie.release_date?.split('-')[0]}</span>
             <span>• {movie.runtime}m</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        
        {/* 2. THE NEW SECTION (Based on your diagram) */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          
          {/* LEFT: YouTube Trailer (Red Part in your image) */}
          <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 aspect-video lg:aspect-auto">
            {trailer ? (
              <iframe
                className="w-full h-full min-h-[300px]"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
                Trailer Not Available
              </div>
            )}
          </div>

          {/* RIGHT: Select Theatre (Black Part in your image) */}
          <div className="w-full lg:w-96 bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Select Theatre
              </h3>
              <div className="space-y-3">
                {/* Placeholder for Theatre List */}
                {['Grand Cinema Hall', 'PVR Cinemas', 'IMAX Center'].map((mall) => (
                  <button key={mall} className="w-full text-left p-3 rounded bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500 transition-colors">
                    <p className="font-medium">{mall}</p>
                    <p className="text-xs text-gray-400">Available: 2:00 PM, 6:00 PM</p>
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleBookTicket}
              className="mt-6 w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-600/20"
            >
              Confirm & Book Tickets
            </button>
          </div>
        </div>

        {/* 3. ADDITIONAL DETAILS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Storyline & Cast */}
          <div className="lg:col-span-2">
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 border-l-4 border-red-500 pl-4">Storyline</h2>
              <p className="text-gray-300 text-lg leading-relaxed">{movie.overview}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-500 pl-4">Top Cast</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {credits.map(actor => (
                  <div key={actor.id} className="text-center">
                    <img
                      src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://via.placeholder.com/185x185?text=No+Image'}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover mx-auto mb-2 border-2 border-gray-800"
                      alt={actor.name}
                    />
                    <p className="text-xs font-bold line-clamp-1">{actor.name}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
             <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <h4 className="text-gray-400 text-sm mb-4 uppercase tracking-widest">Movie Info</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium">{movie.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="font-medium">${movie.budget?.toLocaleString()}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}