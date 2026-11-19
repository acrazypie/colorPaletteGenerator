// palette.js — harmony schemes. Every scheme returns exactly `count` colours and
// always contains the base colour itself, so what you picked is what you get.

import { hexToHsl, hslToHex, normalizeHex } from "./colors.js";

export const SCHEMES = [
    "auto",
    "analogous",
    "monochromatic",
    "complementary",
    "split",
    "triadic",
    "tetradic",
    "square",
    "shades",
];

// hue offsets (degrees) of the anchor colours on the wheel
const ANCHORS = {
    complementary: [0, 180],
    split: [0, 150, 210],
    triadic: [0, 120, 240],
    tetradic: [0, 60, 180, 240],
    square: [0, 90, 180, 270],
};

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** Replace the colour closest in lightness to the base with the base itself. */
function keepBase(list, base, baseL) {
    let idx = 0;
    list.forEach((c, i) => {
        if (Math.abs(c.l - baseL) < Math.abs(list[idx].l - baseL)) idx = i;
    });
    const out = list.map((c) => hslToHex(c));
    out[idx] = base;
    return out;
}

function analogous({ h, s, l }, n, base) {
    const span = Math.min(75, 15 * (n - 1)); // total hue span grows with the count, up to 75°
    const mid = (n - 1) / 2;
    const out = [];
    for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : (i - mid) / (n - 1);
        out.push(
            i === Math.round(mid)
                ? base
                : hslToHex({ h: h + t * span, s: clamp(s + t * 6, 8, 100), l: clamp(l - t * 14, 12, 92) }),
        );
    }
    return out;
}

function lightnessRamp({ h, s, l }, n, base, lo, hi, satDrift) {
    const list = [];
    for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0.5 : i / (n - 1);
        const li = hi - t * (hi - lo); // light → dark
        const edge = Math.abs(t - 0.5) * 2; // 0 in the middle, 1 at the ends
        list.push({ h, s: clamp(s * (1 - satDrift * edge), 0, 100), l: li });
    }
    return keepBase(list, base, l);
}

function anchored({ h, s, l }, n, base, offsets) {
    const k = offsets.length;
    const list = [];
    for (let i = 0; i < n; i++) {
        const a = i % k;
        const round = Math.floor(i / k);
        let li = l;
        let si = s;
        if (round > 0) {
            // alternate lighter / darker variants of each anchor, flipping if we hit the edge
            const dir = round % 2 ? 1 : -1;
            const step = Math.ceil(round / 2) * 18;
            li = l + dir * step;
            if (li > 92 || li < 12) li = l - dir * step;
            li = clamp(li, 10, 94);
            si = clamp(s - round * 6, 8, 100);
        }
        list.push({ a, round, hex: round === 0 && a === 0 ? base : hslToHex({ h: h + offsets[a], s: si, l: li }), l: li });
    }
    list.sort((p, q) => p.a - q.a || q.l - p.l);
    return list.map((c) => c.hex);
}

/**
 * @param {string} baseHex  any hex colour
 * @param {string} scheme   one of SCHEMES except "auto"
 * @param {number} count    2–10
 * @returns {string[]} upper-case hex colours
 */
export function generatePalette(baseHex, scheme, count) {
    const base = normalizeHex(baseHex) || "#FF5733";
    const hsl = hexToHsl(base);
    const n = clamp(Math.round(count) || 5, 2, 10);
    switch (scheme) {
        case "monochromatic":
            return lightnessRamp(hsl, n, base, 16, 88, 0.45);
        case "shades":
            return lightnessRamp(hsl, n, base, 8, 95, 0);
        case "complementary":
        case "split":
        case "triadic":
        case "tetradic":
        case "square":
            return anchored(hsl, n, base, ANCHORS[scheme]);
        case "analogous":
        default:
            return analogous(hsl, n, base);
    }
}

/** A pleasant random colour: any hue, mid saturation and lightness. */
export function randomBase() {
    return hslToHex({
        h: Math.random() * 360,
        s: 45 + Math.random() * 40,
        l: 42 + Math.random() * 22,
    });
}

export function randomScheme() {
    const pool = SCHEMES.filter((s) => s !== "auto");
    return pool[Math.floor(Math.random() * pool.length)];
}

/** Tints and shades of one colour, light to dark. */
export function shadesOf(hex, steps = 11) {
    const { h, s } = hexToHsl(hex);
    const out = [];
    for (let i = 0; i < steps; i++) {
        const l = 96 - (i * 88) / (steps - 1);
        out.push(hslToHex({ h, s, l }));
    }
    return out;
}
