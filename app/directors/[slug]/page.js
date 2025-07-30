// app/directors/[slug]/page.js
import { client } from '@/lib/sanity.client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'

const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

async function getDirectorData(slug) {
  const query = `*[_type == "director" && slug.current == $slug][0]{
    name,
    photo,
    biography,
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

export default async function DirectorPage({ params }) {
  const directorData = await getDirectorData(params.slug)

  if (!directorData) {
    return <div>Regista non trovato!</div>
  }

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
           <div className="flex flex-col md:flex-row items-center gap-8">
            {directorData.photo && (
              <img 
                src={urlFor(directorData.photo).width(200).height(200).url()}
                alt={`Foto di ${directorData.name}`}
                className="w-40 h-40 rounded-full object-cover shadow-lg"
              />
            )}
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-bold text-yellow-400">{directorData.name}</h1>
              {directorData.biography && (
                <div className="prose prose-invert max-w-2xl mt-4 text-gray-300">
                  <PortableText value={directorData.biography} />
                </div>
              )}
            </div>
          </div>
        </header>

        <h2 className="text-3xl font-bold text-center my-8">Filmografia</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {directorData.movies.map((movie) => (
            <div key={movie._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-yellow-400/20 transition-shadow duration-300">
              <Link href={`/movies/${movie.slug}`}>
                 {movie.poster && <img src={urlFor(movie.poster).width(400).height(600).url()} alt={`Poster for ${movie.title}`} className="w-full h-auto object-cover"/>}
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
