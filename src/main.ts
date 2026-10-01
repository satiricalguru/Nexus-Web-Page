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

// 2. Communication Channels Matrix
interface CommChannel {
  name: string;
  category: string;
  tag: string;
  handle: string;
  desc: string;
  url: string;
  btnText: string;
  iconSvg: string;
  themeClass: string;
}

const channelsList: CommChannel[] = [
  {
    name: 'LinkedIn Organization',
    category: 'PROFESSIONAL NETWORK',
    tag: 'VERIFIED WING',
    handle: 'company/nexus-manipal-jaipur',
    desc: 'Official company network for research collaborations, campus achievements, career opportunities, and project highlights.',
    url: config.linkedinUrl,
    btnText: 'Connect on LinkedIn',
    themeClass: 'channel-linkedin',
    iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`
  },
  {
    name: 'Official Instagram',
    category: 'MEDIA & CULTURE',
    tag: 'COMMUNITY',
    handle: '@nexus_muj',
    desc: 'Visual dispatches from telescope sky-watch sessions, hackathon nights, workshop reels, and live event stories.',
    url: config.instagramUrl,
    btnText: 'Follow @nexus_muj',
    themeClass: 'channel-instagram',
    iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`
  },
  {
    name: 'MUJ DSW Directory',
    category: 'CAMPUS ACCREDITATION',
    tag: 'REGISTRY',
    handle: 'jaipur.manipal.edu/dsw',
    desc: 'Official student organization accreditation under Directorate of Student Welfare at Manipal University Jaipur.',
    url: config.mujUrl,
    btnText: 'View University Portal',
    themeClass: 'channel-muj',
    iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`
  },
  {
    name: 'GitHub Open Source',
    category: 'SOURCE ARCHITECTURE',
    tag: 'CODEBASE',
    handle: 'satiricalguru/Nexus-Web-Page',
    desc: 'Interactive 3D WebGL portal source, Three.js shaders, algorithmic telemetry, and space software repositories.',
    url: config.githubUrl,
    btnText: 'Explore on GitHub',
    themeClass: 'channel-github',
    iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`
  }
];

if (config.joinUrl) {
  channelsList.unshift({
    name: 'Nexus Member Induction',
    category: 'JOIN COHORT',
    tag: 'RECRUITMENT',
    handle: 'Application Registry',
    desc: 'Official registration form for new student recruits across technical, management, creative, and research divisions.',
    url: config.joinUrl,
    btnText: 'Apply to Join Nexus',
    themeClass: 'channel-join',
    iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7.5" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>`
  });
}

const channelsMatrixEl = document.getElementById('channels-matrix');
if (channelsMatrixEl) {
  channelsMatrixEl.innerHTML = channelsList
    .filter(ch => Boolean(ch.url))
    .map(ch => `
      <a href="${esc(ch.url)}" class="channel-card ${ch.themeClass}" target="_blank" rel="noopener noreferrer">
        <div class="channel-card-top">
          <div class="channel-icon-wrap" aria-hidden="true">
            ${ch.iconSvg}
          </div>
          <div class="channel-meta-tags">
            <span class="channel-category">${esc(ch.category)}</span>
            <span class="channel-tag">${esc(ch.tag)}</span>
          </div>
        </div>
        <div class="channel-card-content">
          <h3 class="channel-title">${esc(ch.name)}</h3>
          <span class="channel-handle">${esc(ch.handle)}</span>
          <p class="channel-desc">${esc(ch.desc)}</p>
        </div>
        <div class="channel-card-action">
          <span class="channel-btn-text">${esc(ch.btnText)}</span>
          <span class="channel-btn-arrow" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </span>
        </div>
      </a>
    `).join('');
}

const spotifyLink = document.getElementById('spotify-link') as HTMLAnchorElement | null;
if (spotifyLink && config.spotifyUrl) {
  spotifyLink.href = config.spotifyUrl;
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

