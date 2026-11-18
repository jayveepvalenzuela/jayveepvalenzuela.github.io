// 3D take on the Chrome dino runner. three.dino.min.js is a tree-shaken three@0.187.0 build:
// echo 'export {Box3,BoxGeometry,Color,CylinderGeometry,DirectionalLight,Fog,Group,HemisphereLight,Mesh,MeshLambertMaterial,PerspectiveCamera,Scene,WebGLRenderer} from "three"' | npx esbuild --bundle --minify --format=esm --outfile=three.dino.min.js
import {
  Box3,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "./three.dino.min.js";

const root = document.querySelector(".intro-image");
const BG = 0xff6469;
const JUMP_VELOCITY = 16;
const GRAVITY = 48;

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const hud = document.createElement("div");
hud.className = "dino-hud";
const msg = document.createElement("p");
msg.className = "dino-msg";
const canHover = matchMedia("(hover: hover)").matches;
const hint = canHover
  ? "Click to play · Space to jump · ↓ to duck"
  : "Tap to play";
msg.textContent = hint;
root.append(renderer.domElement, hud, msg);

const scene = new Scene();
scene.background = new Color(BG);
scene.fog = new Fog(BG, 30, 60);
const camera = new PerspectiveCamera(35, 1, 0.1, 100);

scene.add(new HemisphereLight(0xffffff, 0xb34247, 2));
const sun = new DirectionalLight(0xffffff, 2.2);
sun.position.set(4, 14, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, {
  left: -15,
  right: 30,
  top: 15,
  bottom: -15,
});
sun.shadow.camera.updateProjectionMatrix();
scene.add(sun);

const mat = (color) => new MeshLambertMaterial({ color, flatShading: true });
const M = {
  dino: mat(0xb5333b),
  belly: mat(0xffd27a),
  wing: mat(0xd9545c),
  spike: mat(0x7a1d25),
  cheek: mat(0xff8fa3),
  eye: mat(0x1f2a30),
  white: mat(0xffffff),
  mouth: mat(0x4a1218),
  dust: mat(0xffd3cf),
  cactus: mat(0x2f6b4f),
  cactusLight: mat(0x4f8f6a),
  flower: mat(0xff8fc0),
  beak: mat(0xffc857),
  bird: mat(0x4a3b52),
  ground: mat(0xff8589),
  track: mat(0xff9396),
  pebble: mat(0xd94a50),
  cloud: mat(0xffffff),
};
const unit = new BoxGeometry(1, 1, 1);
function box(parent, m, w, h, d, x, y, z) {
  const b = new Mesh(unit, m);
  b.scale.set(w, h, d);
  b.position.set(x, y, z);
  b.castShadow = true;
  parent.add(b);
  return b;
}

const rand = (a, b) => a + Math.random() * (b - a);

// the world is a big drum turning under the dino; obstacles ride on it and rise over the horizon
const R = 32;
const world = new Group();
world.position.y = -R;
const sky = new Group();
sky.position.y = -R;
scene.add(world, sky);

for (const [r, depth, m] of [
  [R, 40, M.ground],
  [R + 0.03, 2.6, M.track],
]) {
  const drum = new Mesh(new CylinderGeometry(r, r, depth, 64, 1), m);
  drum.rotation.x = Math.PI / 2;
  drum.receiveShadow = true;
  world.add(drum);
}

// stand o on the drum surface at angle (radians, world-local), h units above it
function place(o, angle, h = 0) {
  o.userData.angle = angle;
  o.userData.h = h;
  o.position.set(
    Math.cos(angle) * (R + h),
    Math.sin(angle) * (R + h),
    o.position.z,
  );
  o.rotation.z = angle - Math.PI / 2;
}

for (let i = 0; i < 90; i++) {
  const z = rand(-14, 14);
  const s = Math.abs(z) < 1.5 ? rand(0.08, 0.2) : rand(0.15, 0.6);
  const b = box(world, M.pebble, s, s * 0.6, s, 0, 0, z);
  b.castShadow = false;
  place(b, rand(0, Math.PI * 2), s * 0.3);
}
for (let i = 0; i < 14; i++) {
  const g = new Group();
  box(g, M.cloud, 2.2, 0.6, 1, 0, 0, 0);
  box(g, M.cloud, 1.2, 0.5, 0.8, rand(-0.4, 0.4), 0.5, 0);
  g.scale.setScalar(rand(0.8, 1.6));
  g.position.z = rand(-18, -6);
  place(g, rand(0, Math.PI * 2), rand(5, 8));
  sky.add(g);
}

// bevelled box: three overlapping boxes, each inset on two axes, so corners read as rounded
function rbox(parent, m, w, h, d, x, y, z, r = 0.1) {
  const g = new Group();
  g.position.set(x, y, z);
  box(g, m, w, h - r, d - r, 0, 0, 0);
  box(g, m, w - r, h, d - r, 0, 0, 0);
  box(g, m, w - r, h - r, d, 0, 0, 0);
  parent.add(g);
  return g;
}
function spike(parent, s, x, y) {
  box(parent, M.spike, s, s, s * 0.6, x, y, 0).rotation.z = Math.PI / 4;
}

const dino = new Group();
const upper = new Group();
dino.add(upper);
scene.add(dino);

rbox(upper, M.dino, 1.3, 1.05, 1, 0, 1.3, 0, 0.16); // torso
rbox(upper, M.belly, 0.85, 0.75, 1.04, 0.2, 1.18, 0, 0.12);
rbox(upper, M.dino, 0.7, 0.6, 0.85, 0.5, 1.8, 0, 0.12); // neck
spike(upper, 0.2, 0.05, 1.86);
spike(upper, 0.18, -0.35, 1.84);

const head = new Group();
head.position.set(0.85, 2.1, 0);
upper.add(head);
rbox(head, M.dino, 1.15, 0.9, 1, 0.05, 0.1, 0, 0.18); // skull
rbox(head, M.dino, 0.65, 0.5, 0.86, 0.75, -0.05, 0, 0.12); // snout
box(head, M.mouth, 0.85, 0.1, 0.78, 0.45, -0.33, 0);
spike(head, 0.16, -0.3, 0.57);
for (const s of [1, -1]) {
  box(head, M.white, 0.08, 0.12, 0.08, 0.95, -0.34, s * 0.28); // teeth
  box(head, M.eye, 0.04, 0.06, 0.08, 1.08, 0.05, s * 0.18); // nostrils
  box(head, M.cheek, 0.22, 0.12, 0.04, 0.65, -0.15, s * 0.44);
  box(head, M.dino, 0.36, 0.08, 0.06, 0.2, 0.45, s * 0.48); // brow
}
const eyes = [1, -1].map((s) => {
  const open = new Group();
  open.position.set(0.2, 0.2, s * 0.5);
  box(open, M.white, 0.3, 0.34, 0.04, 0, 0, 0);
  box(open, M.eye, 0.17, 0.22, 0.04, 0.05, -0.02, s * 0.01);
  box(open, M.white, 0.06, 0.06, 0.04, 0.09, 0.05, s * 0.02); // highlight
  const dead = new Group();
  dead.position.copy(open.position);
  dead.visible = false;
  for (const r of [1, -1])
    box(dead, M.white, 0.34, 0.06, 0.04, 0, 0, 0).rotation.z =
      (r * Math.PI) / 4;
  head.add(open, dead);
  return { open, dead };
});
// dragon ears: tapered fins swept back off the top of the skull and flared outward
const ears = [1, -1].map((s) => {
  const pivot = new Group();
  pivot.position.set(-0.25, 0.48, s * 0.38);
  pivot.rotation.set(0, s * 0.35, -0.5);
  // upright thin fins (tall in y, thin in z) so they read side-on
  box(pivot, M.dino, 0.42, 0.3, 0.08, -0.18, 0.05, 0); // base
  box(pivot, M.wing, 0.3, 0.18, 0.06, -0.2, 0.06, s * 0.03); // lighter inner ear
  box(pivot, M.dino, 0.3, 0.15, 0.07, -0.47, 0.1, 0); // tip
  head.add(pivot);
  return pivot;
});

const jaw = new Group();
jaw.position.set(-0.1, -0.45, 0);
rbox(jaw, M.dino, 1.05, 0.22, 0.82, 0.55, 0, 0, 0.08);
head.add(jaw);

const arms = [1, -1].map((s) => {
  const pivot = new Group();
  pivot.position.set(0.55, 1.45, s * 0.5);
  box(pivot, M.dino, 0.3, 0.14, 0.14, 0.12, 0, 0);
  box(pivot, M.dino, 0.12, 0.2, 0.14, 0.25, -0.08, 0);
  upper.add(pivot);
  return pivot;
});

// tiny decorative wings on the shoulders; they're inside the body's x/y footprint so collisions don't change
const dinoWings = [1, -1].map((s) => {
  const pivot = new Group();
  pivot.position.set(-0.1, 1.72, s * 0.48);
  pivot.rotation.x = -s * 0.5;
  pivot.userData.s = s;
  box(pivot, M.dino, 0.42, 0.06, 0.06, 0.02, 0.02, s * 0.03); // bony leading edge
  box(pivot, M.wing, 0.36, 0.04, 0.32, -0.02, 0, s * 0.18); // membrane
  box(pivot, M.wing, 0.2, 0.04, 0.2, -0.1, 0, s * 0.42); // tip
  upper.add(pivot);
  return pivot;
});

const tail = new Group();
tail.position.set(-0.6, 1.3, 0);
rbox(tail, M.dino, 0.7, 0.7, 0.8, -0.25, 0.05, 0, 0.14);
rbox(tail, M.dino, 0.55, 0.5, 0.6, -0.75, 0.18, 0, 0.1);
rbox(tail, M.dino, 0.45, 0.32, 0.4, -1.2, 0.32, 0, 0.08);
spike(tail, 0.18, -0.3, 0.45);
spike(tail, 0.14, -0.78, 0.48);
spike(tail, 0.1, -1.2, 0.52);
upper.add(tail);

// digitigrade legs: hip -> thigh slanting forward -> knee -> shin slanting back -> ankle -> long toes
const legs = [0.45, -0.45].map((z) => {
  const hip = new Group();
  hip.position.set(0, 1, z);
  rbox(hip, M.dino, 0.6, 0.75, 0.4, 0.06, -0.22, 0, 0.16).rotation.z = 0.3; // thigh
  const knee = new Group();
  knee.position.set(0.16, -0.5, 0);
  box(knee, M.dino, 0.24, 0.48, 0.26, -0.06, -0.2, 0).rotation.z = -0.35; // shin
  const ankle = new Group();
  ankle.position.set(-0.13, -0.4, 0);
  rbox(ankle, M.dino, 0.32, 0.14, 0.34, 0.06, -0.03, 0, 0.06); // heel pad
  for (const tz of [-0.12, 0, 0.12]) {
    box(ankle, M.dino, 0.26, 0.1, 0.1, 0.3, -0.05, tz); // toes
    box(ankle, M.belly, 0.08, 0.07, 0.07, 0.46, -0.06, tz); // claws
  }
  box(ankle, M.belly, 0.08, 0.07, 0.07, -0.13, -0.02, 0); // dewclaw
  knee.add(ankle);
  hip.add(knee);
  dino.add(hip);
  return { hip, knee, ankle };
});

// X eyes and a dropped jaw on game over
const setDead = (dead) => {
  for (const e of eyes) {
    e.open.visible = !dead;
    e.dead.visible = dead;
  }
  jaw.rotation.z = dead ? -0.45 : 0;
};

const dust = Array.from({ length: 16 }, () => {
  const b = box(scene, M.dust, 1, 1, 1, 0, 0, 0);
  b.castShadow = false;
  b.visible = false;
  return b;
});
let dustI = 0;
function puff(n) {
  for (let i = 0; i < n; i++) {
    const b = dust[dustI++ % dust.length];
    b.visible = true;
    b.userData.life = 1;
    b.userData.vy = rand(0.5, 1.5);
    b.position.set(rand(-0.3, 0.1), 0.1, rand(-0.45, 0.45));
  }
}

// vertical light stripes on the z faces read as cactus ribs
function ribs(g, x, y, w, h, d) {
  for (const dx of [-w / 4, w / 4])
    box(g, M.cactusLight, 0.05, h * 0.8, d + 0.02, x + dx, y, 0);
}

function saguaro(g, x) {
  const h = rand(1.1, 1.6);
  rbox(g, M.cactus, 0.5, h, 0.5, x, h / 2, 0, 0.14);
  rbox(g, M.cactus, 0.34, 0.12, 0.34, x, h + 0.04, 0, 0.06); // rounded crown
  ribs(g, x, h / 2, 0.5, h, 0.5);
  // arms stick out along z so they read in 3D without widening the hitbox
  for (const s of [1, -1]) {
    if (Math.random() < 0.35) continue;
    const y = h * rand(0.35, 0.6);
    const up = rand(0.35, 0.6);
    box(g, M.cactus, 0.22, 0.22, 0.32, x, y, s * 0.38);
    rbox(g, M.cactus, 0.26, up, 0.26, x, y + up / 2 - 0.1, s * 0.55, 0.08);
  }
  if (Math.random() < 0.4) flower(g, x, h + 0.12);
}

function barrel(g, x) {
  rbox(g, M.cactus, 0.75, 0.7, 0.75, x, 0.35, 0, 0.18);
  ribs(g, x, 0.35, 0.75, 0.7, 0.75);
  flower(g, x, 0.74);
}

function flower(g, x, y) {
  box(g, M.flower, 0.22, 0.1, 0.22, x, y, 0);
  box(g, M.beak, 0.08, 0.06, 0.08, x, y + 0.06, 0);
}

function makeCactus() {
  const g = new Group();
  const n = Math.random() < 0.6 ? 1 : Math.random() < 0.7 ? 2 : 3;
  for (let i = 0; i < n; i++)
    (Math.random() < 0.7 ? saguaro : barrel)(g, i * 0.8);
  return g;
}

function makeBird() {
  const g = new Group();
  // model is built beak-forward (+x); turn it around so it flies at the dino head-on
  const m = new Group();
  m.rotation.y = Math.PI;
  g.add(m);
  g.userData.body = rbox(m, M.bird, 1, 0.3, 0.38, 0, 0, 0, 0.1); // collision box
  box(m, M.bird, 0.5, 0.16, 0.2, -0.7, 0.04, 0); // tail
  rbox(m, M.bird, 0.42, 0.3, 0.32, 0.62, 0.12, 0, 0.08); // head
  box(m, M.bird, 0.45, 0.1, 0.1, 0.42, 0.3, 0).rotation.z = 0.35; // crest
  box(m, M.beak, 0.5, 0.09, 0.14, 1.04, 0.06, 0);
  for (const s of [1, -1])
    box(m, M.white, 0.07, 0.07, 0.04, 0.72, 0.18, s * 0.16);
  g.userData.wings = [1, -1].map((s) => {
    const inner = new Group();
    inner.position.set(0.05, 0.08, s * 0.18);
    inner.userData.s = s;
    box(inner, M.bird, 0.7, 0.05, 0.6, 0, 0, s * 0.3);
    const outer = new Group();
    outer.position.set(0, 0, s * 0.6);
    box(outer, M.bird, 0.5, 0.04, 0.7, -0.08, 0, s * 0.35);
    box(outer, M.beak, 0.06, 0.06, 0.06, 0.18, 0.02, s * 0.05); // wing claw
    inner.userData.outer = outer;
    inner.add(outer);
    m.add(inner);
    return inner;
  });
  // low: jump it, mid: duck under, high: run under
  g.userData.h = [1, 2.6, 3.7][(Math.random() * 3) | 0];
  return g;
}

let state = "idle"; // idle | play | over
let speed = 12;
let score = 0;
let hi = Number(localStorage.getItem("dino-hi")) || 0;
let gap = 0;
let vy = 0;
let ducking = false;
let overAt = 0;
let obstacles = [];
let t = 0;
let squash = 0;
let blink = 3;
let dustTimer = 0;

const pad = (n) => String(Math.floor(n)).padStart(5, "0");
const drawHud = () => {
  hud.textContent = `HI ${pad(hi)}  ${pad(score)}`;
};
drawHud();

function start() {
  for (const o of obstacles) o.removeFromParent();
  obstacles = [];
  speed = 12;
  score = 0;
  gap = 15;
  vy = 0;
  dino.position.set(0, 0, 0);
  dino.rotation.set(0, 0, 0);
  bodies = [];
  settling = false;
  shake = 0;
  camera.position.set(cam.x, cam.y, cam.z);
  state = "play";
  setDead(false);
  msg.hidden = true;
  kick();
}

function gameOver(hit) {
  state = "over";
  setDead(true);
  dino.scale.set(1, 1, 1);
  // dino is knocked back and keels over onto its side, feet up; the obstacle gets shoved forward
  launch(
    dino,
    -2 - speed * 0.1,
    7 + Math.max(0, vy) * 0.3,
    -7,
    Math.PI / 2,
    "x",
  );
  scene.attach(hit); // off the drum so physics runs in flat scene space
  if (hit.userData.wings) {
    // stunned bird: wings go limp, small bump, then it rolls belly-up and drops to the ground
    for (const w of hit.userData.wings) {
      w.rotation.x = 0;
      w.userData.outer.rotation.x = 0;
    }
    launch(hit, 1.5, 2.5, 7, Math.PI, "x");
  } else launch(hit, 2 + speed * 0.15, 3, -5, Math.PI / 2);
  vy = 0;
  puff(6);
  shake = 0.25;
  settling = true;
  overAt = performance.now();
  hi = Math.max(hi, Math.floor(score));
  localStorage.setItem("dino-hi", hi);
  drawHud();
  msg.textContent = canHover
    ? "Game over · Space or click to retry"
    : "Game over · Tap to retry";
  msg.hidden = false;
}

const grounded = () => dino.position.y <= 0 && vy <= 0;

function press() {
  if (state === "over" && performance.now() - overAt < 500) return;
  if (state !== "play") start();
  if (grounded()) vy = JUMP_VELOCITY;
}

function release() {
  // letting go early cuts the jump short, like the original
  if (vy > 6) vy = 6;
}

const dinoBox = new Box3();
const obBox = new Box3();

function update(dt) {
  t += dt;
  const dx = speed * dt;
  speed = Math.min(28, speed + 0.25 * dt);
  score += dx * 0.8;

  if (!grounded()) {
    vy -= (ducking ? GRAVITY * 2.5 : GRAVITY) * dt;
    dino.position.y = Math.max(0, dino.position.y + vy * dt);
    if (dino.position.y === 0) {
      vy = 0;
      squash = 1;
      puff(5);
    }
  }

  const onGround = grounded();
  const duck = ducking && onGround;
  const phase = t * speed * 1.1;
  const bob = onGround ? Math.abs(Math.sin(phase)) * 0.06 : 0;
  upper.position.set(duck ? 0.3 : 0, (duck ? -0.85 : 0) + bob, 0);
  // stretch while airborne, squash on landing
  squash = Math.max(0, squash - dt * 5);
  const sy = onGround ? 1 - squash * 0.18 : 1.06;
  dino.scale.set(1 + (1 - sy) * 0.6, sy, 1 + (1 - sy) * 0.6);
  head.rotation.z = onGround ? Math.sin(phase * 2) * 0.03 : 0.12;
  jaw.rotation.z = onGround ? 0 : -0.35;
  tail.rotation.y = Math.sin(phase * 0.5) * 0.3;
  tail.rotation.z = Math.sin(phase) * 0.06;
  const stride = onGround ? Math.sin(phase) * 0.7 : 0.3;
  legs.forEach((l, i) => {
    const p = phase + i * Math.PI;
    if (onGround) {
      l.hip.rotation.z = Math.sin(p) * 0.6;
      // bend the knee while the leg swings forward so the foot clears the ground
      l.knee.rotation.z = -Math.max(0, Math.cos(p)) * 0.9;
      // keep the foot level with the ground
      l.ankle.rotation.z = -(l.hip.rotation.z + l.knee.rotation.z);
    } else {
      // airborne: legs swept back and trailing, toes pointed, like a dive
      l.hip.rotation.z = i ? -1.25 : -1;
      l.knee.rotation.z = -0.3;
      l.ankle.rotation.z = -0.5;
    }
  });
  // wings flutter while running and flap hard in the air (negated so +z wing lifts up)
  for (const w of dinoWings) {
    const flap = onGround
      ? 0.5 + Math.sin(t * 18) * 0.25
      : 0.4 + Math.sin(t * 30) * 0.7;
    w.rotation.x = -w.userData.s * flap;
  }
  // ears bounce with the stride and pin back in the air
  for (const e of ears)
    e.rotation.z = onGround ? -0.5 + Math.sin(phase * 2) * 0.08 : -0.85;
  // pitch nose-up on the way up, nose-down on the way down
  dino.rotation.z = onGround ? 0 : vy * 0.012;
  arms[0].rotation.z = stride * 0.6;
  arms[1].rotation.z = -stride * 0.6;

  blink -= dt;
  if (blink < 0) blink = rand(2, 4);
  for (const e of eyes) e.open.scale.y = blink < 0.12 ? 0.1 : 1;

  dustTimer -= dt;
  if (onGround && dustTimer < 0) {
    puff(1);
    dustTimer = 0.08;
  }
  for (const b of dust) {
    if (!b.visible) continue;
    const d = b.userData;
    d.life -= dt * 2.2;
    b.visible = d.life > 0;
    b.position.x -= dx;
    b.position.y += d.vy * dt;
    b.scale.setScalar(0.25 * d.life);
  }

  gap -= dx;
  if (gap <= 0) {
    const o = score > 400 && Math.random() < 0.3 ? makeBird() : makeCactus();
    // spawn just below the far horizon so it rises into view
    world.add(o);
    place(o, Math.PI / 2 - 1 - world.rotation.z, o.userData.h);
    obstacles.push(o);
    gap = speed * rand(0.7, 1.5) + 5;
  }

  world.rotation.z += dx / R;
  sky.rotation.z += (dx / R) * 0.4;
  // Box3.setFromObject doesn't refresh parents, so push the drum's new rotation down first
  world.updateMatrixWorld();

  dinoBox.setFromObject(dino).expandByScalar(-0.15);
  for (const o of obstacles) {
    const wings = o.userData.wings;
    if (wings) {
      // birds fly toward the dino a bit faster than the ground turns
      place(o, o.userData.angle - (dx * 0.15) / R, o.userData.h);
      for (const w of wings) {
        w.rotation.x = w.userData.s * Math.sin(t * 10) * 0.5;
        // outer wing lags behind the inner one for a whip-like flap
        w.userData.outer.rotation.x =
          w.userData.s * Math.sin(t * 10 - 0.9) * 0.6;
      }
    }
    // birds collide by body only, so flapping wings don't make ducking unfair
    obBox.setFromObject(wings ? o.userData.body : o).expandByScalar(-0.1);
    if (state === "play" && obBox.intersectsBox(dinoBox)) gameOver(o);
  }
  obstacles = obstacles.filter(
    (o) =>
      o.userData.angle + world.rotation.z < Math.PI / 2 + 0.6 ||
      !o.removeFromParent(),
  );

  drawHud();
}

// crash physics: knocked-back bodies fall, tumble up to a rotation limit and bounce off the ground
let bodies = [];
let settling = false;
let shake = 0;
const cam = { x: 0, y: 0, z: 0 };

function launch(obj, vx, vy, spin, limit, axis = "z") {
  obj.userData.phys = { vx, vy, spin, limit, axis };
  bodies.push(obj);
}

function physics(dt) {
  let moving = false;
  for (const o of bodies) {
    const p = o.userData.phys;
    p.vy -= GRAVITY * dt;
    o.position.x += p.vx * dt;
    o.position.y += p.vy * dt;
    const r = o.rotation[p.axis] + p.spin * dt;
    o.rotation[p.axis] = Math.max(-p.limit, Math.min(p.limit, r));
    if (o.rotation[p.axis] !== r) p.spin = 0;
    const floor = obBox.setFromObject(o).min.y;
    if (floor < 0) {
      o.position.y -= floor;
      if (p.vy < 0) p.vy = p.vy < -3 ? -p.vy * 0.35 : 0;
      p.vx *= 0.75;
      // spin is kept so bodies finish tipping over to their limit
    }
    if (Math.abs(p.vx) + Math.abs(p.vy) + Math.abs(p.spin) > 0.2) moving = true;
  }
  shake = Math.max(0, shake - dt * 1.5);
  camera.position.set(
    cam.x + rand(-shake, shake),
    cam.y + rand(-shake, shake),
    cam.z,
  );
  return moving || shake > 0;
}

let raf = 0;
let last = 0;
let visible = false;

function frame(now) {
  // clamp so scrolling away and back resumes instead of teleporting
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state === "play") update(dt);
  else if (settling) settling = physics(dt);
  renderer.render(scene, camera);
  // only loop while something moves; idle and settled game-over frames are static
  raf =
    (state === "play" || settling) && visible
      ? requestAnimationFrame(frame)
      : 0;
}

