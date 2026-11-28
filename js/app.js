// app.js — state, rendering and every interaction of the palette generator.

import { t, initLang, currentLang } from "./lang.js";
import {
    normalizeHex,
    hexToRgb,
    hexToHsl,
    hslToHex,
    bestInk,
    contrast,
    grade,
    colorName,
    formatColor,
    extractPalette,
    rgbToLab,
    INK_LIGHT,
    INK_DARK,
} from "./colors.js";
import { SCHEMES, generatePalette, randomBase, randomScheme, shadesOf } from "./palette.js";

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const MIN = 2;
const MAX = 10;
const KEY_STATE = "palette.state";
const KEY_SAVED = "palette.saved";
const KEY_PREFS = "palette.prefs";

// PaletteStore (js/store.js) is localStorage in a browser, Preferences in the app
const { isNative, nativeHook } = window.PalettePlatform;
const SITE = "https://palette.egenesio.com/";
const store = {
    get(key, fallback) {
        try {
            const v = JSON.parse(window.PaletteStore.get(key));
            return v ?? fallback;
        } catch (e) {
            return fallback;
        }
    },
    set(key, value) {
        window.PaletteStore.set(key, JSON.stringify(value));
    },
};

/* ─── STATE ──────────────────────────────────────────────── */
// colors: [{ hex, locked }], base: hex, scheme: one of SCHEMES, auto: the scheme "auto" last picked
let state = { colors: [], base: "#FF5733", scheme: "analogous", auto: null };
let prefs = { format: "hex", vision: "none", exportTab: "css" };
let saved = [];

let past = [];
let future = [];
let pending = null;

const snapshot = () => JSON.stringify({ colors: state.colors, base: state.base, scheme: state.scheme, auto: state.auto });
const restore = (snap) => {
    state = JSON.parse(snap);
};
const hexes = () => state.colors.map((c) => c.hex);

/** Start a change that may span many events (dragging, colour picker); history records it once. */
function beginLive() {
    if (pending === null) pending = snapshot();
}
function endLive() {
    if (pending !== null && pending !== snapshot()) {
        past.push(pending);
        if (past.length > 100) past.shift();
        future = [];
    }
    pending = null;
    persist();
}
function change(mutate, opts = {}) {
    beginLive();
    mutate();
    endLive();
    render(opts);
}

function persist() {
    store.set(KEY_STATE, state);
    const hash = "#" + hexes().map((h) => h.slice(1).toLowerCase()).join("-");
    if (location.hash !== hash) history.replaceState(null, "", hash);
}

function undo() {
    if (!past.length) return;
    nativeHook("undo");
    future.push(snapshot());
    restore(past.pop());
    persist();
    render({ anim: true });
}
function redo() {
    if (!future.length) return;
    nativeHook("redo");
    past.push(snapshot());
    restore(future.pop());
    persist();
    render({ anim: true });
}

/* ─── GENERATION ─────────────────────────────────────────── */
function activeScheme() {
    if (state.scheme !== "auto") return state.scheme;
    if (!state.auto) state.auto = randomScheme();
    return state.auto;
}

/** Rebuild the palette from base + scheme; locked colours keep their place. */
function regenerate(count = state.colors.length || 5) {
    const fresh = generatePalette(state.base, activeScheme(), count);
    state.colors = fresh.map((hex, i) => (state.colors[i]?.locked ? state.colors[i] : { hex, locked: false }));
}

/** With locked colours, the new base is a nudged version of one of them, so the rest still match. */
function nextBase() {
    const locked = state.colors.filter((c) => c.locked);
    if (!locked.length) return randomBase();
    const { h, s, l } = hexToHsl(locked[Math.floor(Math.random() * locked.length)].hex);
    const jitter = (n) => (Math.random() * 2 - 1) * n;
    return hslToHex({
        h: h + jitter(18),
        s: Math.min(95, Math.max(15, s + jitter(18))),
        l: Math.min(78, Math.max(22, l + jitter(18))),
    });
}

