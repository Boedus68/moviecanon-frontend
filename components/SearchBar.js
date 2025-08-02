'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto mb-12">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca un film, regista o attore..."
          className="w-full px-5 py-3 text-lg text-white bg-gray-800 border-2 border-gray-700 rounded-full focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          className="absolute top-0 right-0 mt-2 mr-2 px-6 py-2 text-gray-900 bg-yellow-400 rounded-full hover:bg-yellow-300 font-semibold transition-colors"
        >
          Cerca
        </button>
      </div>
    </form>
  )
}
