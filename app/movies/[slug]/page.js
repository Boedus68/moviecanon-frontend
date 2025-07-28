// app/movies/[slug]/page.js
import { client } from '@/lib/sanity.client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import MovieGallery from '@/components/MovieGallery'
import VotingSystem from '@/components/VotingSystem'
import DisqusComments from '@/components/DisqusComments' // Importa il componente Disqus

const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

async function getMovie(slug) {
  const query = `*[_type == "movie" && slug.current == $slug][0]{
    _id,
    title,
    releaseYear,
    poster,
    plot,
    "slug": slug.current,
    affiliateLink,
    gallery,
    averageRating,
    ratingCount,
    director->{
      name,
      "slug": slug.current
    },
    genres[]->{
      name,
      "slug": slug.current
    },
    actors[]->{
      name,
      "slug": slug.current
    }
  }`

  const movie = await client.fetch(query, { slug })
  return movie
}

export default async function MoviePage({ params }) {
  const movie = await getMovie(params.slug)

  if (!movie) {
    return <div>Film non trovato!</div>
  }

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Colonna Locandina */}
          <div className="md:col-span-1">
            {movie.poster ? (
              <img
                src={urlFor(movie.poster).width(500).url()}
                alt={`Poster for ${movie.title}`}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                <span>No Poster</span>
              </div>
            )}
            
            {movie.affiliateLink && (
                <a 
                    href={movie.affiliateLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-6 w-full inline-block text-center bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors"
                >
                    Acquista o Noleggia
                </a>
            )}
          </div>

          {/* Colonna Dettagli */}
          <div className="md:col-span-2">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-yellow-400 mb-2">{movie.title}</h1>
            <p className="text-xl text-gray-400 mb-6">{movie.releaseYear}</p>

            <VotingSystem 
              movieId={movie._id} 
              initialAverage={movie.averageRating || 0} 
              initialCount={movie.ratingCount || 0} 
            />

            {movie.director && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-300">Regista</h3>
                <Link href={`/directors/${movie.director.slug}`} className="text-lg text-yellow-500 hover:underline">
                    {movie.director.name}
                </Link>
              </div>
            )}

            <div className="prose prose-invert max-w-none text-gray-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-300">Trama</h3>
                {movie.plot ? <PortableText value={movie.plot} /> : <p>Trama non disponibile.</p>}
            </div>

            {movie.actors && movie.actors.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Attori Principali</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.actors.map((actor) => (
                    <Link key={actor.slug} href={`/actors/${actor.slug}`} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-yellow-500 hover:text-gray-900 transition-colors">
                        {actor.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {movie.genres && movie.genres.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Generi</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <Link key={genre.slug} href={`/genres/${genre.slug}`} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-yellow-500 hover:text-gray-900 transition-colors">
                        {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <MovieGallery gallery={movie.gallery} />
        
        {/* Sezione Commenti */}
        <DisqusComments movie={movie} />

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