function shuffle() {
    nativeHook("generate");
    change(
        () => {
            state.base = nextBase();
            if (state.scheme === "auto") state.auto = randomScheme();
            regenerate();
        },
        { anim: true },
    );
}

function addColor() {
    if (state.colors.length >= MAX) return;
    change(() => {
        // from a bigger palette of the same harmony, add the colour least like the ones we have
        const have = hexes().map((h) => rgbToLab(hexToRgb(h)));
        const pool = generatePalette(state.base, activeScheme(), state.colors.length + 1);
        let best = pool[0];
        let bestD = -1;
        for (const hex of pool) {
            const lab = rgbToLab(hexToRgb(hex));
            const d = Math.min(...have.map((p) => (p.L - lab.L) ** 2 + (p.a - lab.a) ** 2 + (p.b - lab.b) ** 2));
            if (d > bestD) {
                bestD = d;
                best = hex;
            }
        }
        state.colors.push({ hex: best, locked: false });
    }, { animLast: true });
}

function removeColor(i) {
    if (state.colors.length <= MIN) return;
    if (i === undefined) {
        // the stepper removes the last colour that isn't locked
        i = state.colors.findLastIndex((c) => !c.locked);
        if (i < 0) i = state.colors.length - 1;
    }
    change(() => state.colors.splice(i, 1));
}

/* ─── RENDER ─────────────────────────────────────────────── */
const ICONS = {
    lockOpen:
        '<svg class="i-open" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 6.8-1.2"/></svg>',
    lockClosed:
        '<svg class="i-closed" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/></svg>',
    shades: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M4 9.2h16M4 14.8h16"/></svg>',
    drag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" stroke-width="2.6"/></svg>',
    remove: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/></svg>',
};

function swatchHTML(c, i, n) {
    const { ink, ratio, grade: g } = bestInk(c.hex);
    const value = formatColor(c.hex, prefs.format);
    return `
        <div class="sw${c.locked ? " locked" : ""}" data-i="${i}" style="--c:${c.hex};--ink:${ink};--k:${i}">
            <label class="sw__edit" title="${t("edit-color")}">
                <input type="color" value="${c.hex.toLowerCase()}" aria-label="${t("edit-color")} ${i + 1}" />
            </label>
            <div class="sw__info">
                <button type="button" class="sw__hex${prefs.format === "hex" ? "" : " small"}" title="${t("copy")}">${value}</button>
                <span class="sw__name">${colorName(c.hex)}</span>
                <span class="sw__grade${g === "Fail" ? " fail" : ""}" title="${t("contrast-tip", { ink: ink === INK_LIGHT ? t("white") : t("black") })}">${g} ${ratio.toFixed(1)}</span>
            </div>
            <div class="sw__tools">
                <button type="button" class="sw__btn sw__lock" aria-pressed="${c.locked}" title="${t(c.locked ? "unlock" : "lock")} (${i + 1})" aria-label="${t(c.locked ? "unlock" : "lock")}">${ICONS.lockOpen}${ICONS.lockClosed}</button>
                <button type="button" class="sw__btn sw__btn--shades" title="${t("shades-title")}" aria-label="${t("shades-title")}">${ICONS.shades}</button>
                <button type="button" class="sw__btn sw__btn--drag" title="${t("drag")}" aria-label="${t("drag")}">${ICONS.drag}</button>
                <button type="button" class="sw__btn sw__btn--remove" title="${t("remove")}" aria-label="${t("remove")}"${n <= MIN ? " disabled" : ""}>${ICONS.remove}</button>
            </div>
        </div>`;
}

function renderStrip({ anim = false, animLast = false } = {}) {
    const strip = $("#strip");
    const n = state.colors.length;
    strip.innerHTML = state.colors.map((c, i) => swatchHTML(c, i, n)).join("");
    strip.classList.toggle("many", n >= 8);
    $$(".sw", strip).forEach((el, i) => {
        const keep = animLast ? i < n - 1 : !anim || state.colors[i].locked;
        if (keep) el.classList.add("no-anim");
    });
}

