// app/directors/page.js
import { client } from '@/lib/sanity.client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'

const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

// Query per recuperare tutti i registi con almeno 1 film, ordinati per numero di film
async function getDirectors() {
  const query = `*[_type == "director"] {
    _id,
    name,
    "slug": slug.current,
    photo,
    "movieCount": count(*[_type == "movie" && references(^._id)])
  } | order(movieCount desc) [movieCount >= 1]`
  
  const directors = await client.fetch(query)
  return directors
}

export default async function DirectorsIndexPage() {
  const directors = await getDirectors()

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-400">I Registi del Movie Canon</h1>
          <p className="text-lg text-gray-300 mt-2">Ordinati per numero di opere presenti nella classifica.</p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-4">
            {directors.map((director) => (
              <Link key={director._id} href={`/directors/${director.slug}`} className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-700 transition-colors duration-200">
                {director.photo ? (
                  <img
                    src={urlFor(director.photo).width(80).height(80).url()}
                    alt={`Foto di ${director.name}`}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-700 flex-shrink-0"></div>
                )}
                <div className="flex-grow">
                  <h2 className="text-xl md:text-2xl font-bold text-yellow-400">{director.name}</h2>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl md:text-3xl font-bold">{director.movieCount}</p>
                  <p className="text-sm text-gray-400">{director.movieCount > 1 ? 'film' : 'film'}</p>
                </div>
              </Link>
            ))}
          </div>
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
