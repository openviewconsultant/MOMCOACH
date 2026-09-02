export type VideoProvider = 'youtube' | 'vimeo';

export interface VideoEmbed {
  provider: VideoProvider;
  url: string;
}

interface EmbedOptions {
  autoplay?: boolean;
  /** Hide native player chrome (title bar, logo). YouTube only — we render our own mute toggle instead. */
  hideControls?: boolean;
}

export function getVideoEmbed(url: string, options?: EmbedOptions): VideoEmbed | null {
  const autoplay = options?.autoplay ?? false;
  const hideControls = options?.hideControls ?? false;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
      const id = host === 'youtu.be'
        ? parsed.pathname.replace('/', '')
        : parsed.pathname.startsWith('/embed/')
        ? parsed.pathname.replace('/embed/', '')
        : parsed.searchParams.get('v');
      if (!id) return null;

      const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        iv_load_policy: '3', // hide video annotations/cards
        cc_load_policy: '0', // don't force captions on
        playsinline: '1',
        enablejsapi: '1',
        vq: 'hd1080', // sugerencia de calidad (YouTube decide según el tamaño del reproductor y el ancho de banda)
        hd: '1',
      });
      if (autoplay) {
        params.set('autoplay', '1');
        params.set('mute', '1');
      }
      if (hideControls) {
        params.set('controls', '0');
        params.set('disablekb', '1');
      }
      return { provider: 'youtube', url: `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}` };
    }

    if (host === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      if (!id) return null;
      const params = new URLSearchParams({ title: '0', byline: '0', portrait: '0' });
      if (autoplay) {
        params.set('autoplay', '1');
        params.set('muted', '1');
      }
      return { provider: 'vimeo', url: `https://player.vimeo.com/video/${id}?${params.toString()}` };
    }

    return null;
  } catch {
    return null;
  }
}
