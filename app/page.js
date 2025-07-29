// app/page.js
import { client } from '@/lib/sanity.client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'

// Funzione per ottenere l'URL dell'immagine da Sanity
const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

// --- FUNZIONE CORRETTA ---
// Funzione per recuperare i dati dei film con ordinamento
async function getMovies(sort = 'date_desc') {
  let orderClause = 'order(releaseYear desc)' // Ordinamento di default

  if (sort === 'date_asc') {
    orderClause = 'order(releaseYear asc)'
  } else if (sort === 'alpha_asc') {
    orderClause = 'order(title asc)'
  } else if (sort === 'random') {
    orderClause = '' // Nessun ordinamento specifico nella query
  }

  // La query è stata ristrutturata per essere sintatticamente corretta
  const query = `*[_type == "movie"]{
    _id,
    title,
    "slug": slug.current,
    poster,
    releaseYear
  } ${orderClause ? `| ${orderClause}` : ''}`
  
  let movies = await client.fetch(query)

  // Se l'ordinamento è random, mescoliamo l'array qui
  if (sort === 'random') {
    for (let i = movies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [movies[i], movies[j]] = [movies[j], movies[i]];
    }
  }

  return movies
}
// -------------------------

// La nostra pagina principale
export default async function HomePage({ searchParams }) {
  const sort = searchParams.sort || 'date_desc'
  const movies = await getMovies(sort)

  // Funzione per creare i link di ordinamento con stile attivo
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

        {/* Controlli di Ordinamento */}
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mb-12 p-4 bg-gray-800 rounded-lg">
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div key={movie._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-yellow-400/20 transition-shadow duration-300 group">
              <Link href={`/movies/${movie.slug}`}>
                <div className="relative">
                  {movie.poster ? (
                    <img
                      src={urlFor(movie.poster).width(400).height(600).url()}
                      alt={`Poster for ${movie.title}`}
                      className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gray-700 flex items-center justify-center">
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
          ))}
        </div>
      </div>
    </main>
  )
}

export const revalidate = 0
