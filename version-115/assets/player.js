import { H as Hls } from './hls-vendor.js';

const players = Array.from(document.querySelectorAll('.movie-player'));

players.forEach((video) => {
  const trigger = video.closest('.player-shell')?.querySelector('[data-player-trigger]');
  const source = video.getAttribute('data-video-url') || video.querySelector('source')?.getAttribute('src');
  let attached = false;

  const attach = () => {
    if (!source || attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    }
  };

  const start = () => {
    attach();

    if (trigger) {
      trigger.hidden = true;
    }

    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        if (trigger) {
          trigger.hidden = false;
        }
      });
    }
  };

  video.addEventListener('play', () => {
    if (trigger) {
      trigger.hidden = true;
    }
  });

  video.addEventListener('click', () => {
    attach();
  });

  if (trigger) {
    trigger.addEventListener('click', start);
  }

  attach();
});

window.addEventListener('pagehide', () => {
  players.forEach((video) => {
    if (video._hlsInstance) {
      video._hlsInstance.destroy();
      video._hlsInstance = null;
    }
  });
});