/** Update one swatch in place (keeps the native colour picker open while dragging in it). */
function paintSwatch(i) {
    const el = $(`.sw[data-i="${i}"]`);
    if (!el) return;
    const hex = state.colors[i].hex;
    const { ink, ratio, grade: g } = bestInk(hex);
    el.style.setProperty("--c", hex);
    el.style.setProperty("--ink", ink);
    $(".sw__hex", el).textContent = formatColor(hex, prefs.format);
    $(".sw__name", el).textContent = colorName(hex);
    const gradeEl = $(".sw__grade", el);
    gradeEl.textContent = `${g} ${ratio.toFixed(1)}`;
    gradeEl.classList.toggle("fail", g === "Fail");
    paintChrome();
}

/** Everything around the strip: nav mark, base controls, stepper, buttons. */
function paintChrome() {
    const list = hexes();
    $$("#nav-mark i").forEach((bar, k) => {
        const hex = list[Math.round((k * (list.length - 1)) / 4)];
        bar.classList.remove("on");
        bar.style.background = hex;
    });
    $("#base-chip").style.setProperty("--base", state.base);
    $("#base-color").value = state.base.toLowerCase();
    const hexInput = $("#base-hex");
    if (document.activeElement !== hexInput) {
        hexInput.value = state.base;
        hexInput.classList.remove("bad");
    }
    $("#count").textContent = state.colors.length;
    $("#count-dec").disabled = state.colors.length <= MIN;
    $("#count-inc").disabled = state.colors.length >= MAX;
    $("#t-undo").disabled = !past.length;
    $("#t-redo").disabled = !future.length;

    const isSaved = saved.some((p) => p.colors.join() === list.join());
    $("#t-save").classList.toggle("on", isSaved);
    $("#t-save").setAttribute("aria-pressed", String(isSaved));
    $$("#saved-list .row").forEach((row) => row.classList.toggle("current", row.dataset.key === list.join()));
    nativeHook("state", info());
}

/** What the app's own bars need: the current palette and which buttons work. */
function info() {
    const list = hexes();
    return {
        colors: list,
        locked: state.colors.map((c) => c.locked),
        scheme: state.scheme,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        canAdd: list.length < MAX,
        canRemove: list.length > MIN,
        isSaved: saved.some((p) => p.colors.join() === list.join()),
        savedCount: saved.length,
    };
}

function renderScheme() {
    const sel = $("#scheme");
    sel.innerHTML = SCHEMES.map((s) => {
        let label = t(`s-${s}`);
        if (s === "auto" && state.scheme === "auto" && state.auto) label += ` · ${t(`s-${state.auto}`)}`;
        return `<option value="${s}">${label}</option>`;
    }).join("");
    sel.value = state.scheme;
}

