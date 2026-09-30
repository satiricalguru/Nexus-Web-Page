import './style.css';
import { config, members, projects, events, Member } from './data';
import { initScene } from './scene';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) {
  document.documentElement.style.scrollBehavior = 'auto';
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

// 1. Members Search & Team Filtering
const teamCounts = members.reduce<Record<string, number>>((acc, m) => {
  acc[m.team] = (acc[m.team] || 0) + 1;
  return acc;
}, {});

// Order: All, Core Committee, followed by the rest
const uniqueTeams = Array.from(new Set(members.map((m) => m.team))).sort((a, b) => {
  if (a === 'Core Committee') return -1;
  if (b === 'Core Committee') return 1;
  return a.localeCompare(b);
});
const teams = ['All', ...uniqueTeams];

let selectedTeam = 'All';
let searchQuery = '';

const peopleList = $('people');
const chipsContainer = $('chips');
const countElement = $('count');
const searchInput = $<HTMLInputElement>('q');
const clearSearchBtn = $<HTMLButtonElement>('clear-search');

function renderMembers() {
  const filtered = members.filter((m) => {
    const matchesTeam = selectedTeam === 'All' || m.team === selectedTeam;
    const matchesQuery = !searchQuery || m.name.toLowerCase().includes(searchQuery);
    return matchesTeam && matchesQuery;
  });

  if (filtered.length === 0) {
    peopleList.innerHTML = `
      <li class="empty-search-msg">
        <p>No crew members match "<strong>${esc(searchQuery)}</strong>" in <strong>${esc(selectedTeam)}</strong>.</p>
        <p class="note">Try adjusting your search or switching team filters.</p>
      </li>
    `;
    countElement.textContent = '0 crew members located';
    return;
  }

  peopleList.innerHTML = filtered
    .map((m: Member) => {
      // Get monogram initials
      const initials = m.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      let roleClass = '';
      if (m.team === 'Core Committee') roleClass = 'core';
      else if (m.role.includes('Head') || m.role.includes('Lead')) roleClass = 'head';

      return `
        <li class="card person-card">
          <span class="av" aria-hidden="true">${esc(initials)}</span>
          <div class="person-info">
            <h3 class="person-name">${esc(m.name)}</h3>
            <span class="person-role ${roleClass}">${esc(m.role)}</span>
            <span class="person-team">${esc(m.team)}</span>
          </div>
        </li>
      `;
    })
    .join('');

  const countStr = `${filtered.length} ${filtered.length === 1 ? 'person' : 'people'}`;
  countElement.textContent = selectedTeam === 'All'
    ? `Showing all ${countStr} in 2026–27 roster`
    : `Showing ${countStr} in ${selectedTeam}`;
}

// Generate team chips with counts
chipsContainer.innerHTML = teams
  .map((t) => {
    const count = t === 'All' ? members.length : teamCounts[t] || 0;
    return `
      <button class="chip" data-team="${esc(t)}" aria-pressed="${t === selectedTeam}">
        <span>${esc(t)}</span>
        <span class="chip-count">(${count})</span>
      </button>
    `;
  })
  .join('');

chipsContainer.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button.chip');
  if (!btn) return;
  selectedTeam = btn.dataset.team || 'All';
  chipsContainer.querySelectorAll('button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b === btn));
  });
  renderMembers();
});

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.toLowerCase().trim();
  clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
  renderMembers();
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    renderMembers();
  }
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  clearSearchBtn.style.display = 'none';
  renderMembers();
  searchInput.focus();
});

renderMembers();

// 2. Communication Links
const linksList: [string, string][] = [
  ['Join Nexus Form', config.joinUrl],
  ['Official Instagram', config.instagramUrl],
  ['Nexus on MUJ Clubs', config.mujUrl],
];

const validLinks = linksList.filter(([, u]) => Boolean(u));
$('links').innerHTML = validLinks.length > 0
  ? validLinks
      .map(
        ([label, url]) => `
      <li>
        <a class="btn ghost" href="${esc(url)}" target="_blank" rel="noopener">
          <span>${esc(label)}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>
      </li>`
      )
      .join('')
  : '<li><p class="note">Communication links pending official configuration.</p></li>';

