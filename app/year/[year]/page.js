// app/year/[year]/page.js
import { client } from '@/lib/sanity.client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'
import Image from 'next/image'

const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

// Funzione per recuperare tutti i film di un anno specifico
async function getMoviesByYear(year) {
  const query = `*[_type == "movie" && releaseYear == $year] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    poster,
    releaseYear
  }`
  
  const movies = await client.fetch(query, { year: parseInt(year, 10) })
  return movies
}

export default async function YearPage({ params }) {
  const year = params.year
  const movies = await getMoviesByYear(year)

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-400">Film del {year}</h1>
          <p className="text-lg text-gray-300 mt-2">Tutti i film del {year} presenti nel Movie Canon.</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <div key={movie._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-yellow-400/20 transition-shadow duration-300 group">
                <Link href={`/movies/${movie.slug}`}>
                  <div className="relative aspect-[2/3]">
                    {movie.poster ? (
                      <Image
                        src={urlFor(movie.poster).url()}
                        alt={`Poster for ${movie.title}`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span>No Poster</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold truncate">{movie.title}</h2>
                    <p className="text-gray-400">{movie.releaseYear}</p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-xl text-gray-400">Nessun film trovato per l'anno {year}.</p>
          )}
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
