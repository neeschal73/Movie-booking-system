import React, { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../Context/authcontext"

export default function MovieDetails() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [credits, setCredits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=80d491707d8cf7b38aa19c7ccab0952f`).then(res => res.json()),
      fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=80d491707d8cf7b38aa19c7ccab0952f`).then(res => res.json())
    ])
      .then(([movieData, creditsData]) => {
        setMovie(movieData)
        setCredits(creditsData.cast?.slice(0, 6) || [])
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
      {/* Backdrop Section */}
      <div className="relative h-[60vh] overflow-hidden">
        {movie.backdrop_path && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-300">
              {movie.genres && movie.genres.map(genre => (
                <span key={genre.id} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
              <span className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
                {movie.vote_average.toFixed(1)}
              </span>
              <span>|</span>
              <span>{movie.release_date?.split('-')[0]}</span>
              {movie.runtime && (
                <>
                  <span>|</span>
                  <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-72 rounded-xl shadow-2xl"
              />
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={handleBookTicket}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/25"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Book Ticket
                </button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Storyline</h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                {movie.overview || "No storyline available."}
              </p>
            </section>

            {credits.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Top Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {credits.map(actor => (
                    <div key={actor.id} className="text-center">
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                          className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-gray-700"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-700 mx-auto mb-2 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      )}
                      <p className="text-white text-sm font-medium line-clamp-1">{actor.name}</p>
                      <p className="text-gray-400 text-xs line-clamp-1">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold mb-4">Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <span className="text-gray-400 text-sm">Status</span>
                  <p className="text-white font-medium">{movie.status}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <span className="text-gray-400 text-sm">Original Language</span>
                  <p className="text-white font-medium uppercase">{movie.original_language}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <span className="text-gray-400 text-sm">Budget</span>
                  <p className="text-white font-medium">
                    {movie.budget ? `$${movie.budget.toLocaleString()}` : "N/A"}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <span className="text-gray-400 text-sm">Revenue</span>
                  <p className="text-white font-medium">
                    {movie.revenue ? `$${movie.revenue.toLocaleString()}` : "N/A"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
