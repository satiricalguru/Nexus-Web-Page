# Nexus MUJ

The Nexus MUJ club website, built with HTML, CSS, JavaScript, and Three.js.

## Run the site

Install Node.js once if you don't already have it, then extract the downloaded ZIP.

**Windows:** double-click `start-site.cmd`. The site opens in your browser. Keep the terminal window open while using it; close it when you're done.

**Any platform:** open a terminal in this folder and run `npm start`. No `npm install` is needed. If port 8000 is busy, the preview picks a free port automatically.

## Build

Run `npm run check` to check the code and `npm run build` to create the `dist/` folder for hosting.

## Edit the site

- `index.html`: page sections, project cards, and contact links.
- `css/style.css`: all layout, typography, responsive styling, and hover effects.
- `js/main.js`: team roster, navigation, search, dialogs, homepage scroll behavior, and star animation.
- `assets/`: local artwork and fonts.
- `js/vendor/`: local Three.js modules and license.

Project cards are concepts. Update both the HTML cards and `projectDetails` in `js/main.js` when real projects are available. Team memberships may repeat a name across teams; the directory reports both membership and distinct-name counts.