function renderTabs() {
    $$("#format-tabs .tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.format === prefs.format)));
    $$("#vision-tabs .tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.vision === prefs.vision)));
    $("#strip").dataset.vision = prefs.vision;
}

function renderSaved() {
    const list = $("#saved-list");
    const fmt = new Intl.DateTimeFormat(currentLang(), { day: "numeric", month: "short" });
    list.innerHTML = saved
        .map((p, k) => {
            const names = [...new Set(p.colors.map(colorName))];
            const title = names.slice(0, 2).join(" · ") + (names.length > 2 ? " …" : "");
            return `
            <li style="--k:${k}">
                <button type="button" class="row" data-key="${p.colors.join()}" data-k="${k}">
                    <span class="row__bars">${p.colors.map((c) => `<i style="background:${c}"></i>`).join("")}</span>
                    <span class="row__text">
                        <span class="row__name">${title}</span>
                        <span class="row__meta">${t("n-colors", { n: p.colors.length })} · ${fmt.format(new Date(p.at))} · ${p.colors.join(" ")}</span>
                    </span>
                </button>
                <button type="button" class="row__del" data-del="${k}" aria-label="${t("delete")}" title="${t("delete")}">${ICONS.trash}</button>
            </li>`;
        })
        .join("");
    $("#saved-empty").hidden = saved.length > 0;
}

function render(opts = {}) {
    renderStrip(opts);
    renderScheme();
    paintChrome();
}

/* ─── FEEDBACK ───────────────────────────────────────────── */
let toastTimer = null;
function toast(msg, chip) {
    const el = $("#toast");
    el.innerHTML = "";
    if (chip) {
        const i = document.createElement("i");
        i.style.background = chip;
        el.append(i);
    }
    el.append(document.createTextNode(msg));
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
}

async function copyText(text) {
    const handled = nativeHook("copy", text);
    if (handled !== undefined) {
        const ok = !!(await Promise.resolve(handled).catch(() => false));
        if (ok) nativeHook("copied");
        return ok;
    }
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.append(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return ok;
    }
}

async function copyColor(i) {
    const hex = state.colors[i].hex;
    const value = formatColor(hex, prefs.format);
    if (await copyText(value)) toast(t("copied", { v: value }), hex);
    const el = $(`.sw[data-i="${i}"]`);
    if (el) {
        el.classList.remove("flash", "no-anim");
        void el.offsetWidth;
        el.classList.add("flash");
    }
}

async function copyAll() {
    const text = hexes()
        .map((h) => formatColor(h, prefs.format))
        .join(prefs.format === "hex" ? ", " : "\n");
    if (await copyText(text)) toast(t("copied-all"));
}

/* ─── SHEETS ─────────────────────────────────────────────── */
function openSheet(id) {
    const d = $(id);
    if (!d.open) d.showModal();
}
function closeSheet(d) {
    if (!d.open || d.classList.contains("closing")) return;
    d.classList.add("closing");
    d.addEventListener(
        "animationend",
        () => {
            d.classList.remove("closing");
            d.close();
        },
        { once: true },
    );
}
$$("dialog").forEach((d) => {
    d.addEventListener("click", (e) => {
        if (e.target === d || e.target.closest("[data-close]")) closeSheet(d);
    });
    d.addEventListener("cancel", (e) => {
        e.preventDefault();
        closeSheet(d);
    });
});

/* shades */
let shadeIndex = 0;
const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
function openShades(i) {
    shadeIndex = i;
    const hex = state.colors[i].hex;
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = hexToHsl(hex);
    const onWhite = contrast(hex, INK_LIGHT);
    const onBlack = contrast(hex, INK_DARK);
    $("#shade-info").innerHTML = `
        <span class="shade-info__chip" style="background:${hex}"></span>
        <div>
            <p class="shade-info__hex">${hex} <span class="muted">${colorName(hex)}</span></p>
            <p class="shade-info__meta">rgb(${r}, ${g}, ${b}) · hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)</p>
            <p class="shade-info__meta">${t("text-white")} <b>${onWhite.toFixed(2)} ${grade(onWhite)}</b> · ${t("text-black")} <b>${onBlack.toFixed(2)} ${grade(onBlack)}</b></p>
        </div>`;
    $("#shades-list").innerHTML = shadesOf(hex)
        .map((c, k) => {
            const near = Math.abs(hexToHsl(c).l - l) < 4.4;
            return `<li><button type="button" class="shade${near ? " is-current" : ""}" data-hex="${c}">
                <i style="background:${c}"></i><span>${c}</span><small>${SHADE_STEPS[k]}</small>
            </button></li>`;
        })
        .join("");
    openSheet("#shades-sheet");
}
$("#shades-list").addEventListener("click", (e) => {
    const btn = e.target.closest(".shade");
    if (!btn) return;
    const hex = btn.dataset.hex;
    change(() => {
        state.colors[shadeIndex].hex = hex;
    });
    closeSheet($("#shades-sheet"));
    toast(t("replaced", { v: hex }), hex);
});

/* export */
function exportText(kind) {
    const list = hexes();
    const named = list.map((hex) => ({ hex, name: colorName(hex) }));
    const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    switch (kind) {
        case "scss":
            return (
                named.map((c, i) => `$palette-${i + 1}: ${c.hex}; // ${c.name}`).join("\n") +
                `\n\n$palette: (\n${named.map((c, i) => `  "${i + 1}": $palette-${i + 1},`).join("\n")}\n);`
            );
        case "tailwind":
            return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        palette: {\n${named
                .map((c, i) => `          ${(i + 1) * 100}: "${c.hex}", // ${c.name}`)
                .join("\n")}\n        },\n      },\n    },\n  },\n};`;
        case "json":
            return JSON.stringify(
                named.map((c) => {
                    const { r, g, b } = hexToRgb(c.hex);
                    const { h, s, l } = hexToHsl(c.hex);
                    return { name: c.name, hex: c.hex, rgb: [r, g, b], hsl: [Math.round(h), Math.round(s), Math.round(l)] };
                }),
                null,
                2,
            );
        case "array":
            return JSON.stringify(list);
        case "svg": {
            const w = 120;
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${w * list.length}" height="${w}" viewBox="0 0 ${w * list.length} ${w}">\n${list
                .map((hex, i) => `  <rect x="${i * w}" y="0" width="${w}" height="${w}" fill="${hex}"/>`)
                .join("\n")}\n</svg>`;
        }
        case "css":
        default:
            return `:root {\n${named.map((c, i) => `  --palette-${i + 1}: ${c.hex}; /* ${c.name} */`).join("\n")}\n}\n\n/* by name */\n:root {\n${named
                .map((c) => `  --${slug(c.name)}: ${c.hex};`)
                .filter((line, i, all) => all.indexOf(line) === i)
                .join("\n")}\n}`;
    }
}
const EXPORT_EXT = { css: "css", scss: "scss", tailwind: "js", json: "json", array: "txt", svg: "svg" };
const EXPORT_MIME = { svg: "image/svg+xml", json: "application/json" };

