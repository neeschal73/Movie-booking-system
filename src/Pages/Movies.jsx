import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function Movies() {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    fetch("https://api.themoviedb.org/3/discover/movie?api_key=80d491707d8cf7b38aa19c7ccab0952f")
      .then(res => res.json())
      .then(data => setMovies(data.results))
  }, [])

  return (
    <div className="bg-gray-900 min-h-screen text-white">

      <div className="max-w-[85%] mx-auto py-10">

        <h1 className="text-3xl font-bold mb-6">All Movies</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map(movie => (
            <Link to={`/movies/${movie.id}`} key={movie.id}>
              <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  className="h-72 w-full object-cover"
                />
                <p className="p-2 text-center">{movie.title}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
