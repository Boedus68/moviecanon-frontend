// app/api/vote/route.js
import { createClient } from '@sanity/client'
import { NextResponse } from 'next/server'

// Configurazione del client Sanity con privilegi di scrittura
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2022-11-15',
  useCdn: false, // Must be false to ensure fresh data
  token: process.env.SANITY_API_WRITE_TOKEN, // Usa il token di scrittura
})

export async function POST(request) {
  try {
    const { movieId, rating } = await request.json()

    if (!movieId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Dati non validi' }, { status: 400 })
    }

    // Recupera il documento del film per ottenere i dati attuali
    const movie = await client.getDocument(movieId)
    if (!movie) {
      return NextResponse.json({ message: 'Film non trovato' }, { status: 404 })
    }

    const currentTotalRating = movie.averageRating * movie.ratingCount
    const newRatingCount = movie.ratingCount + 1
    const newAverageRating = (currentTotalRating + rating) / newRatingCount

    // Esegui l'aggiornamento (patch) sul documento del film
    await client
      .patch(movieId)
      .set({
        averageRating: newAverageRating,
        ratingCount: newRatingCount,
      })
      .commit()

    return NextResponse.json({
      message: 'Voto registrato con successo!',
      newAverage: newAverageRating.toFixed(2),
      newCount: newRatingCount,
    })
  } catch (error) {
    console.error('Errore durante la registrazione del voto:', error)
    return NextResponse.json(
      { message: "Si è verificato un errore interno" },
      { status: 500 }
    )
  }
}
