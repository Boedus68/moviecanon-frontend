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
  // ... (il codice di questa funzione rimane invariato)
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

async function generateAndUploadImage(name, documentType) {
    // ... (il codice di questa funzione rimane invariato)
  const typeText = documentType === 'director' ? 'regista' : 'attore/attrice'
  const prompt = `Un ritratto fotorealistico di alta qualità del ${typeText} cinematografico ${name}.`
  const payload = { instances: [{ prompt }], parameters: { "sampleCount": 1} };
  const apiKey = process.env.GOOGLE_AI_API_KEY
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const result = await response.json();
  const base64Data = result?.predictions?.[0]?.bytesBase64Encoded;
  if (!base64Data) throw new Error("La generazione dell'immagine non è riuscita.");
  const imageBuffer = Buffer.from(base64Data, 'base64');
  const imageAsset = await sanityClient.assets.upload('image', imageBuffer, {filename: `${name.replace(/\s+/g, '-')}-ai.png`, contentType: 'image/png'});
  return imageAsset._id;
}

// --- LOGICA PRINCIPALE AGGIORNATA ---
export async function POST(request) {
  try {
    const { documentId, name, documentType } = await request.json()
    if (!documentId || !name || !documentType) {
      return NextResponse.json({ message: 'Dati mancanti' }, { status: 400, headers: corsHeaders })
    }

    console.log(`[API] Inizio processo per ${name}`);
    
    let biography = null;
    let imageId = null;

    // Genera la biografia. Se fallisce, l'errore bloccherà tutto.
    biography = await generateBiography(name, documentType);

    // Tenta di generare l'immagine, ma non bloccare tutto se fallisce.
    try {
      imageId = await generateAndUploadImage(name, documentType);
    } catch (imageError) {
      console.error(`[API] Generazione immagine per ${name} fallita, ma la biografia è stata creata:`, imageError.message);
      // L'imageId rimarrà null, ma non lanciamo un errore.
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