function renderExport() {
    $("#export-preview").innerHTML = hexes()
        .map((h) => `<i style="background:${h}"></i>`)
        .join("");
    $$("#export-tabs .tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.export === prefs.exportTab)));
    $("#export-code").textContent = exportText(prefs.exportTab);
}
function openExport() {
    renderExport();
    openSheet("#export-sheet");
}
function download(blob, name) {
    // the app saves the file and opens the share sheet; <a download> does nothing in a WebView
    if (nativeHook("save", blob, name) !== undefined) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const fileBase = () => "palette-" + hexes().map((h) => h.slice(1).toLowerCase()).join("-");

async function downloadPng() {
    const list = hexes();
    const W = 1600;
    const H = 900;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    try {
        await Promise.all([document.fonts.load('700 44px "Syne"'), document.fonts.load('400 22px "DM Mono"')]);
    } catch (e) {}
    const col = W / list.length;
    list.forEach((hex, i) => {
        const x = Math.round(i * col);
        ctx.fillStyle = hex;
        ctx.fillRect(x, 0, Math.ceil(col) + 1, H);
        const { ink } = bestInk(hex);
        ctx.fillStyle = ink;
        const size = list.length > 7 ? 30 : 44;
        ctx.font = `700 ${size}px Syne, sans-serif`;
        ctx.fillText(hex, x + 28, H - 78);
        ctx.globalAlpha = 0.75;
        ctx.font = `400 ${Math.round(size / 2)}px "DM Mono", monospace`;
        ctx.fillText(colorName(hex), x + 30, H - 42);
        ctx.globalAlpha = 1;
    });
    canvas.toBlob((blob) => blob && download(blob, `${fileBase()}.png`), "image/png");
}

/* image */
let extracted = [];
function loadImage(file) {
    if (!file || !file.type.startsWith("image/")) return toast(t("image-error"));
    const url = URL.createObjectURL(file);
    const img = $("#image-preview");
    img.onload = () => {
        const max = 160;
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        extracted = extractPalette(ctx.getImageData(0, 0, w, h).data, state.colors.length);
        if (extracted.length < MIN) extracted = []; // a flat, single-colour image has no palette to offer
        img.hidden = false;
        $("#drop-text").hidden = true;
        const strip = $("#image-strip");
        strip.innerHTML = extracted.map((c, k) => `<i style="background:${c};--k:${k}" title="${c}"></i>`).join("");
        strip.hidden = !extracted.length;
        $("#image-use").disabled = !extracted.length;
    };
    img.onerror = () => toast(t("image-error"));
    img.src = url;
}
$("#image-input").addEventListener("change", (e) => loadImage(e.target.files[0]));
const drop = $("#drop");
drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("over");
});
drop.addEventListener("dragleave", () => drop.classList.remove("over"));
drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("over");
    loadImage(e.dataTransfer.files[0]);
});
$("#image-use").addEventListener("click", () => {
    if (!extracted.length) return;
    change(
        () => {
            state.colors = extracted.map((hex) => ({ hex, locked: false }));
            // the most colourful pick becomes the base, so generating keeps the photo's mood
            state.base = [...extracted].sort((a, b) => hexToHsl(b).s - hexToHsl(a).s)[0];
        },
        { anim: true },
    );
    closeSheet($("#image-sheet"));
    toast(t("image-done"));
});

