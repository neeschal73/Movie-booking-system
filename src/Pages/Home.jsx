import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../Context/authcontext"

export default function Home() {
  const { currentUser } = useAuth()
  const [movies, setMovies] = useState([])
  const [featuredMovies, setFeaturedMovies] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetch("https://api.themoviedb.org/3/discover/movie?api_key=80d491707d8cf7b38aa19c7ccab0952f")
      .then(res => res.json())
      .then(data => {
        setMovies(data.results || [])
        const moviesWithBackdrop = (data.results || []).filter(m => m.backdrop_path)
        setFeaturedMovies(moviesWithBackdrop.slice(0, 5))
      })
      .catch(err => {
        console.error("Error fetching movies:", err)
        setMovies([])
        setFeaturedMovies([])
      })
  }, [])

  // Auto-advance slideshow
  useEffect(() => {
    if (featuredMovies.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredMovies.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [featuredMovies.length])

  const goToSlide = (index) => setCurrentSlide(index)

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* Hero Slideshow */}
      {featuredMovies.length > 0 ? (
        <div className="relative h-[85vh] overflow-hidden">
          {featuredMovies.map((movie, index) => (
            <div
              key={movie.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/50" />
              
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 text-sm font-medium mb-6">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                    Now Showing
                  </span>
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                    {movie.title}
                  </h1>
                  <p className="text-gray-300 text-lg mb-8 line-clamp-3">
                    {movie.overview}
                  </p>
                  <div className="flex items-center space-x-6 mb-8">
                    <span className="flex items-center text-yellow-400">
                      <svg className="w-6 h-6 fill-current mr-2" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                      {movie.vote_average?.toFixed(1)}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-300">{movie.release_date?.split('-')[0]}</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to={`/movies/${movie.id}`}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/30"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Book Now
                    </Link>
                    <Link
                      to="/movies"
                      className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-300 border border-white/20"
                    >
                      Explore All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? "bg-red-500 w-8" 
                    : "bg-white/50 hover:bg-white"
                }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide(prev => (prev - 1 + featuredMovies.length) % featuredMovies.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentSlide(prev => (prev + 1) % featuredMovies.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="relative h-[70vh] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-400">Loading movies...</p>
          </div>
        </div>
      )}

      {/* Trending Movies Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-bold">
              Trending <span className="text-red-500">Movies</span>
            </h2>
            <p className="text-gray-400 mt-2">Discover the most popular films</p>
          </div>
          <Link to="/movies" className="hidden md:flex items-center text-gray-400 hover:text-white transition-colors duration-300 group">
            View All
            <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.slice(0, 10).map(movie => (
            <Link to={`/movies/${movie.id}`} key={movie.id} className="group">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300 shadow-lg">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-semibold text-sm line-clamp-2 mb-2">{movie.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 text-sm flex items-center">
                        <svg className="w-4 h-4 fill-current mr-1" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                        {movie.vote_average?.toFixed(1)}
                      </span>
                      <span className="text-gray-300 text-xs bg-red-500 px-2 py-1 rounded">
                        BOOK
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold ${
                  movie.vote_average >= 8 
                    ? "bg-green-500/80 text-white" 
                    : movie.vote_average >= 6
                      ? "bg-yellow-500/80 text-black"
                      : "bg-gray-500/80 text-white"
                }`}>
                  {movie.vote_average?.toFixed(1)}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/movies" className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
            View All Movies
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* CTA Section - Only shown when NOT logged in */}
      {!currentUser && (
        <div className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M54.627%200l.83.828-1.415%201.415L51.8%200h2.827zM5.373%200l-.83.828L5.96%202.243%208.2%200H5.374zM48.97%200l3.657%203.657-1.414%201.414L46.143%200h2.828zM11.03%200L7.372%203.657%208.787%205.07%2013.857%200H11.03zm32.284%200L49.8%206.485%2048.384%207.9l-7.9-7.9h2.83zM16.686%200L10.2%206.485%2011.616%207.9l7.9-7.9h-2.83zM22.344%200L13.858%208.485%2015.272%209.9l9.9-9.9h-2.83zM32%200l-3.314%203.314-1.414-1.414L32%200h-2.83l-3.314%203.314-1.414-1.414%203.314-3.314L32%200zm5.657%200l7.9%207.9-1.414%201.414L35.143%200h2.83zm16.97%205.373L60%200v2.828L52.828%2010H55.8zm-60%200L0%202.828V0H2.83L7.172%205.372%205.758%206.787%200%202.83v2.543zM5.758%2011.03L2.83%208.1V5.374L10.2%2012.744%208.787%2014.16l-3.03-3.13zm48.514%200L49.8%2012.744%2048.384%2014.16l-3.03-3.13L60%205.374V8.1L54.272%2011.03zM11.03%2016.686L8.1%2013.758V11.03L15.272%2018.2l1.414-1.414-5.657-5.657zm48.514%200L49.8%2018.2l1.414-1.414-3.03-3.03L60%2011.03V13.758l-6.657%206.657zM16.686%2022.344L13.758%2019.416V16.686L22.344%2025.272l1.414-1.414-7.072-7.072zm48.514%200L49.8%2025.272l1.414-1.414-3.03-3.03L60%2016.686V19.416l-6.657%206.657zM22.344%2028L19.416%2025.072V22.344L28%2030.928l1.414-1.414-7.072-7.072zm32.284%200L49.8%2030.928l1.414-1.414-3.03-3.03L60%2022.344V25.072l-6.657%206.657zM28%2033.657L25.072%2030.728V28L35.314%2038.242l1.414-1.414-8.728-8.728zm16.97%200L49.8%2038.242l1.414-1.414-3.03-3.03L60%2028V30.728l-6.657%206.657zM35.314%2043.6L30.728%2039.015V35.314L42.385%2047.242l1.414-1.414-8.485-8.485zm16.97%200L49.8%2047.242l1.414-1.414-3.03-3.03L60%2035.314V39.015l-6.657%206.657zM42.385%2049.457L35.314%2042.385V39.6L49.457%2053.743l1.414-1.414-7.486-7.486zm16.97%200L49.8%2053.743l1.414-1.414-3.03-3.03L60%2039.6V42.385l-6.657%206.657zM53.743%2055.314L42.385%2043.6V40.8L55.314%2053.727l1.414-1.414-3-3zM54.627%2060l-5.656-5.656-1.414%201.414L55.314%2060h2.828L54.627%2060zM5.373%2060l5.657-5.656-1.415-1.414L2.83%2060H0l2.83-2.83L1.415%2055.343%205.373%2060zM0%2054.627l2.83%202.83%201.414-1.415L1.415%2053.2%200%2051.8v2.828zM0%205.373l2.83-2.83L4.243%204.143%205.657%205.557%208.485%202.728%200%205.374V5.37zm60%2049.254l-2.83-2.83-1.414%201.414L58.586%2060h2.828L60%2055.314v2.83zM60%205.374l-2.83-2.83-1.414%201.414L58.586%206.6l3.03%203.03L64%205.374V2.83L60%206.657z%22%20fill%3D%22%23ffffff%22%20fill-opacity%3D%22.05%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
        
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Experience Cinema Like Never Before
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Book your tickets instantly with exclusive deals and premium seating. Your perfect movie experience awaits.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
              >
                Create Free Account
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/movies"
                className="inline-flex items-center px-8 py-4 bg-transparent text-white font-bold rounded-lg border-2 border-white hover:bg-white hover:text-red-600 transition-all duration-300"
              >
                Browse Movies
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-white font-bold text-xl">CineBook</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">
              © 2024 CineBook. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
