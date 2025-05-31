import PocketBase from 'pocketbase';

export async function handle({ event, resolve }) {
  const { request, locals } = event;
  locals.pb = new PocketBase('https://exam-result.pockethost.io/');

  locals.pb.authStore.loadFromCookie(request.headers.get('cookie') || '');

  try {
    locals.pb.authStore.isValid && await locals.pb.collection('users').authRefresh();
    locals.user = locals.pb.authStore.record;
  }
  catch (_) {
    locals.pb.authStore.clear();
    locals.user = undefined;
  }

  const response = await resolve(event);

  response.headers.append('set-cookie', locals.pb.authStore.exportToCookie());

  return response;
}
