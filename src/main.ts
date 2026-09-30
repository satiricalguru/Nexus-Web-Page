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

// 6. Optional generated ambience. The supplied Spotify album is linked externally and is not streamed here.
const musicButton = $<HTMLButtonElement>('music');
const musicText = $('music-text');
const navAudioBtn = document.getElementById('nav-audio-btn') as HTMLButtonElement | null;
const navAudioText = document.getElementById('nav-audio-text');
const volSlider = $<HTMLInputElement>('vol');

// Restore persisted volume choice
try {
  const savedVol = localStorage.getItem('nexus-vol');
  if (savedVol !== null) volSlider.value = savedVol;
} catch {
  // localStorage disabled or private browsing
}

class CosmicSoundscape {
  private audioCtx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private resumeWhenVisible = false;
  private onStateChangeCb: ((isPlaying: boolean) => void) | null = null;

  public onStateChange(cb: (isPlaying: boolean) => void) {
    this.onStateChangeCb = cb;
  }

  private notify(isPlaying: boolean) {
    this.onStateChangeCb?.(isPlaying);
  }

  public async toggle(targetVol: number): Promise<boolean> {
    if (this.isPlaying) {
      this.resumeWhenVisible = false;
      await this.stop();
      return false;
    }

    try {
      this.resumeWhenVisible = false;
      this.startSyntheticDrone(targetVol);
      await this.audioCtx?.resume();
      this.isPlaying = this.audioCtx?.state === 'running';
      this.notify(this.isPlaying);
      return this.isPlaying;
    } catch {
      await this.stop();
      return false;
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(vol * 0.15, this.audioCtx.currentTime, 0.05);
    }
  }

  public async stop() {
    this.resumeWhenVisible = false;
    this.isPlaying = false;
    const context = this.audioCtx;
    const oscillators = [this.osc1, this.osc2, this.lfo];
    this.audioCtx = null;
    this.masterGain = null;
    this.osc1 = null;
    this.osc2 = null;
    this.lfo = null;

    if (context) {
      try {
        oscillators.forEach((oscillator) => oscillator?.stop());
        await context.close();
      } catch {
        // The context may already be closed by the browser.
      }
    }
    this.notify(false);
  }

  public onVisibilityChange(hidden: boolean) {
    if (hidden) {
      if (this.isPlaying && this.audioCtx) {
        this.resumeWhenVisible = true;
        this.isPlaying = false;
        const context = this.audioCtx;
        void context.suspend().catch(() => {
          if (context === this.audioCtx) {
            this.resumeWhenVisible = false;
            this.isPlaying = false;
            this.notify(false);
          }
        });
        this.notify(false);
      }
    } else if (this.resumeWhenVisible && this.audioCtx) {
      const context = this.audioCtx;
      this.resumeWhenVisible = false;
      void context.resume().then(() => {
        if (!document.hidden && context === this.audioCtx && context.state === 'running') {
          this.isPlaying = true;
          this.notify(true);
        }
      }).catch(() => {
        this.isPlaying = false;
        this.notify(false);
      });
    }
  }

  private startSyntheticDrone(vol: number) {
    const AudioContextClass = window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) throw new Error('Web Audio is not available in this browser.');

    this.audioCtx = new AudioContextClass();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(vol * 0.12, this.audioCtx.currentTime);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.audioCtx.currentTime);

    this.osc1 = this.audioCtx.createOscillator();
    this.osc1.type = 'sine';
    this.osc1.frequency.setValueAtTime(55, this.audioCtx.currentTime);

    this.osc2 = this.audioCtx.createOscillator();
    this.osc2.type = 'sine';
    this.osc2.frequency.setValueAtTime(110, this.audioCtx.currentTime);

    this.lfo = this.audioCtx.createOscillator();
    this.lfo.frequency.setValueAtTime(0.1, this.audioCtx.currentTime);
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(20, this.audioCtx.currentTime);
    this.lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    this.osc1.connect(filter);
    this.osc2.connect(filter);
    filter.connect(this.masterGain);
    this.masterGain.connect(this.audioCtx.destination);

    this.osc1.start();
    this.osc2.start();
    this.lfo.start();
  }
}

const soundscape = new CosmicSoundscape();

function updateAudioUI(isPlaying: boolean) {
  musicButton.setAttribute('aria-pressed', String(isPlaying));
  musicText.textContent = isPlaying ? 'Ambient tone: on' : 'Ambient tone: off';

  if (navAudioBtn) {
    navAudioBtn.setAttribute('aria-pressed', String(isPlaying));
  }
  if (navAudioText) {
    navAudioText.textContent = isPlaying ? 'AMBIENCE ON' : 'AMBIENCE';
  }
}

soundscape.onStateChange((isPlaying) => {
  updateAudioUI(isPlaying);
});

async function handleAudioToggle() {
  const currentVol = parseFloat(volSlider.value);
  const isPlaying = await soundscape.toggle(currentVol);
  updateAudioUI(isPlaying);
}

musicButton.addEventListener('click', handleAudioToggle);
navAudioBtn?.addEventListener('click', handleAudioToggle);

volSlider.addEventListener('input', () => {
  const val = parseFloat(volSlider.value);
  soundscape.setVolume(val);
  try {
    localStorage.setItem('nexus-vol', volSlider.value);
  } catch {
    // storage disabled
  }
});

document.addEventListener('visibilitychange', () => {
  soundscape.onVisibilityChange(document.hidden);
});

window.addEventListener('pagehide', () => {
  void soundscape.stop();
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

