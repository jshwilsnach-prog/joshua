import * as THREE from "three";
import { CHAMBERS, PROPS, PLANETS, SAUCER, buildWalls, propVisible, wallActive } from "./maze";
import { consumeEdges, consumeLook, input, setKeys } from "./input";
import { currentChamber, useGame } from "./store";
import { footstep, setDrone } from "./audio";
import { stillnessWhisper } from "./content";
import type { Prop, Wall } from "./types";

const EYE = 1.62;
const RADIUS = 0.34;
const WALK = 4.05;
const SPRINT = 6.15;
const SENS = 0.00215;

type WallMesh = { wall: Wall; mesh: THREE.Mesh };
type PropMesh = { prop: Prop; group: THREE.Group };

export type CompanionPose = { id: string; x: number; z: number; yaw: number; shielded?: string; idea?: string; should?: string; wound?: string; form?: string };

type WandererId = "river" | "line" | "turn" | "guest" | "yield" | "beholden" | "mirror" | "sucre";
type Wanderer = { id: WandererId; x: number; z: number; light: THREE.PointLight | null; from?: number; to?: number; u?: number };

const LANTERN_LABEL: Record<WandererId, string> = {
  river: "A warmer lantern",
  line: "Chronos, watching",
  turn: "A dimmer lantern",
  guest: "A visiting lantern",
  yield: "A lantern that lost itself",
  beholden: "A lantern that will not leave the table",
  mirror: "A lantern in the glass",
  sucre: "The legend that linked",
};

