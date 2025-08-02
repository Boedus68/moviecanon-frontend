// app/movies/[slug]/page.js
import { client } from '@/lib/sanity.client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import MovieGallery from '@/components/MovieGallery'
import VotingSystem from '@/components/VotingSystem'
import DisqusComments from '@/components/DisqusComments'
import Image from 'next/image'

const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

async function getMovie(slug) {
  const query = `*[_type == "movie" && slug.current == $slug][0]{_id, title, releaseYear, poster, plot, "slug": slug.current, affiliateLink, gallery, averageRating, ratingCount, directors[]->{name, "slug": slug.current, photo}, genres[]->{name, "slug": slug.current}, actors[]->{name, "slug": slug.current, photo}}`
  const movie = await client.fetch(query, { slug })
  return movie
}

export default async function MoviePage({ params }) {
  const movie = await getMovie(params.slug)
  if (!movie) return <div>Film non trovato!</div>

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div className="md:col-span-1">
            {movie.poster ? (
              <div className="relative aspect-[2/3]">
                <Image src={urlFor(movie.poster).url()} alt={`Poster for ${movie.title}`} fill sizes="100vw" className="rounded-lg shadow-lg object-cover"/>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center"><span>No Poster</span></div>
            )}
            {movie.affiliateLink && <a href={movie.affiliateLink} target="_blank" rel="noopener noreferrer" className="mt-6 w-full inline-block text-center bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors">Acquista o Noleggia</a>}
          </div>
          <div className="md:col-span-2">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-yellow-400 mb-2">{movie.title}</h1>
            <Link href={`/year/${movie.releaseYear}`}><p className="text-xl text-gray-400 mb-6 hover:text-white">{movie.releaseYear}</p></Link>
            <VotingSystem movieId={movie._id} initialAverage={movie.averageRating || 0} initialCount={movie.ratingCount || 0} />
            {movie.directors && movie.directors.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">{movie.directors.length > 1 ? 'Registi' : 'Regista'}</h3>
                <div className="flex flex-col gap-2">
                  {movie.directors.map((director) => (
                    <Link key={director.slug} href={`/directors/${director.slug}`} className="flex items-center gap-3 text-lg text-yellow-500 hover:underline">
                      {director.photo && <Image src={urlFor(director.photo).url()} alt={`Foto di ${director.name}`} width={40} height={40} className="rounded-full object-cover bg-gray-700"/>}
                      <span>{director.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="prose prose-invert max-w-none text-gray-200 my-6">
                <h3 className="text-lg font-semibold text-gray-300">Trama</h3>
                {movie.plot ? <PortableText value={movie.plot} /> : <p>Trama non disponibile.</p>}
            </div>
            {movie.actors && movie.actors.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Attori Principali</h3>
                <div className="flex flex-wrap gap-3">
                  {movie.actors.map((actor) => (
                    <Link key={actor.slug} href={`/actors/${actor.slug}`} className="flex items-center gap-2 bg-gray-800 text-gray-300 pr-3 rounded-full text-sm hover:bg-yellow-500 hover:text-gray-900 transition-colors">
                        {actor.photo && <Image src={urlFor(actor.photo).url()} alt={`Foto di ${actor.name}`} width={32} height={32} className="rounded-full object-cover bg-gray-700"/>}
                        <span>{actor.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {movie.genres && movie.genres.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Generi</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (<Link key={genre.slug} href={`/genres/${genre.slug}`} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-yellow-500 hover:text-gray-900 transition-colors">{genre.name}</Link>))}
                </div>
              </div>
            )}
          </div>
        </div>
        <MovieGallery gallery={movie.gallery} />
        <DisqusComments movie={movie} />
        <div className="text-center mt-12"><Link href="/" className="text-yellow-400 hover:text-yellow-300 transition-colors">&larr; Torna alla classifica</Link></div>
      </div>
    </main>
  )
}
export const revalidate = 0
