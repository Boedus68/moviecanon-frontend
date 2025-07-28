// lib/sanity.client.js
import { createClient } from '@sanity/client'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = '2022-11-15'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // `false` se vuoi sempre i dati più freschi
})
