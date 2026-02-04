import React from "react"
import { Link } from "react-router-dom"

export default function MovieCard({ movie }) {
  if (!movie) return null

  const formatRating = (rating) => {
    const r = parseFloat(rating)
    if (r >= 8) return { label: "Great", color: "text-green-400", bg: "bg-green-400/20" }
    if (r >= 6) return { label: "Good", color: "text-yellow-400", bg: "bg-yellow-400/20" }
    return { label: "Avg", color: "text-gray-400", bg: "bg-gray-400/20" }
  }

  const rating = formatRating(movie.vote_average)

  return (
    <Link to={`/movies/${movie.id}`} className="group">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 transform group-hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/20">
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
}
