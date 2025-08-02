// app/page.js
import { client } from '@/lib/sanity.client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar' // Importa la barra di ricerca

const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

async function getMovies(sort = 'date_desc') {
  let orderClause = 'order(releaseYear desc)'
  if (sort === 'date_asc') orderClause = 'order(releaseYear asc)'
  else if (sort === 'alpha_asc') orderClause = 'order(title asc)'
  else if (sort === 'random') orderClause = ''

  const query = `*[_type == "movie"]{_id, title, "slug": slug.current, poster, releaseYear} ${orderClause ? `| ${orderClause}` : ''}`
  let movies = await client.fetch(query)

  if (sort === 'random') {
    for (let i = movies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [movies[i], movies[j]] = [movies[j], movies[i]];
    }
  }
  return movies
}

export default async function HomePage({ searchParams }) {
  const sort = searchParams.sort || 'date_desc'
  const movies = await getMovies(sort)

  const SortLink = ({ sortValue, children }) => (
    <Link 
      href={sortValue === 'date_desc' ? '/' : `/?sort=${sortValue}`}
      className={`px-4 py-2 rounded-md transition-colors text-sm md:text-base ${sort === sortValue ? 'bg-yellow-500 text-gray-900 font-bold' : 'bg-gray-700 hover:bg-gray-600'}`}
    >
      {children}
    </Link>
  );

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-400">Movie Canon</h1>
          <p className="text-lg text-gray-300 mt-2">The Ultimate Movie Ranking</p>
        </header>

        {/* --- NUOVA BARRA DI RICERCA --- */}
        <SearchBar />
        {/* ----------------------------- */}

        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mb-8 p-4 bg-gray-800 rounded-lg">
          <SortLink sortValue="date_desc">Più Recenti</SortLink>
          <SortLink sortValue="date_asc">Meno Recenti</SortLink>
          <SortLink sortValue="alpha_asc">Ordine Alfabetico</SortLink>
          <Link 
            href="/?sort=random"
            className={`px-4 py-2 rounded-md transition-colors text-sm md:text-base font-bold ${sort === 'random' ? 'bg-yellow-500 text-gray-900' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            Mi sento fortunato
          </Link>
        </div>

        <div className="flex justify-center gap-6 mb-12">
          <Link href="/directors" className="text-yellow-400 hover:text-yellow-300 transition-colors font-semibold text-lg">
            Indice Registi
          </Link>
          <Link href="/actors" className="text-yellow-400 hover:text-yellow-300 transition-colors font-semibold text-lg">
            Indice Attori
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div key={movie._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-yellow-400/20 transition-shadow duration-300 group">
              <Link href={`/movies/${movie.slug}`}>
                <div className="relative">
                  {movie.poster && <img src={urlFor(movie.poster).width(400).height(600).url()} alt={`Poster for ${movie.title}`} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"/>}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold truncate">{movie.title}</h2>
                  <p className="text-gray-400">{movie.releaseYear}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export const revalidate = 0
