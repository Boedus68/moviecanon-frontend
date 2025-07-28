// app/page.js
import { client } from '@/lib/sanity.client'
import imageUrlBuilder from '@sanity/image-url'

// Funzione per ottenere l'URL dell'immagine da Sanity
const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

// Funzione per recuperare i dati dei film
async function getMovies() {
  const query = `*[_type == "movie"] | order(releaseYear desc) {
    _id,
    title,
    "slug": slug.current,
    poster,
    releaseYear
  }`
  const movies = await client.fetch(query)
  return movies
}

// La nostra pagina principale
export default async function HomePage() {
  const movies = await getMovies()

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-400">Movie Canon</h1>
          <p className="text-lg text-gray-300 mt-2">The Ultimate Movie Ranking</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div key={movie._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-yellow-400/20 transition-shadow duration-300">
              <a href={`/movies/${movie.slug}`}>
                {movie.poster ? (
                  <img
                    src={urlFor(movie.poster).width(400).height(600).url()}
                    alt={`Poster for ${movie.title}`}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-700 flex items-center justify-center">
                    <span>No Poster</span>
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold truncate">{movie.title}</h2>
                  <p className="text-gray-400">{movie.releaseYear}</p>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

// Dice a Next.js di non memorizzare la pagina in cache per ora,
// così vedrai subito le modifiche che fai su Sanity.
export const revalidate = 0
