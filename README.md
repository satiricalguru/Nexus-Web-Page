<div align="center">

<a href="https://nexus-muj.vercel.app/">
  <img src="assets/images/cosmic-hero.webp" alt="Nexus space backdrop" width="100%" />
</a>

# NEXUS MUJ

**Space · Research · Technology**  
Manipal University Jaipur

<p><code>HTML</code> · <code>CSS</code> · <code>JavaScript</code> · <code>Three.js</code></p>

**[🌐 Live Site](https://nexus-muj.vercel.app/)** · **[✨ Features](#features)** · **[🛠️ Stack](#stack)** · **[👥 Team](#team)** · **[📁 Files](#files)** · **[💻 Run Locally](#run-locally)**

</div>

---

## 🚀 Overview

The Nexus club website brings together project ideas, the team directory, and ways to get in touch. This version keeps the black-and-gold space theme, with an animated star background and a layout that works on phones and desktops.

You're viewing the **`nexus-redesign`** branch. The live preview is available at **[nexus-muj.vercel.app](https://nexus-muj.vercel.app/)**.

<a id="features"></a>

## ✨ Key Features

- **Star background** — a Three.js star field with a static artwork fallback.
- **Team directory** — search members by name, filter by team, and expand the full roster.
- **Project cards** — telemetry, rocketry, and software concepts with detail popups.
- **Scribble hover effects** — drawn underlines on titles and buttons, with subtle card movement.
- **Mobile navigation** — a full-screen menu and responsive layouts.
- **Keyboard support** — visible focus indicators, Escape-to-close dialogs, and reduced-motion support.
- **Quick local setup** — a Windows launcher or one terminal command, with no dependency installation.

<a id="stack"></a>

## 🛠️ Tech Stack

| Part | Built with |
| :--- | :--- |
| Page content | HTML |
| Styling and responsive layouts | CSS |
| Navigation, search, filters, and dialogs | JavaScript |
| Star animation | Three.js / WebGL |
| Local preview and build | Node.js |
| Current hosting | Vercel |

<a id="team"></a>

## 👥 Core Builders

| Jatin Pandey | Aditya Goyal | Lakshya |
| :---: | :---: | :---: |
| [@satiricalguru](https://github.com/satiricalguru) | [@SynthReaper](https://github.com/SynthReaper) | [@lakshya-agrawal254](https://github.com/lakshya-agrawal254) |

<a id="files"></a>

## 📁 Project Structure

```text
Nexus-Web-Page/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── vendor/
├── assets/
│   ├── fonts/
│   └── images/
├── start-site.cmd
├── serve.mjs
├── build.mjs
├── package.json
├── vercel.json
├── LICENSE
└── README.md
```

Most edits happen in three files:

| File | What to edit |
| :--- | :--- |
| `index.html` | Page content, project cards, and contact links |
| `css/style.css` | Colors, spacing, layouts, and hover effects |
| `js/main.js` | Team names and roles, search, dialogs, and animation |

<a id="run-locally"></a>

## 💻 Getting Started

Install **Node.js 18 or newer** once. No `npm install` is needed.

### Download or clone

Download the ZIP from this branch and extract it, or run:

```sh
git clone --branch nexus-redesign --single-branch https://github.com/satiricalguru/Nexus-Web-Page.git
cd Nexus-Web-Page
```

### Windows

Double-click **`start-site.cmd`**. The site opens in your browser automatically. Keep the terminal window open while using it.

### Any platform

Run this from the project folder:

```sh
npm start
```

The default address is **http://127.0.0.1:8000/**. If that port is busy, the launcher chooses a free one and prints the address. Press **Ctrl+C** to stop the preview.

### Check and build

```sh
npm run check
npm run build
```

The build creates a **`dist/`** folder ready for static hosting.

---

## 📄 License

[MIT License](https://github.com/satiricalguru/Nexus-Web-Page/blob/main/LICENSE) · © 2026 Nexus MUJ

<div align="center">

**[🌐 Live Site](https://nexus-muj.vercel.app/)** · **[📸 Instagram](https://www.instagram.com/nexus_muj/)** · **[🏛️ MUJ Clubs](https://www.jaipur.manipal.edu/dsw-student-clubs.php)**

</div>
