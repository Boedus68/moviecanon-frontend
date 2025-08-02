// app/actors/[slug]/page.js
import { client } from '@/lib/sanity.client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'

const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

async function getActorData(slug) {
  // eslint-disable-next-line react/no-unescaped-entities
  const query = `*[_type == "actor" && slug.current == $slug][0]{name, photo, biography, "movies": *[_type == "movie" && references(^._id)] | order(releaseYear desc) {_id, title, "slug": slug.current, poster, releaseYear}}`
  const data = await client.fetch(query, { slug })
  return data
}

export default async function ActorPage({ params }) {
  const actorData = await getActorData(params.slug)
  if (!actorData) return <div>Attore non trovato!</div>

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {actorData.photo && <Image src={urlFor(actorData.photo).url()} alt={`Foto di ${actorData.name}`} width={200} height={200} className="w-40 h-40 rounded-full object-cover shadow-lg"/>}
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-bold text-yellow-400">{actorData.name}</h1>
              {actorData.biography && <div className="prose prose-invert max-w-2xl mt-4 text-gray-300"><PortableText value={actorData.biography} /></div>}
            </div>
          </div>
        </header>
        <h2 className="text-3xl font-bold text-center my-8">Filmografia</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {actorData.movies.map((movie) => (
            <div key={movie._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-yellow-400/20 transition-shadow duration-300">
              <Link href={`/movies/${movie.slug}`}>
                <div className="relative aspect-[2/3]">
                  {movie.poster && <Image src={urlFor(movie.poster).url()} alt={`Poster for ${movie.title}`} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover"/>}
                </div>
                <div className="p-4"><h2 className="text-xl font-semibold truncate">{movie.title}</h2><p className="text-gray-400">{movie.releaseYear}</p></div>
              </Link>
            </div>
          ))}
        </div>
         <div className="text-center mt-12"><Link href="/" className="text-yellow-400 hover:text-yellow-300 transition-colors">&larr; Torna alla classifica</Link></div>
      </div>
    </main>
  )
}
export const revalidate = 0
