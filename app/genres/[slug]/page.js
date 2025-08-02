// app/genres/[slug]/page.js
import { client } from '@/lib/sanity.client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'
import Image from 'next/image'

const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

async function getGenreData(slug) {
  const query = `*[_type == "genre" && slug.current == $slug][0]{name, "movies": *[_type == "movie" && references(^._id)] | order(releaseYear desc) {_id, title, "slug": slug.current, poster, releaseYear}}`
  const data = await client.fetch(query, { slug })
  return data
}

export default async function GenrePage({ params }) {
  const genreData = await getGenreData(params.slug)
  if (!genreData) return <div>Genere non trovato!</div>

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-400">Genere: {genreData.name}</h1>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {genreData.movies.map((movie) => (
            <div key={movie._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-yellow-400/20 transition-shadow duration-300">
              <Link href={`/movies/${movie.slug}`}>
                <div className="relative aspect-[2/3]">
                  {movie.poster && <Image src={urlFor(movie.poster).url()} alt={`Poster for ${movie.title}`} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover"/>}
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/movies/${movie.slug}`}><h2 className="text-xl font-semibold truncate hover:text-yellow-400">{movie.title}</h2></Link>
                <Link href={`/year/${movie.releaseYear}`}><p className="text-gray-400 hover:text-white">{movie.releaseYear}</p></Link>
              </div>
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
