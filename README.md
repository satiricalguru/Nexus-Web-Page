# Nexus MUJ

The Nexus MUJ club website, built with HTML, CSS, JavaScript, and Three.js.

## Run and build

Install Node.js, then run `npm start` and open the printed local address. Run `npm run check` to check JavaScript syntax and `npm run build` to produce a fresh `dist/` folder. Upload that folder to any static host. The current deployment uses Vercel; its configuration is optional when using another host.

## Edit the site

- `index.html`: page sections, project cards, and contact links.
- `css/style.css`: all layout, typography, responsive styling, and hover effects.
- `js/main.js`: team roster, navigation, search, dialogs, homepage scroll behavior, and star animation.
- `assets/`: local artwork and fonts.
- `js/vendor/`: local Three.js modules and license.

Project cards are concepts. Update both the HTML cards and `projectDetails` in `js/main.js` when real projects are available. Team memberships may repeat a name across teams; the directory reports both membership and distinct-name counts.
