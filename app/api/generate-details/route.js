// app/api/generate-details/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2022-11-15',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://moviecanon.sanity.studio',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS(request) {
  return new Response(null, { headers: corsHeaders })
}

async function generateBiography(name, documentType) {
  const typeText = documentType === 'director' ? 'regista' : 'attore/attrice'
  const prompt = `Scrivi una breve biografia enciclopedica, in italiano, per ${typeText} ${name}. Concentrati sulla sua carriera cinematografica, i film più importanti e il suo stile o i ruoli tipici. Massimo 150 parole.`
  
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const apiKey = process.env.GOOGLE_AI_API_KEY
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('La generazione della biografia non è riuscita.');
  return text.split('\n\n').map(p => ({_type: 'block', style: 'normal', children: [{_type: 'span', text: p}]}));
}

// --- FUNZIONE AGGIORNATA PER GESTIRE MEGLIO LE IMMAGINI ---
async function getAndUploadImageFromTMDB(name) {
  const tmdbApiKey = process.env.TMDB_API_KEY;
  if (!tmdbApiKey) throw new Error('Chiave API di TMDb non trovata.');

  // 1. Cerca la persona per trovare il suo ID
  const searchUrl = `https://api.themoviedb.org/3/search/person?api_key=${tmdbApiKey}&query=${encodeURIComponent(name)}&language=it-IT`;
  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();
  
  const person = searchData.results?.[0];
  if (!person || !person.profile_path) {
    throw new Error(`Nessuna immagine trovata su TMDb per ${name}.`);
  }

  // 2. Costruisci l'URL dell'immagine in alta qualità
  const imageUrl = `https://image.tmdb.org/t/p/original${person.profile_path}`;

  // 3. Scarica l'immagine in un buffer prima di inviarla a Sanity
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Impossibile scaricare l'immagine da TMDb. Status: ${imageResponse.status}`);
  }
  const imageBuffer = await imageResponse.arrayBuffer();

  // 4. Carica l'immagine su Sanity dal buffer
  const imageAsset = await sanityClient.assets.upload('image', Buffer.from(imageBuffer), {
    filename: `${name.replace(/\s+/g, '-')}-tmdb.jpg`,
  });

  return imageAsset._id;
}


export async function POST(request) {
  try {
    const { documentId, name, documentType } = await request.json()
    if (!documentId || !name || !documentType) {
      return NextResponse.json({ message: 'Dati mancanti' }, { status: 400, headers: corsHeaders })
    }

    console.log(`[API] Inizio processo per ${name}`);
    
    let biography = null;
    let imageId = null;

    const results = await Promise.allSettled([
        generateBiography(name, documentType),
        getAndUploadImageFromTMDB(name)
    ]);

    const biographyResult = results[0];
    const imageResult = results[1];

    if (biographyResult.status === 'fulfilled') {
        biography = biographyResult.value;
    } else {
        console.error(`[API] Generazione biografia fallita per ${name}:`, biographyResult.reason.message);
        throw new Error(biographyResult.reason.message);
    }

    if (imageResult.status === 'fulfilled') {
        imageId = imageResult.value;
    } else {
        console.error(`[API] Recupero immagine fallito per ${name}:`, imageResult.reason.message);
    }

    console.log(`[API] Processo per ${name} completato.`);
    return NextResponse.json({ biography, imageId }, { headers: corsHeaders })

  } catch (error) {
    console.error("[API] Errore grave nell'API di generazione:", error.message)
    return NextResponse.json(
        { message: error.message || "Errore interno del server" }, 
        { status: 500, headers: corsHeaders }
    )
  }
}
