# Nexus MUJ

A self-contained static website using HTML, CSS, JavaScript, and a local copy of Three.js. It has no backend, tracking, remote font service, remote scripts, or API dependency. Instagram and MUJ are ordinary outgoing links, opened only when clicked.

## Run and build

Install Node.js, then run `npm start` and open the printed local address. Run `npm run check` to check JavaScript syntax and `npm run build` to produce a fresh `dist/` folder. Upload that folder to any static host. The current deployment uses Vercel; its configuration is optional when using another host.

## Edit the site

- `index.html`: page sections, project cards, and contact links.
- `css/style.css`: all layout, typography, responsive styling, and hover effects.
- `js/main.js`: team roster, navigation, search, dialogs, homepage scroll behavior, and star animation.
- `assets/`: local artwork and fonts.
- `js/vendor/`: local Three.js modules and license.

Project cards are concepts. Update both the HTML cards and `projectDetails` in `js/main.js` when real projects are available. Team memberships may repeat a name across teams; the directory reports both membership and distinct-name counts.

## Independence and privacy

The browser loads all assets from this site's own origin. A Content Security Policy restricts scripts and fonts to this site and blocks outgoing API connections. No forms collect data, and there is no analytics or advertising integration. SVG namespace identifiers in the code are format identifiers, not network requests.

Keep included font and library licenses when redistributing the site. The deployment metadata and Git history are not part of the public build.

## Artwork

The space background and rocket image are concept illustrations, not records of actual Nexus missions or equipment. Their files are in `assets/images/`. Library and font licenses are kept alongside their files.

## Review scope

This branch proposes a complete alternative site, replacing the previous TypeScript/Vite implementation with a static HTML/CSS/JavaScript implementation. It is intended for review before any merge to main.

The replacement includes the responsive gold-and-space layout, project concept dialogs, local team roster with search/filter controls, and scribble hover effects. Fonts, artwork, and Three.js are included locally. The previous orbital navigation and audio player are not carried over. Projects remain concepts pending confirmed project details.

To review, run `npm start`, open the local address, and test navigation, project dialogs, team filtering, and mobile layouts. Run `npm run check` and `npm run build` for source and build checks. No dependency installation is required. The original repository license is retained.