const spotifyLink = document.getElementById('spotify-link') as HTMLAnchorElement | null;
if (spotifyLink && config.spotifyUrl) {
  spotifyLink.href = config.spotifyUrl;
} else {
  document.querySelector('.spotify-card')?.remove();
}

// 3. Work & Events Empty States
const safeUrl = (u?: string) => (u && /^https?:\/\//.test(u) ? esc(u) : '');

const renderRadarEmpty = (title: string, msg: string, code: string) => `
  <div class="empty-radar-card card">
    <div class="radar-scan-circle">
      <span class="radar-icon">✦</span>
    </div>
    <span class="card-code">${code}</span>
    <h3>${esc(title)}</h3>
    <p>${msg}</p>
    <span class="empty-code">All entries strictly verified from authoritative records · No placeholder results</span>
  </div>
`;

$('work-list').innerHTML = projects.length > 0
  ? projects
      .map(
        (p) => `
      <article class="card">
        <span class="card-code">${esc(p.status)}${p.date ? ' // ' + esc(p.date) : ''}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.text)}</p>
        ${safeUrl(p.url) ? `<p><a class="btn ghost" href="${safeUrl(p.url)}" target="_blank" rel="noopener">Explore Whitepaper</a></p>` : ''}
      </article>`
      )
      .join('')
  : renderRadarEmpty(
      'New Transmissions Incoming',
      'Confirmed projects and published work will appear here when details are ready to share.',
      'SYS: FREQUENCY SCANNING // ACTIVE'
    );

$('events-list').innerHTML = events.length > 0
  ? events
      .map(
        (e) => `
      <article class="card">
        <span class="card-code">${esc(e.date)} // ${esc(e.venue)}</span>
        <h3>${esc(e.title)}</h3>
        <p>${esc(e.status)}</p>
        ${safeUrl(e.url) ? `<p><a class="btn primary" href="${safeUrl(e.url)}" target="_blank" rel="noopener">Register Flight Slot</a></p>` : ''}
      </article>`
      )
      .join('')
  : renderRadarEmpty(
      'Orbital Flight Schedule Pending',
      'Confirmed Nexus events will be listed here with dates, locations, and registration details.',
      'SYS: FLIGHT SCHEDULE // STANDBY'
    );

// 4. Mobile Navigation Drawer
const menuButton = $('menu');
const navBar = $('nav');

menuButton.addEventListener('click', () => {
  const isOpen = navBar.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

navBar.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).tagName === 'A') {
    navBar.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});

// 5. 3D Scene Initialization
const canvas = $<HTMLCanvasElement>('scene');
const scrollToSection = (id: string) => {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
};

const disposeScene = initScene(canvas, reduced, scrollToSection);
if (!disposeScene) {
  canvas.remove();
  document.body.classList.add('no-webgl');
}
window.addEventListener('pagehide', () => disposeScene?.());

// 6. Background Audio Player: Official Track in Continuous Loop
const navAudioBtn = document.getElementById('nav-audio-btn') as HTMLButtonElement | null;
const navAudioText = document.getElementById('nav-audio-text');

class BackgroundAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private wasPlayingBeforeHidden = false;
  private targetVolume = 0.35;
  private hasUserManuallyPaused = false;

  constructor() {
    this.initAudio();
    this.setupAutoplayAndListeners();
  }

  private initAudio() {
    const audioPath = config.audioSrc || '/audio/nexus-ambient.mp3';
    this.audio = new Audio(audioPath);
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.volume = 0;

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateUI(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateUI(false);
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio notice:', e);
    });

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: config.audioTitle || 'NEXUS',
          artist: config.audioArtist || 'MUj feat. BNM EFOSA, whyte tee',
          album: 'NEXUS — Official Club Soundtrack',
          artwork: [
            { src: '/nexus-logo.png', sizes: '512x512', type: 'image/png' },
          ],
        });
        navigator.mediaSession.setActionHandler('play', () => void this.play());
        navigator.mediaSession.setActionHandler('pause', () => void this.pause());
      } catch {
        // mediaSession optional
      }
    }
  }

  private setupAutoplayAndListeners() {
    // Attempt playback immediately
    this.attemptPlay();

    // Browser Autoplay Policy: if blocked on load, activate on first interaction
    const startOnFirstInteraction = () => {
      if (!this.hasUserManuallyPaused && !this.isPlaying) {
        void this.play();
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('pointerdown', startOnFirstInteraction);
      window.removeEventListener('keydown', startOnFirstInteraction);
      window.removeEventListener('touchstart', startOnFirstInteraction);
      window.removeEventListener('scroll', startOnFirstInteraction);
    };

    window.addEventListener('pointerdown', startOnFirstInteraction, { once: true });
    window.addEventListener('keydown', startOnFirstInteraction, { once: true });
    window.addEventListener('touchstart', startOnFirstInteraction, { once: true });
    window.addEventListener('scroll', startOnFirstInteraction, { once: true, passive: true });
  }

  public async play(): Promise<boolean> {
    if (!this.audio) return false;
    try {
      this.hasUserManuallyPaused = false;
      await this.audio.play();
      this.fadeIn();
      return true;
    } catch {
      return false;
    }
  }

  public pause(): void {
    if (!this.audio) return;
    this.hasUserManuallyPaused = true;
    this.fadeOutAndPause();
  }

  public toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      void this.play();
    }
  }

  private fadeIn(durationMs = 600) {
    if (!this.audio) return;
    const start = performance.now();
    const startVol = this.audio.volume;
    const step = () => {
      if (!this.audio || this.audio.paused) return;
      const progress = Math.min(1, (performance.now() - start) / durationMs);
      this.audio.volume = startVol + (this.targetVolume - startVol) * progress;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  private fadeOutAndPause(durationMs = 300) {
    if (!this.audio || this.audio.paused) return;
    const start = performance.now();
    const startVol = this.audio.volume;
    const step = () => {
      if (!this.audio) return;
      const progress = Math.min(1, (performance.now() - start) / durationMs);
      this.audio.volume = Math.max(0, startVol * (1 - progress));
      if (progress < 1 && !this.audio.paused) {
        requestAnimationFrame(step);
      } else {
        this.audio.pause();
      }
    };
    requestAnimationFrame(step);
  }

  private attemptPlay() {
    this.audio?.play().then(() => {
      this.fadeIn();
    }).catch(() => {
      // Autoplay blocked by browser policy without user gesture - gesture listener will activate it
    });
  }

  public onVisibilityChange(hidden: boolean) {
    if (hidden) {
      if (this.isPlaying) {
        this.wasPlayingBeforeHidden = true;
        this.audio?.pause();
      }
    } else {
      if (this.wasPlayingBeforeHidden && !this.hasUserManuallyPaused) {
        this.wasPlayingBeforeHidden = false;
        void this.play();
      }
    }
  }

  private updateUI(playing: boolean) {
    if (navAudioBtn) {
      navAudioBtn.setAttribute('aria-pressed', String(playing));
    }
    if (navAudioText) {
      navAudioText.textContent = playing ? 'NEXUS ♪' : 'SOUNDTRACK';
    }
  }
}

const backgroundAudio = new BackgroundAudioPlayer();

navAudioBtn?.addEventListener('click', () => {
  backgroundAudio.toggle();
});

document.addEventListener('visibilitychange', () => {
  backgroundAudio.onVisibilityChange(document.hidden);
});

window.addEventListener('pagehide', () => {
  backgroundAudio.pause();
});

// 7. Active Navigation State Tracking
const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js');
  const navLinks = Array.from(navBar.querySelectorAll<HTMLAnchorElement>('a.nav-link'));

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((a) => {
            if (a.getAttribute('href') === `#${id}`) {
              a.setAttribute('aria-current', 'true');
            } else {
              a.removeAttribute('aria-current');
            }
          });
        }
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );

  sections.forEach((sec) => activeObserver.observe(sec));
}

// 8. Sticky Header Elevation on Scroll
const siteHeader = document.getElementById('site-header');
if (siteHeader) {
  const onHeaderScroll = () => {
    if (window.scrollY > 20) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();
}