function kick() {
  if (raf) return;
  last = performance.now();
  raf = requestAnimationFrame(frame);
}

new IntersectionObserver(([e]) => {
  visible = e.isIntersecting;
  if (visible) kick();
}).observe(root);

new ResizeObserver(() => {
  const w = root.clientWidth;
  const h = root.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // pull back on narrow screens so obstacles still show up early enough
  const back = Math.min(1.8, Math.max(1, 2 / camera.aspect));
  Object.assign(cam, { x: -4 * back, y: 5 * back, z: 13 * back });
  camera.position.set(cam.x, cam.y, cam.z);
  camera.lookAt(6, 1, 0);
  camera.updateProjectionMatrix();
  kick();
}).observe(root);

// keys only after the player has clicked in, so Space still scrolls the page for everyone else
let armed = false;
const JUMP_KEYS = ["Space", "ArrowUp"];
root.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  armed = true;
  press();
});
addEventListener("pointerup", release);
addEventListener("keydown", (e) => {
  if (!armed || !visible || e.target !== document.body) return;
  if (JUMP_KEYS.includes(e.code)) {
    e.preventDefault();
    if (!e.repeat) press();
  } else if (e.code === "ArrowDown") {
    e.preventDefault();
    ducking = true;
  }
});
// this module is only imported from the Play button, so start a run right away
root.setAttribute("aria-hidden", "true"); // the canvas game is decorative for screen readers
armed = true;
start();

addEventListener("keyup", (e) => {
  if (JUMP_KEYS.includes(e.code)) release();
  else if (e.code === "ArrowDown") ducking = false;
});
