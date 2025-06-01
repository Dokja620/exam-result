import type { PageLoad } from "./$types";
import type { Results } from "$lib/types";

export const load: PageLoad = async () => {
  try {
    const response = await fetch('/api/results');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || `Server responded with : ${response.status}`);
    }

    const results: Results[] = await response.json();
    console.log('Results successfully fetched');

    return { results };

  } catch (err: any) {
    console.log('Something went wrong');
  }
}
