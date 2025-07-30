// app/api/generate-details/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

// Client Sanity con privilegi di scrittura
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2022-11-15',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// --- INTESTAZIONI CORS ---
// Queste righe dicono al nostro sito di accettare richieste
// solo dal dominio del nostro Sanity Studio.
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://moviecanon.sanity.studio',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Funzione per gestire le richieste "preflight" del browser
export async function OPTIONS(request) {
  return new Response(null, { headers: corsHeaders })
}

// Funzione per generare la biografia con Gemini
async function generateBiography(name, documentType) {
  const typeText = documentType === 'director' ? 'regista' : 'attore/attrice'
  const prompt = `Scrivi una breve biografia enciclopedica, in italiano, per ${typeText} ${name}. Concentrati sulla sua carriera cinematografica, i film più importanti e il suo stile o i ruoli tipici. Massimo 150 parole.`
  
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const apiKey = "" // Lasciare vuoto
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('La generazione della biografia non è riuscita.');

  return text.split('\n\n').map(paragraph => ({
    _type: 'block',
    style: 'normal',
    children: [{ _type: 'span', text: paragraph }],
  }));
}

// Funzione per generare l'immagine con Imagen e caricarla su Sanity
async function generateAndUploadImage(name, documentType) {
  const typeText = documentType === 'director' ? 'regista' : 'attore/attrice'
  const prompt = `Un ritratto artistico e stilizzato a carboncino del ${typeText} cinematografico ${name}.`

  const payload = { instances: [{ prompt }], parameters: { "sampleCount": 1} };
  const apiKey = "" // Lasciare vuoto
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  const base64Data = result?.predictions?.[0]?.bytesBase64Encoded;

  if (!base64Data) throw new Error("La generazione dell'immagine non è riuscita.");

  const imageBuffer = Buffer.from(base64Data, 'base64');
  const imageAsset = await sanityClient.assets.upload('image', imageBuffer, {
    filename: `${name.replace(/\s+/g, '-')}-ai.png`,
    contentType: 'image/png'
  });

  return imageAsset._id;
}


export async function POST(request) {
  try {
    const { documentId, name, documentType } = await request.json()
    if (!documentId || !name || !documentType) {
      return NextResponse.json({ message: 'Dati mancanti' }, { status: 400, headers: corsHeaders })
    }

    const [biography, imageId] = await Promise.all([
      generateBiography(name, documentType),
      generateAndUploadImage(name, documentType)
    ]);

    // Aggiungiamo le intestazioni CORS alla risposta di successo
    return NextResponse.json({ biography, imageId }, { headers: corsHeaders })
  } catch (error) {
    console.error("Errore nell'API di generazione:", error)
    // Aggiungiamo le intestazioni CORS anche alla risposta di errore
    return NextResponse.json(
        { message: error.message || "Errore interno del server" }, 
        { status: 500, headers: corsHeaders }
    )
  }
}
