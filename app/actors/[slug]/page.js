// app/actors/[slug]/page.js
import { client } from '@/lib/sanity.client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'

const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

// Funzione per recuperare i dati di un attore e i suoi film
async function getActorData(slug) {
  const query = `*[_type == "actor" && slug.current == $slug][0]{
    name,
    "movies": *[_type == "movie" && references(^._id)] | order(releaseYear desc) {
      _id,
      title,
      "slug": slug.current,
      poster,
      releaseYear
    }
  }`
  const data = await client.fetch(query, { slug })
  return data
}

export default async function ActorPage({ params }) {
  const actorData = await getActorData(params.slug)

  if (!actorData) {
    return <div>Attore non trovato!</div>
  }

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-400">{actorData.name}</h1>
          <p className="text-lg text-gray-300 mt-2">Filmografia</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {actorData.movies.map((movie) => (
            <div key={movie._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-yellow-400/20 transition-shadow duration-300">
              <Link href={`/movies/${movie.slug}`}>
                {movie.poster ? (
                  <img
                    src={urlFor(movie.poster).width(400).height(600).url()}
                    alt={`Poster for ${movie.title}`}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-700 flex items-center justify-center">
                    <span>No Poster</span>
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold truncate">{movie.title}</h2>
                  <p className="text-gray-400">{movie.releaseYear}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
         <div className="text-center mt-12">
            <Link href="/" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                &larr; Torna alla classifica
            </Link>
        </div>
      </div>
    </main>
  )
}

export const revalidate = 0
