// app/search/page.js
import { client } from '@/lib/sanity.client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import Image from 'next/image'

const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

async function performSearch(query) {
  if (!query) return { movies: [], directors: [], actors: [] };
  // eslint-disable-next-line react/no-unescaped-entities
  const searchQuery = `{ "movies": *[_type == "movie" && (title match $query || pt::text(plot) match $query)]{_id, title, "slug": slug.current, poster, releaseYear}, "directors": *[_type == "director" && name match $query]{_id, name, "slug": slug.current, photo}, "actors": *[_type == "actor" && name match $query]{_id, name, "slug": slug.current, photo}}`
  const params = { query: `${query}*` };
  const results = await client.fetch(searchQuery, params);
  return results;
}

export default async function SearchPage({ searchParams }) {
  const query = searchParams.q || ''
  const results = await performSearch(query)
  const hasResults = results.movies.length > 0 || results.directors.length > 0 || results.actors.length > 0;

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8"><Link href="/"><h1 className="text-5xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors">Movie Canon</h1></Link></header>
        <SearchBar />
        <div className="mt-12">
          {query && <h2 className="text-3xl font-bold mb-8">Risultati della ricerca per: <span className="text-yellow-400">"{query}"</span></h2>}
          {!hasResults && query && <p className="text-center text-xl text-gray-400">Nessun risultato trovato.</p>}
          {results.movies.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-semibold border-b-2 border-gray-700 pb-2 mb-6">Film</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {results.movies.map((movie) => (
                  <div key={movie._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-yellow-400/20 transition-shadow duration-300 group">
                    <Link href={`/movies/${movie.slug}`}>
                      <div className="relative aspect-[2/3]">
                        {movie.poster && <Image src={urlFor(movie.poster).url()} alt={`Poster for ${movie.title}`} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover"/>}
                      </div>
                    </Link>
                    <div className="p-3">
                      <Link href={`/movies/${movie.slug}`}><h4 className="font-semibold truncate hover:text-yellow-400">{movie.title}</h4></Link>
                      <Link href={`/year/${movie.releaseYear}`}><p className="text-sm text-gray-400 hover:text-white">{movie.releaseYear}</p></Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {results.directors.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-semibold border-b-2 border-gray-700 pb-2 mb-6">Registi</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.directors.map((director) => (
                  <Link key={director._id} href={`/directors/${director.slug.current}`} className="text-center group">
                    {director.photo && <Image src={urlFor(director.photo).url()} alt={`Foto di ${director.name}`} width={150} height={150} className="w-24 h-24 rounded-full object-cover mx-auto mb-2 border-2 border-transparent group-hover:border-yellow-400 transition-all"/>}
                    <h4 className="font-semibold group-hover:text-yellow-400 transition-colors">{director.name}</h4>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {results.actors.length > 0 && (
            <section>
              <h3 className="text-2xl font-semibold border-b-2 border-gray-700 pb-2 mb-6">Attori</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.actors.map((actor) => (
                  <Link key={actor._id} href={`/actors/${actor.slug.current}`} className="text-center group">
                    {actor.photo && <Image src={urlFor(actor.photo).url()} alt={`Foto di ${actor.name}`} width={150} height={150} className="w-24 h-24 rounded-full object-cover mx-auto mb-2 border-2 border-transparent group-hover:border-yellow-400 transition-all"/>}
                    <h4 className="font-semibold group-hover:text-yellow-400 transition-colors">{actor.name}</h4>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
export const revalidate = 0
