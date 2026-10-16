import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { defaultYear } from '$lib/server/data';

export const load: PageServerLoad = () => {
	redirect(307, `/etablissements/${defaultYear()}`);
};
