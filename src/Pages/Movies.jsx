import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function Movies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("https://api.themoviedb.org/3/discover/movie?api_key=80d491707d8cf7b38aa19c7ccab0952f")
      .then(res => res.json())
      .then(data => {
        setMovies(data.results)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const formatRating = (rating) => {
    const r = parseFloat(rating)
    if (r >= 8) return { label: "Great", color: "text-green-400", bg: "bg-green-400/20" }
    if (r >= 6) return { label: "Good", color: "text-yellow-400", bg: "bg-yellow-400/20" }
    return { label: "Avg", color: "text-gray-400", bg: "bg-gray-400/20" }
  }

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading movies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen pt-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              All <span className="text-red-500">Movies</span>
            </h1>
            <p className="text-gray-400">Discover the latest and greatest films</p>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 md:mt-0 relative">
            <input
              type="text"
              placeholder="Search movies..."
              className="w-full md:w-80 px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-300"
            />
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Genre Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["All", "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance"].map((genre, idx) => (
            <button
              key={genre}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                idx === 0
                  ? "bg-red-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map(movie => {
            const rating = formatRating(movie.vote_average)
            return (
              <Link to={`/movies/${movie.id}`} key={movie.id} className="group">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 transform group-hover:scale-105 transition-all duration-300 shadow-lg">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Rating Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold ${rating.bg} ${rating.color}`}>
                    {movie.vote_average.toFixed(1)}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-semibold text-sm line-clamp-2 mb-2">{movie.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-xs">
                          {movie.release_date?.split('-')[0]}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 bg-red-500 text-white text-xs rounded font-medium">
                          Book
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-all duration-300 border border-gray-700">
            Load More Movies
          </button>
        </div>
      </div>
    </div>
  )
}
