import * as THREE from 'three';

const GOLD = 0xf5ce62;
const GOLD_LIGHT = 0xffe89e;
const GOLD_DIM = 0x8c7333;
const CYAN_ACCENT = 0x4fc3f7;

export interface SceneNode {
  id: string;
  name: string;
  tag: string;
  ring: number;
  initialAngle: number;
  speedMultiplier: number;
}

const NODES: SceneNode[] = [
  { id: 'mission', name: 'Mission', tag: '01 // ORBIT', ring: 0, initialAngle: 0.05, speedMultiplier: 0.6 },
  { id: 'domains', name: 'Domains', tag: '02 // TECH', ring: 1, initialAngle: 1.4, speedMultiplier: 0.5 },
  { id: 'work', name: 'Research', tag: '03 // DATA', ring: 2, initialAngle: 2.8, speedMultiplier: 0.42 },
  { id: 'events', name: 'Events', tag: '04 // FLIGHT', ring: 1, initialAngle: 4.2, speedMultiplier: 0.5 },
  { id: 'members', name: 'People', tag: '05 // CREW', ring: 3, initialAngle: 5.5, speedMultiplier: 0.35 },
];

export function initScene(
  canvas: HTMLCanvasElement,
  reduced: boolean,
  onPick: (id: string) => void
): (() => void) | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
  } catch {
    return null;
  }

  const isMobile = window.innerWidth < 768;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);

  // Master orbital system group
  const system = new THREE.Group();
  system.rotation.x = 0.45;
  scene.add(system);

  // 1. Central Nexus Core
  const coreGroup = new THREE.Group();
  system.add(coreGroup);

  // Dark obsidian core sphere
  const innerSphereGeo = new THREE.SphereGeometry(isMobile ? 0.9 : 1.05, 32, 32);
  const innerSphereMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
  coreGroup.add(innerSphere);

  // Luminous geometric wireframe exoskeleton
  const exoGeo = new THREE.IcosahedronGeometry(isMobile ? 1.08 : 1.25, 2);
  const exoMat = new THREE.MeshBasicMaterial({
    color: GOLD,
    wireframe: true,
    transparent: true,
    opacity: 0.45,
  });
  const exoskeleton = new THREE.Mesh(exoGeo, exoMat);
  coreGroup.add(exoskeleton);

  // Inner gyroscopic rings for core depth
  const gyro1Pts = Array.from({ length: 96 }, (_, k) => {
    const a = (k / 96) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * 1.35, 0, Math.sin(a) * 1.35);
  });
  const gyro1 = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(gyro1Pts),
    new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.35 })
  );
  gyro1.rotation.z = 0.4;
  coreGroup.add(gyro1);

  const gyro2Pts = Array.from({ length: 96 }, (_, k) => {
    const a = (k / 96) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * 1.45, 0, Math.sin(a) * 1.45);
  });
  const gyro2 = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(gyro2Pts),
    new THREE.LineBasicMaterial({ color: CYAN_ACCENT, transparent: true, opacity: 0.25 })
  );
  gyro2.rotation.x = 0.6;
  gyro2.rotation.y = 0.3;
  coreGroup.add(gyro2);

  // 2. Orbital Tracks with subtle inclinations
  const ringRadii = isMobile ? [2.3, 3.2, 4.1, 5.0] : [2.6, 3.7, 4.8, 5.8];
  const ringGroup = new THREE.Group();
  system.add(ringGroup);

  const orbitalRings: THREE.LineLoop[] = [];
  ringRadii.forEach((radius, i) => {
    const segments = 144;
    const pts = Array.from({ length: segments }, (_, k) => {
      const a = (k / segments) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    });
    const ring = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({
        color: i === 1 ? CYAN_ACCENT : GOLD,
        transparent: true,
        opacity: i === 1 ? 0.22 : 0.18 + i * 0.03,
      })
    );
    ring.rotation.z = (i - 1.5) * 0.08;
    ring.rotation.x = (i - 1) * 0.05;
    ringGroup.add(ring);
    orbitalRings.push(ring);
  });

  // 3. Interactive Orbital Nodes
  const nodeHits: THREE.Mesh[] = [];
  const nodeMeshes: THREE.Group[] = [];

  NODES.forEach((node) => {
    const nodeAnchor = new THREE.Group();
    nodeAnchor.userData = node;
    system.add(nodeAnchor);

    // Glowing core sphere
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(isMobile ? 0.16 : 0.18, 16, 16),
      new THREE.MeshBasicMaterial({ color: GOLD_LIGHT })
    );
    nodeAnchor.add(marker);

    // Subtle beacon ring around node
    const beaconPts = Array.from({ length: 32 }, (_, k) => {
      const a = (k / 32) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32);
    });
    const beacon = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(beaconPts),
      new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.5 })
    );
    beacon.rotation.x = Math.PI / 2;
    nodeAnchor.add(beacon);

    // Invisible larger hit sphere for effortless touch and cursor interaction
    const hitSphere = new THREE.Mesh(
      new THREE.SphereGeometry(isMobile ? 0.75 : 0.6, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitSphere.userData = node;
    nodeAnchor.add(hitSphere);
    nodeHits.push(hitSphere);

    nodeMeshes.push(nodeAnchor);
  });

  // 4. Multi-Layer Deep Starfield & Cosmic Dust
  const starCount = isMobile ? 300 : 1400;
  const starPos = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    // Distribute stars in spherical shell around system
    const rad = 25 + Math.random() * 55;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    starPos[i3] = rad * Math.sin(phi) * Math.cos(theta);
    starPos[i3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
    starPos[i3 + 2] = rad * Math.cos(phi);

    // 85% white, 10% gold starlight, 5% cyan telemetry speck
    const roll = Math.random();
    if (roll > 0.90) {
      starColors[i3] = 0.96; starColors[i3 + 1] = 0.81; starColors[i3 + 2] = 0.38; // Gold
    } else if (roll > 0.85) {
      starColors[i3] = 0.31; starColors[i3 + 1] = 0.76; starColors[i3 + 2] = 0.97; // Cyan
    } else {
      starColors[i3] = 0.85; starColors[i3 + 1] = 0.85; starColors[i3 + 2] = 0.9;  // White
    }
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: isMobile ? 0.08 : 0.09,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
  });
  const starfield = new THREE.Points(starGeo, starMat);
  scene.add(starfield);

  // 5. DOM Projected HUD Labels
  const labelContainer = document.createElement('div');
  labelContainer.className = 'scene-labels-container';
  labelContainer.setAttribute('role', 'group');
  labelContainer.setAttribute('aria-label', 'Orbital section shortcuts');
  document.body.appendChild(labelContainer);

  const labelElements = NODES.map((node) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'scene-node-label';
    el.dataset.nodeId = node.id;
    el.setAttribute('aria-label', `Go to ${node.name} section`);
    el.innerHTML = `<span class="node-tag">${node.tag}</span><span class="node-title">${node.name}</span>`;
    el.addEventListener('click', () => {
      onPick(node.id);
      const heading = document.getElementById(node.id)?.querySelector('h2') as HTMLElement | null;
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    });
    labelContainer.appendChild(el);
    return el;
  });

  // Vector for 3D -> 2D screen projection
  const projVec = new THREE.Vector3();
  const compactViewport = window.matchMedia('(max-width: 768px)');
  const heroContent = document.querySelector('.hero-content');
  let safeLabelLeft = window.innerWidth * 0.62;
  const updateSafeLabelLeft = () => {
    const heroRight = heroContent?.getBoundingClientRect().right ?? window.innerWidth * 0.62;
    safeLabelLeft = Math.max(window.innerWidth * 0.62, heroRight + 16);
  };
  updateSafeLabelLeft();
  const updateLabels = () => {
    const showLabels = !compactViewport.matches && window.scrollY < 80;
    nodeMeshes.forEach((mesh, idx) => {
      mesh.getWorldPosition(projVec);
      projVec.project(camera);

      const el = labelElements[idx];
      const screenX = (projVec.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (-projVec.y * 0.5 + 0.5) * window.innerHeight;
      const isVisible = showLabels && projVec.z < 1.0 &&
        projVec.x > -1.05 && projVec.x < 1.05 && projVec.y > -1.05 && projVec.y < 1.05 &&
        screenX > safeLabelLeft && screenY > 104 && screenY < window.innerHeight - 120;

      el.style.transform = `translate3d(${screenX}px, ${screenY}px, 0)`;
      el.style.opacity = isVisible ? '1' : '0';
      el.style.visibility = isVisible ? 'visible' : 'hidden';
      el.tabIndex = isVisible ? 0 : -1;
    });
  };

  // Node positioning and orbital math
  const updateNodes = (time: number) => {
    nodeMeshes.forEach((mesh) => {
      const { ring, initialAngle, speedMultiplier } = mesh.userData as SceneNode;
      const radius = ringRadii[ring];
      const angle = initialAngle + (reduced ? 0 : time * 0.08 * speedMultiplier);

      mesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      mesh.position.applyEuler(new THREE.Euler(0, 0, (ring - 1.5) * 0.08));

      // Subtle breath scaling
      const breath = reduced ? 1 : 1 + Math.sin(time * 2.5 + initialAngle) * 0.08;
      mesh.scale.setScalar(breath);
    });
  };

  // Mouse & Scroll State
  const targetMouse = new THREE.Vector2(0, 0);
  const currentMouse = new THREE.Vector2(0, 0);
  let hoveredNodeId: string | null = null;
  const raycaster = new THREE.Raycaster();
  let time = 0;
  let lastTime = performance.now();

  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    updateSafeLabelLeft();

    if (reduced) {
      renderFrame();
    }
  };

  // Render loop
  const renderFrame = () => {
    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (!reduced) {
      time += delta;
    }

    // Smooth mouse damping
    currentMouse.lerp(targetMouse, 0.06);

    // Scroll progress: 0 (top/hero) -> 1 (bottom/footer)
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollP = reduced ? 0 : Math.min(1, Math.max(0, window.scrollY / maxScroll));

    // Story camera choreographies across chapters:
    // 0.00 (Hero): Wide grand system view
    // 0.20 (Mission): Closer focus on central hub
    // 0.45 (Domains / Work): Tilted plane, shifted right for left content cards
    // 0.75 (Members): Constellation cluster overview
    // 1.00 (Footer): Calm, centered orbital lockup
    const baseZ = isMobile ? 14.5 - scrollP * 1.5 : 10.2 - scrollP * 2.0;
    const shiftX = isMobile ? 0 : Math.sin(scrollP * Math.PI) * 2.2;
    const shiftY = scrollP * 1.6;

    camera.position.set(
      shiftX + currentMouse.x * 0.65 * (reduced ? 0 : 1),
      shiftY - currentMouse.y * 0.45 * (reduced ? 0 : 1),
      baseZ
    );
    camera.lookAt(isMobile ? -1.1 : shiftX * 0.25, shiftY * 0.15, 0);

    // Subtly modulate wireframe opacity during scroll so text cards stay high-contrast
    exoMat.opacity = Math.max(0.18, 0.45 - scrollP * 0.25);
    orbitalRings.forEach((r, idx) => {
      (r.material as THREE.LineBasicMaterial).opacity = Math.max(0.08, 0.22 - scrollP * 0.12);
    });

    // System continuous rotation + scroll tilt
    if (!reduced) {
      system.rotation.y = time * 0.03 + scrollP * 1.2;
      exoskeleton.rotation.y = time * 0.08;
      exoskeleton.rotation.x = time * 0.04;
      gyro1.rotation.y = time * -0.06;
      gyro2.rotation.x = time * 0.04;
      starfield.rotation.y = time * 0.002;
    }

    updateNodes(time);
    renderer.render(scene, camera);
    updateLabels();
  };

  const startLoop = () => {
    if (!reduced && !document.hidden) {
      renderer.setAnimationLoop(renderFrame);
    } else {
      renderer.setAnimationLoop(null);
      renderFrame();
    }
  };

  const clearHoveredNode = () => {
    document.body.style.cursor = '';
    hoveredNodeId = null;
    labelElements.forEach((label) => label.classList.remove('hovered'));
  };

  const pickNode = (clientX: number, clientY: number): THREE.Intersection | undefined => {
    const pointer = new THREE.Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(nodeHits)[0];
  };

  const onPointerMove = (e: PointerEvent) => {
    targetMouse.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      (e.clientY / window.innerHeight) * 2 - 1
    );

    if (e.target !== canvas) {
      clearHoveredNode();
      return;
    }

    const hit = pickNode(e.clientX, e.clientY);
    if (hit && hit.object.userData?.id) {
      const id = hit.object.userData.id;
      document.body.style.cursor = 'pointer';
      if (hoveredNodeId !== id) {
        hoveredNodeId = id;
        labelElements.forEach(l => {
          l.classList.toggle('hovered', l.dataset.nodeId === id);
        });
      }
    } else clearHoveredNode();
  };

  const onPointerDown = (e: PointerEvent) => {
    // Only a direct canvas hit may activate a beacon; clicks on ordinary page text never raycast.
    if (e.target !== canvas) return;
    const hit = pickNode(e.clientX, e.clientY);
    if (hit && hit.object.userData?.id) {
      onPick(hit.object.userData.id);
    }
  };

  const onVisibilityChange = () => {
    startLoop();
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    renderer.setAnimationLoop(null);
    document.body.classList.add('no-webgl');
  };
  const onContextRestored = () => {
    document.body.classList.remove('no-webgl');
    startLoop();
  };

  // Event Listeners
  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);

  // Initialize
  handleResize();
  startLoop();

  // Teardown callback
  return () => {
    renderer.setAnimationLoop(null);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('webglcontextrestored', onContextRestored);

    labelContainer.remove();
    document.body.style.cursor = '';

    // Explicit GPU resource disposal
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });

    renderer.dispose();
  };
}
