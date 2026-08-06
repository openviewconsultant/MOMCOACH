export function getVideoEmbedUrl(url: string, options?: { autoplay?: boolean }): string | null {
  const autoplay = options?.autoplay ?? false;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = parsed.pathname.startsWith('/embed/')
        ? parsed.pathname.replace('/embed/', '')
        : parsed.searchParams.get('v');
      if (!id) return null;
      const params = new URLSearchParams({ rel: '0', modestbranding: '1' });
      if (autoplay) {
        params.set('autoplay', '1');
        params.set('mute', '1');
      }
      return `https://www.youtube.com/embed/${id}?${params.toString()}`;
    }

    if (host === 'youtu.be') {
      const id = parsed.pathname.replace('/', '');
      if (!id) return null;
      const params = new URLSearchParams({ rel: '0', modestbranding: '1' });
      if (autoplay) {
        params.set('autoplay', '1');
        params.set('mute', '1');
      }
      return `https://www.youtube.com/embed/${id}?${params.toString()}`;
    }

    if (host === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      if (!id) return null;
      const params = new URLSearchParams();
      if (autoplay) {
        params.set('autoplay', '1');
        params.set('muted', '1');
      }
      const query = params.toString();
      return `https://player.vimeo.com/video/${id}${query ? `?${query}` : ''}`;
    }

    return null;
  } catch {
    return null;
  }
}
