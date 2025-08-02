// app/actors/page.js
import { client } from '@/lib/sanity.client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'
import Image from 'next/image'

const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

async function getActors() {
  // eslint-disable-next-line react/no-unescaped-entities
  const query = `*[_type == "actor"] {"movieCount": count(*[_type == "movie" && references(^._id)]), ...} | order(movieCount desc) [movieCount >= 2]`
  const actors = await client.fetch(query)
  return actors
}

export default async function ActorsIndexPage() {
  const actors = await getActors()
  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-400">Gli Attori del Movie Canon</h1>
          <p className="text-lg text-gray-300 mt-2">Attori con almeno due opere, ordinati per numero di film presenti nella classifica.</p>
        </header>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-4">
            {actors.map((actor) => (
              <Link key={actor._id} href={`/actors/${actor.slug.current}`} className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-700 transition-colors duration-200">
                {actor.photo ? (
                  <Image src={urlFor(actor.photo).url()} alt={`Foto di ${actor.name}`} width={80} height={80} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover flex-shrink-0"/>
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-700 flex-shrink-0"></div>
                )}
                <div className="flex-grow"><h2 className="text-xl md:text-2xl font-bold text-yellow-400">{actor.name}</h2></div>
                <div className="text-right flex-shrink-0"><p className="text-2xl md:text-3xl font-bold">{actor.movieCount}</p><p className="text-sm text-gray-400">film</p></div>
              </Link>
            ))}
          </div>
        </div>
        <div className="text-center mt-12"><Link href="/" className="text-yellow-400 hover:text-yellow-300 transition-colors">&larr; Torna alla classifica</Link></div>
      </div>
    </main>
  )
}
export const revalidate = 0
