import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  try {
    const response = await fetch('/api/results');

    if (!response.ok) {
      throw new Error(`Failed to fetch results: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();

    return {
      results: data,
    };
  } catch (error) {
    console.error('Error fetching results:', error);
    throw error;
  }
};
