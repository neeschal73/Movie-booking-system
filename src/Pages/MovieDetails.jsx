import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

export default function MovieDetails() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=80d491707d8cf7b38aa19c7ccab0952f`)
      .then(res => res.json())
      .then(data => setMovie(data))
  }, [id])

  if (!movie) return <p className="text-white text-center mt-20">Loading...</p>

  return (
    <div className="bg-gray-900 min-h-screen text-white">

      <div className="max-w-[85%] mx-auto py-12">

        <div className="bg-gray-800 rounded-xl flex overflow-hidden shadow-lg">

          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            className="w-1/3 object-cover"
          />

          <div className="p-6">
            <h1 className="text-3xl font-bold mb-3">{movie.title}</h1>
            <p className="mb-4 text-gray-300">{movie.overview}</p>
            <p>⭐ Rating: {movie.vote_average}</p>
            <p>📅 Release: {movie.release_date}</p>

            <button className="mt-6 bg-red-500 px-5 py-2 rounded hover:bg-red-600">
              Book Ticket
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
