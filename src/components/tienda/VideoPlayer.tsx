'use client';

import React, { useRef, useState } from 'react';
import { getVideoEmbed } from '@/lib/video';

export default function VideoPlayer({ videoUrl, title }: { videoUrl: string; title: string }) {
  const embed = getVideoEmbed(videoUrl, { autoplay: true, hideControls: true });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [muted, setMuted] = useState(true);

  if (!embed) return null;

  function requestHd() {
    const iframe = iframeRef.current;
    if (embed?.provider !== 'youtube' || !iframe?.contentWindow) return;
    // Pide la mejor calidad disponible en cuanto el reproductor está listo.
    for (const func of ['setPlaybackQualityRange', 'setPlaybackQuality'] as const) {
      const args = func === 'setPlaybackQualityRange' ? ['hd1080', 'highres'] : ['hd1080'];
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
    }
  }

  function toggleMute() {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    const func = muted ? 'unMute' : 'mute';
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
    setMuted((prev) => !prev);
  }

  return (
    <div className="producto-video-wrap">
      <iframe
        ref={iframeRef}
        src={embed.url}
        title={title}
        onLoad={() => {
          requestHd();
          setTimeout(requestHd, 1500);
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {embed.provider === 'youtube' && (
        <button
          type="button"
          className="producto-video-mute-btn"
          onClick={toggleMute}
          aria-label={muted ? 'Activar sonido' : 'Silenciar'}
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
