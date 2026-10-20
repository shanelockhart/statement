self.addEventListener('fetch', event => {
  const target = new URL('./share', self.registration.scope);
  if (event.request.method !== 'POST' || event.request.url !== target.href) return;
  event.respondWith((async () => {
    const form = await event.request.formData();
    const audio = form.get('audio');
    const transcript = form.get('transcript');
    const text = String(form.get('text') || '');
    if (!audio?.size && !transcript?.size && !text) {
      return Response.redirect(new URL('./', self.registration.scope).href, 303);
    }
    const id = crypto.randomUUID();
    const base = new URL('./shared/' + id + '/', self.registration.scope);
    const cache = await caches.open('statement-shares-v1');
    const meta = { text, audioName: audio?.name || '', audioType: audio?.type || '' };
    await cache.put(new URL('meta', base), new Response(JSON.stringify(meta), { headers: { 'Content-Type': 'application/json' } }));
    if (audio?.size) await cache.put(new URL('audio', base), new Response(audio));
    if (transcript?.size) await cache.put(new URL('transcript', base), new Response(transcript));
    const destination = new URL('./', self.registration.scope);
    destination.searchParams.set('shared', id);
    return Response.redirect(destination.href, 303);
  })());
});
