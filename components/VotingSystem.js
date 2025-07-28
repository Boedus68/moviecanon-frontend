'use client'

import { useState, useEffect } from 'react'

export default function VotingSystem({ movieId, initialAverage, initialCount }) {
  const [averageRating, setAverageRating] = useState(initialAverage)
  const [ratingCount, setRatingCount] = useState(initialCount)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    // Controlla se l'utente ha già votato usando i cookie
    const votedCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`voted_${movieId}=`))
    if (votedCookie) {
      setHasVoted(true)
      setUserRating(parseInt(votedCookie.split('=')[1], 10))
    }
  }, [movieId])

  const handleVote = async (rating) => {
    if (hasVoted || isLoading) return

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, rating }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Qualcosa è andato storto')
      }

      setAverageRating(parseFloat(data.newAverage))
      setRatingCount(data.newCount)
      setHasVoted(true)
      setUserRating(rating)
      setMessage('Grazie per il tuo voto!')

      // Imposta un cookie per ricordare il voto (valido per 1 anno)
      document.cookie = `voted_${movieId}=${rating}; path=/; max-age=31536000`

    } catch (error) {
      setMessage(`Errore: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg my-8">
      <h3 className="text-2xl font-bold mb-4 text-yellow-400">Vota questo film</h3>
      <div className="flex items-center gap-4">
        <div className="flex text-4xl" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`cursor-pointer transition-colors ${
                (hoverRating || userRating) >= star ? 'text-yellow-400' : 'text-gray-600'
              } ${hasVoted || isLoading ? 'cursor-not-allowed' : ''}`}
              onMouseEnter={() => !hasVoted && setHoverRating(star)}
              onClick={() => handleVote(star)}
            >
              &#9733;
            </span>
          ))}
        </div>
        <div className="text-lg">
          <p>
            Media: <strong>{averageRating.toFixed(2)}</strong> / 5
          </p>
          <p className="text-sm text-gray-400">
            ({ratingCount} voti)
          </p>
        </div>
      </div>
      {message && <p className={`mt-4 ${message.startsWith('Errore') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
      {hasVoted && !message && <p className="mt-4 text-gray-300">Hai già votato questo film.</p>}
    </div>
  )
}
