'use client'

// Importa dal pacchetto 'disqus-react'
import { DiscussionEmbed } from 'disqus-react'

export default function DisqusComments({ movie }) {
  const disqusShortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME

  if (!disqusShortname) {
    console.error("Disqus shortname non è stato impostato nel file .env.local")
    return null
  }

  const disqusConfig = {
    url: `https://www.moviecanon.com/movies/${movie.slug}`, // Assicurati che questo sia il tuo dominio finale
    identifier: movie._id, // L'ID univoco del film da Sanity
    title: movie.title, // Il titolo del film
  }

  return (
    <div className="mt-12 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Commenti</h2>
        <DiscussionEmbed
            shortname={disqusShortname}
            config={disqusConfig}
        />
    </div>
  )
}
