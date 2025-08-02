'use client'

import { useState } from 'react'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/lib/sanity.client'
import './MovieGallery.css'
import Image from 'next/image'

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
    e.stopPropagation()
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % gallery.length)
  }

  const showPrevImage = (e) => {
    e.stopPropagation()
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + gallery.length) % gallery.length)
  }

  if (!gallery || gallery.length === 0) return null

  return (
    <>
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Galleria</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((image, index) => (
            <div key={index} onClick={() => openLightbox(index)} className="cursor-pointer relative aspect-video">
              <Image
                src={urlFor(image).url()}
                alt={`Immagine della galleria ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="rounded-lg shadow-md hover:opacity-80 transition-opacity object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close-button" onClick={closeLightbox}>&times;</button>
          <button className="lightbox-nav-button lightbox-prev-button" onClick={showPrevImage}>&#8249;</button>
          <div className="relative w-[90vw] h-[85vh]">
            <Image
                src={urlFor(gallery[currentImageIndex]).url()}
                alt={`Immagine ingrandita ${currentImageIndex + 1}`}
                fill
                sizes="90vw"
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button className="lightbox-nav-button lightbox-next-button" onClick={showNextImage}>&#8250;</button>
        </div>
      )}
    </>
  )
}
