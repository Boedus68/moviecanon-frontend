/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aggiungiamo questa configurazione per le immagini
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
      },
    ],
  },
};

export default nextConfig;