/* ─── SAVED ──────────────────────────────────────────────── */
function toggleSave() {
    const key = hexes().join();
    const at = saved.findIndex((p) => p.colors.join() === key);
    if (at >= 0) {
        saved.splice(at, 1);
        toast(t("unsaved"));
    } else {
        saved.unshift({ colors: hexes(), at: Date.now() });
        saved = saved.slice(0, 60);
        toast(t("saved-toast"));
    }
    nativeHook("saved", at < 0);
    store.set(KEY_SAVED, saved);
    renderSaved();
    paintChrome();
}
$("#saved-list").addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) {
        saved.splice(Number(del.dataset.del), 1);
        store.set(KEY_SAVED, saved);
        renderSaved();
        paintChrome();
        return;
    }
    const row = e.target.closest(".row");
    if (!row) return;
    const p = saved[Number(row.dataset.k)];
    change(
        () => {
            state.colors = p.colors.map((hex) => ({ hex, locked: false }));
            state.base = p.colors[0];
        },
        { anim: true },
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ─── SHARE ──────────────────────────────────────────────── */
async function share() {
    persist();
    // in the app, location is https://localhost/…, so share the website's link instead
    const url = isNative ? SITE + location.hash : location.href;
    const handled = nativeHook("share", { title: "Palette", text: hexes().join(" "), url });
    if (handled !== undefined) return handled;
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        try {
            await navigator.share({ title: "Palette", text: hexes().join(" "), url });
            return;
        } catch (e) {
            if (e.name === "AbortError") return;
        }
    }
    if (await copyText(url)) toast(t("link-copied"));
}

/* ─── STRIP EVENTS ───────────────────────────────────────── */
const strip = $("#strip");
strip.addEventListener("click", (e) => {
    const sw = e.target.closest(".sw");
    if (!sw) return;
    const i = Number(sw.dataset.i);
    if (e.target.closest(".sw__hex")) copyColor(i);
    else if (e.target.closest(".sw__lock")) {
        change(() => {
            state.colors[i].locked = !state.colors[i].locked;
        });
        nativeHook("lock", state.colors[i].locked);
    } else if (e.target.closest(".sw__btn--shades")) openShades(i);
    else if (e.target.closest(".sw__btn--remove")) removeColor(i);
});
strip.addEventListener("input", (e) => {
    if (e.target.type !== "color") return;
    const i = Number(e.target.closest(".sw").dataset.i);
    beginLive();
    state.colors[i].hex = normalizeHex(e.target.value);
    paintSwatch(i);
});
strip.addEventListener("change", (e) => {
    if (e.target.type !== "color") return;
    endLive();
    paintChrome();
});

