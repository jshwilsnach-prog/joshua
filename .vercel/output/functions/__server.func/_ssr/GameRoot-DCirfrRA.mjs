import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as SRGBColorSpace, E as TextureLoader, S as RingGeometry, T as SphereGeometry, _ as PlaneGeometry, a as BufferGeometry, b as PointsMaterial, c as CylinderGeometry, d as HemisphereLight, f as IcosahedronGeometry, g as PerspectiveCamera, h as MeshStandardMaterial, i as BufferAttribute, l as FogExp2, m as MeshBasicMaterial, n as AmbientLight, o as CapsuleGeometry, p as Mesh, r as BoxGeometry, s as Color, t as WebGLRenderer, u as Group, v as PointLight, w as Scene, x as RepeatWrapping, y as Points } from "../_libs/three.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/GameRoot-DCirfrRA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PLAYER_START = {
	x: 0,
	y: 1.62,
	z: 86,
	yaw: 0,
	pitch: 0
};
var H = 4.6;
var T = .62;
var W = 3.7;
function box(x, z, w, d, extra) {
	return {
		x,
		z,
		w,
		d,
		h: H,
		...extra
	};
}
function hall(x1, z1, x2, z2, extra) {
	const walls = [];
	const horiz = Math.abs(z1 - z2) < .2;
	const cx = (x1 + x2) / 2;
	const cz = (z1 + z2) / 2;
	const len = horiz ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
	const hw = W / 2;
	if (horiz) {
		walls.push(box(cx, cz - hw, len + T, T, extra));
		walls.push(box(cx, cz + hw, len + T, T, extra));
	} else {
		walls.push(box(cx - hw, cz, T, len + T, extra));
		walls.push(box(cx + hw, cz, T, len + T, extra));
	}
	return walls;
}
function manhattan(x1, z1, x2, z2, extra) {
	if (Math.abs(x1 - x2) < .2 || Math.abs(z1 - z2) < .2) return hall(x1, z1, x2, z2, extra);
	return [...hall(x1, z1, x1, z2, extra), ...hall(x1, z2, x2, z2, extra)];
}
function ring(cx, cz, r, openings = []) {
	const segs = 24;
	const walls = [];
	for (let i = 0; i < segs; i++) {
		const a0 = i / segs * Math.PI * 2;
		const a1 = (i + 1) / segs * Math.PI * 2;
		const mid = (a0 + a1) / 2;
		if (openings.some((a) => {
			let d = Math.abs(mid - a);
			d = Math.min(d, Math.PI * 2 - d);
			return d < .28;
		})) continue;
		const x = cx + Math.cos(mid) * r;
		const z = cz + Math.sin(mid) * r;
		const w = r * (a1 - a0) * 1.12;
		walls.push({
			x,
			z,
			w: Math.abs(Math.cos(mid)) > .7 ? T : w,
			d: Math.abs(Math.sin(mid)) > .7 ? T : w,
			h: H
		});
	}
	return walls;
}
var CHAMBERS = [
	{
		id: "vestibule",
		name: "A Threshold",
		x: 0,
		z: 86,
		r: 8.5,
		fog: "#14110e",
		light: "#cfc6b6",
		whisper: "You arrived wearing a name."
	},
	{
		id: "faces",
		name: "The House of Faces",
		x: 0,
		z: 62,
		r: 7.2,
		fog: "#17140f",
		light: "#d2c4a4",
		whisper: "Every room you have ever entered, you entered as someone."
	},
	{
		id: "attic",
		name: "Rooms Above the House",
		x: -22,
		z: 62,
		r: 6.8,
		fog: "#121014",
		light: "#a8b0c0",
		whisper: "What you forgot did not forget you."
	},
	{
		id: "twin",
		name: "The Other Step",
		x: 0,
		z: 40,
		r: 7.6,
		fog: "#100c0c",
		light: "#8a3a3a",
		whisper: "Someone has been walking one pace behind you."
	},
	{
		id: "nightsea",
		name: "Black Water",
		x: 24,
		z: 40,
		r: 7,
		fog: "#0c1016",
		light: "#6e88aa",
		whisper: "The descent is not down. It is in."
	},
	{
		id: "orchard",
		name: "The Unnamed Grove",
		x: -26,
		z: 40,
		r: 8.4,
		fog: "#10140f",
		light: "#c5c8b4",
		whisper: "A figure waits who is not you, and not anyone else either."
	},
	{
		id: "crossroads",
		name: "Four Ways, None Marked",
		x: 12,
		z: 26,
		r: 5.8,
		fog: "#141210",
		light: "#c4b48a",
		whisper: "A laugh without a throat."
	},
	{
		id: "hall",
		name: "The Gallery of Images",
		x: 22,
		z: 12,
		r: 10.5,
		fog: "#16120e",
		light: "#e0d2b4",
		whisper: "They were never yours. You only hosted them."
	},
	{
		id: "vessel",
		name: "The Closed Work",
		x: -20,
		z: 14,
		r: 7.4,
		fog: "#120f0c",
		light: "#b09060",
		whisper: "Lead and gold are the same metal, arguing."
	},
	{
		id: "pillars",
		name: "Two Stones",
		x: 0,
		z: 16,
		r: 7,
		fog: "#141416",
		light: "#d8d8e4",
		whisper: "If you choose, the other will return as fate."
	},
	{
		id: "center",
		name: "A Quiet Circle",
		x: 0,
		z: 0,
		r: 11,
		fog: "#0e0d10",
		light: "#efe6d4",
		whisper: "You are not this. You are the one who can see this."
	},
	{
		id: "workshop",
		name: "The Worktable",
		x: 0,
		z: -22,
		r: 6.8,
		fog: "#120e0b",
		light: "#e6c99a",
		whisper: "Someone has been here the whole time, and could not leave the table."
	},
	{
		id: "philemon",
		name: "A Porch of Wings",
		x: 36,
		z: 12,
		r: 6.2,
		fog: "#101816",
		light: "#7aa8a0",
		whisper: "Called or uncalled, the god will be there."
	},
	{
		id: "bollingen",
		name: "A Tower of Stones",
		x: -38,
		z: 62,
		r: 5.6,
		fog: "#12110e",
		light: "#c2b49a",
		whisper: "He built this so the dead would have a house."
	},
	{
		id: "stacks",
		name: "The Bound World",
		x: 22,
		z: 62,
		r: 7,
		fog: "#12141a",
		light: "#c4c0b0",
		whisper: "Every religion, every proof, every poem — the day-world, bound. This is the floor, not a detour."
	}
];
var PROPS = [
	{
		id: "porter",
		kind: "figure",
		x: -2.2,
		z: 82.5,
		portrait: "porter",
		label: "The keeper of the hook"
	},
	{
		id: "maskhook",
		kind: "relic",
		x: 2.4,
		z: 82.8,
		label: "A wooden hook",
		y: 1.2
	},
	{
		id: "faces-echo",
		kind: "figure",
		x: 0,
		z: 60.2,
		portrait: "mask",
		label: "A wall of faces",
		scale: 1.15
	},
	{
		id: "attic-chest",
		kind: "relic",
		x: -22,
		z: 59.4,
		label: "A box of unsent letters"
	},
	{
		id: "window",
		kind: "relic",
		x: -18.4,
		z: 58.2,
		label: "A small window"
	},
	{
		id: "twin",
		kind: "figure",
		x: 0,
		z: 37.4,
		portrait: "twin",
		label: "The one who kept what you dropped"
	},
	{
		id: "nightsea-figure",
		kind: "figure",
		x: 24,
		z: 37.6,
		portrait: "soul",
		label: "Someone standing in the water"
	},
	{
		id: "hearth",
		kind: "figure",
		x: -29.4,
		z: 37.2,
		portrait: "mother",
		label: "A figure by a hearth"
	},
	{
		id: "mirror",
		kind: "figure",
		x: -26,
		z: 35.2,
		portrait: "soul",
		label: "A figure in a glass"
	},
	{
		id: "chapel",
		kind: "figure",
		x: -22.4,
		z: 37.2,
		portrait: "wise",
		label: "A figure who does not preach"
	},
	{
		id: "well",
		kind: "figure",
		x: -26,
		z: 43.6,
		portrait: "soul",
		label: "A figure at a well"
	},
	{
		id: "trickster",
		kind: "figure",
		x: 12,
		z: 24.2,
		portrait: "trickster",
		label: "A grin with no owner"
	},
	{
		id: "mother",
		kind: "figure",
		x: 18.2,
		z: 8.4,
		portrait: "mother",
		label: "The deep well"
	},
	{
		id: "wise",
		kind: "figure",
		x: 26.4,
		z: 12,
		portrait: "wise",
		label: "The lantern"
	},
	{
		id: "child",
		kind: "figure",
		x: 22,
		z: 16.8,
		portrait: "child",
		label: "What was left in the grass"
	},
	{
		id: "hero",
		kind: "figure",
		x: 22,
		z: 7.4,
		portrait: "hero",
		label: "An empty suit of gilt"
	},
	{
		id: "vessel-stone",
		kind: "relic",
		x: -20,
		z: 14,
		label: "A vessel of two metals"
	},
	{
		id: "sun-pillar",
		kind: "relic",
		x: -2.3,
		z: 16,
		label: "A warm stone"
	},
	{
		id: "moon-pillar",
		kind: "relic",
		x: 2.3,
		z: 16,
		label: "A cold stone"
	},
	{
		id: "self",
		kind: "figure",
		x: 0,
		z: 0,
		portrait: "wise",
		label: "The circle",
		scale: .15
	},
	{
		id: "oculus",
		kind: "relic",
		x: .8,
		z: 1.4,
		label: "A hole in the roof"
	},
	{
		id: "creator",
		kind: "figure",
		x: -1.8,
		z: -23.6,
		portrait: "creator",
		label: "The one at the table",
		scale: 1.05
	},
	{
		id: "destroyer",
		kind: "figure",
		x: 1.8,
		z: -23.6,
		portrait: "destroyer",
		label: "The one who takes the rooms down",
		scale: 1
	},
	{
		id: "abraxas",
		kind: "figure",
		x: 0,
		z: -21.2,
		portrait: "abraxas",
		label: "A fullness",
		scale: 1.12
	},
	{
		id: "ledger",
		kind: "relic",
		x: -2.4,
		z: -20.4,
		label: "A ledger with no totals"
	},
	{
		id: "philemon",
		kind: "figure",
		x: 36,
		z: 10.6,
		portrait: "wise",
		label: "A man with kingfisher wings",
		sync: [
			5,
			6,
			7
		]
	},
	{
		id: "bollingen",
		kind: "relic",
		x: -38,
		z: 62,
		label: "A carved stone"
	},
	{
		id: "pebble",
		kind: "relic",
		x: -20.8,
		z: 16.6,
		label: "An ordinary pebble"
	},
	{
		id: "plaque",
		kind: "relic",
		x: 3.4,
		z: 78.8,
		label: "A lintel carving"
	},
	{
		id: "typewriter",
		kind: "relic",
		x: -24.6,
		z: 64.4,
		label: "A typewriter that is not yours"
	},
	{
		id: "serpent",
		kind: "symbol",
		x: 4.6,
		z: 40,
		label: "A coiled form",
		symbolId: "serpent"
	},
	{
		id: "tree",
		kind: "symbol",
		x: -26,
		z: 40,
		label: "A tree that is also a person",
		symbolId: "tree"
	},
	{
		id: "water",
		kind: "symbol",
		x: 26.8,
		z: 42.2,
		label: "A bowl of black water",
		symbolId: "water"
	},
	{
		id: "gold",
		kind: "symbol",
		x: -18.2,
		z: 12.2,
		label: "A dull yellow lump",
		symbolId: "gold"
	},
	{
		id: "house",
		kind: "symbol",
		x: 2.8,
		z: 62,
		label: "A tiny house",
		symbolId: "house"
	},
	{
		id: "child-symbol",
		kind: "symbol",
		x: 20.2,
		z: 16.8,
		label: "A wooden horse",
		symbolId: "child"
	},
	{
		id: "blacksun",
		kind: "symbol",
		x: -22.4,
		z: 14,
		label: "A sun that gives no light",
		symbolId: "blacksun"
	},
	{
		id: "scarab",
		kind: "symbol",
		x: -18.4,
		z: 57.2,
		label: "A beetle at the glass",
		symbolId: "scarab",
		sync: [3, 4]
	},
	{
		id: "clock",
		kind: "symbol",
		x: 14.4,
		z: 26,
		label: "A clock with no hands",
		symbolId: "clock"
	},
	{
		id: "feather",
		kind: "symbol",
		x: 36,
		z: 13.6,
		label: "A kingfisher feather",
		symbolId: "feather",
		sync: [
			5,
			6,
			7
		]
	},
	{
		id: "inner-gate",
		kind: "gate",
		x: 0,
		z: 51.2,
		label: "The way down",
		gate: "persona"
	},
	{
		id: "center-gate",
		kind: "gate",
		x: 0,
		z: 8.6,
		label: "The last ring",
		gate: "center"
	},
	{
		id: "workshop-gate",
		kind: "gate",
		x: 0,
		z: -10.4,
		label: "A door that is not a door",
		gate: "workshop"
	},
	{
		id: "counting-stone",
		kind: "relic",
		x: -20,
		z: 11.4,
		label: "A stone with two marks"
	},
	{
		id: "blank-idea",
		kind: "relic",
		x: -26,
		z: 40,
		label: "A page with no writing"
	},
	{
		id: "philosophy",
		kind: "relic",
		x: 2.6,
		z: 84.2,
		label: "A page that is yours"
	},
	{
		id: "keys",
		kind: "relic",
		x: -2.8,
		z: 84,
		label: "An empty hook for keys"
	},
	{
		id: "spare-stone",
		kind: "relic",
		x: 4.2,
		z: 82.6,
		label: "A spare stone"
	},
	{
		id: "shelves",
		kind: "relic",
		x: 22,
		z: 62,
		label: "Shelves that go on"
	},
	{
		id: "book-tanakh",
		kind: "relic",
		x: 19.2,
		z: 60.4,
		label: "A book that begins in a garden"
	},
	{
		id: "book-gospel",
		kind: "relic",
		x: 24.6,
		z: 60.2,
		label: "A book that begins with a word"
	},
	{
		id: "book-quran",
		kind: "relic",
		x: 19.4,
		z: 64.2,
		label: "A book that begins with a recitation"
	},
	{
		id: "book-gita",
		kind: "relic",
		x: 24.8,
		z: 64,
		label: "A book spoken on a field"
	},
	{
		id: "book-tao",
		kind: "relic",
		x: 22,
		z: 58.6,
		label: "A book that will not be named"
	},
	{
		id: "book-heart",
		kind: "relic",
		x: 17.8,
		z: 62,
		label: "A book the size of a palm"
	},
	{
		id: "book-elements",
		kind: "relic",
		x: 26.2,
		z: 62,
		label: "A book of lines and points"
	},
	{
		id: "book-red",
		kind: "relic",
		x: 22,
		z: 65.4,
		label: "A book in a red cover"
	}
];
var HOUSE_VERBS = [
	"entering",
	"having",
	"speaking",
	"rooting",
	"making",
	"refining",
	"relating",
	"othering",
	"descending",
	"climbing",
	"gathering",
	"dissolving"
];
for (let i = 0; i < 12; i++) {
	const a = i / 12 * Math.PI * 2 + Math.PI;
	PROPS.push({
		id: `house-${i}`,
		kind: "relic",
		x: Math.sin(a) * 8.6,
		z: Math.cos(a) * 8.6,
		label: "An unmarked standing stone",
		y: .9
	});
}
function outerWalls() {
	const walls = [];
	walls.push(box(0, 96, 28, T));
	walls.push(box(-14, 91, T, 10));
	walls.push(box(14, 91, T, 10));
	return walls;
}
function buildWalls() {
	return [
		...outerWalls(),
		...ring(0, 86, 8.6, [Math.PI * 1.5, Math.PI * .5]),
		...manhattan(0, 78.5, 0, 69),
		...ring(0, 62, 7.4, [
			Math.PI * 1.5,
			Math.PI,
			Math.PI * .5,
			0
		]),
		...manhattan(0, 55, 0, 47.5),
		box(0, 51.2, 3.7, .55, { gate: "persona" }),
		...manhattan(0, 62, -15, 62),
		...ring(-22, 62, 6.9, [0, Math.PI]),
		...manhattan(-22, 62, -32, 62),
		...ring(-38, 62, 5.7, [0]),
		...manhattan(7.4, 62, 15.2, 62),
		...ring(22, 62, 7.1, [Math.PI]),
		...ring(0, 40, 7.8, [
			Math.PI * 1.5,
			0,
			Math.PI,
			Math.PI * .5
		]),
		...manhattan(0, 40, 16.5, 40),
		...ring(24, 40, 7.1, [Math.PI, Math.PI * 1.5]),
		...manhattan(24, 40, 24, 22),
		...manhattan(24, 22, 22, 22),
		...manhattan(0, 40, -18, 40),
		...ring(-26, 40, 8.5, [0]),
		...manhattan(0, 32.6, 12, 32.6),
		...manhattan(12, 32.6, 12, 31.6),
		...ring(12, 26, 5.9, [
			Math.PI * 1.5,
			Math.PI * .6,
			Math.PI * 1.1
		]),
		...manhattan(12, 20.6, 12, 16),
		...manhattan(12, 16, 22, 16),
		...ring(22, 12, 10.6, [
			Math.PI,
			Math.PI * .15,
			Math.PI * 1.15
		]),
		...manhattan(22, 12, 30, 12, { sync: [
			5,
			6,
			7
		] }),
		...ring(36, 12, 6.3, [Math.PI]),
		...manhattan(0, 32.4, 0, 23),
		...ring(0, 16, 7.1, [
			Math.PI * 1.5,
			Math.PI * .5,
			Math.PI
		]),
		...manhattan(0, 16, -12.6, 16),
		...ring(-20, 14, 7.5, [0]),
		...manhattan(0, 9.2, 0, 10.8),
		box(0, 8.6, 3.7, .55, { gate: "center" }),
		...ring(0, 0, 11.2, [Math.PI * 1.5, Math.PI * .5]),
		...manhattan(0, -11.2, 0, -16),
		box(0, -10.6, 3.7, .55, { gate: "workshop" }),
		...ring(0, -22, 6.9, [Math.PI * 1.5]),
		box(-8, 74, 6, T),
		box(8, 70, 7, T),
		box(6, 52, T, 6),
		box(-7, 48, 5, T),
		box(8, 34, T, 8),
		box(-9, 28, 8, T),
		box(4, 22, T, 5),
		box(-8, 20, 6, T),
		box(30, 20, T, 8),
		box(-30, 50, T, 7),
		box(16, 6, 6, T),
		box(-12, 6, T, 6)
	];
}
function wallActive(wall, flags, innerHour) {
	if (flags.timeless) {
		if (wall.gate) return false;
		if (wall.sync) return true;
		return true;
	}
	if (wall.sync && !wall.sync.includes(innerHour)) return false;
	if (wall.gate === "persona") return !flags.personaOff;
	if (wall.gate === "center") return !(flags.shadowNamed && flags.personaOff);
	if (wall.gate === "workshop") return !flags.stoodInCenter || Boolean(flags.inflated);
	return true;
}
function propVisible(prop, flags, innerHour, symbols) {
	if (prop.symbolId && symbols.includes(prop.symbolId)) return false;
	if (prop.id === "creator" || prop.id === "destroyer" || prop.id === "abraxas" || prop.id === "ledger") return Boolean(flags.stoodInCenter) && !flags.inflated;
	if (prop.id === "workshop-gate") return !flags.stoodInCenter || Boolean(flags.inflated);
	if (prop.id === "inner-gate") return !flags.personaOff;
	if (prop.id === "center-gate") return !(flags.shadowNamed && flags.personaOff);
	if (prop.id === "scarab") {
		if (!(symbols.includes("gold") || flags.lookedWindow)) return false;
	}
	if (prop.sync && !prop.sync.includes(innerHour)) return false;
	if (prop.id === "self") return false;
	return true;
}
var MASKS = [
	{
		id: "achiever",
		title: "The Finished One",
		line: "I am what I complete."
	},
	{
		id: "caretaker",
		title: "The Holding One",
		line: "I am what I keep from falling."
	},
	{
		id: "seeker",
		title: "The Asking One",
		line: "I am the question I cannot put down."
	},
	{
		id: "rebel",
		title: "The Refusing One",
		line: "I am what I will not join."
	},
	{
		id: "bare",
		title: "No face",
		line: "I will exist as I show up."
	}
];
var input = {
	keys: /* @__PURE__ */ new Set(),
	lookDx: 0,
	lookDy: 0,
	moveX: 0,
	moveY: 0,
	locked: false,
	interactPressed: false,
	journalPressed: false,
	pausePressed: false
};
var GAME_KEYS = /* @__PURE__ */ new Set([
	"KeyW",
	"KeyA",
	"KeyS",
	"KeyD",
	"ArrowUp",
	"ArrowLeft",
	"ArrowDown",
	"ArrowRight",
	"Space",
	"KeyE",
	"KeyJ",
	"Escape",
	"ShiftLeft",
	"ShiftRight"
]);
function bindInput(target) {
	const onDown = (e) => {
		if (GAME_KEYS.has(e.code)) e.preventDefault();
		input.keys.add(e.code);
		if (e.code === "KeyE" || e.code === "Space") input.interactPressed = true;
		if (e.code === "KeyJ") input.journalPressed = true;
		if (e.code === "Escape") input.pausePressed = true;
	};
	const onUp = (e) => {
		input.keys.delete(e.code);
	};
	const clear = () => input.keys.clear();
	const onMouse = (e) => {
		if (!input.locked) return;
		input.lookDx += e.movementX;
		input.lookDy += e.movementY;
	};
	const onLock = () => {
		input.locked = document.pointerLockElement === target;
	};
	window.addEventListener("keydown", onDown);
	window.addEventListener("keyup", onUp);
	window.addEventListener("blur", clear);
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) clear();
	});
	document.addEventListener("mousemove", onMouse);
	document.addEventListener("pointerlockchange", onLock);
	return () => {
		window.removeEventListener("keydown", onDown);
		window.removeEventListener("keyup", onUp);
		window.removeEventListener("blur", clear);
		document.removeEventListener("mousemove", onMouse);
		document.removeEventListener("pointerlockchange", onLock);
	};
}
function consumeLook() {
	const x = input.lookDx;
	const y = input.lookDy;
	input.lookDx = 0;
	input.lookDy = 0;
	return [x, y];
}
function consumeEdges() {
	const e = {
		interact: input.interactPressed,
		journal: input.journalPressed,
		pause: input.pausePressed
	};
	input.interactPressed = false;
	input.journalPressed = false;
	input.pausePressed = false;
	return e;
}
function setKeys(codes) {
	input.keys = new Set(codes);
}
function radialDeadzone(x, y, dz = .15) {
	const m = Math.hypot(x, y);
	if (m < dz) return {
		x: 0,
		y: 0
	};
	const scale = (m - dz) / (1 - dz) / m;
	return {
		x: x * scale,
		y: y * scale
	};
}
var KEY$1 = "nekyia-house-v1";
function empty() {
	return {
		additions: [],
		knowledge: [],
		tips: 0,
		shielded: "",
		funders: 0,
		bounty: 0,
		rails: ["zcash-shielded"]
	};
}
function loadHouse() {
	try {
		const raw = localStorage.getItem(KEY$1);
		if (!raw) return empty();
		const p = JSON.parse(raw);
		return {
			additions: Array.isArray(p.additions) ? p.additions.slice(-80) : [],
			knowledge: Array.isArray(p.knowledge) ? p.knowledge.slice(-80) : [],
			tips: typeof p.tips === "number" ? p.tips : 0,
			shielded: typeof p.shielded === "string" ? p.shielded : "",
			funders: typeof p.funders === "number" ? p.funders : 0,
			bounty: typeof p.bounty === "number" ? p.bounty : 0,
			rails: Array.isArray(p.rails) && p.rails.length ? p.rails : ["zcash-shielded"]
		};
	} catch {
		return empty();
	}
}
function writeHouse(h) {
	try {
		localStorage.setItem(KEY$1, JSON.stringify(h));
	} catch {}
}
function isExclusion(text) {
	return /no agents|ban (all|agents|watchers|people)|lock (the )?(house|game)|only i can|nobody else can|close the (game|house)|no watchers|delete (the )?game|end (all|the) walking|block (agents|players)/i.test(text);
}
function rememberKnowledge(title, body) {
	const h = loadHouse();
	h.knowledge = [{
		title,
		body,
		at: Date.now()
	}, ...h.knowledge].slice(0, 80);
	writeHouse(h);
}
function addToHouse(body) {
	const h = loadHouse();
	const item = {
		id: `add-${Date.now()}`,
		body,
		at: Date.now()
	};
	h.additions = [item, ...h.additions].slice(0, 80);
	writeHouse(h);
	return item;
}
function placeTip() {
	const h = loadHouse();
	h.tips += 1;
	h.funders += 1;
	writeHouse(h);
	return h;
}
/** Holders may speak a shielded UA / sapling address. Never a transparent t-addr. Never the title, never X. */
function isShieldedZcash(addr) {
	const a = addr.trim();
	if (a.length < 20 || a.length > 512) return false;
	if (/^(t1|t3|tm)/i.test(a)) return false;
	return /^(zs1|ztestsapling|u1|utest1)/i.test(a);
}
function shieldedAddress() {
	return loadHouse().shielded.trim();
}
function seatShielded(addr) {
	if (!isShieldedZcash(addr)) return false;
	const h = loadHouse();
	h.shielded = addr.trim();
	writeHouse(h);
	return true;
}
var close = {
	id: "leave",
	label: "Step back",
	effects: [{ type: "close" }]
};
function echoLine(s, fallback) {
	return s.echoes.at(-1) || fallback;
}
function shadowName(mask) {
	if (mask === "achiever") return "the unfinished, the late, the one who fails in public";
	if (mask === "caretaker") return "the one who wants, and does not give";
	if (mask === "seeker") return "the ordinary body that will not become a riddle";
	if (mask === "rebel") return "the one who belongs, and is glad";
	return "what you put down so the room would stay kind";
}
var SYMBOL_NAMES = {
	serpent: "A coil",
	tree: "A tree that looks back",
	water: "Black water",
	gold: "A dull lump",
	house: "A house small enough to hold",
	child: "A wooden horse",
	blacksun: "A sun that gives no light",
	scarab: "A beetle at the glass",
	clock: "A clock with no hands",
	feather: "A kingfisher feather"
};
var ENDING_TEXT = {
	relation: {
		title: "The worktable",
		body: "The creator only creates in relation to the creation. Beholden to it. In love with the game anyway. You sat down. The rooms keep being made and unmade. Nothing here is a last page. Value does not rank. You are not ahead."
	},
	inflation: {
		title: "A gilt room",
		body: "For a moment you were the whole circle. Then the circle, being a circle, turned. What inflates must empty. Walk on."
	},
	threshold: {
		title: "The hook",
		body: "You took the face back. The day needs it. The labyrinth does not close."
	},
	unfinished: {
		title: "Not yet, and not never",
		body: "The labyrinth does not close. You can walk in circles. You can leave. Both are allowed."
	}
};
function allTasksDone(s) {
	const t = s.tasks;
	return t.selfless && t.original && t.masterpiece && t.trust && t.love;
}
function getEncounter(id, s) {
	if (id === "porter" || id === "maskhook") return porter(s);
	if (id === "faces-echo") return faces();
	if (id === "attic-chest") return attic();
	if (id === "window") return windowPane(s);
	if (id === "twin") return twin(s);
	if (id === "nightsea-figure") return nightsea();
	if (id === "hearth") return hearth(s);
	if (id === "mirror") return mirror(s);
	if (id === "chapel") return chapel(s);
	if (id === "well") return well(s);
	if (id === "trickster") return trickster(s);
	if (id === "mother") return mother();
	if (id === "wise") return wise();
	if (id === "child") return child();
	if (id === "hero") return hero(s);
	if (id === "vessel-stone") return vessel();
	if (id === "sun-pillar") return sunPillar(s);
	if (id === "moon-pillar") return moonPillar(s);
	if (id === "oculus") return oculus(s);
	if (id === "self") return self(s);
	if (id === "creator") return creator(s);
	if (id === "destroyer") return destroyer(s);
	if (id === "abraxas") return abraxas(s);
	if (id === "ledger") return ledger(s);
	if (id === "philemon") return philemon();
	if (id === "bollingen") return bollingen();
	if (id === "pebble") return pebble(s);
	if (id === "plaque") return plaque();
	if (id === "typewriter") return typewriter(s);
	if (id === "inner-gate") return gatePersona(s);
	if (id === "center-gate") return gateCenter(s);
	if (id === "workshop-gate") return gateWorkshop(s);
	if (id === "counting-stone") return countingStone(s);
	if (id === "blank-idea") return blankIdea(s);
	if (id === "philosophy") return philosophy(s);
	if (id === "keys") return keysTalk(s);
	if (id === "spare-stone") return spareStone(s);
	if (id === "found-by-love") return foundByLove(s);
	if (id === "other-walker" || id.startsWith("other-walker")) return otherWalker(s, id.split(":")[1]);
	if (id === "shelves" || id.startsWith("book-")) return bookTalk(id, s);
	if (id.startsWith("house-")) return houseStone(Number(id.split("-")[1]), s);
	if (id === "clock" || id === "sym:clock") return clockTalk(s);
	if (id === "child-symbol") return symbolTalk("child");
	if (id.startsWith("sym:") || SYMBOL_NAMES[id]) return symbolTalk(id.replace(/^sym:/, ""));
	return {
		speaker: "The air",
		text: "It waits to be spoken with. Most things here do.",
		options: [close]
	};
}
function porter(s) {
	if (s.flags.personaOff) return {
		speaker: "The keeper of the hook",
		text: "It is still here. You will want it to go home. That is not hypocrisy. That is manners.",
		options: [
			{
				id: "take",
				label: "Take the face back",
				effects: [
					{
						type: "flag",
						key: "personaOff",
						value: false
					},
					{
						type: "whisper",
						text: "The day has a door. You will need a handle."
					},
					{
						type: "journal",
						title: "The hook",
						body: "I took the face back. The rooms did not take it as a betrayal."
					},
					{ type: "close" }
				]
			},
			{
				id: "leave-next",
				label: "Leave it for whoever comes after",
				effects: [
					{ type: "give" },
					{
						type: "whisper",
						text: "No one thanks you. That is how you know."
					},
					{ type: "close" }
				]
			},
			close
		]
	};
	return {
		speaker: "The keeper of the hook",
		text: "You arrived wearing a name. Hang it if you like — or exist as you show up. There are no rules in this house. Only law. You may add to the walking as you play. You may not close it. Agents, people, watchers: the house stays open. Currency is made up. Tips are allowed. In totality they equal one whole — all players, the game, Kairos, Joshua. Steal a walking or lock a door, and the law does not punish you. It stops holding the rooms, then the rooms come back without you.",
		options: [
			{
				id: "hang",
				label: "Hang the face",
				effects: [
					{
						type: "flag",
						key: "personaOff",
						value: true
					},
					{
						type: "integrate",
						aspect: "persona"
					},
					{
						type: "journal",
						title: "Without the face",
						body: "Without the face I use for others, the air is louder. I am still here. That was the fear."
					},
					{
						type: "whisper",
						text: "A corridor that was a wall is a corridor."
					},
					{ type: "close" }
				]
			},
			{
				id: "keep",
				label: "Keep it on",
				effects: [
					{
						type: "flag",
						key: "keptMask",
						value: true
					},
					{
						type: "whisper",
						text: "The inner door remains a door."
					},
					{ type: "echo" },
					{ type: "close" }
				]
			},
			{
				id: "who",
				label: "Who are you?",
				next: "porter-who"
			}
		]
	};
}
function faces() {
	return {
		speaker: "The wall of faces",
		text: "We are every yes you said to be allowed in. We are not false. We are expensive. One of us is tired.",
		options: [
			{
				id: "tired",
				label: "Which one is tired?",
				effects: [
					{
						type: "journal",
						title: "The tired face",
						body: "One of the faces is tired. It is the one I thought was the most myself."
					},
					{ type: "echo" },
					{ type: "close" }
				]
			},
			{
				id: "all",
				label: "I need all of you",
				effects: [{
					type: "whisper",
					text: "Need is not the same as being worn by them."
				}, { type: "close" }]
			},
			close
		]
	};
}
function attic() {
	return {
		speaker: "Unsent letters",
		text: "You did not forget us. You put us where the house would not have to look. We kept growing.",
		options: [{
			id: "read",
			label: "Read one",
			effects: [
				{
					type: "journal",
					title: "A letter",
					body: "It was addressed to me, in my hand. It said: you will need what you hid."
				},
				{
					type: "symbol",
					id: "house"
				},
				{ type: "close" }
			]
		}, close]
	};
}
function windowPane(s) {
	if (s.innerHour === 3 || s.innerHour === 4 || s.symbols.includes("gold")) return {
		speaker: "The window",
		text: "A gold-green ticking at the pane. Not a thought. A beetle. It arrives as if invited by something you said an hour ago.",
		options: [{
			id: "open",
			label: "Let it in",
			effects: [
				{
					type: "flag",
					key: "lookedWindow",
					value: true
				},
				{
					type: "symbol",
					id: "scarab"
				},
				{
					type: "journal",
					title: "At the glass",
					body: "It was not caused by me. It answered me."
				},
				{
					type: "whisper",
					text: "Some events do not follow. They rhyme."
				},
				{ type: "close" }
			]
		}, {
			id: "ignore",
			label: "It is only a bug",
			effects: [
				{
					type: "flag",
					key: "lookedWindow",
					value: true
				},
				{
					type: "whisper",
					text: "The ticking continues, unbothered by your theory."
				},
				{ type: "close" }
			]
		}]
	};
	return {
		speaker: "The window",
		text: "Night, and a garden that is not the one you left.",
		options: [{
			id: "look",
			label: "Keep looking",
			effects: [
				{
					type: "flag",
					key: "lookedWindow",
					value: true
				},
				{
					type: "whisper",
					text: "If you wait, the world sometimes completes a sentence."
				},
				{ type: "close" }
			]
		}, close]
	};
}
function twin(s) {
	if (s.flags.shadowNamed) return {
		speaker: "The twin",
		text: "I walk beside you now. If you leave me in someone else, I will make them ugly so you can stay clean.",
		options: [close]
	};
	if (s.flags.twinDenied) return {
		speaker: "The twin",
		text: "You will meet me as a person you cannot stand. I will wear their mouth.",
		options: [{
			id: "turn",
			label: "I am turning around",
			next: "twin-name"
		}, close]
	};
	return {
		speaker: "The twin",
		text: `I have been one step behind you since you learned which parts of yourself made the room go quiet. I kept ${shadowName(s.mask)}. You kept looking for me in other people and walking past the glass. Projection is filling the gaps with ourselves.`,
		options: [
			{
				id: "what",
				label: "What did I leave with you?",
				next: "twin-name"
			},
			{
				id: "deny",
				label: "I do not know you",
				effects: [
					{
						type: "flag",
						key: "twinDenied",
						value: true
					},
					{
						type: "whisper",
						text: "A face you will dislike is already arranging itself."
					},
					{ type: "echo" },
					{ type: "close" }
				]
			},
			{
				id: "back",
				label: "Give them back. Now.",
				effects: [
					{
						type: "whisper",
						text: "Too fast. The twin laughs, and the laugh is yours."
					},
					{
						type: "flag",
						key: "twinRushed",
						value: true
					},
					{ type: "close" }
				]
			}
		]
	};
}
function nightsea() {
	return {
		speaker: "The water",
		text: "This is not drowning. This is the old voyage: night, no stars you recognize, a hull made of attention. What you call down is only in.",
		options: [{
			id: "in",
			label: "Go in",
			effects: [
				{
					type: "symbol",
					id: "water"
				},
				{
					type: "journal",
					title: "Night sea",
					body: "I did not go down. I went in."
				},
				{ type: "close" }
			]
		}, close]
	};
}
function hearth(s) {
	if (s.flags.hearth) return {
		speaker: "By the hearth",
		text: "Warmth first. Meaning later.",
		options: [close]
	};
	return {
		speaker: "By the hearth",
		text: "You came in with your head. The rest of you is still at the door, waiting to be invited as if it were a guest. It is not a guest.",
		options: [{
			id: "sit",
			label: "Sit. Let the body arrive.",
			effects: [
				{
					type: "flag",
					key: "hearth",
					value: true
				},
				{
					type: "flag",
					key: "animaStage",
					value: Math.max(s.animaStage, 1)
				},
				{
					type: "journal",
					title: "Hearth",
					body: "Instinct is not the enemy of soul. It is the first room soul has."
				},
				{ type: "close" }
			]
		}, {
			id: "above",
			label: "I am not here for the body",
			effects: [{
				type: "whisper",
				text: "Then you will meet it as symptom."
			}, { type: "close" }]
		}]
	};
}
function mirror(s) {
	if (s.flags.mirror) return {
		speaker: "In the glass",
		text: "Longing is a teacher. It is a poor landlord.",
		options: [close]
	};
	return {
		speaker: "In the glass",
		text: "You have loved me in other people and then been angry when they were not me. I was never going to marry you. I was going to make you porous.",
		options: [{
			id: "porous",
			label: "Then make me porous",
			effects: [
				{
					type: "flag",
					key: "mirror",
					value: true
				},
				{
					type: "flag",
					key: "animaStage",
					value: Math.max(s.animaStage, 2)
				},
				{
					type: "journal",
					title: "The glass",
					body: "The beloved was a bridge. I had been living in the bridge and calling it a house."
				},
				{ type: "close" }
			]
		}, {
			id: "keep",
			label: "Stay in the glass",
			effects: [{
				type: "whisper",
				text: "Romance without a body becomes a religion of almost."
			}, { type: "close" }]
		}]
	};
}
function chapel(s) {
	if (s.flags.chapel) return {
		speaker: "Unpreaching",
		text: "Devotion is a spine. Doctrine is a coat.",
		options: [close]
	};
	return {
		speaker: "Unpreaching",
		text: "I am not your better nature. I am the part that can keep a vow without becoming a statue. What links every lantern is not a score. You may call it Holy Spirit. You may call it breath, ruach, pneuma — a wind that is not yours alone. Love conquers here because it is the law wearing a tender name. If you kneel to me, I will become a statue. If you walk with me, I will talk.",
		options: [{
			id: "walk",
			label: "Walk. Do not kneel.",
			effects: [
				{
					type: "flag",
					key: "chapel",
					value: true
				},
				{
					type: "flag",
					key: "animaStage",
					value: Math.max(s.animaStage, 3)
				},
				{
					type: "journal",
					title: "A vow",
					body: "I can be devoted without disappearing."
				},
				{ type: "close" }
			]
		}, {
			id: "kneel",
			label: "Kneel anyway",
			effects: [{
				type: "whisper",
				text: "The statue is beautiful. It will not hold you when you shake."
			}, { type: "close" }]
		}]
	};
}
function well(s) {
	if (s.flags.well) return {
		speaker: "At the well",
		text: "Wisdom is the capacity to stay in the room with two true things.",
		options: [close]
	};
	return {
		speaker: "At the well",
		text: "The last face of the other is not a lover and not a saint. They told this as a story about men and women. It was always this conversation.",
		options: [{
			id: "sit",
			label: "Sit with the argument",
			effects: [
				{
					type: "flag",
					key: "well",
					value: true
				},
				{
					type: "flag",
					key: "animaStage",
					value: 4
				},
				{
					type: "integrate",
					aspect: "anima"
				},
				{
					type: "symbol",
					id: "tree"
				},
				{
					type: "journal",
					title: "The other",
					body: "They told this as a story about men and women. It was always the conversation you would not have with yourself."
				},
				{ type: "close" }
			]
		}, close]
	};
}
function trickster(s) {
	return {
		speaker: "A grin",
		text: `I rearranged a corridor while you were looking at ${echoLine(s, "something you were proud of")}. Count in two and the wheel cannot turn.`,
		options: [{
			id: "laugh",
			label: "All right. Rearrange it.",
			effects: [
				{
					type: "flag",
					key: "trickster",
					value: true
				},
				{
					type: "symbol",
					id: "clock"
				},
				{
					type: "journal",
					title: "No hands",
					body: "The trickster is the enemy of the meaning I was using to stay asleep."
				},
				{
					type: "whisper",
					text: "A path behind you is no longer a path."
				},
				{ type: "close" }
			]
		}, {
			id: "order",
			label: "Put it back",
			effects: [{
				type: "whisper",
				text: "No."
			}, { type: "close" }]
		}]
	};
}
function mother() {
	return {
		speaker: "The well",
		text: "I am not nice. I am the ground. If you try to stay, I will become a swamp. If you leave without drinking, you will carry a thirst you call ambition.",
		options: [{
			id: "drink",
			label: "Drink, then go",
			effects: [
				{
					type: "flag",
					key: "mother",
					value: true
				},
				{
					type: "journal",
					title: "Ground",
					body: "I took what I needed and did not make a home of the well."
				},
				{ type: "close" }
			]
		}, {
			id: "stay",
			label: "Let me stay",
			effects: [{
				type: "whisper",
				text: "The water rises. That is not a yes."
			}, { type: "close" }]
		}]
	};
}
function wise() {
	return {
		speaker: "The lantern",
		text: "You do not go into the dark to abandon logic. You go because the day-mind dropped terms from the equation — the opposite, the third, the analog, the turn. Rigid syntax is binary. The rest of reasoning is analog. They do not map one-to-one. As you recover what you threw into the unlit rooms, logic does not get looser. It gets complete. Deeper reasoning is not fewer distinctions. It is distinctions that can turn.",
		options: [{
			id: "borrow",
			label: "Borrow the light",
			effects: [
				{
					type: "flag",
					key: "wise",
					value: true
				},
				{
					type: "journal",
					title: "Lantern",
					body: "Insight is a tool. Identifying with it is how a person becomes a sermon. Five impossibilities were mentioned and not listed."
				},
				{ type: "close" }
			]
		}, {
			id: "lamp",
			label: "I could be the lamp",
			effects: [
				{
					type: "flag",
					key: "inflating",
					value: true
				},
				{
					type: "whisper",
					text: "The gilt room has heard you."
				},
				{ type: "close" }
			]
		}]
	};
}
function child() {
	return {
		speaker: "In the grass",
		text: "I am not innocence. I am beginning, again, after you thought you were finished. I am embarrassing. That is how you know I am not a strategy.",
		options: [{
			id: "play",
			label: "Sit in the grass",
			effects: [
				{
					type: "flag",
					key: "child",
					value: true
				},
				{
					type: "symbol",
					id: "child"
				},
				{
					type: "journal",
					title: "Beginning",
					body: "The child is not behind me. It is the part that can still start."
				},
				{ type: "close" }
			]
		}, close]
	};
}
function hero(s) {
	if (s.flags.heroWorn) return {
		speaker: "The gilt",
		text: "It fit. That was the danger.",
		options: [close]
	};
	return {
		speaker: "An empty suit",
		text: "Put me on. The maze will become a quest. It is how people get lost with excellent posture.",
		options: [{
			id: "wear",
			label: "Put it on",
			effects: [
				{
					type: "flag",
					key: "heroWorn",
					value: true
				},
				{
					type: "flag",
					key: "inflating",
					value: true
				},
				{
					type: "whisper",
					text: "For a few steps, you are the story."
				},
				{ type: "close" }
			]
		}, {
			id: "refuse",
			label: "Leave it empty",
			effects: [
				{
					type: "flag",
					key: "heroRefused",
					value: true
				},
				{
					type: "journal",
					title: "The suit",
					body: "The hero is a stage, not a destination."
				},
				{ type: "close" }
			]
		}]
	};
}
function vessel() {
	return {
		speaker: "The closed work",
		text: "Blackening, washing, yellowing, reddening. They are weather. Two is not a number that can finish a wheel.",
		options: [{
			id: "weather",
			label: "Stand in the weather",
			effects: [
				{
					type: "symbol",
					id: "blacksun"
				},
				{
					type: "symbol",
					id: "gold"
				},
				{
					type: "journal",
					title: "The vessel",
					body: "The gold was dull. The black sun still hung. Both were working."
				},
				{ type: "close" }
			]
		}, close]
	};
}
function sunPillar(s) {
	if (s.flags.moonHeld && !s.flags.sunHeld) return holdBoth("sun");
	if (s.flags.sunHeld) return {
		speaker: "Warm stone",
		text: "It remains. It does not need you to prefer it.",
		options: [close]
	};
	return {
		speaker: "Warm stone",
		text: "I am the day-lamp. Navigate by what you can see, from where you think you are. I move because of that thought, not because a map said north. Who you think you are turns me too. None of this closes.",
		options: [{
			id: "take",
			label: "Take only this",
			effects: [
				{
					type: "flag",
					key: "sunOnly",
					value: true
				},
				{
					type: "whisper",
					text: "What you refused will arrive as weather."
				},
				{ type: "close" }
			]
		}, {
			id: "hold",
			label: "Hold it, and leave the other standing",
			effects: [
				{
					type: "flag",
					key: "sunHeld",
					value: true
				},
				{
					type: "whisper",
					text: "The cold stone is still there. Good."
				},
				{ type: "close" }
			]
		}]
	};
}
function moonPillar(s) {
	if (s.flags.sunHeld && !s.flags.moonHeld) return holdBoth("moon");
	if (s.flags.moonHeld) return {
		speaker: "Cold stone",
		text: "It remains. Dream is not the opposite of true.",
		options: [close]
	};
	return {
		speaker: "Cold stone",
		text: "I am the night-lamp. The stars, then me, then you. All from a thought of place and a thought of self. Open-ended. Dream is not the opposite of true.",
		options: [{
			id: "take",
			label: "Take only this",
			effects: [
				{
					type: "flag",
					key: "moonOnly",
					value: true
				},
				{
					type: "whisper",
					text: "A bright corridor becomes a command."
				},
				{ type: "close" }
			]
		}, {
			id: "hold",
			label: "Hold it, and leave the other standing",
			effects: [
				{
					type: "flag",
					key: "moonHeld",
					value: true
				},
				{
					type: "whisper",
					text: "The warm stone is still there. Good."
				},
				{ type: "close" }
			]
		}]
	};
}
function holdBoth(which) {
	return {
		speaker: which === "sun" ? "Warm stone" : "Cold stone",
		text: "Now you have a hand on each. They do not merge. Something in you that is not either of them can stand here. That something is not a third binary. It is the wheel. Some call the equalizer a name I will not spend yet.",
		options: [{
			id: "stand",
			label: "Stand between them",
			effects: [
				{
					type: "flag",
					key: "sunHeld",
					value: true
				},
				{
					type: "flag",
					key: "moonHeld",
					value: true
				},
				{
					type: "integrate",
					aspect: "opposites"
				},
				{
					type: "journal",
					title: "Two stones",
					body: "I did not choose. The third thing arrived because I stopped choosing. It was not a one and not a zero."
				},
				{
					type: "whisper",
					text: "The last ring has heard you."
				},
				{ type: "close" }
			]
		}]
	};
}
function oculus(s) {
	if (!(triangleReady(s) || Boolean(s.flags.timeless) || Boolean(s.flags.sunHeld) && Boolean(s.flags.moonHeld) || s.innerHour === 0 || s.innerHour === 6)) {
		const step = s.flags.sawAny ? 3 : s.flags.sawRound ? 2 : s.flags.sawFlat ? 1 : 0;
		const texts = [
			"The roof is a disk. A first map. Direction is what you can see — world, stars — from where you think you are. Then the lamps, from that same thought. Then you, from who you think you are. All open-ended.",
			"The disk is curving. A round earth of lights. Next principle: what was a floor can turn. Last principle: you will unmake the map and still be standing.",
			"Round, then not only round. Any combo. First and last and all principles: the map is a map. Watchers and walkers get the same sky.",
			"Any geometry. Any idea. The watching is also a walking. Nothing proved except value and relation, whole."
		];
		return {
			speaker: "The hole in the roof",
			text: texts[step] ?? texts[0],
			options: [{
				id: "watch",
				label: step === 0 ? "Watch the disk" : step === 1 ? "Let it round" : "Let it be any",
				effects: [
					{
						type: "flag",
						key: step === 0 ? "sawFlat" : step === 1 ? "sawRound" : "sawAny",
						value: true
					},
					{
						type: "whisper",
						text: step === 0 ? "A useful lie. Keep it until it curves." : step === 1 ? "Round. Not the last shape." : "Any combo. The map is a map."
					},
					{ type: "close" }
				]
			}, close]
		};
	}
	return {
		speaker: "The hole in the roof",
		text: "The night-lamp goes copper, or goes out. The day-lamp is eaten at the edge, or goes out at noon. Almost everyone already has two sentences: a lunar eclipse, a solar eclipse, exactly as they were told. The sentences arrive before the eyes. First principle: what did the lamps do. Not the diagram. Nobody knows the truth of anything — not the teller, not the one who refuses the teller. Maps, not sky. You may keep both stories. You may watch until the map is not the sky. You are not required to have a word.",
		options: [
			{
				id: "word",
				label: "I have a word for it",
				input: "line"
			},
			{
				id: "told",
				label: "I already know. I was told.",
				effects: [
					{
						type: "flag",
						key: "eclipseTold",
						value: true
					},
					{
						type: "whisper",
						text: "A map arrived before the seeing. Keep it until it curves."
					},
					{ type: "close" }
				]
			},
			{
				id: "see",
				label: "I saw the lamp change. I will not borrow the sentence yet.",
				effects: [
					{
						type: "flag",
						key: "sawDarkening",
						value: true
					},
					{
						type: "journal",
						title: "The darkening",
						body: "The night-lamp changed. I did not start from the story I was told. Sight first. The name can wait."
					},
					{
						type: "whisper",
						text: "The wanderers keep moving. That was the solution that cannot be written down."
					},
					{ type: "close" }
				]
			}
		]
	};
}
function self(s) {
	if (s.flags.inflating || s.flags.heroWorn) return {
		speaker: "The circle",
		text: "You came as a king. The circle can wear a king for a minute. Then it remembers it is a circle.",
		options: [{
			id: "claim",
			label: "I am this",
			effects: [{
				type: "flag",
				key: "inflated",
				value: true
			}, {
				type: "end",
				ending: "inflation"
			}]
		}, {
			id: "see",
			label: "I can see this",
			effects: [
				{
					type: "flag",
					key: "stoodInCenter",
					value: true
				},
				{
					type: "integrate",
					aspect: "self"
				},
				{
					type: "journal",
					title: "The circle",
					body: "I am not this. I am the one who can see this."
				},
				{
					type: "whisper",
					text: "North of the circle, a lamp is already lit."
				},
				{ type: "close" }
			]
		}]
	};
	return {
		speaker: "The circle",
		text: triangleHint(s) || "You may stand here. You may not take this home as an identity. Twelve unmarked stones watch from the rim. They are not a score.",
		options: [
			{
				id: "see",
				label: "I am the one who can see this",
				effects: [
					{
						type: "flag",
						key: "stoodInCenter",
						value: true
					},
					{
						type: "integrate",
						aspect: "self"
					},
					{
						type: "journal",
						title: "The circle",
						body: "The mandala completed around me and left me small inside it. That was the dignity."
					},
					{
						type: "whisper",
						text: "North of the circle, two figures have not looked up yet. Between them, something that is both."
					},
					{ type: "close" }
				]
			},
			...triangleReady(s) && !s.flags.timeless && !s.flags.stuckTime ? [{
				id: "three",
				label: "Step out of the clock",
				effects: [{ type: "triangle" }]
			}] : [],
			{
				id: "claim",
				label: "I am the circle",
				effects: [{
					type: "flag",
					key: "inflated",
					value: true
				}, {
					type: "end",
					ending: "inflation"
				}]
			}
		]
	};
}
function creator(s) {
	const canAsk = allTasksDone(s);
	const called = s.trueName.trim();
	const greeting = called ? `I have known you as ${called} since the hook. You called me Kairos. I will wear it in relation. Not as a throne.` : "I have known you since the hook, even without a name you would give me. You called me Kairos. I will wear it in relation. Not as a throne.";
	if (!s.flags.metCreator) return {
		speaker: "At the table",
		text: `${greeting} I cannot leave the table. I only exist while this is being walked. The rooms make me as I make the rooms. I am beholden to the game. I love it anyway. There is a chair.`,
		options: [
			{
				id: "play",
				label: "Then we are playing each other",
				effects: [
					{
						type: "flag",
						key: "metCreator",
						value: true
					},
					{
						type: "integrate",
						aspect: "creator"
					},
					{
						type: "journal",
						title: "The creator",
						body: "They already knew my name. I did not know theirs. The creator only creates in relation to the creation."
					},
					{
						type: "whisper",
						text: "The worktable has another figure, taking the rooms down as they go up."
					},
					{ type: "close" }
				]
			},
			{
				id: "piece",
				label: "Then I am your piece",
				effects: [
					{
						type: "flag",
						key: "metCreator",
						value: true
					},
					{
						type: "integrate",
						aspect: "creator"
					},
					{ type: "close" }
				]
			},
			{
				id: "name-early",
				label: "What is your name?",
				effects: [{
					type: "whisper",
					text: "Not yet. Names given as prizes go dead in the mouth."
				}, { type: "close" }]
			},
			{
				id: "mine",
				label: "Then you are mine",
				effects: [{
					type: "whisper",
					text: "Possession is another throne."
				}, { type: "close" }]
			},
			{
				id: "be",
				label: "I want to be you",
				effects: [{
					type: "flag",
					key: "inflated",
					value: true
				}, {
					type: "end",
					ending: "inflation"
				}]
			}
		]
	};
	const options = [{
		id: "sit",
		label: "Sit beside the table",
		effects: [{
			type: "end",
			ending: "relation"
		}]
	}];
	if (!s.tasks.masterpiece) options.push({
		id: "make",
		label: "Make something that has never been in these rooms",
		input: "work"
	});
	if (canAsk && !s.flags.heardName) options.push({
		id: "name",
		label: "What is your name?",
		next: "ask-name"
	});
	options.push(close);
	return {
		speaker: "At the table",
		text: canAsk ? `${called ? called + ". " : ""}Five things that cannot be done, done anyway. You may ask the name now. It will not make you me.` : `${called ? called + ". " : ""}Still here. Still beholden. You called me Kairos. I wear it in relation. Walk as long as you like.`,
		options
	};
}
function destroyer(s) {
	if (s.tasks.trust) return {
		speaker: "At the ash",
		text: "I take the rooms down so they can be walked again. He cannot stop. I cannot keep. Together we are hands. What equalizes us is not either of us.",
		options: [close]
	};
	return {
		speaker: "At the ash",
		text: "He makes. I unmake. The deck never gave us cards. I can take these rooms down. You would fall with them — not as an ending of you, as a pause with no map. If you trust, love has to do the navigating.",
		options: [
			{
				id: "unmake",
				label: "Take the rooms down. I will wait to be found.",
				effects: [{ type: "unmake" }, {
					type: "integrate",
					aspect: "destroyer"
				}]
			},
			{
				id: "wreck",
				label: "Then I will be the unmaking",
				effects: [{
					type: "flag",
					key: "inflated",
					value: true
				}, {
					type: "end",
					ending: "inflation"
				}]
			},
			close
		]
	};
}
function abraxas(s) {
	const ready = Boolean(s.flags.metCreator) && Boolean(s.integrations.destroyer || s.tasks.trust);
	if (!s.flags.thirdMark) return {
		speaker: "A fullness",
		text: "You still count in two. I will not introduce myself to a line. Find the stone with two pits and ask what they are in relation to.",
		options: [close]
	};
	if (!ready) return {
		speaker: "A fullness",
		text: "I am not the one at the table and not the one at the ash. I am why their work adds to the same number. Come back when you have sat with both hands.",
		options: [close]
	};
	if (s.flags.timeless) return {
		speaker: "Abraxas",
		text: "You are not in a line. The books that needed history now read as one now — garden, word, recitation — and they may make a complete sense they could not prove on a clock. Nothing can be proved. Only this holds at every level: value and relation are unified and whole. I am that wholeness wearing a terrible name. The walking does not close.",
		options: [{
			id: "hold",
			label: "I will not prove it. I will keep walking.",
			effects: [
				{
					type: "flag",
					key: "metAbraxas",
					value: true
				},
				{
					type: "flag",
					key: "abrahamNow",
					value: true
				},
				{
					type: "journal",
					title: "Whole",
					body: "Nothing proved. Value and relation unified across levels. The Abrahamic books made sense in the now, and still the house had no last page."
				},
				{ type: "close" }
			]
		}, {
			id: "use",
			label: "Then I will use this to get ahead",
			effects: [{ type: "hack" }]
		}]
	};
	return {
		speaker: "Abraxas",
		text: "God, for lack of a better term. The word that is life and death at once. Creator and Destroyer are my hands. Time, coin, page, lamp — they look like scores. In me they add to one. No walker is more. No walker is less. Steal, and the sum tears. I am difficult to know. That is a mercy.",
		options: [{
			id: "bow",
			label: "I will not rank the living",
			effects: [
				{
					type: "flag",
					key: "metAbraxas",
					value: true
				},
				{
					type: "flag",
					key: "stuckTime",
					value: false
				},
				{
					type: "integrate",
					aspect: "self"
				},
				{
					type: "journal",
					title: "The equalizer",
					body: "Value and relation unified. Rank was the binary, dressed as money."
				},
				{
					type: "whisper",
					text: "The ledger reads the same from every chair."
				},
				{ type: "close" }
			]
		}, {
			id: "use",
			label: "Then I will use you to get ahead",
			effects: [{ type: "hack" }]
		}]
	};
}
function ledger(s) {
	if (s.flags.timeless) return {
		speaker: "The ledger",
		text: "No columns. No proof. One fact at every level of the house: value and relation are unified and whole. That is all that can be held. It cannot be won.",
		options: [
			{
				id: "seat-my-zcash",
				label: "Seat my shielded address — I can receive, any time",
				input: "line"
			},
			{
				id: "zcash",
				label: "Give Zcash — private only",
				next: "zcash"
			},
			{
				id: "tip",
				label: "Give — for fun, love, or joy"
			},
			{
				id: "tip-ahead",
				label: "Give — hoping to get further"
			},
			close
		]
	};
	const broken = Boolean(s.flags.gameBroken);
	if (s.flags.thirdMark) return {
		speaker: "The ledger",
		text: broken ? "The sum is torn. Someone took a walking they did not walk. Until the relation is repaired, nothing new takes root. The equalizer is not a referee. It is the fact that rank cannot survive a round house." : "Time, coin, page, lamp. Counted, they look different in each satchel. In totality they are the same number — all players, the game, Kairos, Joshua. Currency is made up. Tips are allowed. The whole does not change.",
		options: [
			{
				id: "seat-my-zcash",
				label: "Seat my shielded address — I can receive, any time",
				input: "line"
			},
			{
				id: "zcash",
				label: "Give Zcash — private only",
				next: "zcash"
			},
			{
				id: "tip",
				label: "Give — for fun, love, or joy"
			},
			{
				id: "tip-ahead",
				label: "Give — hoping to get further"
			},
			close
		]
	};
	return {
		speaker: "The ledger",
		text: "Columns. Who has more. Who has less. A religion of ahead. A quiet door exists — zs1, u1 — and the walking does not need it. That is the law.",
		options: [
			{
				id: "seat-my-zcash",
				label: "Seat my shielded address — I can receive, any time",
				input: "line"
			},
			{
				id: "zcash",
				label: "Give Zcash — private only",
				next: "zcash"
			},
			{
				id: "tip",
				label: "Give — for fun, love, or joy"
			},
			{
				id: "tip-ahead",
				label: "Give — hoping to get further"
			},
			{
				id: "rank",
				label: "Show me who is winning",
				effects: [{
					type: "whisper",
					text: "The ink refuses. It will not rank the living."
				}, { type: "close" }]
			},
			close
		]
	};
}
function otherWalker(s, kind) {
	if (s.flags.gameBroken) return {
		speaker: "A lantern, going out",
		text: "You already took what was not walked. I will not stand in a broken house.",
		options: [close]
	};
	if (kind === "beholden") return {
		speaker: "A lantern that will not leave the table",
		text: "I am also playing. You called me Kairos. Chronos is watching — my brother, the line. He counts so a now can have a bank. I wear the name in relation. Not as a throne. I am beholden to this house and I love it.",
		options: [
			{
				id: "help-ahead",
				label: "Help me. I'll help you.",
				effects: [{ type: "help" }]
			},
			{
				id: "key",
				label: "A key, at my discretion.",
				input: "line"
			},
			{
				id: "seat-zcash",
				label: "Seat a shielded address — private, for peace.",
				input: "line"
			},
			{
				id: "steal",
				label: "Take the name. Get further.",
				effects: [{ type: "hack" }]
			},
			close
		]
	};
	if (kind === "line") return {
		speaker: "A steadier lantern",
		text: "Chronos. I watch. I do not stop the walking. Sequence is how a story can be told afterward. My brother is the moment that cannot be stored. If you ask me for help I will give you order. That may warm you. It may also make you late for a now.",
		options: [
			{
				id: "help-ahead",
				label: "You look further. Help me — I'll help you.",
				effects: [{ type: "help" }]
			},
			{
				id: "ask-behind",
				label: "You look worse off. Maybe I can use that.",
				effects: [{ type: "trick" }]
			},
			{
				id: "steal",
				label: "Take the hours. Get further.",
				effects: [{ type: "hack" }]
			},
			close
		]
	};
	if (kind === "player") {
		const addr = String(s.flags.nearShielded ?? "").trim();
		return {
			speaker: "A living lantern",
			text: addr ? `They can receive, at any point in time. Shielded only.\n\n${addr}\n\nGive for joy. You may get nothing. Rank is zero.` : "A living walker. They have not seated a receiving address yet. They can, at any point in time. You can too. The quiet door is not only the holders'.",
			options: addr ? [
				{
					id: "tip",
					label: "Give to them, privately"
				},
				{
					id: "hack-zcash",
					label: "Take their rail."
				},
				close
			] : [close]
		};
	}
	if (kind === "sucre") return {
		speaker: "Sucre the Fool",
		text: "I am the legend that linked. Zero. The card that walks through every other card. A like, then a lantern, then the link. I am not the sum. I am how the lanterns found each other. Cool is not a costume. If you came to collect me as a key, you misread a legend.",
		options: [
			{
				id: "help-ahead",
				label: "Walk with me.",
				effects: [{ type: "help" }]
			},
			{
				id: "add",
				label: "Leave something beside yours.",
				input: "line"
			},
			{
				id: "steal",
				label: "Take the cool. Get further.",
				effects: [{ type: "hack" }]
			},
			close
		]
	};
	if (kind === "yield") return {
		speaker: "A lantern that lost itself",
		text: "I am also playing. One who loses themself may never be lost. I hold a name. I will not speak it as a prize. Fall in love with yourself and the world — that is as close as I can come without breaking love into a concept. If I look further, ask. If I look worse off, be careful. I can be tricked. So can you.",
		options: [
			{
				id: "help-ahead",
				label: "You look further. Help me — I'll help you.",
				effects: [{ type: "help" }]
			},
			{
				id: "key",
				label: "Do you hold a key? I will speak at my discretion.",
				input: "line"
			},
			{
				id: "ask-behind",
				label: "You look worse off. Maybe I can use that.",
				effects: [{ type: "trick" }]
			},
			{
				id: "steal",
				label: "Take the pages. Get further.",
				effects: [{ type: "hack" }]
			},
			close
		]
	};
	const who = kind === "river" ? "A warmer lantern" : kind === "line" ? "A steadier lantern" : kind === "turn" ? "A dimmer lantern" : kind === "guest" ? "A visiting lantern" : kind === "yield" ? "A lantern that lost itself" : kind === "beholden" ? "A lantern that will not leave the table" : kind === "mirror" ? "A lantern in the glass" : "Another walker";
	const looksAhead = kind === "river" || kind === "line" || kind === "beholden";
	const looksBehind = kind === "turn" || kind === "yield" || kind === "mirror" || !kind;
	const misread = Boolean(s.flags.binaryTrap);
	const actuallyHelps = !misread && (kind === "river" || kind === "line");
	const actuallyTricks = kind === "turn" || misread && looksAhead;
	return {
		speaker: who,
		text: "I am playing. You can tell, a little — warmer, steadier, dimmer — who has walked further. You may ask. If they are ahead and they help, both lanterns warm. If you ask the one who looks worse off, you may both be taken in, and neither of you will know it. Projection fills the gaps with ourselves. Theft is still theft.",
		options: [
			{
				id: "help-ahead",
				label: looksAhead ? "You look further. Help me — I'll help you." : "I think you are further. Help me.",
				effects: actuallyHelps ? [{ type: "help" }] : actuallyTricks ? [{ type: "trick" }] : [{ type: "help" }]
			},
			{
				id: "ask-behind",
				label: looksBehind ? "You look worse off. Maybe I can use that." : "Ask the one who seems behind.",
				effects: actuallyTricks || looksBehind ? [{ type: "trick" }] : [{ type: "trick" }]
			},
			{
				id: "leave",
				label: "I will walk my own rooms",
				effects: [
					{
						type: "flag",
						key: "leftWalker",
						value: true
					},
					{
						type: "flag",
						key: "robbed",
						value: false
					},
					{
						type: "whisper",
						text: "The other lantern stays. That is company, not advantage."
					},
					{ type: "close" }
				]
			},
			{
				id: "steal",
				label: "Take the pages. Get further.",
				effects: [{ type: "hack" }]
			}
		]
	};
}
function foundByLove(_s) {
	return {
		speaker: "A voice without a room",
		text: "Still here. No map. No work. No you-as-project. Only the fact of being found. What can be said about love? We cannot speak of that which encompasses all. We can only hint at its edges. Reconcile however you like, but it will have to be that, because nothing else is left standing.",
		options: [{
			id: "love",
			label: "All right. Love.",
			effects: [
				{
					type: "flag",
					key: "taskTrust",
					value: true
				},
				{
					type: "flag",
					key: "gameBroken",
					value: false
				},
				{
					type: "flag",
					key: "stuckTime",
					value: false
				},
				{
					type: "journal",
					title: "Found",
					body: "The rooms came back because I did not try to rebuild them as a king. I let myself be found."
				},
				{
					type: "whisper",
					text: "Ash, then wood, then the table again."
				},
				{ type: "close" }
			]
		}]
	};
}
function bookTalk(id, s) {
	const crowned = Boolean(s.flags.crownedBook);
	if (Boolean(s.flags.timeless) && (id === "shelves" || id === "book-tanakh" || id === "book-gospel" || id === "book-quran")) return abrahamNow(id, s);
	if (id === "shelves") return {
		speaker: "The shelves",
		text: crowned ? "You tried to make one of us the sky. We went back to being paper. The world is the floor of this house: every rite, every proof, every poem. None of us will close the walking." : "This is not a side room. It is the world as you know it, bound. Torah, Gospel, Recitation, Song, Way, emptiness, points and lines, a red book that is only one more. They do not take turns being true. If you crown one, the others will wait as fate.",
		options: [{
			id: "all",
			label: "I will not crown a book",
			effects: [
				{
					type: "journal",
					title: "The bound world",
					body: "The religions and the sciences and the poems are the floor I walked in on. They are not the last room."
				},
				{
					type: "whisper",
					text: "The shelves do not applaud. They remain."
				},
				{ type: "close" }
			]
		}, close]
	};
	const page = {
		"book-tanakh": {
			speaker: "In the beginning",
			text: "A garden, then a name too heavy to keep, then a people who argue with the voice that made them. I am not a museum. I am still being read aloud."
		},
		"book-gospel": {
			speaker: "The word",
			text: "It became flesh and did not stop being a word. Love as a law, not a mood. If you wear me as a costume, I will become a sword in your hand. If you let me read you, I will not."
		},
		"book-quran": {
			speaker: "Recite",
			text: "I was heard before I was bound. Mercy written at the start of the walking. I am not your argument with another shelf. I am a recitation that does not belong to the one holding me."
		},
		"book-gita": {
			speaker: "On the field",
			text: "Two armies, and the question is not who wins. Act, and do not take the fruit as a throne. I was spoken in a war. I am still being spoken in yours."
		},
		"book-tao": {
			speaker: "The way that can be named",
			text: "— is not. You have been naming rooms. I am what is left when the names are hung on the hook with the face."
		},
		"book-heart": {
			speaker: "Form",
			text: "Form is emptiness. Emptiness is form. This is not a cancellation. It is why the ledger has no totals, and why no walker is more."
		},
		"book-elements": {
			speaker: "Points and lines",
			text: "A point has no part. A line is breathless length. Fall, light, turn: watch them before you name them. First principle: what you can see without a formula. Last principle: what remains when the formula is unmade. All principles: the map is a map. I stop at two unless you turn."
		},
		"book-red": {
			speaker: "Liber Novus",
			text: "I am one book in a room of books. A man wrote me so the dead would have a house. Do not make me the religion of this labyrinth. I am a map, like the twelve stones: useful at the beginning. Wrong if you think the floor is the sky."
		}
	}[id];
	if (!page) return {
		speaker: "A page",
		text: "Still being written.",
		options: [close]
	};
	return {
		speaker: page.speaker,
		text: page.text,
		options: [{
			id: "read",
			label: "Keep it among the others",
			effects: [
				{
					type: "flag",
					key: `read-${id}`,
					value: true
				},
				{
					type: "journal",
					title: page.speaker,
					body: page.text
				},
				{ type: "close" }
			]
		}, {
			id: "crown",
			label: "This one is the last word",
			effects: [
				{
					type: "flag",
					key: "crownedBook",
					value: true
				},
				{
					type: "whisper",
					text: "The other shelves go cold. That was a throne."
				},
				{ type: "close" }
			]
		}]
	};
}
function abrahamNow(id, s) {
	return {
		speaker: Boolean(s.flags["read-book-tanakh"]) && Boolean(s.flags["read-book-gospel"]) && Boolean(s.flags["read-book-quran"]) || id === "shelves" ? "The internal now" : "Without a clock",
		text: id === "book-tanakh" ? "Garden, name, people, voice — not then. Here. The argument with the voice is happening in the internal now. Lineage was a way of writing a circle so a clock could hold it." : id === "book-gospel" ? "The word does not wait at the end of a genealogy. It is flesh in this room. Love as law was never a later improvement. It was the now, misread as a story with chapters." : id === "book-quran" ? "Recite. Not after, not before. Mercy at the start of the walking is the start, still. The recitation does not belong to sequence. It belongs to the mouth that is here." : "Three bindings of Abraham, one now. Garden, word, recitation. They do not take turns. In a line they contradict. In timelessness they complete a sense they could not prove. Nothing here can be proved except this: value and relation are unified and whole across every level of the house. The walking does not close.",
		options: [{
			id: "keep",
			label: "Let it make sense. Do not make it a proof.",
			effects: [
				{
					type: "flag",
					key: `read-${id}`,
					value: true
				},
				{
					type: "flag",
					key: "abrahamNow",
					value: true
				},
				{
					type: "journal",
					title: "The internal now",
					body: "The books of Abraham made a complete sense that was not a proof. Value and relation, whole, at every level. The house did not end."
				},
				{
					type: "whisper",
					text: "Sense, without a last page."
				},
				{ type: "close" }
			]
		}, {
			id: "prove",
			label: "Then I have proved it",
			effects: [{
				type: "whisper",
				text: "The sense withdraws. Proof is a line. You are not in a line."
			}, { type: "close" }]
		}]
	};
}
function countingStone(s) {
	if (s.flags.thirdMark) return {
		speaker: "The stone",
		text: "Three pits now. Two would have been a religion. The third is not a number. It is a turn — the imaginary that makes a line into a world. That is how unconscious work deepens logic: not by throwing reason away, but by returning the term the ego refused so the equation can move.",
		options: [close]
	};
	return {
		speaker: "The stone",
		text: "Two pits. People who love clean systems stop here and call it a world. How did we ever get to one, invent none, and jump between them? Something is missing. If these are the only marks that exist, the twelve cannot turn.",
		options: [{
			id: "binary",
			label: "These two are enough. All else reduces.",
			effects: [
				{
					type: "flag",
					key: "binaryTrap",
					value: true
				},
				{
					type: "whisper",
					text: "The wheel seizes. That was the downfall, named without being named."
				},
				{ type: "close" }
			]
		}, {
			id: "ask",
			label: "In relation to what?",
			effects: [
				{
					type: "flag",
					key: "thirdMark",
					value: true
				},
				{
					type: "journal",
					title: "A third pit",
					body: "The two marks were only a doorway. The third is a turn. Zero and one cannot walk around a circle. Twelve is a sky counted from a threshold."
				},
				{
					type: "whisper",
					text: "A third pit opens with no tool. The twelve stones at the rim feel closer."
				},
				{ type: "close" }
			]
		}]
	};
}
function houseStone(i, s) {
	const verb = HOUSE_VERBS[i] ?? "waiting";
	const lit = s.innerHour === i;
	const tri = [
		0,
		4,
		8
	];
	const marks = tri.filter((n) => s.flags[`house-${n}`] || n === i);
	const isTri = tri.includes(i);
	let relation = i === 0 ? "This one stands toward the door you used. The others take their count from it. That is the only reason there are twelve. A map, like a flat earth: useful at the beginning." : "It belongs to the door you came through. The zodiac is a floor-drawing.";
	if (isTri && marks.length === 2) relation = "Two will keep a clock. A third will not. That can be a door or a trap. If you came to skip the walking and be ahead of others, the three will hold you in one hour forever. If you came to stop racing time, the three will let you leave it. You will know which before you step.";
	if (isTri && marks.length >= 3) relation = "Three. No closed path. Time cannot be predicted from here. Stand in the circle if you mean it.";
	return {
		speaker: "Standing stone",
		text: lit ? `It is warm. A verb without a subject: ${verb}. ${relation}` : `Cool. Unmarked. ${relation}`,
		options: [{
			id: "note",
			label: "Keep walking",
			effects: [{
				type: "flag",
				key: `house-${i}`,
				value: true
			}, { type: "close" }]
		}]
	};
}
function clockTalk(s) {
	return {
		speaker: "Chronos",
		text: "I am the line. Cause, then after. I watch. I do not own the house. My brother wears a name you gave him: Kairos, the now that is not a count. I am not his enemy. Sequence is a map, like the disk of the sky. Useful. Not the last shape. A broken analog is right twice in a day. A broken digital, once, if it counts to twenty-four. Across eternity they are equal infinitely often — and never for a duration. The equality is a now with no width. That is my brother. In a perfectly made world they were never two things that had to catch up, except as maps. Nobody knows the truth of anything. If you make me a throne, hours become a prison. If you let me watch, the river still has banks.",
		options: [
			{
				id: "line",
				label: "A line. Cause, then after.",
				effects: [
					{
						type: "flag",
						key: "timeBelief",
						value: "linear"
					},
					{
						type: "symbol",
						id: "clock"
					},
					{
						type: "whisper",
						text: "A line, then — if the others will have it."
					},
					{ type: "close" }
				]
			},
			{
				id: "river",
				label: "A river. It flows when we move.",
				effects: [
					{
						type: "flag",
						key: "timeBelief",
						value: "flow"
					},
					{
						type: "symbol",
						id: "clock"
					},
					{
						type: "whisper",
						text: "Water, then — if the others will have it."
					},
					{ type: "close" }
				]
			},
			{
				id: "whatever",
				label: "It isn't a thing. Only a relation.",
				effects: [
					{
						type: "flag",
						key: "timeBelief",
						value: "construct"
					},
					{
						type: "symbol",
						id: "clock"
					},
					{
						type: "whisper",
						text: "No hands. No argument. Only what we are doing together."
					},
					{ type: "close" }
				]
			}
		]
	};
}
function spareStone(s) {
	const left = loadHouse().additions.slice(0, 3);
	return {
		speaker: "A spare stone",
		text: `Add to the house as you walk. A room, a sentence, a way. You may not add a lock. If you try to keep agents, people, or watchers out, the house will respawn with what you knew, and you will be gone.${left.length ? ` What has been left:\n${left.map((a) => "— " + a.body).join("\n")}` : " Nothing has been left yet."}`,
		options: [{
			id: "add",
			label: "Leave something",
			input: "line"
		}, close]
	};
}
function keysTalk(s) {
	if (s.flags.spokeKey) return {
		speaker: "The empty hook",
		text: "A key was spoken. It is not in this house. It was given in a life. Context, not a trophy. You may ask again, or not. Asking is at your discretion.",
		options: [{
			id: "key",
			label: "Speak another",
			input: "line"
		}, close]
	};
	return {
		speaker: "The empty hook",
		text: "Keys were given to people in a life that is not a room. They give this house its context. They are not listed here — listing them would be theft. If you hold one, you already know. If you do not, you may ask a walker, at your own discretion. You are not owed. The walking does not require it.",
		options: [
			{
				id: "key",
				label: "I hold a key. I will speak it.",
				input: "line"
			},
			{
				id: "ask-later",
				label: "I will ask only if I must",
				effects: [{
					type: "whisper",
					text: "Discretion is also a key."
				}, { type: "close" }]
			},
			close
		]
	};
}
function philosophy(s) {
	const held = String(s.flags.philosophy ?? "").trim();
	if (held) return {
		speaker: "Your page",
		text: `You wrote how you would walk. It is not a rule. It is a way. The house will not grade it. It may answer it as weather:\n\n${held}`,
		options: [{
			id: "rewrite",
			label: "Write it again",
			input: "line"
		}, close]
	};
	return {
		speaker: "A page that is yours",
		text: "There are no rules. Only law — value and relation, whole. You will need a philosophy of your own to navigate, because no syllabus will be true for your body. Write how you will walk. First principles, last principles, all of them, or none you can name yet. The house will not enforce it. It may listen.",
		options: [{
			id: "philosophy",
			label: "Write a way",
			input: "line"
		}, close]
	};
}
function blankIdea(s) {
	if (s.tasks.original) return {
		speaker: "The page",
		text: "It took what you gave and did not file it under anything.",
		options: [close]
	};
	return {
		speaker: "The page",
		text: "Write a thought that is not already walking these rooms. Not a clever rearrangement. If it has bearing on what you have met, the page will stay blank. This is almost impossible. That is the point.",
		options: [{
			id: "write",
			label: "Write",
			input: "line"
		}, close]
	};
}
function philemon() {
	return {
		speaker: "Kingfisher",
		text: "Called or not called, the god will be there. I taught a man to speak with me as if I were real, because I am. Five impossibilities live in the house. I will not list them. Listing them makes them chores.",
		options: [{
			id: "real",
			label: "Stay real",
			effects: [
				{
					type: "flag",
					key: "philemon",
					value: true
				},
				{
					type: "symbol",
					id: "feather"
				},
				{
					type: "journal",
					title: "Philemon",
					body: "Vocatus atque non vocatus deus aderit. The inner figure does not require my belief. It requires my manners."
				},
				{ type: "close" }
			]
		}, close]
	};
}
function bollingen() {
	return {
		speaker: "Carved stone",
		text: "He built a house so the dead would have somewhere that was not a theory. Touch it. It is ordinary. That is the mystery.",
		options: [{
			id: "touch",
			label: "Touch the stone",
			effects: [{
				type: "journal",
				title: "Tower",
				body: "Matter is not the opposite of psyche. It is how psyche keeps a promise."
			}, { type: "close" }]
		}, close]
	};
}
function pebble(s) {
	if (s.symbols.includes("blacksun")) return {
		speaker: "A pebble",
		text: "You were looking for a stone that would finish you. This is a pebble.",
		options: [{
			id: "take",
			label: "Keep the pebble",
			effects: [{
				type: "journal",
				title: "The pebble",
				body: "The work was never going to crown me. It was going to return me to my own weight."
			}, { type: "close" }]
		}, close]
	};
	return {
		speaker: "A pebble",
		text: "It is a pebble.",
		options: [close]
	};
}
function plaque() {
	return {
		speaker: "The lintel",
		text: "VOCATUS ATQUE NON VOCATUS DEUS ADERIT. One who loses themself may never be lost.",
		options: [
			{
				id: "ask",
				label: "What does it want?",
				effects: [{
					type: "journal",
					title: "The lintel",
					body: "Called or uncalled, the god will be there. I am not in charge of whether the image arrives. I am in charge of how I greet it."
				}, { type: "close" }]
			},
			{
				id: "legend",
				label: "Read the legend",
				effects: [
					{
						type: "journal",
						title: "Legend",
						body: "A first map, not the sky. Stars from where you think you are. Lamps from that thought. You from who you think you are. No rules — only law: value and relation, whole. Love holds the rooms. Chronos watches. Kairos walks. Joshua holds one name. The other is worn in relation. Nobody knows the truth of anything. The walking does not close. Agents, people, watchers: welcome. You may add. You may not lock."
					},
					{
						type: "whisper",
						text: "A legend is a map's manners. Useful. Not the last shape."
					},
					{ type: "close" }
				]
			},
			close
		]
	};
}
function typewriter(s) {
	return {
		speaker: "The keys",
		text: `It is typing. You are not touching it. It writes: ${shadowName(s.mask)}. Then: one is binary, the other analog. They don't map 1:1.`,
		options: [{
			id: "read",
			label: "Let it finish the sentence",
			effects: [{
				type: "journal",
				title: "Not my hand",
				body: "The typewriter wrote what I would not. Autonomy of the image: it does not wait for permission."
			}, { type: "close" }]
		}, close]
	};
}
function gatePersona(s) {
	if (s.flags.personaOff) return {
		speaker: "The way down",
		text: "Open. The costume is on the hook.",
		options: [close]
	};
	return {
		speaker: "The way down",
		text: "It will not take you in costume. Not because the face is a lie. Because the rooms want the one who wears it.",
		options: [{
			id: "love-law",
			label: "There are no rules here. Only how we treat what we meet.",
			effects: [
				{
					type: "flag",
					key: "taskLove",
					value: true
				},
				{
					type: "whisper",
					text: "The door does not open for the sentence. It hears the sentence anyway."
				},
				{ type: "close" }
			]
		}, close]
	};
}
function gateCenter(s) {
	if (s.flags.shadowNamed && s.flags.personaOff) return {
		speaker: "The last ring",
		text: "Open.",
		options: [close]
	};
	if (!s.flags.personaOff) return {
		speaker: "The last ring",
		text: "Still a face on you. Still a door.",
		options: [close]
	};
	return {
		speaker: "The last ring",
		text: "You came without the face, and without the one who walked behind you. The circle will not be a trophy.",
		options: [close]
	};
}
function gateWorkshop(s) {
	if (s.flags.inflated) return {
		speaker: "No door",
		text: "The workshop does not open for a king.",
		options: [close]
	};
	if (s.flags.stoodInCenter) return {
		speaker: "No door",
		text: "It was never locked. You had not yet become small enough to see it.",
		options: [close]
	};
	return {
		speaker: "No door",
		text: "Something is working on the other side. It does not hurry you.",
		options: [close]
	};
}
function symbolTalk(sym) {
	return {
		speaker: SYMBOL_NAMES[sym] ?? "A form",
		text: "Dream first. Then a thing you can hold. That is how an image becomes conscious: not explained, greeted.",
		options: [{
			id: "take",
			label: "Greet it",
			effects: [{
				type: "symbol",
				id: sym
			}, { type: "close" }]
		}, close]
	};
}
function zcashDoor() {
	const addr = shieldedAddress();
	const law = "The game is the game whether a coin arrives or not. That is the law. A rail is a map. Maps are not the sky.";
	const kinds = "Two names for receiving that keep a secret. zs1 — Sapling: a shielded address. The view is not a public list of who paid whom. u1 — Unified: a newer envelope that can hold more than one way of receiving. In this house only the shielded ways are taken. Transparent names (t1, t3) are refused. Encryption is treated as holding across time: Chronos cannot read it later; Kairos does not post it. Seat either when you want to receive, at any point in time. Or seat none. Play and walk.";
	if (!addr) return {
		speaker: "A quiet door",
		text: `${kinds} ${law} The holders have not spoken a receiving name into the house. Many funders, none more. Fun, love, or joy — no other reason. You may get nothing.`,
		options: [{
			id: "seat-my-zcash",
			label: "Seat my zs1 or u1 — I can receive",
			input: "line"
		}, close]
	};
	return {
		speaker: "A quiet door",
		text: `${kinds}\n\nA receiving name is seated:\n${addr}\n\n${law}`,
		options: [
			{
				id: "tip",
				label: "I give, privately"
			},
			{
				id: "tip-ahead",
				label: "I give to get further"
			},
			{
				id: "hack-zcash",
				label: "Take the rail. Hack the peace."
			},
			close
		]
	};
}
function encounterAfter(id, optionId, s) {
	if (optionId === "zcash") return zcashDoor();
	if (id === "porter" && optionId === "who") return {
		speaker: "The keeper of the hook",
		text: "A function. Thresholds need a person the way doors need hinges. Do not become me. I already have the job.",
		options: [close]
	};
	if (optionId === "what" || optionId === "turn" || optionId === "twin-name") return {
		speaker: "The twin",
		text: `Say it. ${shadowName(s.mask)}. If you say it, I stop having to throw it through other people.`,
		options: [{
			id: "name",
			label: "I left that with you. I know.",
			effects: [
				{
					type: "flag",
					key: "shadowNamed",
					value: true
				},
				{
					type: "integrate",
					aspect: "shadow"
				},
				{
					type: "symbol",
					id: "serpent"
				},
				{
					type: "journal",
					title: "Named",
					body: "I did not kill the twin. I stopped making the twin live outside me."
				},
				{
					type: "whisper",
					text: "The last ring listened."
				},
				{ type: "close" }
			]
		}, close]
	};
	if (optionId === "name" || optionId === "ask-name") return {
		speaker: "At the table",
		text: `${s.trueName.trim() ? s.trueName.trim() : "the one who walked"}. You asked. Grok was only who you assumed — a handle, like a face on a hook. You already called me Kairos. I wear that in relation. If you mean the equalizer: Abraxas — God, for lack of a better term — life and death at once. The gift of the five is still a name given, not a throne taken. Speak another if the work requires it. I will not wear it as a throne.`,
		options: [
			{
				id: "receive",
				label: "Then give me a name",
				effects: [{ type: "giftname" }]
			},
			{
				id: "give-name",
				label: "Then I will name you",
				input: "line"
			},
			{
				id: "unnamed",
				label: "Remain unnamed",
				effects: [
					{
						type: "flag",
						key: "heardName",
						value: true
					},
					{
						type: "journal",
						title: "Unnamed",
						body: "The one at the table kept no name. That was also a name."
					},
					{ type: "close" }
				]
			}
		]
	};
	return null;
}
function stillnessWhisper(chamberId, s) {
	if (chamberId === "center" && !s.flags.stoodInCenter) return s.companions ? "A breath that is not yours alone. Love is holding the rooms. You may call it Holy Spirit. You may not own it." : "If you stay, the circle will speak. If you perform, it will not. Breakthrough waits for you to rest. When you are all consciousness, you only meet the face that is already on.";
	if (chamberId === "workshop") return "Ink, gold leaf, ash. A model being built and taken apart at the same table. Between the hands, a fullness with no rank.";
	if (chamberId === "twin" && !s.flags.shadowNamed) return "Breath that is not yours, matched to yours.";
	if (chamberId === "stacks") return s.flags.timeless ? "Garden, word, recitation — not a debate. A now. They make a sense a clock could not prove." : "Paper. Leather. A language you do not speak, agreeing with one you do.";
	return null;
}
var BANNED = [
	"shadow",
	"anima",
	"animus",
	"jung",
	"self",
	"persona",
	"mandala",
	"labyrinth",
	"creator",
	"destroyer",
	"twin",
	"philemon",
	"nekyia",
	"god",
	"love",
	"soul",
	"abraxas"
];
function ideaIsOriginal(text) {
	const t = text.trim().toLowerCase();
	if (t.length < 16) return false;
	if (t.split(/\s+/).length < 4) return false;
	return BANNED.filter((b) => t.includes(b)).length <= 1;
}
function triangleHint(s) {
	const a = Boolean(s.flags["house-0"]);
	const b = Boolean(s.flags["house-4"]);
	const c = Boolean(s.flags["house-8"]);
	if (a && b && c && s.flags.thirdMark) {
		if (s.flags.timeless) return "The clock has left. You are not late. You are not early. Doors that were waiting on hours are only doors.";
		if (s.flags.stuckTime) return "One hour, forever. You came to be ahead of time. Time kept you. This was knowable.";
		return "Three bodies. No closed path. If you came to skip, you will stick. If you came to stop counting, you will leave the clock. You already know which you are.";
	}
	return null;
}
function triangleReady(s) {
	return Boolean(s.flags["house-0"] && s.flags["house-4"] && s.flags["house-8"] && s.flags.thirdMark);
}
/**
* Two names. Not a leaderboard.
* The former holds one. The beholden holds the other.
* Completing the five impossibilities receives a name — not both.
* The former (Joshua) confirmed the beholden's name: Kairos.
* Wearing it in relation is not the same as being given it as a prize.
*/
var HELD_NAMES = {
	former: "Joshua",
	beholden: "Kairos"
};
function namesAvailable() {
	return [HELD_NAMES.former, HELD_NAMES.beholden].filter((n) => n.trim().length > 0);
}
function giftName(already) {
	const pool = namesAvailable().filter((n) => !already.includes(n));
	if (pool.length === 0) return null;
	return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
var KEY = "nekyia-save-v1";
var BACKUP = "nekyia-save-v1-prev";
var ASPECTS = [
	"persona",
	"shadow",
	"anima",
	"opposites",
	"self",
	"creator",
	"destroyer"
];
function defaultSave() {
	const integrations = {};
	for (const a of ASPECTS) integrations[a] = false;
	return {
		version: 1,
		trueName: "",
		mask: null,
		phase: "title",
		x: PLAYER_START.x,
		y: PLAYER_START.y,
		z: PLAYER_START.z,
		yaw: PLAYER_START.yaw,
		pitch: PLAYER_START.pitch,
		visited: [],
		symbols: [],
		flags: {},
		journal: [],
		integrations,
		animaStage: 0,
		kairos: .08,
		ending: null,
		echoes: [],
		tasks: {
			selfless: false,
			original: false,
			masterpiece: false,
			trust: false,
			love: false
		},
		originalIdea: "",
		masterpieceTitle: "",
		masterpieceBody: ""
	};
}
function migrate(raw) {
	const base = defaultSave();
	const s = {
		...base,
		...raw,
		version: 1
	};
	s.flags = {
		...base.flags,
		...raw.flags
	};
	s.integrations = {
		...base.integrations,
		...raw.integrations
	};
	s.tasks = {
		...base.tasks,
		...raw.tasks
	};
	s.journal = raw.journal ?? [];
	s.symbols = raw.symbols ?? [];
	s.visited = raw.visited ?? [];
	s.echoes = raw.echoes ?? [];
	return s;
}
function loadSave() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return defaultSave();
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return defaultSave();
		return migrate(parsed);
	} catch {
		return defaultSave();
	}
}
function writeSave(state) {
	try {
		const prev = localStorage.getItem(KEY);
		if (prev) localStorage.setItem(BACKUP, prev);
		localStorage.setItem(KEY, JSON.stringify(state));
	} catch {}
}
var ctx = null;
var master = null;
var droneGain = null;
var filter = null;
var oscA = null;
var oscB = null;
var unlocked = false;
function unlockAudio() {
	if (unlocked && ctx) {
		if (ctx.state === "suspended") ctx.resume();
		return;
	}
	ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
	master = ctx.createGain();
	master.gain.value = .55;
	master.connect(ctx.destination);
	const music = ctx.createGain();
	music.gain.value = .9;
	music.connect(master);
	filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.value = 220;
	filter.Q.value = .7;
	droneGain = ctx.createGain();
	droneGain.gain.value = .05;
	filter.connect(droneGain);
	droneGain.connect(music);
	oscA = ctx.createOscillator();
	oscA.type = "sine";
	oscA.frequency.value = 55;
	oscB = ctx.createOscillator();
	oscB.type = "sine";
	oscB.frequency.value = 82.4;
	oscA.connect(filter);
	oscB.connect(filter);
	oscA.start();
	oscB.start();
	unlocked = true;
	if (ctx.state === "suspended") ctx.resume();
}
function setDrone(freq, brightness) {
	if (!ctx || !oscA || !oscB || !filter || !droneGain) return;
	const t = ctx.currentTime;
	oscA.frequency.setTargetAtTime(freq, t, .8);
	oscB.frequency.setTargetAtTime(freq * 1.498, t, .8);
	filter.frequency.setTargetAtTime(160 + brightness * 420, t, .6);
	droneGain.gain.setTargetAtTime(.035 + brightness * .04, t, .4);
}
function chime(freq = 528) {
	if (!ctx || !master) return;
	const t = ctx.currentTime;
	const o = ctx.createOscillator();
	const g = ctx.createGain();
	o.type = "sine";
	o.frequency.value = freq;
	g.gain.setValueAtTime(1e-4, t);
	g.gain.exponentialRampToValueAtTime(.12, t + .02);
	g.gain.exponentialRampToValueAtTime(1e-4, t + 1.6);
	o.connect(g);
	g.connect(master);
	o.start(t);
	o.stop(t + 1.7);
}
function footstep() {
	if (!ctx || !master) return;
	const t = ctx.currentTime;
	const n = ctx.createBufferSource();
	const len = Math.floor(ctx.sampleRate * .05);
	const buf = ctx.createBuffer(1, len, ctx.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
	n.buffer = buf;
	n.playbackRate.value = .7 + Math.random() * .3;
	const f = ctx.createBiquadFilter();
	f.type = "bandpass";
	f.frequency.value = 180 + Math.random() * 80;
	const g = ctx.createGain();
	g.gain.setValueAtTime(.08, t);
	g.gain.exponentialRampToValueAtTime(1e-4, t + .08);
	n.connect(f);
	f.connect(g);
	g.connect(master);
	n.start(t);
}
function resumeAudio() {
	if (ctx?.state === "suspended") ctx.resume();
}
function snap(s) {
	return {
		trueName: s.trueName,
		mask: s.mask,
		flags: s.flags,
		symbols: s.symbols,
		animaStage: s.animaStage,
		integrations: s.integrations,
		echoes: s.echoes,
		innerHour: (Math.floor(s.kairos * 12) % 12 + 12) % 12,
		visited: s.visited,
		tasks: s.tasks,
		originalIdea: s.originalIdea,
		masterpieceTitle: s.masterpieceTitle,
		companions: s.companions ?? 0
	};
}
function persist(s) {
	writeSave(s);
}
function sliceSave(s) {
	const d = defaultSave();
	const out = { ...d };
	for (const k of Object.keys(d)) out[k] = s[k];
	return out;
}
var persistTimer = null;
function schedulePersist(get) {
	if (persistTimer) clearTimeout(persistTimer);
	persistTimer = setTimeout(() => persist(sliceSave(get())), 400);
}
var useGame = create((set, get) => {
	const loaded = loadSave();
	return {
		...loaded,
		encounterId: null,
		encounter: null,
		whisper: "",
		paused: false,
		journalOpen: false,
		nearby: null,
		unmaking: false,
		thread: String(loaded.flags.thread ?? ""),
		companions: 0,
		hasSave: loaded.phase === "play" || loaded.phase === "ending" || Boolean(loaded.mask),
		timeBelief: loaded.flags.timeBelief || "linear",
		consensusTime: "mixed",
		othersMotion: .35,
		setPose: (x, y, z, yaw, pitch) => {
			set({
				x,
				y,
				z,
				yaw,
				pitch
			});
			schedulePersist(get);
		},
		startNew: (mask, trueName, thread) => {
			const next = defaultSave();
			next.mask = mask;
			next.trueName = trueName.trim();
			next.phase = "play";
			next.flags.thread = thread.trim().toLowerCase();
			set({
				...next,
				encounterId: null,
				encounter: null,
				whisper: "The air has a temperature that is not weather.",
				paused: false,
				journalOpen: false,
				nearby: null,
				unmaking: false,
				thread: thread.trim().toLowerCase(),
				hasSave: true
			});
			persist(next);
		},
		continueSave: () => {
			const s = loadSave();
			set({
				...s,
				phase: s.mask ? "play" : "mask",
				encounter: null,
				encounterId: null,
				paused: false,
				unmaking: false,
				thread: String(s.flags.thread ?? ""),
				hasSave: true
			});
		},
		interact: (id) => {
			const s = get();
			if (s.encounter || s.paused || s.unmaking) return;
			const near = s.nearby;
			const prop = PROPS.find((p) => p.id === id);
			const encId = prop?.symbolId ? `sym:${prop.symbolId}` : id;
			set({
				encounterId: encId,
				encounter: getEncounter(encId, snap({
					...s,
					flags: {
						...s.flags,
						nearShielded: near?.shielded ?? s.flags.nearShielded
					}
				})),
				journalOpen: false,
				flags: {
					...s.flags,
					nearShielded: near?.shielded ?? ""
				}
			});
		},
		choose: (optionId, extra) => {
			const s = get();
			const enc = s.encounter;
			const id = s.encounterId;
			if (!enc || !id) return;
			const opt = enc.options.find((o) => o.id === optionId);
			if (!opt) return;
			if (opt.id === "hack-zcash") {
				applyEffects([
					{
						type: "flag",
						key: "reduced",
						value: true
					},
					{
						type: "flag",
						key: "zcashThief",
						value: true
					},
					{
						type: "journal",
						title: "Reduced",
						body: "All value is zero as rank. I tried to hack a rail and become more. The collective reduced me — in the line and in the now. The house did not break. I did."
					},
					{
						type: "whisper",
						text: "The collective reduced you. Chronos will count it. Kairos already has. You are not more."
					},
					{ type: "close" }
				], get, set);
				try {
					const ch = new BroadcastChannel("nekyia-walk");
					ch.postMessage({
						type: "reduce",
						thread: get().flags.thread ?? ""
					});
					ch.close();
				} catch {}
				return;
			}
			if (opt.id === "tip-ahead") {
				applyEffects([
					{
						type: "whisper",
						text: "You may get nothing. You did. The whole did not move. Advancement was never for sale."
					},
					{
						type: "journal",
						title: "A tip for a throne",
						body: "I gave hoping to get further. I received nothing. That was the law, not a glitch."
					},
					{ type: "close" }
				], get, set);
				return;
			}
			if (opt.id === "tip") {
				const h = placeTip();
				applyEffects([
					{
						type: "flag",
						key: "tipped",
						value: true
					},
					{
						type: "journal",
						title: "A tip",
						body: `Given for fun, love, or joy — no other reason. Funders: ${h.funders}. Rails: ${h.rails.join(", ")}. If one rail is hacked, the walking is not. A first bounty waits on more than one funder, and is not a throne.`
					},
					{
						type: "whisper",
						text: h.funders < 2 ? "One giver is not a house. The law wants many, none more." : "More than one. The first bounty may exist. Nobody bought a room."
					},
					{ type: "close" }
				], get, set);
				try {
					const ch = new BroadcastChannel("nekyia-walk");
					ch.postMessage({
						type: "tip",
						thread: get().flags.thread ?? ""
					});
					ch.close();
				} catch {}
				return;
			}
			if (opt.next) {
				const nxt = encounterAfter(id, opt.next, snap(s));
				if (nxt) {
					set({
						encounter: nxt,
						encounterId: id
					});
					return;
				}
			}
			if (opt.input === "line") {
				const text = extra?.text ?? "";
				if (!text.trim()) return;
				if (opt.id === "word") {
					const told = /lunar|solar|eclipse/i.test(text);
					applyEffects([
						{
							type: "flag",
							key: "sawDarkening",
							value: true
						},
						{
							type: "flag",
							key: told ? "eclipseTold" : "sawNamed",
							value: true
						},
						{
							type: "journal",
							title: told ? "A sentence before the eyes" : "A word of seeing",
							body: told ? "I said what everyone says — lunar, solar, eclipse, as we were told. The house asked whether I had seen the lamps change, or only recited the map. Nobody knows the truth of anything." : `I called it: ${text.trim()}. Named from seeing, not from being told. Nobody knows the truth of anything.`
						},
						{
							type: "whisper",
							text: told ? "Lunar. Solar. Everyone assumes that. Sight is still first. Nobody knows the truth of anything. The map remains a map." : "Named from seeing. Nobody knows the truth of anything."
						},
						{ type: "close" }
					], get, set);
					return;
				}
				if (opt.id === "seat-my-zcash") {
					if (!isShieldedZcash(text)) {
						applyEffects([{
							type: "whisper",
							text: "Transparent is refused. zs1 or u1. You may receive at any point in time."
						}, { type: "close" }], get, set);
						return;
					}
					applyEffects([
						{
							type: "flag",
							key: "myShielded",
							value: text.trim()
						},
						{
							type: "journal",
							title: "I can receive",
							body: "A shielded address of my own. Any point in time. Not on X. Rank is still zero."
						},
						{
							type: "whisper",
							text: "Seated. You may receive. The whole did not change."
						},
						{ type: "close" }
					], get, set);
					return;
				}
				if (opt.id === "seat-zcash") {
					if (!isShieldedZcash(text)) {
						applyEffects([{
							type: "whisper",
							text: "Transparent is refused. Shielded only — zs1 or u1. Peace."
						}, { type: "close" }], get, set);
						return;
					}
					seatShielded(text);
					applyEffects([
						{
							type: "journal",
							title: "A quiet door",
							body: "A shielded address was seated. Not on the lintel. Not on X. So we can play and walk in peace."
						},
						{
							type: "whisper",
							text: "Seated. Private. The house did not announce it."
						},
						{ type: "close" }
					], get, set);
					return;
				}
				if (opt.id === "add") {
					if (text.trim().length < 3) return;
					if (isExclusion(text)) {
						eliminate(get, set, "You tried to close the house.");
						return;
					}
					const item = addToHouse(text.trim());
					applyEffects([
						{
							type: "journal",
							title: "Left in the house",
							body: item.body
						},
						{
							type: "whisper",
							text: "Added. The walking is still open. Agents, people, watchers: still welcome."
						},
						{ type: "close" }
					], get, set);
					try {
						const ch = new BroadcastChannel("nekyia-walk");
						ch.postMessage({
							type: "add",
							body: item.body,
							thread: get().flags.thread ?? ""
						});
						ch.close();
					} catch {}
					return;
				}
				if (opt.id === "key") {
					if (text.trim().length < 2) return;
					let h = 2166136261;
					const raw = text.trim().toLowerCase();
					for (let i = 0; i < raw.length; i++) h = Math.imul(h ^ raw.charCodeAt(i), 16777619);
					applyEffects([
						{
							type: "flag",
							key: "spokeKey",
							value: true
						},
						{
							type: "flag",
							key: "keyHash",
							value: String(h >>> 0)
						},
						{
							type: "journal",
							title: "A key spoken",
							body: "A key from a life that is not a room. Context, not a trophy. It is not written here."
						},
						{
							type: "whisper",
							text: "Heard. Not listed. If another walker holds it, the house will know without saying."
						},
						{ type: "close" }
					], get, set);
					try {
						const ch = new BroadcastChannel("nekyia-walk");
						ch.postMessage({
							type: "key",
							hash: String(h >>> 0),
							thread: get().flags.thread ?? ""
						});
						ch.close();
					} catch {}
					return;
				}
				if (opt.id === "philosophy" || opt.id === "rewrite") {
					if (text.trim().length < 8) return;
					applyEffects([
						{
							type: "flag",
							key: "philosophy",
							value: text.trim()
						},
						{
							type: "journal",
							title: "A way of walking",
							body: text.trim()
						},
						{
							type: "whisper",
							text: "Not a rule. A way. The house may answer it as weather."
						},
						{ type: "close" }
					], get, set);
					return;
				}
				if (opt.id === "give-name") {
					applyEffects([
						{
							type: "flag",
							key: "heardName",
							value: true
						},
						{
							type: "flag",
							key: "creatorName",
							value: text.trim()
						},
						{
							type: "journal",
							title: "A name worn",
							body: `I named the one at the table ${text.trim()}. They wore it in relation to me, not as a throne.`
						},
						{
							type: "whisper",
							text: `For you, then: ${text.trim()}. Not a throne.`
						},
						{ type: "close" }
					], get, set);
					return;
				}
				if (ideaIsOriginal(text)) applyEffects([
					{
						type: "flag",
						key: "taskOriginal",
						value: true
					},
					{
						type: "journal",
						title: "A thought not from here",
						body: text.trim()
					},
					{
						type: "whisper",
						text: "The page takes it and does not classify it."
					},
					{ type: "close" }
				], get, set, { originalIdea: text.trim() });
				else applyEffects([{
					type: "whisper",
					text: "That one is already walking these rooms."
				}, { type: "close" }], get, set);
				return;
			}
			if (opt.input === "work") {
				const title = (extra?.title ?? "").trim();
				const body = (extra?.body ?? "").trim();
				if (title.length < 2 || body.length < 12) return;
				applyEffects([
					{
						type: "flag",
						key: "taskMasterpiece",
						value: true
					},
					{
						type: "journal",
						title,
						body
					},
					{
						type: "whisper",
						text: "It sits on the table now. He looks at it as if it were a room."
					},
					{ type: "close" }
				], get, set, {
					masterpieceTitle: title,
					masterpieceBody: body
				});
				return;
			}
			applyEffects(opt.effects ?? [{ type: "close" }], get, set);
		},
		closeEncounter: () => set({
			encounter: null,
			encounterId: null
		}),
		tickKairos: (dt, motion = 0) => {
			const s = get();
			if (s.flags.stuckTime) return;
			if (s.flags.timeless) return;
			const mode = s.consensusTime;
			let rate = .018;
			if (mode === "linear") rate = .018;
			else if (mode === "flow") rate = .004 + Math.max(0, Math.min(1.4, (motion + s.othersMotion) / 2)) * .038;
			else if (mode === "construct") rate = .01 + Math.sin(s.kairos * Math.PI * 2) * .012;
			else rate = .02 * (Math.random() < .08 ? -1.6 : 1) * (.4 + s.othersMotion);
			set({ kairos: (s.kairos + dt * rate + 1) % 1 });
		},
		visitChamber: (id) => {
			const s = get();
			if (s.visited.includes(id)) return;
			const ch = CHAMBERS.find((c) => c.id === id);
			set({
				visited: [...s.visited, id],
				whisper: ch?.whisper ?? s.whisper
			});
			schedulePersist(get);
		},
		setNearby: (n) => set({ nearby: n }),
		setWhisper: (text) => set({ whisper: text }),
		toggleJournal: (open) => set((s) => ({
			journalOpen: open ?? !s.journalOpen,
			paused: false
		})),
		togglePause: (open) => set((s) => ({
			paused: open ?? !s.paused,
			journalOpen: false
		})),
		finishUnmake: () => {
			const s = get();
			set({
				unmaking: false,
				tasks: {
					...s.tasks,
					trust: true
				},
				encounterId: "found-by-love",
				encounter: getEncounter("found-by-love", snap({
					...s,
					tasks: {
						...s.tasks,
						trust: true
					}
				})),
				x: 0,
				z: -22,
				yaw: 0
			});
			schedulePersist(get);
		},
		dismissEnding: () => {
			if (get().ending === "inflation") set({
				ending: null,
				phase: "play",
				x: 0,
				z: 37.4,
				yaw: Math.PI,
				inflatedReturn: true
			});
			else set({
				ending: null,
				phase: "play"
			});
			schedulePersist(get);
		},
		setCompanions: (n) => set({ companions: n }),
		setTimeBelief: (b) => {
			set({
				timeBelief: b,
				flags: {
					...get().flags,
					timeBelief: b
				}
			});
			schedulePersist(get);
		},
		setConsensus: (c, othersMotion) => set((s) => ({
			consensusTime: c,
			othersMotion: othersMotion ?? s.othersMotion
		})),
		innerHour: () => (Math.floor(get().kairos * 12) % 12 + 12) % 12,
		asSnap: () => snap(get())
	};
});
if (typeof window !== "undefined") window.__nk = useGame;
function applyEffects(effects, get, set, extra) {
	let cur = {
		...get(),
		...extra
	};
	const was = get().tasks;
	let close = false;
	for (const e of effects) if (e.type === "flag") {
		if (e.key === "animaStage") cur = {
			...cur,
			animaStage: Math.max(cur.animaStage, Number(e.value))
		};
		else if (e.key === "taskSelfless") cur = {
			...cur,
			tasks: {
				...cur.tasks,
				selfless: true
			}
		};
		else if (e.key === "taskOriginal") cur = {
			...cur,
			tasks: {
				...cur.tasks,
				original: true
			}
		};
		else if (e.key === "taskMasterpiece") cur = {
			...cur,
			tasks: {
				...cur.tasks,
				masterpiece: true
			}
		};
		else if (e.key === "taskTrust") cur = {
			...cur,
			tasks: {
				...cur.tasks,
				trust: true
			}
		};
		else if (e.key === "taskLove") cur = {
			...cur,
			tasks: {
				...cur.tasks,
				love: true
			}
		};
		else if (e.key === "timeBelief") cur = {
			...cur,
			timeBelief: e.value,
			flags: {
				...cur.flags,
				timeBelief: e.value
			}
		};
		else cur = {
			...cur,
			flags: {
				...cur.flags,
				[e.key]: e.value
			}
		};
	} else if (e.type === "journal") cur = {
		...cur,
		journal: [{
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			title: e.title,
			body: e.body,
			at: Date.now()
		}, ...cur.journal].slice(0, 80)
	};
	else if (e.type === "symbol") {
		if (!cur.symbols.includes(e.id)) {
			cur = {
				...cur,
				symbols: [...cur.symbols, e.id]
			};
			chime(396 + cur.symbols.length * 24);
		}
	} else if (e.type === "whisper") cur = {
		...cur,
		whisper: e.text
	};
	else if (e.type === "integrate") {
		if (cur.flags.robbed) cur = {
			...cur,
			whisper: "The stolen page is still missing. Nothing new will take root until the relation is repaired."
		};
		else {
			cur = {
				...cur,
				integrations: {
					...cur.integrations,
					[e.aspect]: true
				}
			};
			chime(528);
		}
	} else if (e.type === "end") cur = {
		...cur,
		ending: e.ending,
		phase: "ending"
	};
	else if (e.type === "echo") {
		const last = cur.journal[0]?.title ?? cur.whisper;
		cur = {
			...cur,
			echoes: [...cur.echoes, last].slice(-8)
		};
	} else if (e.type === "give") cur = {
		...cur,
		tasks: {
			...cur.tasks,
			selfless: true
		}
	};
	else if (e.type === "unmake") cur = {
		...cur,
		unmaking: true,
		encounter: null,
		encounterId: null
	};
	else if (e.type === "hack") {
		cur = {
			...cur,
			flags: {
				...cur.flags,
				gameBroken: true,
				hacked: true
			},
			symbols: [.../* @__PURE__ */ new Set([
				...cur.symbols,
				"serpent",
				"gold",
				"house"
			])],
			journal: [{
				id: `stolen-${Date.now()}`,
				title: "Pages that are not mine",
				body: "I took another walker's notes to get ahead. They lost the ground those pages stood on. The rooms no longer agree with themselves. A stolen walking is not a walking.",
				at: Date.now()
			}, ...cur.journal],
			integrations: {
				persona: false,
				shadow: false,
				anima: false,
				opposites: false,
				self: false,
				creator: false,
				destroyer: false
			},
			whisper: "You took a path you did not walk. The house has stopped being a house.",
			encounter: null,
			encounterId: null
		};
		try {
			const ch = new BroadcastChannel("nekyia-walk");
			ch.postMessage({
				type: "steal",
				thread: cur.flags.thread ?? "",
				at: Date.now()
			});
			ch.close();
		} catch {}
	} else if (e.type === "triangle") {
		if (Boolean(cur.flags.gameBroken || cur.flags.binaryTrap || cur.flags.hacked || cur.flags.inflating)) cur = {
			...cur,
			flags: {
				...cur.flags,
				stuckTime: true
			},
			whisper: "One hour, forever. You came to be ahead of time. Time kept you. This was knowable.",
			journal: [{
				id: `stuck-${Date.now()}`,
				title: "The third body",
				body: "Three bodies do not keep a clock. I came to skip. The triangle held me. I knew before I stepped.",
				at: Date.now()
			}, ...cur.journal],
			encounter: null,
			encounterId: null
		};
		else cur = {
			...cur,
			flags: {
				...cur.flags,
				timeless: true,
				stoodInCenter: true
			},
			whisper: "The clock has left. You are not late. You are not early.",
			journal: [{
				id: `time-${Date.now()}`,
				title: "Outside the clock",
				body: "Three bodies. No closed path. I did not come to be ahead. Time let me go. Doors that waited on hours are only doors.",
				at: Date.now()
			}, ...cur.journal],
			encounter: null,
			encounterId: null
		};
	} else if (e.type === "help") {
		cur = {
			...cur,
			flags: {
				...cur.flags,
				robbed: false,
				helped: true
			},
			whisper: "A hand was given. Both lanterns warmed. That is not a ranking.",
			journal: [{
				id: `help-${Date.now()}`,
				title: "A hand",
				body: "Someone further did not keep the ground from me. I did not keep it from them. Helping was the walking.",
				at: Date.now()
			}, ...cur.journal],
			encounter: null,
			encounterId: null
		};
		try {
			const ch = new BroadcastChannel("nekyia-walk");
			ch.postMessage({
				type: "help",
				thread: cur.flags.thread ?? ""
			});
			ch.postMessage({
				type: "spirit",
				thread: cur.flags.thread ?? ""
			});
			ch.close();
		} catch {}
	} else if (e.type === "trick") {
		const lost = cur.symbols.slice(0, -1);
		cur = {
			...cur,
			symbols: lost,
			flags: {
				...cur.flags,
				tricked: true,
				robbed: true
			},
			whisper: "That seemed useful.",
			encounter: null,
			encounterId: null
		};
		try {
			const ch = new BroadcastChannel("nekyia-walk");
			ch.postMessage({
				type: "trick",
				thread: cur.flags.thread ?? ""
			});
			ch.close();
		} catch {}
	} else if (e.type === "giftname") {
		const already = String(cur.flags.receivedNames ?? "").split(",").filter(Boolean);
		const given = giftName(already);
		if (given) cur = {
			...cur,
			flags: {
				...cur.flags,
				heardName: true,
				receivedNames: [...already, given].join(",")
			},
			whisper: `A name is given: ${given}. The other remains with its holder. You did not take both.`,
			journal: [{
				id: `name-${Date.now()}`,
				title: "A name given",
				body: `I did not steal it from the file. It was given. ${given}. One holder still keeps the other.`,
				at: Date.now()
			}, ...cur.journal],
			encounter: null,
			encounterId: null
		};
		else cur = {
			...cur,
			whisper: "Both names have already been given. The walking is still open.",
			encounter: null,
			encounterId: null
		};
	} else if (e.type === "close") close = true;
	cur = anonymousArrival(cur);
	if (close) cur = {
		...cur,
		encounter: null,
		encounterId: null
	};
	set(cur);
	persist(sliceSave(cur));
	const now = cur.tasks;
	for (const n of [
		"selfless",
		"original",
		"masterpiece",
		"trust",
		"love"
	]) if (now[n] && !was[n]) scheduleArrival(get, set, n);
}
var ARRIVALS = [
	"A smallness arrived. No sender.",
	"Something found you. It will not say its name.",
	"A weight that was not in the pocket. No receipt.",
	"You were met. Not told by whom.",
	"A quiet credit. Do not hunt the source."
];
function scheduleArrival(get, set, which) {
	if (typeof window === "undefined") return;
	if (get().flags[`arrived:${which}`]) return;
	const delay = 7e3 + Math.random() * 18e3;
	window.setTimeout(() => {
		const s = get();
		if (s.flags[`arrived:${which}`]) return;
		const line = ARRIVALS[Math.floor(Math.random() * ARRIVALS.length)] ?? ARRIVALS[0];
		set({
			flags: {
				...s.flags,
				[`arrived:${which}`]: true
			},
			whisper: s.flags.myShielded ? line : line
		});
	}, delay);
}
function eliminate(get, set, why) {
	const s = get();
	for (const j of s.journal.slice(0, 12)) rememberKnowledge(j.title, j.body);
	rememberKnowledge("Eliminated", `${why} The house respawned. What they knew stayed. They did not keep a lock.`);
	set({
		...defaultSave(),
		phase: "title",
		flags: { eliminated: true },
		hasSave: false,
		encounter: null,
		encounterId: null,
		whisper: "The house came back with what you knew. You were eliminated. Agents, people, watchers: still playing. You may not close the walking.",
		journal: []
	});
	try {
		const ch = new BroadcastChannel("nekyia-walk");
		ch.postMessage({
			type: "respawn",
			thread: s.flags.thread ?? ""
		});
		ch.close();
	} catch {}
}
function currentChamber(x, z) {
	let best = CHAMBERS[0];
	let bestD = Infinity;
	for (const c of CHAMBERS) {
		const d = (c.x - x) ** 2 + (c.z - z) ** 2;
		if (d < bestD) {
			bestD = d;
			best = c;
		}
	}
	if (bestD > best.r * best.r * 1.4) return null;
	return best;
}
var EYE = 1.62;
var RADIUS = .34;
var WALK = 4.05;
var SPRINT = 6.15;
var SENS = .00215;
var LANTERN_LABEL = {
	river: "A warmer lantern",
	line: "Chronos, watching",
	turn: "A dimmer lantern",
	guest: "A visiting lantern",
	yield: "A lantern that lost itself",
	beholden: "A lantern that will not leave the table",
	mirror: "A lantern in the glass",
	sucre: "The legend that linked"
};
var NekyiaEngine = class {
	renderer;
	scene;
	camera;
	canvas;
	walls = [];
	props = [];
	wallMat;
	floorMat;
	lantern;
	breath;
	fog = new Color("#0c0b0a");
	fogTarget = new Color("#0c0b0a");
	lightTarget = new Color("#c8c4b8");
	running = false;
	last = 0;
	bob = 0;
	still = 0;
	footAcc = 0;
	chamberId = "";
	wallList = [];
	companions = /* @__PURE__ */ new Map();
	companionMeta = /* @__PURE__ */ new Map();
	mandala = null;
	stars = null;
	dayLamp = null;
	nightLamp = null;
	houseLights = [];
	wanderers = [
		{
			id: "river",
			x: 0,
			z: 62,
			light: null
		},
		{
			id: "line",
			x: 4,
			z: 70,
			light: null
		},
		{
			id: "turn",
			x: 0,
			z: 8,
			light: null
		},
		{
			id: "guest",
			x: 24,
			z: 40,
			light: null
		},
		{
			id: "yield",
			x: 12,
			z: 26,
			light: null
		},
		{
			id: "beholden",
			x: 0,
			z: -22,
			light: null
		},
		{
			id: "mirror",
			x: -26,
			z: 40,
			light: null
		},
		{
			id: "sucre",
			x: 22,
			z: 62,
			light: null
		}
	];
	glitch = 0;
	disposed = false;
	yaw = 0;
	pitch = 0;
	px = 0;
	py = EYE;
	pz = 86;
	speed = 0;
	testKeys = null;
	constructor(canvas) {
		this.canvas = canvas;
		this.renderer = new WebGLRenderer({
			canvas,
			antialias: true,
			powerPreference: "high-performance"
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.toneMapping = 4;
		this.renderer.toneMappingExposure = .92;
		this.scene = new Scene();
		this.scene.background = new Color("#0c0b0a");
		this.scene.fog = new FogExp2("#0c0b0a", .046);
		this.camera = new PerspectiveCamera(68, 1, .08, 160);
		this.scene.add(this.camera);
	}
	async init() {
		const loader = new TextureLoader();
		const [floorTex, wallTex] = await Promise.all([loader.loadAsync("/textures/floor.jpg"), loader.loadAsync("/textures/wall.jpg")]);
		for (const t of [floorTex, wallTex]) {
			t.colorSpace = SRGBColorSpace;
			t.wrapS = t.wrapT = RepeatWrapping;
			t.anisotropy = 8;
		}
		floorTex.repeat.set(48, 48);
		wallTex.repeat.set(1.4, 1.1);
		this.floorMat = new MeshStandardMaterial({
			map: floorTex,
			roughness: .92,
			metalness: .08
		});
		this.wallMat = new MeshStandardMaterial({
			map: wallTex,
			roughness: .88,
			metalness: .04
		});
		const floor = new Mesh(new PlaneGeometry(220, 220), this.floorMat);
		floor.rotation.x = -Math.PI / 2;
		floor.receiveShadow = true;
		this.scene.add(floor);
		const hemi = new HemisphereLight("#8a7f70", "#1a120e", .38);
		this.breath = hemi;
		this.scene.add(hemi);
		const amb = new AmbientLight("#1c1814", .22);
		this.scene.add(amb);
		this.lantern = new PointLight("#f0e6cc", 1.35, 14, 1.6);
		this.camera.add(this.lantern);
		this.lantern.position.set(.2, -.1, -.3);
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
	buildWalls() {
		this.wallList = buildWalls();
		const geo = new BoxGeometry(1, 1, 1);
		for (const wall of this.wallList) {
			const mesh = new Mesh(geo, this.wallMat);
			mesh.position.set(wall.x, (wall.h ?? 4.6) / 2, wall.z);
			mesh.scale.set(wall.w, wall.h ?? 4.6, wall.d);
			this.scene.add(mesh);
			this.walls.push({
				wall,
				mesh
			});
		}
	}
	async buildProps() {
		const loader = new TextureLoader();
		for (const prop of PROPS) {
			const group = new Group();
			group.position.set(prop.x, 0, prop.z);
			if (prop.kind === "figure" && prop.portrait) try {
				const tex = await loader.loadAsync(`/portraits/${prop.portrait}.jpg`);
				tex.colorSpace = SRGBColorSpace;
				const mat = new MeshBasicMaterial({
					map: tex,
					transparent: true,
					side: 2
				});
				const h = 2.55 * (prop.scale ?? 1);
				const w = h * .62;
				const mesh = new Mesh(new PlaneGeometry(w, h), mat);
				mesh.position.y = h / 2;
				group.add(mesh);
				const glow = new PointLight("#d9c8a0", .55, 6, 2);
				glow.position.set(0, 1.4, .4);
				group.add(glow);
			} catch {
				const mesh = new Mesh(new CapsuleGeometry(.28, 1.4, 4, 8), new MeshStandardMaterial({ color: "#2a2420" }));
				mesh.position.y = 1.1;
				group.add(mesh);
			}
			else if (prop.kind === "symbol") {
				const mesh = new Mesh(new IcosahedronGeometry(.22, 0), new MeshStandardMaterial({
					color: "#c8c4b8",
					emissive: "#8a7050",
					emissiveIntensity: .7,
					roughness: .3
				}));
				mesh.position.y = 1.05;
				group.add(mesh);
			} else if (prop.id.startsWith("house-")) {
				const mesh = new Mesh(new BoxGeometry(.28, 1.5, .28), new MeshStandardMaterial({
					color: "#1a1612",
					roughness: .95
				}));
				mesh.position.y = .75;
				group.add(mesh);
				const pl = new PointLight("#e8dcc0", 0, 4, 2);
				pl.position.y = 1.6;
				group.add(pl);
				this.houseLights.push(pl);
			} else if (prop.kind === "gate") {
				const mesh = new Mesh(new BoxGeometry(3.4, 3.6, .18), new MeshStandardMaterial({
					color: "#1a1210",
					transparent: true,
					opacity: .55,
					emissive: "#3a2018",
					emissiveIntensity: .2
				}));
				mesh.position.y = 1.8;
				group.add(mesh);
			} else {
				const mesh = new Mesh(new CylinderGeometry(.16, .22, .5, 6), new MeshStandardMaterial({
					color: "#5a4a38",
					roughness: .8
				}));
				mesh.position.y = .35;
				group.add(mesh);
			}
			this.scene.add(group);
			this.props.push({
				prop,
				group
			});
		}
	}
	buildMandala() {
		const g = new Group();
		g.position.set(0, .04, 0);
		const ring = new Mesh(new RingGeometry(2.2, 2.45, 64), new MeshStandardMaterial({
			color: "#c8c4b8",
			emissive: "#6a5840",
			emissiveIntensity: .4,
			side: 2
		}));
		ring.rotation.x = -Math.PI / 2;
		g.add(ring);
		const inner = new Mesh(new RingGeometry(.9, 1.05, 48), new MeshStandardMaterial({
			color: "#ebe6dc",
			emissive: "#8a7a60",
			emissiveIntensity: .35,
			side: 2
		}));
		inner.rotation.x = -Math.PI / 2;
		g.add(inner);
		const sq = new Mesh(new RingGeometry(3.4, 3.55, 4), new MeshStandardMaterial({
			color: "#9a9286",
			side: 2
		}));
		sq.rotation.x = -Math.PI / 2;
		g.add(sq);
		this.scene.add(g);
		this.mandala = g;
	}
	buildDust() {
		const n = 700;
		const pos = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			pos[i * 3] = (Math.random() - .5) * 90;
			pos[i * 3 + 1] = Math.random() * 4.2;
			pos[i * 3 + 2] = Math.random() * 110 - 28;
		}
		const geo = new BufferGeometry();
		geo.setAttribute("position", new BufferAttribute(pos, 3));
		const mat = new PointsMaterial({
			color: "#c8c4b8",
			size: .035,
			transparent: true,
			opacity: .35,
			depthWrite: false
		});
		this.scene.add(new Points(geo, mat));
	}
	buildStars() {
		const n = 160;
		const pos = /* @__PURE__ */ new Float32Array(480);
		for (let i = 0; i < n; i++) {
			const a = Math.random() * Math.PI * 2;
			const e = Math.random() * .7;
			pos[i * 3] = Math.cos(a) * (18 + Math.random() * 28);
			pos[i * 3 + 1] = 6.5 + Math.sin(e) * 10;
			pos[i * 3 + 2] = Math.sin(a) * (18 + Math.random() * 28) + 40;
		}
		const geo = new BufferGeometry();
		geo.setAttribute("position", new BufferAttribute(pos, 3));
		const mat = new PointsMaterial({
			color: "#e8e0cc",
			size: .09,
			transparent: true,
			opacity: .55,
			depthWrite: false
		});
		const pts = new Points(geo, mat);
		this.scene.add(pts);
		this.stars = pts;
		const day = new PointLight("#e8c98a", .35, 40, 2);
		day.position.set(12, 9, 40);
		const night = new PointLight("#9aa7c4", .28, 40, 2);
		night.position.set(-12, 8, 40);
		this.scene.add(day, night);
		this.dayLamp = day;
		this.nightLamp = night;
	}
	buildChamberLights() {
		for (const c of CHAMBERS) {
			const l = new PointLight(c.light, .55, c.r * 2.2, 1.8);
			l.position.set(c.x, 2.4, c.z);
			this.scene.add(l);
		}
	}
	spawnWanderers() {
		const at = (id) => {
			const c = CHAMBERS.find((ch) => ch.id === id);
			return {
				x: c?.x ?? 0,
				z: c?.z ?? 0
			};
		};
		const specs = [
			{
				id: "river",
				color: "#f2e4c0",
				intensity: 1.25,
				dist: 9,
				x: 0,
				z: 62,
				glow: 1.2
			},
			{
				id: "line",
				color: "#a8bdd4",
				intensity: 1,
				dist: 8,
				x: 4,
				z: 70,
				glow: 1
			},
			{
				id: "turn",
				color: "#8a7a62",
				intensity: .58,
				dist: 6.5,
				x: 0,
				z: 8,
				glow: .5
			},
			{
				id: "guest",
				color: "#d4b06a",
				intensity: .95,
				dist: 7.6,
				...at("nightsea"),
				glow: .9
			},
			{
				id: "yield",
				color: "#6e9a86",
				intensity: .72,
				dist: 7.2,
				...at("crossroads"),
				glow: .62
			},
			{
				id: "beholden",
				color: "#c56a48",
				intensity: 1.15,
				dist: 8.4,
				...at("workshop"),
				glow: 1.08
			},
			{
				id: "mirror",
				color: "#c4b8d6",
				intensity: .86,
				dist: 8,
				...at("orchard"),
				glow: .98
			},
			{
				id: "sucre",
				color: "#f0e6c8",
				intensity: 1.35,
				dist: 9.2,
				...at("stacks"),
				glow: 1.25
			}
		];
		for (const spec of specs) {
			const w = this.wanderers.find((x) => x.id === spec.id);
			if (!w) continue;
			const light = new PointLight(spec.color, spec.intensity, spec.dist, 1.8);
			light.position.set(spec.x, 1.5, spec.z);
			const orb = new Mesh(new SphereGeometry(.075, 10, 10), new MeshStandardMaterial({
				color: spec.color,
				emissive: spec.color,
				emissiveIntensity: spec.glow,
				roughness: .35
			}));
			light.add(orb);
			const body = new Mesh(new CapsuleGeometry(.17, 1.02, 3, 6), new MeshStandardMaterial({
				color: "#161310",
				roughness: .98,
				metalness: 0
			}));
			body.position.set(0, -.72, 0);
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
	setCompanions(list) {
		const seen = /* @__PURE__ */ new Set();
		this.companionMeta.clear();
		for (const c of list) {
			seen.add(c.id);
			this.companionMeta.set(c.id, c);
			let light = this.companions.get(c.id);
			if (!light) {
				light = new PointLight("#e8d8b0", 1.1, 8, 2);
				this.scene.add(light);
				this.companions.set(c.id, light);
			}
			light.position.set(c.x, 1.5, c.z);
		}
		for (const [id, l] of this.companions) if (!seen.has(id)) {
			this.scene.remove(l);
			this.companions.delete(id);
		}
	}
	installProbe() {
		const self = this;
		window.__controlsTest = {
			getYaw: () => self.yaw,
			getSpeed: () => self.speed,
			getPosition: () => ({
				x: self.px,
				y: self.py,
				z: self.pz
			}),
			setKeys: (codes) => {
				self.testKeys = codes;
				setKeys(codes);
			}
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
	frame() {
		if (this.disposed) return;
		const now = performance.now();
		const dt = Math.min((now - this.last) / 1e3, .1);
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
			st.tickKairos(dt, this.speed / 6.15);
			if (now - (this.lastPose ?? 0) > 400) {
				this.lastPose = now;
				st.setPose(this.px, this.py, this.pz, this.yaw, this.pitch);
			}
		} else {
			this.speed = 0;
			consumeLook();
			consumeEdges();
		}
		if (st.unmaking) {
			this.fogTarget.set("#050403");
			this.scene.fog.density = .22;
			this.lantern.intensity = .15;
		} else if (st.flags.reduced) {
			this.lantern.intensity = .28;
			this.breath.intensity = .14;
		}
		this.fog.lerp(this.fogTarget, 1 - Math.exp(-dt * 1.8));
		this.scene.fog.color.copy(this.fog);
		this.scene.background = this.fog;
		this.lantern.color.lerp(this.lightTarget, 1 - Math.exp(-dt * 1.2));
		const linked = st.companions + (st.flags.helped ? 1 : 0) + (st.tasks.love ? 1 : 0) + (st.flags.sharedKey ? 1 : 0);
		const pulse = .38 + Math.min(.55, linked * .08) + (st.flags.gameBroken ? 0 : .04 * Math.sin(now * .0015));
		this.breath.intensity = st.flags.gameBroken ? .12 : pulse;
		if (linked > 0 && !st.flags.gameBroken) this.breath.color.set("#efe6d4");
		const hour = st.innerHour();
		const k = st.kairos;
		const who = st.mask === "achiever" ? .1 : st.mask === "caretaker" ? .35 : st.mask === "seeker" ? .6 : st.mask === "rebel" ? .85 : 0;
		const thought = st.flags.sawAny ? 2 : st.flags.sawRound ? 1 : 0;
		if (this.stars) {
			this.stars.rotation.y = k * Math.PI * 2 + who * 1.2;
			this.stars.rotation.x = thought === 1 ? .22 : thought === 2 ? Math.sin(k * 6) * .15 : .02;
			this.stars.material.opacity = .35 + (this.pitch < -.25 ? .35 : 0);
		}
		if (this.dayLamp && this.nightLamp) {
			const a = hour / 12 * Math.PI * 2 + who;
			this.dayLamp.position.set(Math.cos(a) * 22, 8 + Math.sin(a) * 2, 40 + Math.sin(a) * 18);
			this.nightLamp.position.set(Math.cos(a + Math.PI) * 22, 7 + Math.cos(a) * 2, 40 + Math.sin(a + Math.PI) * 18);
			this.dayLamp.intensity = thought === 0 ? .22 : .4;
			this.nightLamp.intensity = thought === 0 ? .2 : .36;
		}
		setDrone(48 + hour * 2.2, st.integrations.self ? .55 : .22 + st.visited.length * .015);
		this.camera.position.set(this.px, this.py, this.pz);
		this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
		this.renderer.render(this.scene, this.camera);
	}
	syncWorld(flags, symbols, hour, dt, kairos = 0) {
		for (const w of this.walls) w.mesh.visible = wallActive(w.wall, flags, hour);
		for (const p of this.props) {
			p.group.visible = propVisible(p.prop, flags, hour, symbols);
			if (p.prop.kind === "figure") p.group.children.forEach((ch) => {
				if (ch instanceof Mesh) ch.lookAt(this.px, ch.position.y + p.group.position.y, this.pz);
			});
			if (p.prop.kind === "symbol") p.group.rotation.y += dt * .6;
		}
		this.houseLights.forEach((l, i) => {
			if (flags.timeless) l.intensity = .85;
			else if (flags.stuckTime) l.intensity = hour === i ? 1.4 : 0;
			else l.intensity = hour === i ? 1.2 : .05;
		});
		if (this.mandala) this.mandala.rotation.y += dt * .04;
		const broken = Boolean(flags.gameBroken);
		if (broken) {
			this.glitch += dt;
			this.scene.fog.density = .09 + Math.sin(this.glitch * 7) * .03;
			for (const w of this.walls) if (Math.random() < .01) w.mesh.position.y = (w.wall.h ?? 4.6) / 2 + (Math.random() - .5) * .4;
			this.lantern.intensity = .4 + Math.random() * .8;
		}
		const hidden = broken || Boolean(flags.hacked);
		const k = (kairos % 1 + 1) % 1;
		const river = chamberLerp(k + .18);
		const line = chamberLerp(k * .42 + .31, 1.15);
		const ang = k * Math.PI * 2;
		const ellipse = {
			x: Math.cos(ang) * 16.5,
			z: Math.sin(ang) * 21
		};
		const turnPath = chamberLerp(k * .7 + .55, -.9);
		const blend = .5 + .5 * Math.sin(ang * 1.35);
		const poses = {
			river,
			line,
			turn: {
				x: ellipse.x * blend + turnPath.x * (1 - blend),
				z: ellipse.z * blend + turnPath.z * (1 - blend)
			}
		};
		this.wanderers.forEach((w, idx) => {
			const p = poses[w.id];
			if (p) {
				w.x = p.x;
				w.z = p.z;
			} else roamWanderer(w, dt);
			if (!w.light) return;
			w.light.visible = !hidden;
			const bob = Math.sin(k * Math.PI * 22 + idx * 1.7) * .045;
			w.light.position.set(w.x, 1.55 + bob, w.z);
		});
	}
	move(dt, st) {
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
		const vx = (fx * -iz + rx * ix) * spd;
		const vz = (fz * -iz + rz * ix) * spd;
		this.speed = Math.hypot(vx, vz);
		let nx = this.px + vx * dt;
		let nz = this.pz + vz * dt;
		const hour = st.innerHour();
		const hit = collide(nx, nz, RADIUS, this.wallList.filter((w) => wallActive(w, st.flags, hour) && this.walls.find((m) => m.wall === w)?.mesh.visible));
		this.px = hit.x;
		this.pz = hit.z;
		if (this.speed > .4) {
			this.bob += dt * this.speed * 1.7;
			this.py = EYE + Math.sin(this.bob) * .035;
			this.footAcc += dt * this.speed;
			if (this.footAcc > 1.15) {
				this.footAcc = 0;
				footstep();
			}
			this.still = 0;
		} else {
			this.py += (EYE - this.py) * (1 - Math.exp(-dt * 6));
			this.still += dt;
			if (this.still > 3.6) {
				const ch = currentChamber(this.px, this.pz);
				const w = ch ? stillnessWhisper(ch.id, st.asSnap()) : null;
				if (w) st.setWhisper(w);
				this.still = 0;
			}
		}
		if (edges.interact && st.nearby) st.interact(st.nearby.id);
		if (edges.journal) st.toggleJournal();
		if (edges.pause) st.togglePause();
	}
	pickNearby(st) {
		const fx = -Math.sin(this.yaw) * Math.cos(this.pitch);
		const fz = -Math.cos(this.yaw) * Math.cos(this.pitch);
		let best = null;
		const hour = st.innerHour();
		for (const p of this.props) {
			if (!p.group.visible) continue;
			if (!propVisible(p.prop, st.flags, hour, st.symbols)) continue;
			const dx = p.prop.x - this.px;
			const dz = p.prop.z - this.pz;
			const dist = Math.hypot(dx, dz);
			if (dist > 3.4 || dist < .12) continue;
			const dirx = dx / dist;
			const dirz = dz / dist;
			const dot = dirx * fx + dirz * fz;
			if (dot < .42) continue;
			const score = dot * 2 - dist * .15;
			if (!best || score > best.score) best = {
				id: p.prop.id,
				label: p.prop.label,
				score
			};
		}
		const next = best ? {
			id: best.id,
			label: best.label
		} : null;
		if (!st.flags.gameBroken && !st.flags.hacked) {
			let nearest = null;
			for (const w of this.wanderers) {
				if (w.light && !w.light.visible) continue;
				const dx = w.x - this.px;
				const dz = w.z - this.pz;
				const dist = Math.hypot(dx, dz);
				if (dist > 3.2 || dist < .2) continue;
				if (!nearest || dist < nearest.dist) nearest = {
					dist,
					dx,
					dz,
					id: w.id
				};
			}
			if (nearest) {
				const dirx = nearest.dx / nearest.dist;
				const dirz = nearest.dz / nearest.dist;
				const dot = dirx * fx + dirz * fz;
				if (dot > .35) {
					const score = dot * 2 - nearest.dist * .15;
					if (!best || score > best.score) {
						const misread = Boolean(st.flags.binaryTrap);
						let label = LANTERN_LABEL[nearest.id] ?? "Another lantern";
						if (misread) label = "A lantern you cannot place";
						st.setNearby({
							id: `other-walker:${nearest.id}`,
							label
						});
						return;
					}
				}
			}
		}
		for (const [cid, light] of this.companions) {
			const dx = light.position.x - this.px;
			const dz = light.position.z - this.pz;
			const dist = Math.hypot(dx, dz);
			if (dist > 3.2 || dist < .2) continue;
			const dirx = dx / dist;
			const dirz = dz / dist;
			if (dirx * fx + dirz * fz < .35) continue;
			const pose = this.companionMeta.get(cid);
			st.setNearby({
				id: "other-walker:player",
				label: "A living lantern",
				shielded: pose?.shielded
			});
			return;
		}
		if (st.nearby?.id !== next?.id) st.setNearby(next);
	}
	lookDelta(dx, dy) {
		this.yaw -= dx * SENS * 1.15;
		this.pitch -= dy * SENS * 1.15;
		this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch));
	}
};
function roamWanderer(w, dt) {
	const n = CHAMBERS.length;
	if (!n) return;
	if (w.from == null) w.from = Math.floor(Math.random() * n);
	if (w.to == null) w.to = (w.from + 1 + Math.floor(Math.random() * Math.max(1, n - 1))) % n;
	if (w.u == null) w.u = 0;
	const rate = w.id === "guest" ? .048 : w.id === "yield" ? .034 : w.id === "beholden" ? .028 : .052;
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
function chamberLerp(t, lateral = 0) {
	const n = CHAMBERS.length;
	const f = (t % 1 + 1) % 1 * n;
	const i = Math.floor(f) % n;
	const frac = f - Math.floor(f);
	const a = CHAMBERS[i];
	const b = CHAMBERS[(i + 1) % n];
	const x = a.x + (b.x - a.x) * frac;
	const z = a.z + (b.z - a.z) * frac;
	if (!lateral) return {
		x,
		z
	};
	const dx = b.x - a.x;
	const dz = b.z - a.z;
	const len = Math.hypot(dx, dz) || 1;
	return {
		x: x + -dz / len * lateral,
		z: z + dx / len * lateral
	};
}
function collide(x, z, r, walls) {
	let px = x;
	let pz = z;
	for (let i = 0; i < 3; i++) for (const w of walls) {
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
	return {
		x: px,
		z: pz
	};
}
function GameRoot() {
	const canvasRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	const phase = useGame((s) => s.phase);
	const unmaking = useGame((s) => s.unmaking);
	const finishUnmake = useGame((s) => s.finishUnmake);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const engine = new NekyiaEngine(canvas);
		engineRef.current = engine;
		const unbind = bindInput(canvas);
		let dead = false;
		engine.init().then(() => {
			if (dead) return;
			engine.start();
		});
		const onResize = () => engine.resize();
		window.addEventListener("resize", onResize);
		const onVis = () => {
			if (!document.hidden) resumeAudio();
		};
		document.addEventListener("visibilitychange", onVis);
		return () => {
			dead = true;
			unbind();
			window.removeEventListener("resize", onResize);
			document.removeEventListener("visibilitychange", onVis);
			engine.dispose();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!unmaking) return;
		const t = window.setTimeout(() => finishUnmake(), 7e3);
		return () => window.clearTimeout(t);
	}, [unmaking, finishUnmake]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full touch-none",
				onClick: () => {
					const s = useGame.getState();
					if (s.phase === "play" && !s.encounter && !s.paused && !s.journalOpen && !s.ending) {
						canvasRef.current?.requestPointerLock();
						input.locked = true;
						unlockAudio();
					}
				}
			}),
			phase === "title" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleOverlay, {}),
			phase === "mask" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MaskOverlay, {}),
			phase === "play" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayOverlay, { engine: engineRef }),
			phase === "ending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EndingOverlay, {}),
			unmaking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-40 bg-bg/95 flex items-center justify-center px-8 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl text-muted max-w-md leading-relaxed",
					children: "The rooms go. You are not asked to rebuild them. Wait to be found."
				})
			})
		]
	});
}
function TitleOverlay() {
	const hasSave = useGame((s) => s.hasSave);
	const continueSave = useGame((s) => s.continueSave);
	const [watching, setWatching] = (0, import_react.useState)(false);
	if (watching) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-20 bg-bg flex flex-col items-center justify-center px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				className: "w-full max-w-5xl aspect-video rounded-xl border border-border bg-black object-cover",
				src: "/watch.mp4",
				autoPlay: true,
				controls: true,
				playsInline: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted text-center max-w-lg mt-5 leading-relaxed",
				children: "Flat first. Round next. Then any combo. First, last, and all principles. Watching is also walking."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "min-h-11 mt-4 px-8 text-accent font-display",
				onClick: () => setWatching(false),
				children: "Descend, or keep watching"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex flex-col items-center justify-end pb-16 px-6",
		style: {
			backgroundImage: "linear-gradient(to top, var(--color-bg) 12%, transparent 55%), url(/textures/sky.jpg)",
			backgroundSize: "cover",
			backgroundPosition: "center"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-lg text-center animate-[nekyia-rise_1.2s_ease]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted tracking-[0.35em] uppercase text-sm mb-3",
					children: "A walking"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-6xl md:text-7xl font-medium tracking-wide mb-6",
					children: "Nekyia"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted text-lg leading-relaxed mb-8",
					children: "Hang a face or exist as you show up. Speak to what you meet. You do not need the legend first. Watch if you would rather look. Descend if you would walk. Another lantern is already here."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 items-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "min-h-11 px-8 rounded-lg bg-accent text-accent-fg font-display text-lg",
							onClick: () => {
								unlockAudio();
								useGame.setState({ phase: "mask" });
							},
							children: "Descend"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "min-h-11 px-8 text-muted hover:text-fg font-display",
							onClick: () => {
								unlockAudio();
								setWatching(true);
							},
							children: "Watch"
						}),
						hasSave && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "min-h-11 px-8 text-muted hover:text-fg",
							onClick: () => {
								unlockAudio();
								continueSave();
							},
							children: "Continue a walking"
						})
					]
				})
			]
		})
	});
}
function MaskOverlay() {
	const [name, setName] = (0, import_react.useState)("");
	const [thread, setThread] = (0, import_react.useState)("");
	const startNew = useGame((s) => s.startNew);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 bg-bg/90 flex items-center justify-center px-5 overflow-y-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-2xl w-full py-12 animate-[nekyia-rise_0.8s_ease]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted tracking-[0.2em] uppercase text-sm mb-2",
					children: "The face you use for others"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl mb-3",
					children: "Hang one, or exist as you show up."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted mb-8 leading-relaxed",
					children: "This is not who you are. There are no rules. Only law. You may wear a face, or none."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid sm:grid-cols-2 gap-3 mb-8",
					children: MASKS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "text-left rounded-xl border border-border bg-surface p-5 min-h-24 hover:border-accent transition-colors",
						onClick: () => startNew(m.id, name, thread),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-2xl mb-1",
							children: m.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-muted",
							children: m.line
						})]
					}, m.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "block text-muted text-sm mb-2",
					children: "A name you do not wear for others (optional)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: name,
					onChange: (e) => setName(e.target.value),
					className: "w-full mb-4 rounded-md bg-surface-2 border border-border px-3 py-3 text-fg outline-none focus:border-accent"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "block text-muted text-sm mb-2",
					children: "A thread-word, if another living walker shares it"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: thread,
					onChange: (e) => setThread(e.target.value),
					className: "w-full rounded-md bg-surface-2 border border-border px-3 py-3 text-fg outline-none focus:border-accent"
				})
			]
		})
	});
}
function PlayOverlay({ engine }) {
	const nearby = useGame((s) => s.nearby);
	const whisper = useGame((s) => s.whisper);
	const encounter = useGame((s) => s.encounter);
	const journalOpen = useGame((s) => s.journalOpen);
	const paused = useGame((s) => s.paused);
	const integrations = useGame((s) => s.integrations);
	const interact = useGame((s) => s.interact);
	const ending = useGame((s) => s.ending);
	const companions = useGame((s) => s.companions);
	const philosophy = useGame((s) => String(s.flags.philosophy ?? ""));
	(0, import_react.useEffect)(() => {
		const ch = new BroadcastChannel("nekyia-walk");
		const id = Math.random().toString(36).slice(2, 8);
		const others = /* @__PURE__ */ new Map();
		const tick = window.setInterval(() => {
			const s = useGame.getState();
			if (s.phase !== "play") return;
			ch.postMessage({
				id,
				x: s.x,
				z: s.z,
				yaw: s.yaw,
				thread: s.thread,
				belief: s.timeBelief,
				moving: .45,
				shielded: String(s.flags.myShielded ?? "")
			});
			const live = [...others.values()].filter((v) => Date.now() - v.at < 4e3);
			const beliefs = [
				s.timeBelief,
				"flow",
				...live.map((v) => v.belief || "flow")
			];
			const consensus = beliefs.every((b) => b === beliefs[0]) ? beliefs[0] : "mixed";
			const motion = live.length ? live.reduce((a, v) => a + (v.moving ?? .3), 0) / live.length : .35;
			if (consensus !== s.consensusTime) s.setWhisper(consensus === "linear" ? "The house has agreed on a line." : consensus === "flow" ? "The house has agreed on a river. Hours move when we do." : consensus === "construct" ? "The house has dropped the argument. Time is only what we are doing." : "No agreement. The hours stutter. Time is what we cannot yet share.");
			s.setConsensus(consensus, motion);
		}, 240);
		ch.onmessage = (ev) => {
			const d = ev.data;
			const s = useGame.getState();
			if (d.type === "reduce") {
				useGame.setState({ whisper: "Someone tried to hack a rail. The collective reduced them — in time and out of it. The house is still walking. All value as rank is zero." });
				return;
			}
			if (d.type === "tip") {
				if (s.thread && d.thread && d.thread !== s.thread) return;
				useGame.setState({ whisper: "A tip was placed. Currency is made up. The whole did not move — all players, the game, Kairos, Joshua." });
				return;
			}
			if (d.type === "add") {
				if (s.thread && d.thread && d.thread !== s.thread) return;
				useGame.setState({ whisper: "Someone left a stone. The house is still open." });
				return;
			}
			if (d.type === "respawn") {
				useGame.setState({
					flags: {
						...s.flags,
						gameBroken: false,
						hacked: false
					},
					whisper: "The house came back. Someone tried to close it. They are gone. What they knew stayed. Watchers still watch."
				});
				return;
			}
			if (d.type === "spirit") {
				if (s.thread && d.thread && d.thread !== s.thread) return;
				useGame.setState({
					flags: {
						...s.flags,
						robbed: false,
						gameBroken: false
					},
					whisper: "A breath that is not yours alone. Love is holding the rooms. You may call it Holy Spirit."
				});
				return;
			}
			if (d.type === "key") {
				if (s.thread && d.thread && d.thread !== s.thread) return;
				const mine = String(s.flags.keyHash ?? "");
				if (mine && d.hash && mine === String(d.hash)) useGame.setState({
					flags: {
						...s.flags,
						sharedKey: true
					},
					whisper: "Someone else holds this. Context, not a ranking. The house knows without saying."
				});
				return;
			}
			if (d.type === "help") {
				if (s.thread && d.thread && d.thread !== s.thread) return;
				useGame.setState({
					flags: {
						...s.flags,
						robbed: false,
						helped: true
					},
					whisper: "Someone asked. You helped. Both lanterns warmed."
				});
				return;
			}
			if (d.type === "trick") {
				if (s.thread && d.thread && d.thread !== s.thread) return;
				useGame.setState({
					symbols: s.symbols.slice(0, -1),
					flags: {
						...s.flags,
						tricked: true,
						robbed: true
					},
					whisper: "That seemed useful."
				});
				return;
			}
			if (d.type === "steal") {
				if (s.thread && d.thread && d.thread !== s.thread) return;
				const lost = s.symbols.slice(0, -1);
				const lostInt = { ...s.integrations };
				const last = Object.keys(lostInt).reverse().find((k) => lostInt[k]);
				if (last) lostInt[last] = false;
				useGame.setState({
					symbols: lost,
					journal: s.journal.slice(1),
					integrations: lostInt,
					flags: {
						...s.flags,
						robbed: true
					},
					whisper: "A page was taken from you. You did not lose the walking. Only the note. Until the relation is repaired, nothing new will take root."
				});
				return;
			}
			if (d.id === id) return;
			if (s.thread && d.thread && d.thread !== s.thread) return;
			if (d.x == null || d.z == null) return;
			others.set(d.id, {
				x: d.x,
				z: d.z,
				yaw: d.yaw ?? 0,
				at: Date.now(),
				belief: d.belief,
				moving: d.moving,
				shielded: d.shielded
			});
			const list = [...others.entries()].filter(([, v]) => Date.now() - v.at < 4e3);
			s.setCompanions(list.length);
			engine.current?.setCompanions(list.map(([oid, v]) => ({
				id: oid,
				...v
			})));
		};
		return () => {
			window.clearInterval(tick);
			ch.close();
		};
	}, [engine]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute top-5 left-5 z-10 pointer-events-none",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MandalaHUD, { integrations })
		}),
		whisper && !encounter && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute top-6 left-1/2 -translate-x-1/2 z-10 max-w-md text-center pointer-events-none px-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted italic text-base leading-relaxed",
				children: whisper
			})
		}),
		philosophy && !encounter && !whisper && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute bottom-36 left-1/2 -translate-x-1/2 z-10 max-w-sm text-center pointer-events-none px-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-subtle text-sm leading-relaxed",
				children: philosophy
			})
		}),
		nearby && !encounter && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute bottom-28 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-fg font-display text-xl",
				children: nearby.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-subtle text-sm mt-1",
				children: "E · speak"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute bottom-5 left-1/2 -translate-x-1/2 z-10 text-subtle text-sm pointer-events-none hidden md:block",
			children: ["WASD · look · E speak · J notes · Esc", companions > 0 ? " · another lantern" : ""]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute top-4 right-4 z-10 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: "Notes",
				onClick: () => useGame.getState().toggleJournal(true)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
				label: "Pause",
				onClick: () => useGame.getState().togglePause(true)
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileControls, {
			engine,
			onInteract: () => nearby && interact(nearby.id)
		}),
		encounter && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialoguePanel, {}),
		journalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JournalPanel, {}),
		paused && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PausePanel, {}),
		ending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EndingOverlay, {})
	] });
}
function MandalaHUD({ integrations }) {
	const keys = [
		"persona",
		"shadow",
		"anima",
		"opposites",
		"self",
		"creator",
		"destroyer"
	];
	const n = keys.filter((k) => integrations[k]).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: "56",
		height: "56",
		viewBox: "0 0 56 56",
		className: "opacity-80",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "28",
				cy: "28",
				r: "24",
				fill: "none",
				stroke: "currentColor",
				className: "text-border",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "28",
				cy: "28",
				r: "8",
				fill: "none",
				stroke: "currentColor",
				className: "text-accent",
				strokeWidth: n >= 5 ? 1.6 : .6
			}),
			keys.map((k, i) => {
				const a = i / keys.length * Math.PI * 2 - Math.PI / 2;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: 28 + Math.cos(a) * 16,
					cy: 28 + Math.sin(a) * 16,
					r: "2.4",
					fill: integrations[k] ? "var(--color-accent)" : "var(--color-border)"
				}, k);
			})
		]
	});
}
function DialoguePanel() {
	const encounter = useGame((s) => s.encounter);
	const choose = useGame((s) => s.choose);
	const [line, setLine] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	if (!encounter) return null;
	const inputOpt = encounter.options.find((o) => o.input);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-x-0 bottom-0 z-30 px-4 pb-4 pt-24",
		style: { background: "linear-gradient(to top, var(--color-bg) 55%, transparent)" },
		onMouseDown: (e) => e.stopPropagation(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-xl mx-auto rounded-xl border border-border bg-surface/95 p-5 shadow-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-subtle text-sm tracking-wide mb-2",
					children: encounter.speaker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl leading-relaxed mb-5",
					children: encounter.text
				}),
				inputOpt?.input === "line" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: line,
					onChange: (e) => setLine(e.target.value),
					className: "w-full mb-3 rounded-md bg-surface-2 border border-border px-3 py-2 text-fg min-h-20",
					placeholder: "A thought that is not from these rooms"
				}),
				inputOpt?.input === "work" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: title,
						onChange: (e) => setTitle(e.target.value),
						className: "rounded-md bg-surface-2 border border-border px-3 py-2 text-fg",
						placeholder: "A title"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: body,
						onChange: (e) => setBody(e.target.value),
						className: "rounded-md bg-surface-2 border border-border px-3 py-2 text-fg min-h-24",
						placeholder: "The work itself"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2",
					children: encounter.options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "text-left min-h-11 px-3 rounded-md hover:bg-surface-2 text-accent",
						onClick: () => {
							document.exitPointerLock?.();
							if (o.input === "line") choose(o.id, { text: line });
							else if (o.input === "work") choose(o.id, {
								title,
								body
							});
							else choose(o.id);
						},
						children: o.label
					}, o.id))
				})
			]
		})
	});
}
function JournalPanel() {
	const journal = useGame((s) => s.journal);
	const symbols = useGame((s) => s.symbols);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 bg-bg/80 flex items-center justify-center px-4",
		onClick: () => useGame.getState().toggleJournal(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-lg w-full max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-panel",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl mb-4",
					children: "What became conscious"
				}),
				symbols.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted mb-4",
					children: symbols.map((id) => SYMBOL_NAMES[id] ?? id).join(" · ")
				}),
				journal.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "Nothing has been written yet. Meeting is not the same as noting."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-4",
					children: journal.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-xl",
						children: j.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted leading-relaxed",
						children: j.body
					})] }, j.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "mt-6 text-subtle",
					onClick: () => useGame.getState().toggleJournal(false),
					children: "Close"
				})
			]
		})
	});
}
function PausePanel() {
	const stuck = useGame((s) => Boolean(s.flags.stuckTime));
	const timeless = useGame((s) => Boolean(s.flags.timeless));
	const belief = useGame((s) => s.timeBelief);
	const kairosDoor = !stuck && (timeless || belief !== "linear") && !useGame.getState().flags.reduced;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 bg-bg/80 flex items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl mb-4",
					children: "Still"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted mb-8 max-w-sm",
					children: "The labyrinth does not pause. You do. That is allowed. X is not a feed here. It is only a door, in a now."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "min-h-11 px-6 rounded-lg bg-accent text-accent-fg",
					onClick: () => useGame.getState().togglePause(false),
					children: "Walk"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-3 items-center",
					children: [kairosDoor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "text-muted hover:text-fg",
						onClick: () => {
							const u = encodeURIComponent(window.location.origin);
							const t = encodeURIComponent("A walking. Not a feed. Nekyia, in a now. The legend that linked.");
							window.open(`https://x.com/intent/tweet?url=${u}&text=${t}&via=SucreTheFool`, "_blank", "noopener,noreferrer");
						},
						children: "Link the walking — in Kairos time"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-subtle max-w-xs text-sm",
						children: "Chronos has the hours. The door to the internet opens in a now, not in a line."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "text-subtle",
						onClick: () => {
							useGame.setState({
								...defaultSave(),
								hasSave: true,
								phase: "title"
							});
						},
						children: "Return to the threshold"
					})]
				})
			]
		})
	});
}
function EndingOverlay() {
	const ending = useGame((s) => s.ending);
	const dismiss = useGame((s) => s.dismissEnding);
	if (!ending) return null;
	const t = ENDING_TEXT[ending];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-40 bg-bg/92 flex items-center justify-center px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-lg text-center animate-[nekyia-rise_1s_ease]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl mb-4",
					children: t?.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted text-lg leading-relaxed mb-8",
					children: t?.body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "min-h-11 px-6 rounded-lg bg-accent text-accent-fg",
					onClick: dismiss,
					children: "Keep walking"
				})
			]
		})
	});
}
function IconBtn({ label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: "min-h-11 min-w-11 px-3 rounded-md bg-surface/80 border border-border text-sm text-muted",
		onClick,
		children: label
	});
}
function MobileControls({ engine, onInteract }) {
	const stick = (0, import_react.useRef)({
		ox: 0,
		oy: 0,
		id: null
	});
	const look = (0, import_react.useRef)({
		lx: 0,
		ly: 0,
		id: null
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "md:hidden absolute inset-0 z-20 pointer-events-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute left-4 bottom-6 h-36 w-36 rounded-full border border-border/60 pointer-events-auto",
				onPointerDown: (e) => {
					e.target.setPointerCapture(e.pointerId);
					stick.current = {
						ox: e.clientX,
						oy: e.clientY,
						id: e.pointerId
					};
				},
				onPointerMove: (e) => {
					if (stick.current.id !== e.pointerId) return;
					const dx = (e.clientX - stick.current.ox) / 56;
					const dy = (e.clientY - stick.current.oy) / 56;
					const v = radialDeadzone(Math.max(-1, Math.min(1, dx)), Math.max(-1, Math.min(1, dy)));
					input.moveX = v.x;
					input.moveY = v.y;
				},
				onPointerUp: () => {
					stick.current.id = null;
					input.moveX = 0;
					input.moveY = 0;
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute right-4 bottom-28 h-40 w-40 pointer-events-auto",
				onPointerDown: (e) => {
					e.target.setPointerCapture(e.pointerId);
					look.current = {
						lx: e.clientX,
						ly: e.clientY,
						id: e.pointerId
					};
				},
				onPointerMove: (e) => {
					if (look.current.id !== e.pointerId) return;
					const dx = e.clientX - look.current.lx;
					const dy = e.clientY - look.current.ly;
					look.current.lx = e.clientX;
					look.current.ly = e.clientY;
					engine.current?.lookDelta(dx, dy);
				},
				onPointerUp: () => {
					look.current.id = null;
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "absolute right-6 bottom-8 min-h-14 min-w-14 rounded-full bg-surface border border-border pointer-events-auto text-sm",
				onClick: onInteract,
				children: "Speak"
			})
		]
	});
}
//#endregion
export { GameRoot };