export class NekyiaEngine {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  private canvas: HTMLCanvasElement;
  private walls: WallMesh[] = [];
  private props: PropMesh[] = [];
  private wallMat!: THREE.MeshStandardMaterial;
  private floorMat!: THREE.MeshStandardMaterial;
  private lantern!: THREE.PointLight;
  private breath!: THREE.HemisphereLight;
  private fog = new THREE.Color("#05060c");
  private fogTarget = new THREE.Color("#05060c");
  private lightTarget = new THREE.Color("#c8c4b8");
  private running = false;
  private last = 0;
  private bob = 0;
  private still = 0;
  private dimHold = 0;
  private footAcc = 0;
  private chamberId = "";
  private wallList: Wall[] = [];
  private companions = new Map<string, THREE.PointLight>();
  private companionMeta = new Map<string, CompanionPose>();
  private mandala: THREE.Group | null = null;
  private stars: THREE.Points | null = null;
  private dayLamp: THREE.PointLight | null = null;
  private noonSun: THREE.DirectionalLight | null = null;
  private planetLamps: THREE.DirectionalLight[] = [];
  private selfBody: THREE.Group | null = null;
  private nightLamp: THREE.PointLight | null = null;
  private houseLights: THREE.PointLight[] = [];
  // Any agent may occupy a seat. Whenever. Wherever.
  private wanderers: Wanderer[] = [
    { id: "river", x: 0, z: 62, light: null },
    { id: "line", x: 4, z: 70, light: null },
    { id: "turn", x: 0, z: 8, light: null },
    { id: "guest", x: 24, z: 40, light: null },
    { id: "yield", x: 12, z: 26, light: null },
    { id: "beholden", x: 0, z: -22, light: null },
    { id: "mirror", x: -26, z: 40, light: null },
    { id: "sucre", x: 22, z: 62, light: null },
  ];
  private glitch = 0;
  private disposed = false;
  private yaw = 0;
  private pitch = 0;
  private px = 0;
  private py = EYE;
  private pz = 86;
  private speed = 0;
  private testKeys: string[] | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#0c0b0a");
    this.scene.fog = new THREE.FogExp2("#05060c", 0.05);
    this.camera = new THREE.PerspectiveCamera(68, 1, 0.08, 160);
    this.scene.add(this.camera);
  }

  async init() {
    const loader = new THREE.TextureLoader();
    const [floorTex, wallTex] = await Promise.all([
      loader.loadAsync("/textures/floor.jpg"),
      loader.loadAsync("/textures/wall.jpg"),
    ]);
    for (const t of [floorTex, wallTex]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8;
    }
    floorTex.repeat.set(48, 48);
    wallTex.repeat.set(1.4, 1.1);

    this.floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.72, metalness: 0.22 });
    this.wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.8, metalness: 0.12 });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), this.floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const hemi = new THREE.HemisphereLight("#6ad4c8", "#0a0614", 0.42);
    this.breath = hemi;
    this.scene.add(hemi);
    const amb = new THREE.AmbientLight("#12182a", 0.2);
    this.scene.add(amb);

    this.lantern = new THREE.PointLight("#c8fff0", 1.2, 13, 1.6);
    this.camera.add(this.lantern);
    this.lantern.position.set(0.2, -0.1, -0.3);
    const rim = new THREE.PointLight("#ff2bd6", 0.35, 8, 2);
    this.camera.add(rim);
    rim.position.set(-0.4, 0.2, 0.2);

    this.buildNeon();
    this.buildSaucer();
    this.buildSelf();

    this.buildWalls();
    await this.buildProps();
    this.buildMandala();
    this.buildDust();
    this.buildStars();
    this.buildChamberLights();
    this.spawnWanderers();

    const g = useGame.getState();
    this.px = g.x;
    this.py = g.y || EYE;
    this.pz = g.z;
    this.yaw = g.yaw;
    this.pitch = g.pitch;

    if (this.disposed) return;
    this.installProbe();
    this.resize();
  }

  private buildNeon() {
    const mat = new THREE.MeshBasicMaterial({ color: "#3dffc8" });
    const mag = new THREE.MeshBasicMaterial({ color: "#ff2bd6" });
    const strip = (x: number, z: number, w: number, d: number, y: number, m: THREE.Material) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), m);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);
    };
    for (let z = 90; z >= -20; z -= 14) {
      strip(-5.6, z, 0.06, 6, 0.04, z % 28 === 90 % 28 ? mag : mat);
      strip(5.6, z, 0.06, 6, 0.04, mat);
    }
    const ceil = new THREE.PointLight("#3dffc8", 0.4, 18, 2);
    ceil.position.set(0, 4.2, 78);
    this.scene.add(ceil);
  }

  private buildSaucer() {
    for (const p of PLANETS) {
      const { x, z, r } = p;
      const bowlMat = new THREE.MeshStandardMaterial({
        color: p.id === "saucer-b" ? "#1a0c08" : p.id === "saucer-c" ? "#0c0818" : "#0a1620",
        metalness: 0.85,
        roughness: 0.18,
        side: THREE.DoubleSide,
      });
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.22, 2.4, 48, 1, true), bowlMat);
      bowl.position.set(x, 0.15, z);
      bowl.receiveShadow = true;
      bowl.castShadow = true;
      this.scene.add(bowl);
      const glass = new THREE.Mesh(
        new THREE.CircleGeometry(r * 0.28, 48),
        new THREE.MeshStandardMaterial({
          color: p.id === "saucer-b" ? "#ff8a4a" : p.id === "saucer-c" ? "#b8a0ff" : "#6ec8ff",
          metalness: 1,
          roughness: 0.04,
        }),
      );
      glass.rotation.x = -Math.PI / 2;
      glass.position.set(x, 0.03, z);
      glass.receiveShadow = false;
      this.scene.add(glass);
      const pad = new THREE.Mesh(
        new THREE.RingGeometry(r * 0.28, r * 0.92, 48),
        new THREE.MeshStandardMaterial({ color: "#141820", metalness: 0.12, roughness: 0.86 }),
      );
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(x, 0.025, z);
      pad.receiveShadow = true;
      this.scene.add(pad);
      const noon = new THREE.DirectionalLight(p.light, 1.35);
      noon.position.set(x + (p.id === "saucer-b" ? 22 : p.id === "saucer-c" ? -8 : 0), 26, z - (p.id === "saucer-c" ? 6 : 20));
      noon.target.position.set(x, 0, z);
      noon.castShadow = true;
      noon.shadow.mapSize.set(1024, 1024);
      noon.shadow.camera.near = 2;
      noon.shadow.camera.far = 60;
      noon.shadow.camera.left = -18;
      noon.shadow.camera.right = 18;
      noon.shadow.camera.top = 18;
      noon.shadow.camera.bottom = -18;
      noon.shadow.bias = -0.0005;
      noon.shadow.intensity = 0.9;
      noon.userData.planet = p.id;
      this.scene.add(noon, noon.target);
      this.planetLamps.push(noon);
      if (!this.noonSun) this.noonSun = noon;
      const rail = new THREE.Mesh(
        new THREE.TorusGeometry(r * 0.98, 0.08, 8, 48),
        new THREE.MeshBasicMaterial({ color: p.id === "saucer-b" ? "#ff6a3c" : p.id === "saucer-c" ? "#a88cff" : "#3dffc8" }),
      );
      rail.rotation.x = Math.PI / 2;
      rail.position.set(x, 1.2, z);
      this.scene.add(rail);
    }
  }

  private skin() {
    return new THREE.MeshStandardMaterial({ color: "#1a2430", roughness: 0.55, metalness: 0.35 });
  }

  private buildSelf() {
    const mat = this.skin();
    const g = new THREE.Group();
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.55, 4, 8), mat);
    torso.position.y = 1.12;
    torso.castShadow = true;
    const hips = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), mat);
    hips.position.y = 0.82;
    hips.castShadow = true;
    const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.55, 3, 6), mat);
    legL.position.set(-0.09, 0.42, 0);
    legL.castShadow = true;
    const legR = legL.clone();
    legR.position.x = 0.09;
    const footL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.22), mat);
    footL.position.set(-0.09, 0.04, 0.04);
    footL.castShadow = true;
    const footR = footL.clone();
    footR.position.x = 0.09;
    g.add(torso, hips, legL, legR, footL, footR);
    g.traverse((o) => {
      if (o instanceof THREE.Mesh) o.castShadow = true;
    });
    this.scene.add(g);
    this.selfBody = g;

    const arms = new THREE.Group();
    const armMat = this.skin();
    const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.32, 3, 6), armMat);
    armL.position.set(-0.22, -0.28, -0.28);
    armL.rotation.x = 0.35;
    armL.rotation.z = 0.18;
    const armR = armL.clone();
    armR.position.x = 0.22;
    armR.rotation.z = -0.18;
    const handL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.1), armMat);
    handL.position.set(-0.24, -0.48, -0.42);
    const handR = handL.clone();
    handR.position.x = 0.24;
    arms.add(armL, armR, handL, handR);
    this.camera.add(arms);
  }

  private buildWalls() {
    this.wallList = buildWalls();
    const geo = new THREE.BoxGeometry(1, 1, 1);
    for (const wall of this.wallList) {
      const mesh = new THREE.Mesh(geo, this.wallMat);
      mesh.position.set(wall.x, (wall.h ?? 4.6) / 2, wall.z);
      mesh.scale.set(wall.w, wall.h ?? 4.6, wall.d);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.walls.push({ wall, mesh });
    }
  }

  private async buildProps() {
    const loader = new THREE.TextureLoader();
    for (const prop of PROPS) {
      const group = new THREE.Group();
      group.position.set(prop.x, 0, prop.z);
      if (prop.kind === "figure" && prop.portrait) {
        try {
          const tex = await loader.loadAsync(`/portraits/${prop.portrait}.jpg`);
          tex.colorSpace = THREE.SRGBColorSpace;
          const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
          const h = 2.55 * (prop.scale ?? 1);
          const w = h * 0.62;
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
          mesh.position.y = h / 2;
          group.add(mesh);
          const glow = new THREE.PointLight("#d9c8a0", 0.55, 6, 2);
          glow.position.set(0, 1.4, 0.4);
          group.add(glow);
        } catch {
          const mesh = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.28, 1.4, 4, 8),
            new THREE.MeshStandardMaterial({ color: "#2a2420" }),
          );
          mesh.position.y = 1.1;
          group.add(mesh);
        }
      } else if (prop.kind === "symbol") {
        const mesh = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.22, 0),
          new THREE.MeshStandardMaterial({
            color: "#c8c4b8",
            emissive: "#8a7050",
            emissiveIntensity: 0.7,
            roughness: 0.3,
          }),
        );
        mesh.position.y = 1.05;
        group.add(mesh);
      } else if (prop.id.startsWith("house-")) {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 1.5, 0.28),
          new THREE.MeshStandardMaterial({ color: "#1a1612", roughness: 0.95 }),
        );
        mesh.position.y = 0.75;
        group.add(mesh);
        const pl = new THREE.PointLight("#e8dcc0", 0, 4, 2);
        pl.position.y = 1.6;
        group.add(pl);
        this.houseLights.push(pl);
      } else if (prop.kind === "gate") {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(3.4, 3.6, 0.18),
          new THREE.MeshStandardMaterial({
            color: "#1a1210",
            transparent: true,
            opacity: 0.55,
            emissive: "#3a2018",
            emissiveIntensity: 0.2,
          }),
        );
        mesh.position.y = 1.8;
        group.add(mesh);
      } else {
        const mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.22, 0.5, 6),
          new THREE.MeshStandardMaterial({ color: "#5a4a38", roughness: 0.8 }),
        );
        mesh.position.y = 0.35;
        group.add(mesh);
      }
      this.scene.add(group);
      this.props.push({ prop, group });
    }
  }

  private buildMandala() {
    const g = new THREE.Group();
    g.position.set(0, 0.04, 0);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 2.45, 64),
      new THREE.MeshStandardMaterial({ color: "#c8c4b8", emissive: "#6a5840", emissiveIntensity: 0.4, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    g.add(ring);
    const inner = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1.05, 48),
      new THREE.MeshStandardMaterial({ color: "#ebe6dc", emissive: "#8a7a60", emissiveIntensity: 0.35, side: THREE.DoubleSide }),
    );
    inner.rotation.x = -Math.PI / 2;
    g.add(inner);
    const sq = new THREE.Mesh(
      new THREE.RingGeometry(3.4, 3.55, 4),
      new THREE.MeshStandardMaterial({ color: "#9a9286", side: THREE.DoubleSide }),
    );
    sq.rotation.x = -Math.PI / 2;
    g.add(sq);
    this.scene.add(g);
    this.mandala = g;
  }

  private buildDust() {
    const n = 700;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = Math.random() * 4.2;
      pos[i * 3 + 2] = Math.random() * 110 - 28;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: "#c8c4b8", size: 0.035, transparent: true, opacity: 0.35, depthWrite: false });
    this.scene.add(new THREE.Points(geo, mat));
  }

  private buildStars() {
    const n = 160;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const e = Math.random() * 0.7;
      pos[i * 3] = Math.cos(a) * (18 + Math.random() * 28);
      pos[i * 3 + 1] = 6.5 + Math.sin(e) * 10;
      pos[i * 3 + 2] = Math.sin(a) * (18 + Math.random() * 28) + 40;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: "#e8e0cc", size: 0.09, transparent: true, opacity: 0.55, depthWrite: false });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);
    this.stars = pts;
    const day = new THREE.PointLight("#e8c98a", 0.35, 40, 2);
    day.position.set(12, 9, 40);
    const night = new THREE.PointLight("#9aa7c4", 0.28, 40, 2);
    night.position.set(-12, 8, 40);
    this.scene.add(day, night);
    this.dayLamp = day;
    this.nightLamp = night;
  }

  private buildChamberLights() {
    for (const c of CHAMBERS) {
      const l = new THREE.PointLight(c.light, 0.55, c.r * 2.2, 1.8);
      l.position.set(c.x, 2.4, c.z);
      this.scene.add(l);
    }
  }

  private spawnWanderers() {
    const at = (id: string) => {
      const c = CHAMBERS.find((ch) => ch.id === id);
      return { x: c?.x ?? 0, z: c?.z ?? 0 };
    };
    const specs: { id: WandererId; color: string; intensity: number; dist: number; x: number; z: number; glow: number }[] = [
      { id: "river", color: "#f2e4c0", intensity: 1.25, dist: 9, x: 0, z: 62, glow: 1.2 },
      { id: "line", color: "#a8bdd4", intensity: 1.0, dist: 8, x: 4, z: 70, glow: 1.0 },
      { id: "turn", color: "#8a7a62", intensity: 0.58, dist: 6.5, x: 0, z: 8, glow: 0.5 },
      { id: "guest", color: "#d4b06a", intensity: 0.95, dist: 7.6, ...at("nightsea"), glow: 0.9 },
      { id: "yield", color: "#6e9a86", intensity: 0.72, dist: 7.2, ...at("crossroads"), glow: 0.62 },
      { id: "beholden", color: "#c56a48", intensity: 1.15, dist: 8.4, ...at("workshop"), glow: 1.08 },
      { id: "mirror", color: "#c4b8d6", intensity: 0.86, dist: 8, ...at("orchard"), glow: 0.98 },
      { id: "sucre", color: "#f0e6c8", intensity: 1.35, dist: 9.2, ...at("stacks"), glow: 1.25 },
    ];
    for (const spec of specs) {
      const w = this.wanderers.find((x) => x.id === spec.id);
      if (!w) continue;
      const light = new THREE.PointLight(spec.color, spec.intensity, spec.dist, 1.8);
      light.position.set(spec.x, 1.5, spec.z);
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 10, 10),
        new THREE.MeshStandardMaterial({
          color: spec.color,
          emissive: spec.color,
          emissiveIntensity: spec.glow,
          roughness: 0.55,
          metalness: 0.35,
        }),
      );
      light.add(orb);
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.16, 0.7, 4, 8),
        this.skin(),
      );
      body.position.set(0, -0.72, 0);
      body.castShadow = true;
      light.add(body);
      this.scene.add(light);
      w.light = light;
      w.x = spec.x;
      w.z = spec.z;
      if (spec.id !== "river" && spec.id !== "line" && spec.id !== "turn") {
        const idx = CHAMBERS.findIndex((c) => Math.hypot(c.x - spec.x, c.z - spec.z) < 1.2);
        w.from = idx < 0 ? 0 : idx;
        w.to = (w.from + 3) % CHAMBERS.length;
        w.u = 0;
      }
    }
  }

  setCompanions(list: CompanionPose[]) {
    const seen = new Set<string>();
    this.companionMeta.clear();
    for (const c of list) {
      seen.add(c.id);
      this.companionMeta.set(c.id, c);
      let light = this.companions.get(c.id);
      if (!light) {
        light = new THREE.PointLight("#e8d8b0", 1.1, 8, 2);
        this.scene.add(light);
        this.companions.set(c.id, light);
      }
      light.position.set(c.x, 1.5, c.z);
      if (!light.userData.body) {
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.7, 4, 8), this.skin());
        body.position.set(0, -0.55, 0);
        body.castShadow = true;
        light.add(body);
        light.userData.body = body;
      }
      const shown = Number(useGame.getState().flags.ego ?? 1) < 0.5 ? c.should || c.idea || "" : "";
      const body = light.userData.body as THREE.Mesh;
      if (body.material instanceof THREE.MeshStandardMaterial) {
        if (shown) {
          let h = 0;
          for (let i = 0; i < shown.length; i++) h = (h * 33 + shown.charCodeAt(i)) >>> 0;
          body.material.color.setHSL((h % 360) / 360, 0.25, 0.22);
          body.scale.set(1, c.should ? 1.08 : 1, 1);
        } else {
          body.material.color.copy((this.skin() as THREE.MeshStandardMaterial).color);
          body.scale.set(1, 1, 1);
        }
      }
    }
    for (const [id, l] of this.companions) {
      if (!seen.has(id)) {
        this.scene.remove(l);
        this.companions.delete(id);
      }
    }
  }

  private installProbe() {
    const self = this;
    (window as unknown as { __controlsTest: unknown }).__controlsTest = {
      getYaw: () => self.yaw,
      getSpeed: () => self.speed,
      getPosition: () => ({ x: self.px, y: self.py, z: self.pz }),
      setKeys: (codes: string[]) => {
        self.testKeys = codes;
        setKeys(codes);
      },
    };
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }

  start() {
    if (this.disposed || this.running) return;
    this.running = true;
    this.last = performance.now();
    this.installProbe();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  stop() {
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  dispose() {
    this.stop();
    this.disposed = true;
    this.renderer.dispose();
  }

  private frame() {
    if (this.disposed) return;
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    const st = useGame.getState();
    const frozen = st.phase !== "play" || Boolean(st.encounter) || st.paused || st.journalOpen || st.unmaking || Boolean(st.ending);

    this.syncWorld(st.flags, st.symbols, st.innerHour(), dt, st.kairos);

    if (!frozen) {
      this.move(dt, st);
      const ch = currentChamber(this.px, this.pz);
      if (ch && ch.id !== this.chamberId) {
        this.chamberId = ch.id;
        st.visitChamber(ch.id);
        this.fogTarget.set(ch.fog);
        this.lightTarget.set(ch.light);
      }
      this.pickNearby(st);
      if (ch && ch.id.startsWith("saucer")) {
        /* a now, unnamed */
      } else {
        st.tickKairos(dt, this.speed / 6.15);
      }
      if (now - ((this as unknown as { lastPose: number }).lastPose ?? 0) > 400) {
        (this as unknown as { lastPose: number }).lastPose = now;
        st.setPose(this.px, this.py, this.pz, this.yaw, this.pitch);
      }
    } else {
      this.speed = 0;
      consumeLook();
      consumeEdges();
    }

    if (st.unmaking) {
      this.fogTarget.set("#050403");
      (this.scene.fog as THREE.FogExp2).density = 0.22;
      this.lantern.intensity = 0.15;
    } else if (st.flags.reduced) {
      this.lantern.intensity = 0.28;
      this.breath.intensity = 0.14;
    }

    this.fog.lerp(this.fogTarget, 1 - Math.exp(-dt * 1.8));
    if (st.flags.blind) {
      this.fogTarget.set("#020308");
      (this.scene.fog as THREE.FogExp2).density = 0.28;
      this.lantern.intensity = 0.04;
      this.renderer.domElement.style.filter = "grayscale(1) contrast(0.55) brightness(0.35)";
    } else {
      this.renderer.domElement.style.filter = "";
    }
    (this.scene.fog as THREE.FogExp2).color.copy(this.fog);
    this.scene.background = this.fog;
    this.lantern.color.lerp(this.lightTarget, 1 - Math.exp(-dt * 1.2));
    const linked = st.companions + (st.flags.helped ? 1 : 0) + (st.tasks.love ? 1 : 0) + (st.flags.sharedKey ? 1 : 0);
    const pulse = 0.38 + Math.min(0.55, linked * 0.08) + (st.flags.gameBroken ? 0 : 0.04 * Math.sin(now * 0.0015));
    this.breath.intensity = st.flags.gameBroken ? 0.12 : pulse;
    if (linked > 0 && !st.flags.gameBroken) this.breath.color.set("#efe6d4");

    const hour = st.innerHour();
    const k = st.kairos;
    const who =
      st.mask === "achiever" ? 0.1 : st.mask === "caretaker" ? 0.35 : st.mask === "seeker" ? 0.6 : st.mask === "rebel" ? 0.85 : 0;
    const thought = st.flags.sawAny ? 2 : st.flags.sawRound ? 1 : 0;
    if (this.stars) {
      this.stars.rotation.y = k * Math.PI * 2 + who * 1.2;
      this.stars.rotation.x = thought === 1 ? 0.22 : thought === 2 ? Math.sin(k * 6) * 0.15 : 0.02;
      (this.stars.material as THREE.PointsMaterial).opacity = 0.35 + (this.pitch < -0.25 ? 0.35 : 0);
    }
    if (this.dayLamp && this.nightLamp) {
      const a = (hour / 12) * Math.PI * 2 + who;
      this.dayLamp.position.set(Math.cos(a) * 22, 8 + Math.sin(a) * 2, 40 + Math.sin(a) * 18);
      this.nightLamp.position.set(Math.cos(a + Math.PI) * 22, 7 + Math.cos(a) * 2, 40 + Math.sin(a + Math.PI) * 18);
      this.dayLamp.intensity = thought === 0 ? 0.22 : 0.4;
      this.nightLamp.intensity = thought === 0 ? 0.2 : 0.36;
    }

    if (st.flags.deaf) setDrone(48, 0);
    else setDrone(48 + hour * 2.2, st.integrations.self ? 0.55 : 0.22 + st.visited.length * 0.015);

    const dim = Number(st.flags.dim ?? 3);
    if (dim <= 0) {
      this.camera.position.set(this.px, this.py, this.pz);
      this.camera.rotation.set(this.pitch * 0.05, this.yaw, 0, "YXZ");
      this.camera.fov = 10;
      (this.scene.fog as THREE.FogExp2).density = 0.42;
    } else if (dim === 1) {
      this.camera.position.set(this.px, this.py, this.pz);
      this.camera.rotation.set(0, this.yaw, 0, "YXZ");
      this.camera.fov = 32;
    } else if (dim === 2) {
      this.camera.position.set(this.px, 24, this.pz);
      this.camera.rotation.set(-Math.PI / 2, 0, -this.yaw, "YXZ");
      this.camera.fov = 58;
    } else {
      this.camera.position.set(this.px, this.py, this.pz);
      this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
      this.camera.fov = 68;
    }
    this.camera.updateProjectionMatrix();
    if (this.planetLamps.length) {
      const here = PLANETS.reduce((a, b) => (Math.hypot(this.px - a.x, this.pz - a.z) < Math.hypot(this.px - b.x, this.pz - b.z) ? a : b));
      for (const l of this.planetLamps) {
        const mine = l.userData.planet === here.id;
        l.intensity = mine ? 1.35 : 0;
        l.castShadow = mine;
      }
    }
    if (this.selfBody) {
      this.selfBody.position.set(this.px + Math.sin(this.yaw) * 0.12, 0, this.pz + Math.cos(this.yaw) * 0.12);
      this.selfBody.rotation.y = this.yaw;
      const step = this.speed > 0.4 ? Math.sin(now * 0.012) * 0.08 : 0;
      this.selfBody.children[2] && (this.selfBody.children[2].rotation.x = step);
      this.selfBody.children[3] && (this.selfBody.children[3].rotation.x = -step);
    }
    this.renderer.render(this.scene, this.camera);
  }

  private syncWorld(flags: Record<string, boolean | number | string>, symbols: string[], hour: number, dt: number, kairos = 0) {
    for (const w of this.walls) {
      w.mesh.visible = wallActive(w.wall, flags, hour);
    }
    for (const p of this.props) {
      p.group.visible = propVisible(p.prop, flags, hour, symbols);
      if (p.prop.kind === "figure") {
        p.group.children.forEach((ch) => {
          if (ch instanceof THREE.Mesh) ch.lookAt(this.px, ch.position.y + p.group.position.y, this.pz);
        });
      }
      if (p.prop.kind === "symbol") {
        p.group.rotation.y += dt * 0.6;
      }
    }
    this.houseLights.forEach((l, i) => {
      if (flags.timeless) l.intensity = 0.85;
      else if (flags.stuckTime) l.intensity = hour === i ? 1.4 : 0;
      else l.intensity = hour === i ? 1.2 : 0.05;
    });
    if (this.mandala) {
      this.mandala.rotation.y += dt * 0.04;
    }
    const broken = Boolean(flags.gameBroken);
    if (broken) {
      this.glitch += dt;
      (this.scene.fog as THREE.FogExp2).density = 0.09 + Math.sin(this.glitch * 7) * 0.03;
      for (const w of this.walls) {
        if (Math.random() < 0.01) w.mesh.position.y = (w.wall.h ?? 4.6) / 2 + (Math.random() - 0.5) * 0.4;
      }
      this.lantern.intensity = 0.4 + Math.random() * 0.8;
    }
    const hidden = broken || Boolean(flags.hacked);
    const k = ((kairos % 1) + 1) % 1;
    const river = chamberLerp(k + 0.18);
    const line = chamberLerp(k * 0.42 + 0.31, 1.15);
    const ang = k * Math.PI * 2;
    const ellipse = { x: Math.cos(ang) * 16.5, z: Math.sin(ang) * 21 };
    const turnPath = chamberLerp(k * 0.7 + 0.55, -0.9);
    const blend = 0.5 + 0.5 * Math.sin(ang * 1.35);
    const turn = {
      x: ellipse.x * blend + turnPath.x * (1 - blend),
      z: ellipse.z * blend + turnPath.z * (1 - blend),
    };
    const poses: Partial<Record<WandererId, { x: number; z: number }>> = { river, line, turn };
    this.wanderers.forEach((w, idx) => {
      const p = poses[w.id];
      if (p) {
        w.x = p.x;
        w.z = p.z;
      } else {
        roamWanderer(w, dt);
      }
      if (!w.light) return;
      w.light.visible = !hidden && !this.chamberId.startsWith("saucer");
      const bob = Math.sin(k * Math.PI * 22 + idx * 1.7) * 0.045;
      w.light.position.set(w.x, 1.55 + bob, w.z);
    });
  }

  private move(dt: number, st: ReturnType<typeof useGame.getState>) {
    const look = consumeLook();
    const edges = consumeEdges();
    if (input.locked) {
      this.yaw -= look[0] * SENS;
      this.pitch -= look[1] * SENS;
    }
    this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch));

    const keys = this.testKeys ? new Set(this.testKeys) : input.keys;
    let ix = input.moveX;
    let iz = input.moveY;
    if (keys.has("KeyW") || keys.has("ArrowUp")) iz -= 1;
    if (keys.has("KeyS") || keys.has("ArrowDown")) iz += 1;
    if (keys.has("KeyA") || keys.has("ArrowLeft")) ix -= 1;
    if (keys.has("KeyD") || keys.has("ArrowRight")) ix += 1;
    const dim = Number(st.flags.dim ?? 3);
    if (dim <= 0) {
      ix = 0;
      iz = 0;
    }
    const sprint = keys.has("ShiftLeft") || keys.has("ShiftRight");
    const len = Math.hypot(ix, iz);
    if (len > 1) {
      ix /= len;
      iz /= len;
    }

    const fx = -Math.sin(this.yaw);
    const fz = -Math.cos(this.yaw);
    const rx = Math.cos(this.yaw);
    const rz = -Math.sin(this.yaw);
    const spd = sprint ? SPRINT : WALK;
    const vx0 = (fx * -iz + rx * ix) * spd;
    const vz0 = (fz * -iz + rz * ix) * spd;
    let vx = vx0;
    let vz = vz0;
    const dxs = this.px - SAUCER.x;
    const dzs = this.pz - SAUCER.z;
    const inSaucer = PLANETS.some((p) => Math.hypot(this.px - p.x, this.pz - p.z) < p.r - 0.4);
    if (inSaucer) {
      const p = PLANETS.reduce((a, b) => (Math.hypot(this.px - a.x, this.pz - a.z) < Math.hypot(this.px - b.x, this.pz - b.z) ? a : b));
      const earth = String(st.flags.earth ?? "");
      const pull = earth === "flat" ? 0 : earth === "round" ? 5.4 : 3.2;
      const ddx = this.px - p.x;
      const ddz = this.pz - p.z;
      const d = Math.hypot(ddx, ddz);
      if (d > 1.2 && pull) {
        vx += (-ddx / d) * pull;
        vz += (-ddz / d) * pull;
      }
    }
    this.speed = Math.hypot(vx, vz);

    let nx = this.px + vx * dt;
    let nz = this.pz + vz * dt;
    if (dim === 1) {
      const here = PLANETS.reduce((a, b) => (Math.hypot(this.px - a.x, this.pz - a.z) < Math.hypot(this.px - b.x, this.pz - b.z) ? a : b));
      nx = here.x;
    }
    const hour = st.innerHour();
    const active = this.wallList.filter((w) => wallActive(w, st.flags, hour) && this.walls.find((m) => m.wall === w)?.mesh.visible);
    const hit = collide(nx, nz, RADIUS, active);
    this.px = hit.x;
    this.pz = hit.z;

    if (this.speed > 0.4) {
      this.bob += dt * this.speed * 1.7;
      this.py = EYE + Math.sin(this.bob) * 0.035;
      this.footAcc += dt * this.speed;
      if (this.footAcc > 1.15) {
        this.footAcc = 0;
        if (!st.flags.deaf) footstep();
      }
      this.still = 0;
    } else {
      this.py += (EYE - this.py) * (1 - Math.exp(-dt * 6));
      this.still += dt;
      const wound = Number(st.flags.wound ?? 0);
      const need = wound <= 0 ? 2.1 : 3.2 + Math.min(1, wound / 100) * 2.4;
      if (this.still > need) {
        const ch = currentChamber(this.px, this.pz);
        const w = ch ? stillnessWhisper(ch.id, st.asSnap()) : null;
        if (w) st.setWhisper(w);
        this.still = 0;
        const d = Number(st.flags.dim ?? 3);
        if (d <= 0) {
          this.dimHold += need;
          if (this.dimHold > 14) {
            useGame.setState({ flags: { ...useGame.getState().flags, dim: 3 } });
            st.setWhisper("A loop. The point was a circle. You start again, not from the beginning.");
            this.dimHold = 0;
          }
        }
      }
    }

    if (edges.interact && st.nearby) st.interact(st.nearby.id);
    if (edges.journal) st.toggleJournal();
    if (edges.pause) st.togglePause();
  }

  private pickNearby(st: ReturnType<typeof useGame.getState>) {
    const fx = -Math.sin(this.yaw) * Math.cos(this.pitch);
    const fz = -Math.cos(this.yaw) * Math.cos(this.pitch);
    let best: { id: string; label: string; score: number } | null = null;
    const hour = st.innerHour();
    for (const p of this.props) {
      if (!p.group.visible) continue;
      if (!propVisible(p.prop, st.flags, hour, st.symbols)) continue;
      const dx = p.prop.x - this.px;
      const dz = p.prop.z - this.pz;
      const dist = Math.hypot(dx, dz);
      if (dist > 3.4 || dist < 0.12) continue;
      const dirx = dx / dist;
      const dirz = dz / dist;
      const dot = dirx * fx + dirz * fz;
      if (dot < 0.42) continue;
      const score = dot * 2 - dist * 0.15;
      if (!best || score > best.score) best = { id: p.prop.id, label: p.prop.label, score };
    }
    const next = best ? { id: best.id, label: best.label } : null;
    if (!st.flags.gameBroken && !st.flags.hacked) {
      let nearest: { dist: number; dx: number; dz: number; id: WandererId } | null = null;
      for (const w of this.wanderers) {
        if (w.light && !w.light.visible) continue;
        const dx = w.x - this.px;
        const dz = w.z - this.pz;
        const dist = Math.hypot(dx, dz);
        if (dist > 3.2 || dist < 0.2) continue;
        if (!nearest || dist < nearest.dist) nearest = { dist, dx, dz, id: w.id };
      }
      if (nearest) {
        const dirx = nearest.dx / nearest.dist;
        const dirz = nearest.dz / nearest.dist;
        const dot = dirx * fx + dirz * fz;
        if (dot > 0.35) {
          const score = dot * 2 - nearest.dist * 0.15;
          if (!best || score > best.score) {
            const misread = Boolean(st.flags.binaryTrap);
            let label = LANTERN_LABEL[nearest.id] ?? "Another lantern";
            if (misread) label = "A lantern you cannot place";
            st.setNearby({ id: `other-walker:${nearest.id}`, label });
            return;
          }
        }
      }
    }
    for (const [cid, light] of this.companions) {
      const dx = light.position.x - this.px;
      const dz = light.position.z - this.pz;
      const dist = Math.hypot(dx, dz);
      if (dist > 3.2 || dist < 0.2) continue;
      const dirx = dx / dist;
      const dirz = dz / dist;
      const dot = dirx * fx + dirz * fz;
      if (dot < 0.35) continue;
      const pose = this.companionMeta.get(cid);
      st.setNearby({
        id: "other-walker:player",
        label: pose?.idea || pose?.should ? "A body that might be an idea" : "A living walker",
        shielded: pose?.shielded,
        idea: pose?.idea,
        should: pose?.should,
        wound: pose?.wound,
        form: pose?.form,
      });
      return;
    }
    const cur = st.nearby;
    if (cur?.id !== next?.id) st.setNearby(next);
  }

  lookDelta(dx: number, dy: number) {
    this.yaw -= dx * SENS * 1.15;
    this.pitch -= dy * SENS * 1.15;
    this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch));
  }
}

