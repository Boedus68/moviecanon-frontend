'use client'

import { useState } from 'react'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/lib/sanity.client'
import './MovieGallery.css' // Importa il nuovo file CSS

const builder = imageUrlBuilder(client)
function urlFor(source) {
  return builder.image(source)
}

export default function MovieGallery({ gallery }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const openLightbox = (index) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const showNextImage = (e) => {
    e.stopPropagation() // Evita che il click chiuda la lightbox
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % gallery.length)
  }

  const showPrevImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + gallery.length) % gallery.length)
  }

  if (!gallery || gallery.length === 0) {
    return null
  }

  return (
    <>
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Galleria</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((image, index) => (
            <div key={index} onClick={() => openLightbox(index)} className="cursor-pointer">
              <img
                src={urlFor(image).width(400).height(300).url()}
                alt={`Immagine della galleria ${index + 1}`}
                className="w-full h-auto rounded-lg shadow-md hover:opacity-80 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close-button" onClick={closeLightbox}>&times;</button>
          
          <button className="lightbox-nav-button lightbox-prev-button" onClick={showPrevImage}>&#8249;</button>
          
          <img
            src={urlFor(gallery[currentImageIndex]).url()}
            alt={`Immagine ingrandita ${currentImageIndex + 1}`}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()} // Evita la chiusura cliccando sull'immagine
          />

          <button className="lightbox-nav-button lightbox-next-button" onClick={showNextImage}>&#8250;</button>
        </div>
      )}
    </>
  )
}
