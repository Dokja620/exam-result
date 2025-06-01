import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
  const search = url.searchParams.get('search')?.trim() || '';

  const endpoint = search
    ? `/api/results?search=${encodeURIComponent(search)}`
    : `/api/results`;

  const res = await fetch(endpoint);

  if (!res.ok) {
    throw new Error('Failed to fetch results');
  }

  const results = await res.json();

  return {
    results,
    search,
  };
};