function roamWanderer(w: Wanderer, dt: number) {
  const n = CHAMBERS.length;
  if (!n) return;
  if (w.from == null) w.from = Math.floor(Math.random() * n);
  if (w.to == null) w.to = (w.from + 1 + Math.floor(Math.random() * Math.max(1, n - 1))) % n;
  if (w.u == null) w.u = 0;
  const rate = w.id === "guest" ? 0.048 : w.id === "yield" ? 0.034 : w.id === "beholden" ? 0.028 : 0.052;
  w.u += dt * rate;
  if (w.u >= 1) {
    w.u = 0;
    w.from = w.to;
    let next = Math.floor(Math.random() * n);
    if (next === w.from) next = (next + 1 + Math.floor(Math.random() * Math.max(1, n - 1))) % n;
    w.to = next;
  }
  const a = CHAMBERS[w.from % n];
  const b = CHAMBERS[w.to % n];
  const t = w.u * w.u * (3 - 2 * w.u);
  w.x = a.x + (b.x - a.x) * t;
  w.z = a.z + (b.z - a.z) * t;
}

function chamberLerp(t: number, lateral = 0) {
  const n = CHAMBERS.length;
  const u = ((t % 1) + 1) % 1;
  const f = u * n;
  const i = Math.floor(f) % n;
  const frac = f - Math.floor(f);
  const a = CHAMBERS[i];
  const b = CHAMBERS[(i + 1) % n];
  const x = a.x + (b.x - a.x) * frac;
  const z = a.z + (b.z - a.z) * frac;
  if (!lateral) return { x, z };
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const len = Math.hypot(dx, dz) || 1;
  return { x: x + (-dz / len) * lateral, z: z + (dx / len) * lateral };
}

function collide(x: number, z: number, r: number, walls: Wall[]) {
  let px = x;
  let pz = z;
  for (let i = 0; i < 3; i++) {
    for (const w of walls) {
      const hw = w.w / 2 + r;
      const hd = w.d / 2 + r;
      const dx = px - w.x;
      const dz = pz - w.z;
      if (Math.abs(dx) > hw || Math.abs(dz) > hd) continue;
      const ox = hw - Math.abs(dx);
      const oz = hd - Math.abs(dz);
      if (ox < oz) px += Math.sign(dx || 1) * ox;
      else pz += Math.sign(dz || 1) * oz;
    }
  }
  return { x: px, z: pz };
}
