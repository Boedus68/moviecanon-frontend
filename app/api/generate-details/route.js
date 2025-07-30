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

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://moviecanon.sanity.studio',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS(request) {
  return new Response(null, { headers: corsHeaders })
}

// Funzione per generare la biografia con Gemini
async function generateBiography(name, documentType) {
  console.log(`[AI] Avvio generazione biografia per: ${name}`);
  console.time('Gemini_API_Call_Duration');
  const typeText = documentType === 'director' ? 'regista' : 'attore/attrice'
  const prompt = `Scrivi una breve biografia enciclopedica, in italiano, per ${typeText} ${name}. Concentrati sulla sua carriera cinematografica, i film più importanti e il suo stile o i ruoli tipici. Massimo 150 parole.`
  
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const apiKey = process.env.GOOGLE_AI_API_KEY
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  console.timeEnd('Gemini_API_Call_Duration');
  const result = await response.json();
  console.log(`[AI] Risposta da Gemini API ricevuta. Status: ${response.status}`);
  
  if (result.error) {
    console.error('[AI] Errore da Gemini API:', result.error.message);
    throw new Error('La generazione della biografia non è riuscita a causa di un errore API.');
  }

  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error('[AI] Risposta da Gemini API non contiene testo:', JSON.stringify(result, null, 2));
    throw new Error('La generazione della biografia non è riuscita (nessun testo restituito).');
  }
  
  console.log(`[AI] Generazione biografia completata.`);
  return text.split('\n\n').map(paragraph => ({
    _type: 'block',
    style: 'normal',
    children: [{ _type: 'span', text: paragraph }],
  }));
}

// Funzione per generare l'immagine con Imagen e caricarla su Sanity
async function generateAndUploadImage(name, documentType) {
  console.log(`[AI] Avvio generazione immagine per: ${name}`);
  console.time('Imagen_API_Call_Duration');
  const typeText = documentType === 'director' ? 'regista' : 'attore/attrice'
  const prompt = `Un ritratto fotorealistico di alta qualità del ${typeText} cinematografico ${name}.`

  const payload = { instances: [{ prompt }], parameters: { "sampleCount": 1} };
  const apiKey = process.env.GOOGLE_AI_API_KEY
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  console.timeEnd('Imagen_API_Call_Duration');
  const result = await response.json();
  console.log(`[AI] Risposta da Imagen API ricevuta. Status: ${response.status}`);

  if (result.error || !result.predictions || result.predictions.length === 0) {
    console.error('[AI] Errore o risposta vuota da Imagen API:', result.error ? result.error.message : 'Nessuna previsione restituita.');
    console.error('[AI] Contenuto completo risposta Imagen:', JSON.stringify(result, null, 2));
    throw new Error("La generazione dell'immagine non è riuscita a causa di un errore API o di una risposta vuota.");
  }

  const base64Data = result.predictions[0]?.bytesBase64Encoded;
  if (!base64Data) throw new Error("La generazione dell'immagine non è riuscita (nessuna immagine restituita nel payload).");

  console.log(`[AI] Generazione immagine completata, avvio upload su Sanity...`);
  const imageBuffer = Buffer.from(base64Data, 'base64');
  const imageAsset = await sanityClient.assets.upload('image', imageBuffer, {
    filename: `${name.replace(/\s+/g, '-')}-ai.png`,
    contentType: 'image/png'
  });
  console.log(`[AI] Upload su Sanity completato.`);

  return imageAsset._id;
}


export async function POST(request) {
  try {
    const { documentId, name, documentType } = await request.json()
    if (!documentId || !name || !documentType) {
      return NextResponse.json({ message: 'Dati mancanti' }, { status: 400, headers: corsHeaders })
    }

    console.log(`[API] Inizio processo per ${name}`);
    const biography = await generateBiography(name, documentType);
    const imageId = await generateAndUploadImage(name, documentType);
    console.log(`[API] Processo per ${name} completato con successo.`);

    return NextResponse.json({ biography, imageId }, { headers: corsHeaders })
  } catch (error) {
    console.error("[API] Errore grave nell'API di generazione:", error.message)
    return NextResponse.json(
        { message: error.message || "Errore interno del server" }, 
        { status: 500, headers: corsHeaders }
    )
  }
}
