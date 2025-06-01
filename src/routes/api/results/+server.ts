import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.pb) {
    console.error('API: PocketBase instance is not avaible!')
    return json({ error: 'Server configuration error' }, { status: 500 })
  }
  try {
    console.log('API: Fetching results from database...')
    const examResults = await locals.pb.collection('results').getList(1, 20, {
      filter: 'created>="2025-01-01"',
    })

    console.log(`API: Successfully fetched ${examResults.items.length} results`)

    return json(examResults.items)
  } catch (error: any) {
    console.error('API: Error fetching results', error)
    return json({ error: 'Failed to retrieve results', details: error.message }, { status: 500 })

  }
}