// drag to reorder: the strip holds the pointer so the swatches can be re-rendered underneath it
let drag = null;
strip.addEventListener("pointerdown", (e) => {
    const handle = e.target.closest(".sw__btn--drag");
    if (!handle) return;
    e.preventDefault();
    const i = Number(handle.closest(".sw").dataset.i);
    drag = { i, horizontal: getComputedStyle(strip).flexDirection === "row", id: e.pointerId };
    strip.setPointerCapture(e.pointerId);
    strip.classList.add("is-dragging");
    beginLive();
    $(`.sw[data-i="${i}"]`).classList.add("dragging");
});
strip.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const pos = drag.horizontal ? e.clientX : e.clientY;
    const els = $$(".sw", strip);
    let target = drag.i;
    els.forEach((el, j) => {
        const r = el.getBoundingClientRect();
        const lo = drag.horizontal ? r.left : r.top;
        const hi = drag.horizontal ? r.right : r.bottom;
        if (pos >= lo && pos <= hi) target = j;
    });
    if (target === drag.i) return;
    const [moved] = state.colors.splice(drag.i, 1);
    state.colors.splice(target, 0, moved);
    drag.i = target;
    nativeHook("reorder");
    renderStrip();
    $(`.sw[data-i="${target}"]`).classList.add("dragging");
});
const endDrag = () => {
    if (!drag) return;
    drag = null;
    strip.classList.remove("is-dragging");
    endLive();
    renderStrip();
    paintChrome();
};
strip.addEventListener("pointerup", endDrag);
strip.addEventListener("pointercancel", endDrag);

/* ─── CONTROLS ───────────────────────────────────────────── */
function setBase(hex, live) {
    if (live) beginLive();
    state.base = hex;
    regenerate();
    if (!live) endLive();
    renderStrip();
    paintChrome();
}
$("#base-color").addEventListener("input", (e) => setBase(normalizeHex(e.target.value), true));
$("#base-color").addEventListener("change", () => {
    endLive();
    paintChrome();
});
$("#base-hex").addEventListener("input", (e) => {
    const hex = normalizeHex(e.target.value);
    e.target.classList.toggle("bad", !hex && e.target.value.replace("#", "").length >= 3);
    if (hex && hex !== state.base && e.target.value.replace("#", "").length === 6) setBase(hex, false);
});
$("#base-hex").addEventListener("change", (e) => {
    const hex = normalizeHex(e.target.value);
    if (hex && hex !== state.base) setBase(hex, false);
    e.target.value = state.base;
    e.target.classList.remove("bad");
});
$("#base-hex").addEventListener("keydown", (e) => {
    if (e.key === "Enter") e.target.blur();
});
$("#random-base").addEventListener("click", () => {
    change(() => {
        state.base = randomBase();
        regenerate();
    }, { anim: true });
});
$("#scheme").addEventListener("change", (e) => {
    change(
        () => {
            state.scheme = e.target.value;
            state.auto = state.scheme === "auto" ? randomScheme() : null;
            regenerate();
        },
        { anim: true },
    );
});
$("#count-inc").addEventListener("click", addColor);
$("#count-dec").addEventListener("click", () => removeColor());
$("#generate").addEventListener("click", shuffle);

$("#t-undo").addEventListener("click", undo);
$("#t-redo").addEventListener("click", redo);
$("#t-save").addEventListener("click", toggleSave);
$("#t-share").addEventListener("click", share);
$("#t-export").addEventListener("click", openExport);
$("#t-image").addEventListener("click", () => openSheet("#image-sheet"));
$("#open-help").addEventListener("click", () => openSheet("#help-sheet"));
$("#go-saved").addEventListener("click", () => $("#saved").scrollIntoView({ behavior: "smooth" }));

$("#format-tabs").addEventListener("click", (e) => {
    const b = e.target.closest(".tab");
    if (!b) return;
    prefs.format = b.dataset.format;
    store.set(KEY_PREFS, prefs);
    renderTabs();
    renderStrip();
});
$("#vision-tabs").addEventListener("click", (e) => {
    const b = e.target.closest(".tab");
    if (!b) return;
    prefs.vision = b.dataset.vision;
    store.set(KEY_PREFS, prefs);
    renderTabs();
});
$("#export-tabs").addEventListener("click", (e) => {
    const b = e.target.closest(".tab");
    if (!b) return;
    prefs.exportTab = b.dataset.export;
    store.set(KEY_PREFS, prefs);
    renderExport();
});
$("#export-copy").addEventListener("click", async () => {
    if (await copyText(exportText(prefs.exportTab))) toast(t("code-copied"));
});
$("#export-png").addEventListener("click", downloadPng);
$("#export-file").addEventListener("click", () => {
    const kind = prefs.exportTab;
    const blob = new Blob([exportText(kind)], { type: EXPORT_MIME[kind] || "text/plain" });
    download(blob, `${fileBase()}.${EXPORT_EXT[kind]}`);
});

