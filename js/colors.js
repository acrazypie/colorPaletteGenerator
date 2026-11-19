// colors.js — conversions (hex, rgb, hsl, lab), contrast and colour names.

import { NAMED_COLORS } from "./names.js";

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** "#abc", "abc", "#aabbcc" or "aabbcc" → "#AABBCC", or null if it is not a colour. */
export function normalizeHex(input) {
    if (typeof input !== "string") return null;
    let h = input.trim().replace(/^#/, "");
    if (/^[0-9a-f]{3}$/i.test(h)) h = h.replace(/./g, "$&$&");
    if (!/^[0-9a-f]{6}$/i.test(h)) return null;
    return `#${h.toUpperCase()}`;
}

export function hexToRgb(hex) {
    const h = normalizeHex(hex).slice(1);
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
    };
}

export function rgbToHex({ r, g, b }) {
    const to = (c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, "0");
    return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

/** rgb 0-255 → { h: 0-360, s: 0-100, l: 0-100 } */
export function rgbToHsl({ r, g, b }) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
    }
    return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }) {
    h = ((h % 360) + 360) % 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 };
}

export const hexToHsl = (hex) => rgbToHsl(hexToRgb(hex));
export const hslToHex = (hsl) => rgbToHex(hslToRgb(hsl));

/* ─── WCAG contrast ─────────────────────────────────────── */
export function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const lin = (c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a, b) {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export const INK_LIGHT = "#FFFFFF";
export const INK_DARK = "#111111";

/** The text colour (near-black or white) that reads best on `hex`, with its ratio and WCAG grade. */
export function bestInk(hex) {
    const onDark = contrast(hex, INK_LIGHT);
    const onLight = contrast(hex, INK_DARK);
    const ink = onLight >= onDark ? INK_DARK : INK_LIGHT;
    const ratio = Math.max(onDark, onLight);
    return { ink, ratio, grade: grade(ratio) };
}

export function grade(ratio) {
    if (ratio >= 7) return "AAA";
    if (ratio >= 4.5) return "AA";
    if (ratio >= 3) return "AA Large";
    return "Fail";
}

/* ─── Lab, for perceptual distance (names, image extraction) ── */
export function rgbToLab({ r, g, b }) {
    const lin = (c) => {
        c /= 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const R = lin(r);
    const G = lin(g);
    const B = lin(b);
    let x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
    let y = R * 0.2126 + G * 0.7152 + B * 0.0722;
    let z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    x = f(x);
    y = f(y);
    z = f(z);
    return { L: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z) };
}

const labDist = (p, q) => (p.L - q.L) ** 2 + (p.a - q.a) ** 2 + (p.b - q.b) ** 2;

const NAME_LAB = NAMED_COLORS.map(([name, hex]) => ({ name, lab: rgbToLab(hexToRgb(hex)) }));
const nameCache = new Map();

/** Closest human name for a colour ("Tomato", "Slate Blue"…). */
export function colorName(hex) {
    if (nameCache.has(hex)) return nameCache.get(hex);
    const lab = rgbToLab(hexToRgb(hex));
    let best = NAME_LAB[0];
    let bestD = Infinity;
    for (const c of NAME_LAB) {
        const d = labDist(lab, c.lab);
        if (d < bestD) {
            bestD = d;
            best = c;
        }
    }
    nameCache.set(hex, best.name);
    return best.name;
}

/* ─── formats ───────────────────────────────────────────── */
export function formatColor(hex, format) {
    if (format === "rgb") {
        const { r, g, b } = hexToRgb(hex);
        return `rgb(${r}, ${g}, ${b})`;
    }
    if (format === "hsl") {
        const { h, s, l } = hexToHsl(hex);
        return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    }
    return hex;
}

/** k-means in Lab over an RGBA pixel buffer; returns `k` hex colours, darkest first. */
export function extractPalette(data, k) {
    const px = [];
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue; // skip transparent pixels
        const rgb = { r: data[i], g: data[i + 1], b: data[i + 2] };
        px.push({ rgb, lab: rgbToLab(rgb) });
    }
    if (!px.length) return [];
    k = Math.min(k, px.length);

    // deterministic farthest-point seeding: start from the mean, then keep the most distant pixel
    const mean = px.reduce((m, p) => ({ L: m.L + p.lab.L / px.length, a: m.a + p.lab.a / px.length, b: m.b + p.lab.b / px.length }), { L: 0, a: 0, b: 0 });
    const centers = [];
    let first = px[0];
    let firstD = Infinity;
    for (const p of px) {
        const d = labDist(p.lab, mean);
        if (d < firstD) {
            firstD = d;
            first = p;
        }
    }
    centers.push({ ...first.lab });
    const minD = px.map((p) => labDist(p.lab, centers[0]));
    while (centers.length < k) {
        let idx = 0;
        for (let i = 1; i < px.length; i++) if (minD[i] > minD[idx]) idx = i;
        centers.push({ ...px[idx].lab });
        for (let i = 0; i < px.length; i++) minD[i] = Math.min(minD[i], labDist(px[i].lab, centers.at(-1)));
    }

    const assign = new Array(px.length).fill(0);
    for (let iter = 0; iter < 12; iter++) {
        for (let i = 0; i < px.length; i++) {
            let best = 0;
            let bestD = Infinity;
            for (let c = 0; c < centers.length; c++) {
                const d = labDist(px[i].lab, centers[c]);
                if (d < bestD) {
                    bestD = d;
                    best = c;
                }
            }
            assign[i] = best;
        }
        const sums = centers.map(() => ({ L: 0, a: 0, b: 0, n: 0 }));
        px.forEach((p, i) => {
            const s = sums[assign[i]];
            s.L += p.lab.L;
            s.a += p.lab.a;
            s.b += p.lab.b;
            s.n++;
        });
        sums.forEach((s, c) => {
            if (s.n) centers[c] = { L: s.L / s.n, a: s.a / s.n, b: s.b / s.n };
        });
    }

    // report each cluster by its average sRGB colour
    const rgbSums = centers.map(() => ({ r: 0, g: 0, b: 0, n: 0 }));
    px.forEach((p, i) => {
        const s = rgbSums[assign[i]];
        s.r += p.rgb.r;
        s.g += p.rgb.g;
        s.b += p.rgb.b;
        s.n++;
    });
    return rgbSums
        .filter((s) => s.n)
        .map((s) => rgbToHex({ r: s.r / s.n, g: s.g / s.n, b: s.b / s.n }))
        .sort((a, b) => luminance(a) - luminance(b));
}
