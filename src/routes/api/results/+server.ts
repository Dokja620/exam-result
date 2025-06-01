import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.pb) {
    console.error('API: PocketBase instance is not available!')
    return json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    console.log('API: Fetching results from database...')

    const search = url.searchParams.get('search')?.trim();

    let filter = 'created>="2025-01-01"';

    // Add search filter if search parameter exists
    if (search) {
      const searchFilter = `(matricule~"${search}" || first_name~"${search}" || last_name~"${search}")`;
      filter = `${filter} && ${searchFilter}`;
    }

    const examResults = await locals.pb.collection('results').getList(1, 20, {
      filter: filter,
    })

    console.log(`API: Successfully fetched ${examResults.items.length} results${search ? ` for search: "${search}"` : ''}`)

    return json(examResults.items)
  } catch (error: any) {
    console.error('API: Error fetching results', error)
    return json({ error: 'Failed to retrieve results', details: error.message }, { status: 500 })
  }
}