/* ─── KEYBOARD ───────────────────────────────────────────── */
document.addEventListener("keydown", (e) => {
    if ($$("dialog").some((d) => d.open)) return;
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (mod && key === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
        return;
    }
    if (mod && key === "y") {
        e.preventDefault();
        redo();
        return;
    }
    if (mod || e.altKey) return;

    if (e.code === "Space") {
        // let a focused button keep its own space behaviour, except the generate button
        if (tag === "BUTTON" && e.target.id !== "generate") return;
        e.preventDefault();
        if (!e.repeat) shuffle();
    } else if (/^[1-9]$/.test(key)) {
        const i = Number(key) - 1;
        if (state.colors[i]) {
            change(() => (state.colors[i].locked = !state.colors[i].locked));
            nativeHook("lock", state.colors[i].locked);
        }
    } else if (key === "c") copyAll();
    else if (key === "s") toggleSave();
    else if (key === "e") openExport();
    else if (key === "?") openSheet("#help-sheet");
});

/* ─── START ──────────────────────────────────────────────── */
function fromHash() {
    const parts = location.hash.replace(/^#\/?/, "").split("-").map(normalizeHex);
    if (parts.length < MIN || parts.length > MAX || parts.some((p) => !p)) return null;
    return parts;
}

window.addEventListener("hashchange", () => {
    const list = fromHash();
    if (!list || list.join() === hexes().join()) return;
    change(
        () => {
            state.colors = list.map((hex) => ({ hex, locked: false }));
            state.base = list[0];
        },
        { anim: true },
    );
});

document.addEventListener("langchange", () => {
    render();
    renderSaved();
    if ($("#export-sheet").open) renderExport();
});

(async function start() {
    await window.PaletteStore.ready;
    prefs = { ...prefs, ...store.get(KEY_PREFS, {}) };
    saved = store.get(KEY_SAVED, []);
    const fromUrl = fromHash();
    const last = store.get(KEY_STATE, null);
    if (last && Array.isArray(last.colors) && last.colors.every((c) => normalizeHex(c.hex))) {
        state = { ...state, ...last };
    }
    if (!SCHEMES.includes(state.scheme)) state.scheme = "analogous";
    // a link to a palette wins over the last session, unless it is that same palette (keeps its locks)
    if (fromUrl && fromUrl.join() !== hexes().join()) {
        state.colors = fromUrl.map((hex) => ({ hex, locked: false }));
        state.base = fromUrl[0];
    }
    if (state.colors.length < MIN) {
        state.base = normalizeHex(state.base) || "#FF5733";
        regenerate(5);
    }
    await initLang();
    renderTabs();
    renderSaved();
    render({ anim: true });
    persist();
})();

/* ─── APP API ────────────────────────────────────────────── */
// For the iOS / Android app's own bars and back button (unused on the website).
window.Palette = {
    info,
    generate: shuffle,
    undo,
    redo,
    addColor,
    removeColor: () => removeColor(),
    toggleSave,
    share,
    copyAll,
    openExport,
    openImage: () => openSheet("#image-sheet"),
    openHelp: () => openSheet("#help-sheet"),
    loadImage,
    toast,
    /** Closes the top open sheet; false when none was open (Android back). */
    closeSheet() {
        // a sheet still playing its closing animation counts as closed
        const open = $$("dialog").filter((d) => d.open && !d.classList.contains("closing"));
        if (!open.length) return false;
        closeSheet(open[open.length - 1]);
        return true;
    },
};
