(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    if (location.hash || navigation?.type === "back_forward") return;
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    let interacted = false;
    const markInteraction = () => {
        interacted = true;
    };
    const events = [ "touchstart", "wheel", "pointerdown", "keydown" ];
    events.forEach(type => window.addEventListener(type, markInteraction, {
        passive: true
    }));
    window.addEventListener("pageshow", event => {
        if (!event.persisted && !interacted && !location.hash) {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "instant"
            });
        }
        history.scrollRestoration = previousRestoration;
        events.forEach(type => window.removeEventListener(type, markInteraction));
    }, {
        once: true
    });
})();

document.addEventListener("DOMContentLoaded", () => {
    const rosterGroup = (team, role, names) => names.split(";").map(name => ({
        name: name.trim(),
        team: team,
        role: role
    }));
    const NEXUS_CONTENT = {
        leadership: [ {
            name: "Aarshee Aarya",
            team: "Core Committee",
            role: "Head of Operation"
        }, {
            name: "Sachjyot Kour",
            team: "Core Committee",
            role: "Creative Head"
        }, {
            name: "Tejas Narula",
            team: "Core Committee",
            role: "TechOps Lead"
        }, {
            name: "Yash Pandey",
            team: "Core Committee",
            role: "Membership Chair"
        }, {
            name: "Shaurya Goel",
            team: "Core Committee",
            role: "Membership Chair"
        } ],
        crew: [ ...rosterGroup("Events", "Team Head", "Labya Chandrakar;Aryan Tyagi;Lakshita;Reenika;Dishi"), ...rosterGroup("Events", "JC", "Swati Dash;Bhavya Katiyar;Huzaif;Subhod Kumar;Amritansh Singh;Kamakshi Bharti;Punika Pamnani;Sanvee;Rudra Pratap Singh"), ...rosterGroup("Marketing", "Team Head", "Rashi"), ...rosterGroup("Marketing", "JC", "Mannat;Ishika;Advaita;Asmi;Daksh Vasudeva;Abhinav Sinha;Nishit Sharma;Aditi"), ...rosterGroup("Finance & Registration · Sponsorship & Curation", "Team Head", "Preksha Jain;Aditya Sarkar"), ...rosterGroup("Finance & Registration", "JC", "Vidit Mittal;Agrim Gupta;Divy;Bhavya;Saksham;Keshav;Dakshesh;Ayush;Shourya;Sahas"), ...rosterGroup("Operations & Logistics", "Team Head", "Sarvagya Singh;Devpriy"), ...rosterGroup("Logistics", "JC", "Kunal Jaiswal;Rithvik Krishna Dusa;Shaurya Thapliyal;Darsh Gupta;Animesh Kushwaha;Pavan Wagh"), ...rosterGroup("Social Media", "Team Head", "Ridhima Gupta"), ...rosterGroup("Social Media", "JC", "Angad Singh;Soumya;Kritika Sinha;Rachit Agarwal;Rana Chowdary;Bhavya Katiyar;Neelabh Sati;Neev Gupta;Sarthak Rana;Divyanshi Singh;Himanshu Sharma"), ...rosterGroup("Graphic Design", "Team Head", "Anwesha"), ...rosterGroup("Graphic Design", "JC", "Sarthak Srivastava;Ratnajit Dutta"), ...rosterGroup("Web Development", "Team Head", "Kaustav Paul;Shaaz Adil"), ...rosterGroup("Web Development", "JC", "Vansh Sood;Jatin Pandey;Lakshya Agarwal;Vivan Bhardwaj;Ritvik Bansal;Aditya Goyal;Gunika Madan;Aarav Srivastava;Rashmi Raj;Devika Sharma"), ...rosterGroup("PNR", "JC", "Aditya Goyal;G. Shrihari Kshitij;Sahas Reddy Pingili;Karthikeya Kollimarla;Bhavya Gupta;Jyotirmay Sharma;Udita Sau;Nia Kunwar Nirban;Alok Singh;Arsh Rana;Muddam Jaswanth Reddy;Saatvik Shyam Chakravarthi") ]
    };
    const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
    const header = document.querySelector(".site-header");
    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector("#primary-navigation");
    function closeMenu() {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
        navigation.classList.remove("open");
        document.body.classList.remove("menu-open");
        document.querySelector("main").inert = false;
        document.querySelector("footer").inert = false;
        document.querySelector(".menu-label").textContent = "MENU";
    }
    menuButton.addEventListener("click", () => {
        const open = menuButton.getAttribute("aria-expanded") !== "true";
        menuButton.setAttribute("aria-expanded", String(open));
        menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        navigation.classList.toggle("open", open);
        document.body.classList.toggle("menu-open", open);
        document.querySelector("main").inert = open;
        document.querySelector("footer").inert = open;
        document.querySelector(".menu-label").textContent = open ? "CLOSE" : "MENU";
    });
    header.addEventListener("click", event => {
        if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Tab" && menuButton.getAttribute("aria-expanded") === "true") {
            const controls = [ ...header.querySelectorAll("a, button") ].filter(element => element.getClientRects().length);
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
        if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
            closeMenu();
            menuButton.focus();
        }
    });
    window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 30), {
        passive: true
    });
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            navigation.querySelectorAll("a").forEach(link => {
                const active = link.hash === `#${entry.target.id}`;
                link.classList.toggle("active", active);
                if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
            });
        });
    }, {
        rootMargin: "-15% 0px -60% 0px"
    });
    document.querySelectorAll("main > section[id]").forEach(section => sectionObserver.observe(section));
    const projectLinks = [ ...document.querySelectorAll(".project-rail a") ];
    const projectRailObserver = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting);
        if (!visible.length) return;
        const project = visible[visible.length - 1].target;
        projectLinks.forEach((link, index) => {
            const active = link.hash === `#${project.id}`;
            link.classList.toggle("active", active);
            if (active) {
                link.setAttribute("aria-current", "location");
                document.querySelector(".rail-number").textContent = String(index + 1).padStart(2, "0");
            } else link.removeAttribute("aria-current");
        });
    }, {
        rootMargin: "-25% 0px -40% 0px",
        threshold: 0
    });
    document.querySelectorAll(".project-card[id]").forEach(card => projectRailObserver.observe(card));
    function memberInitials(name) {
        return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
    }
    function addScribbles(scope = document) {
        scope.querySelectorAll(".team-details h4, .project-content h3, .button").forEach(element => {
            if (element.querySelector(".scribble-mark")) return;
            element.classList.add("scribble-target");
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", "scribble-mark");
            svg.setAttribute("viewBox", "0 0 240 18");
            svg.setAttribute("preserveAspectRatio", "none");
            svg.setAttribute("aria-hidden", "true");
            svg.setAttribute("focusable", "false");
            svg.innerHTML = '<path pathLength="100" d="M4 10 C44 2 98 6 138 5 S203 3 235 7"/><path pathLength="100" d="M229 12 C177 8 110 16 18 13"/>';
            element.append(svg);
        });
    }
    function renderMembers(target, members) {
        document.querySelector(target).innerHTML = members.map(member => `\n    <article class="team-card"><div class="team-avatar team-initials" aria-hidden="true">${escapeHTML(memberInitials(member.name))}</div><div class="team-details"><small>${escapeHTML(member.role)}</small><h4>${escapeHTML(member.name)}</h4><p>${escapeHTML(member.team)}</p></div></article>`).join("");
        addScribbles(document.querySelector(target));
    }
    if (document.querySelector("#leadership-grid")) renderMembers("#leadership-grid", NEXUS_CONTENT.leadership);
    const crewSearch = document.querySelector("#crew-search");
    const crewTeam = document.querySelector("#crew-team");
    const crewCount = document.querySelector("#crew-count");
    const crewToggle = document.querySelector("#crew-toggle");
    const crewClear = document.querySelector("#crew-clear");
    const allEntries = [ ...NEXUS_CONTENT.leadership, ...NEXUS_CONTENT.crew ];
    const distinctNames = new Set(allEntries.map(member => member.name.trim().toLowerCase())).size;
    document.querySelector("#roster-summary").textContent = `${allEntries.length} team memberships · ${distinctNames} distinct names in the source roster`;
    const crewTeams = [ ...new Set(NEXUS_CONTENT.crew.map(member => member.team)) ];
    crewTeam.innerHTML = [ "All teams", ...crewTeams ].map(team => `<option value="${escapeHTML(team)}">${escapeHTML(team)}</option>`).join("");
    let crewExpanded = false;
    function renderCrew() {
        const query = crewSearch.value.trim().toLowerCase();
        const matches = NEXUS_CONTENT.crew.filter(member => (crewTeam.value === "All teams" || member.team === crewTeam.value) && (!query || member.name.toLowerCase().includes(query)));
        const visible = crewExpanded ? matches : matches.slice(0, 12);
        renderMembers("#crew-grid", visible);
        crewCount.textContent = `Showing ${visible.length} of ${matches.length} team entries`;
        crewClear.hidden = !query;
        if (!matches.length) document.querySelector("#crew-grid").innerHTML = '<p class="crew-empty">No members found. Try another name or choose a different team.</p>';
        crewToggle.hidden = matches.length <= 12;
        crewToggle.textContent = crewExpanded ? "Show fewer entries" : `View all ${matches.length} entries`;
        crewToggle.setAttribute("aria-expanded", String(crewExpanded));
        addScribbles();
    }
    crewClear.addEventListener("click", () => {
        crewSearch.value = "";
        crewExpanded = false;
        renderCrew();
        crewSearch.focus();
    });
    crewSearch.addEventListener("input", () => {
        crewExpanded = false;
        renderCrew();
    });
    crewTeam.addEventListener("change", () => {
        crewExpanded = false;
        renderCrew();
    });
    crewToggle.addEventListener("click", () => {
        crewExpanded = !crewExpanded;
        renderCrew();
        if (!crewExpanded) crewSearch.scrollIntoView({
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "center"
        });
    });
    renderCrew();
    const dialog = document.querySelector("#detail-dialog");
    const dialogContent = document.querySelector("#dialog-content");
    function showDetails(kicker, title, body) {
        dialogContent.innerHTML = `<p class="dialog-kicker">${escapeHTML(kicker)}</p><h2 id="dialog-title" class="dialog-title">${escapeHTML(title)}</h2><div class="dialog-body">${body}</div>`;
        dialog.showModal();
        document.body.style.overflow = "hidden";
    }
    dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
        document.body.style.overflow = "";
    });
    dialog.addEventListener("click", event => {
        const rect = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    const projectDetails = {
        telemetry: {
            title: "Ground Station Telemetry",
            intro: "A concept for a browser-based dashboard that turns payload measurements into understandable flight information.",
            features: [ "Altitude and temperature plots with clearly labeled units", "GPS trajectory mapping and payload status panels", "Packet timestamps, missing-data indicators, and CSV export", "A simulated-data mode for learning before hardware integration" ],
            note: "Concept study with simulated readings. No live flight data or repository is available."
        },
        rocketry: {
            title: "Rocketry Projects",
            intro: "A place to document student aerospace engineering concepts, design decisions, and the lessons learned along the way.",
            features: [ "Aerodynamic models and design studies", "Structural and materials exploration", "Avionics, sensing, and recovery-system concepts", "Project reports with documented methods and results" ],
            note: "Project concept. The rocket illustration does not depict a Nexus vehicle, launch, or achievement. Official project details are pending."
        },
        software: {
            title: "Software & Research Tools",
            intro: "A home for research software that makes complex questions more approachable through computation and visualization.",
            features: [ "Data processing and visualization utilities", "Scientific simulations with documented assumptions", "Reproducible analysis notebooks", "Readable code and contribution guides for student developers" ],
            note: "Concept study. The code illustration is not an installable package; a working demo and repository are not available."
        }
    };
    document.addEventListener("click", event => {
        const projectButton = event.target.closest("[data-project]");
        if (projectButton) {
            const project = projectDetails[projectButton.dataset.project];
            showDetails("PROJECT CONCEPT / PREVIEW", project.title, `<p>${project.intro}</p><h3>What this could include</h3><ul>${project.features.map(feature => `<li>${feature}</li>`).join("")}</ul><p class="dialog-note">${project.note}</p>`);
        }
    });
    document.querySelector("#current-year").textContent = (new Date).getFullYear();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.nexusMotionPaused = reducedMotion.matches;
    function updateMotion(paused) {
        window.nexusMotionPaused = paused;
        document.documentElement.classList.toggle("motion-paused", paused);
        window.dispatchEvent(new CustomEvent("nexus:motion", {
            detail: {
                paused: paused
            }
        }));
    }
    reducedMotion.addEventListener("change", event => {
        updateMotion(event.matches);
        if (event.matches) document.documentElement.classList.remove("motion-enabled");
    });
    updateMotion(reducedMotion.matches);
    if (!reducedMotion.matches) document.documentElement.classList.add("motion-enabled");
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: .08
    });
    document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));
    (async () => {
        const THREE = await (import("./vendor/three.module.min.js"));
        const host = document.querySelector("#space-scene");
        const hero = document.querySelector("#home");
        const smallScreen = window.matchMedia("(max-width: 800px)");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        try {
            const renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: false,
                powerPreference: "low-power"
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, smallScreen.matches ? 1.25 : 1.5));
            renderer.setClearColor(0, 0);
            renderer.domElement.setAttribute("aria-hidden", "true");
            host.appendChild(renderer.domElement);
            const scene = new THREE.Scene;
            const camera = new THREE.PerspectiveCamera(55, 1, .1, 160);
            camera.position.z = 25;
            const count = smallScreen.matches ? 230 : 650;
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            const gold = new THREE.Color("#e2bc75");
            const white = new THREE.Color("#bdcbd9");
            for (let index = 0; index < count; index++) {
                const offset = index * 3;
                positions[offset] = (Math.random() - .5) * 100;
                positions[offset + 1] = (Math.random() - .5) * 65;
                positions[offset + 2] = -Math.random() * 65;
                const color = index % 4 === 0 ? gold : white;
                colors.set([ color.r, color.g, color.b ], offset);
            }
            const geometry = new THREE.BufferGeometry;
            geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
            const material = new THREE.PointsMaterial({
                size: .085,
                vertexColors: true,
                transparent: true,
                opacity: .65,
                sizeAttenuation: true,
                depthWrite: false
            });
            const stars = new THREE.Points(geometry, material);
            scene.add(stars);
            let frame = 0;
            let lastTime = 0;
            let inView = true;
            let contextLost = false;
            let paused = window.nexusMotionPaused ?? reducedMotion.matches;
            const pointer = {
                x: 0,
                y: 0
            };
            function resize() {
                const width = hero.clientWidth;
                const height = hero.clientHeight;
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.render(scene, camera);
            }
            const resizeObserver = new ResizeObserver(resize);
            resizeObserver.observe(hero);
            hero.addEventListener("pointermove", event => {
                if (paused || event.pointerType !== "mouse") return;
                const rect = hero.getBoundingClientRect();
                pointer.x = ((event.clientX - rect.left) / rect.width - .5) * 1.6;
                pointer.y = ((event.clientY - rect.top) / rect.height - .5) * 1.1;
            }, {
                passive: true
            });
            hero.addEventListener("pointerleave", () => {
                pointer.x = 0;
                pointer.y = 0;
            });
            function shouldAnimate() {
                return !paused && inView && !document.hidden && !contextLost;
            }
            function animate(now) {
                frame = 0;
                if (!shouldAnimate()) return;
                if (now - lastTime > 32) {
                    const delta = Math.min((now - lastTime) / 1e3, .05);
                    lastTime = now;
                    stars.rotation.y += delta * .009;
                    stars.rotation.z += delta * .003;
                    camera.position.x += (pointer.x - camera.position.x) * .035;
                    camera.position.y += (-pointer.y - camera.position.y) * .035;
                    camera.lookAt(0, 0, -15);
                    renderer.render(scene, camera);
                }
                frame = requestAnimationFrame(animate);
            }
            function syncAnimation() {
                if (frame) {
                    cancelAnimationFrame(frame);
                    frame = 0;
                }
                if (shouldAnimate()) {
                    lastTime = performance.now();
                    frame = requestAnimationFrame(animate);
                }
            }
            const visibilityObserver = new IntersectionObserver(entries => {
                inView = entries[0].isIntersecting;
                syncAnimation();
            });
            visibilityObserver.observe(hero);
            document.addEventListener("visibilitychange", syncAnimation);
            window.addEventListener("nexus:motion", event => {
                paused = event.detail.paused;
                syncAnimation();
            });
            renderer.domElement.addEventListener("webglcontextlost", event => {
                event.preventDefault();
                contextLost = true;
                syncAnimation();
            });
            renderer.domElement.addEventListener("webglcontextrestored", () => {
                contextLost = false;
                resize();
                syncAnimation();
            });
            window.addEventListener("pagehide", () => {
                if (frame) cancelAnimationFrame(frame);
            });
            window.addEventListener("pageshow", syncAnimation);
            resize();
            syncAnimation();
        } catch (error) {
            host.dataset.fallback = "true";
            host.replaceChildren();
            console.info("Nexus: using the static space artwork because WebGL is unavailable.");
        }
    })().catch(() => {
        document.querySelector("#space-scene").dataset.fallback = "true";
    });
}, {
    once: true
});