/**
 * Color Utility Functions
 * Conversion between Hex, RGB, and HSV
 *
 * HSV is used for palette generation as it aligns with the color wheel concept:
 * H (Hue) = Position on the color wheel (0-360 degrees, normalized to 0-1)
 * S (Saturation) = Intensity of the color (0-1)
 * V (Value/Brightness) = Lightness of the color (0-1)
 */

// --- Color Conversion Functions ---

/**
 * Convert hex color to RGB object.
 * @param {string} hexColor - Base color in hex format (e.g., '#3498db')
 * @returns {{r: number, g: number, b: number}} RGB object with values 0-255.
 */
function hexToRgb(hexColor) {
    let hex = hexColor.startsWith("#") ? hexColor.substring(1) : hexColor;
    if (hex.length !== 6) {
        throw new Error(`Invalid hex color: ${hexColor}`);
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
}

/**
 * Convert RGB (0-255) to hex color.
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color string (e.g., '#3498db')
 */
function rgbToHex(r, g, b) {
    // Ensure values are integers and within the 0-255 range
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    const toHex = (c) => c.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB (0-1) to HSV (0-1). Reimplementation of colorsys.rgb_to_hsv.
 * @param {number} r - Red value (0-1)
 * @param {number} g - Green value (0-1)
 * @param {number} b - Blue value (0-1)
 * @returns {{h: number, s: number, v: number}} HSV object with values 0-1.
 */
function rgbToHsv(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
        s,
        v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return { h, s, v };
}

/**
 * Convert HSV (0-1) to RGB (0-1). Reimplementation of colorsys.hsv_to_rgb.
 * @param {number} h - Hue value (0-1)
 * @param {number} s - Saturation value (0-1)
 * @param {number} v - Value/Brightness value (0-1)
 * @returns {{r: number, g: number, b: number}} RGB object with values 0-1.
 */
function hsvToRgb(h, s, v) {
    let r, g, b;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
            r = v;
            g = p;
            b = q;
            break;
    }

    return { r, g, b };
}

/**
 * Convert HSV (0-1) to hex color.
 * @param {number} h - Hue value (0-1)
 * @param {number} s - Saturation value (0-1)
 * @param {number} v - Value/Brightness value (0-1)
 * @returns {string} Hex color string (e.g., '#3498db')
 */
function hsvToHex(h, s, v) {
    const { r, g, b } = hsvToRgb(h, s, v);
    // Convert R, G, B from 0-1 to 0-255 range for hex conversion
    return rgbToHex(r * 255, g * 255, b * 255);
}

// --- Palette Generation Functions ---

/**
 * Generates analogous color palette (adjacent colors on the color wheel).
 * @param {string} baseHex - Base color in hex format
 * @param {number} [count=5] - Number of colors to generate
 * @returns {string[]} List of hex colors
 */
function analogous(baseHex, count = 5) {
    const { r, g, b } = hexToRgb(baseHex);
    // Convert R, G, B from 0-255 to 0-1 for HSV conversion
    const { h, s, v } = rgbToHsv(r / 255, g / 255, b / 255);

    const palette = [];
    // Adjust step to shift hue slightly to adjacent colors
    const step = 1.0 / count;
    for (let i = 0; i < count; i++) {
        const shift = (i - Math.floor(count / 2)) * step * 0.1;
        const nh = (h + shift) % 1;
        palette.push(hsvToHex(nh, s, v));
    }
    return palette;
}

/**
 * Generates complementary color palette (opposite on color wheel).
 * @param {string} baseHex - Base color in hex format
 * @param {number} [count=5] - Number of colors to generate
 * @returns {string[]} List of hex colors
 */
function complementary(baseHex, count = 5) {
    const { r, g, b } = hexToRgb(baseHex);
    const { h, s, v } = rgbToHsv(r / 255, g / 255, b / 255);

    const palette = [];
    const compH = (h + 0.5) % 1; // The complementary hue is +0.5 (180 degrees)

    for (let i = 0; i < count; i++) {
        let nh;
        // Shift colors between the base and complementary hue
        if (i < Math.floor(count / 2)) {
            nh = (h + (i / count) * 0.2) % 1;
        } else {
            nh = (compH + ((i - Math.floor(count / 2)) / count) * 0.2) % 1;
        }
        palette.push(hsvToHex(nh, s, v));
    }
    return palette;
}

/**
 * Generates triadic color palette (3 colors equally spaced 120° apart).
 * @param {string} baseHex - Base color in hex format
 * @param {number} [count=9] - Number of colors to generate
 * @returns {string[]} List of hex colors
 */
function triadic(baseHex, count = 9) {
    const { r, g, b } = hexToRgb(baseHex);
    const { h, s, v } = rgbToHsv(r / 255, g / 255, b / 255);

    const palette = [];
    const colorsPerSection = Math.floor(count / 3);

    for (let section = 0; section < 3; section++) {
        const baseHue = (h + section * (1 / 3)) % 1; // Shifts by 0, 1/3, 2/3
        for (let i = 0; i < colorsPerSection; i++) {
            // Apply a small shift around each of the three base hues
            const shift = (i - Math.floor(colorsPerSection / 2)) * 0.05;
            const nh = (baseHue + shift) % 1;
            palette.push(hsvToHex(nh, s, v));
        }
    }
    return palette;
}

/**
 * Generates tetradic color palette (4 colors forming a rectangle/square).
 * @param {string} baseHex - Base color in hex format
 * @param {number} [count=8] - Number of colors to generate
 * @returns {string[]} List of hex colors
 */
function tetradic(baseHex, count = 8) {
    const { r, g, b } = hexToRgb(baseHex);
    const { h, s, v } = rgbToHsv(r / 255, g / 255, b / 255);

    const palette = [];
    const colorsPerSection = Math.floor(count / 4);

    for (let section = 0; section < 4; section++) {
        const baseHue = (h + section * 0.25) % 1; // Shifts by 0, 0.25, 0.5, 0.75
        for (let i = 0; i < colorsPerSection; i++) {
            // Apply a small shift around each of the four base hues
            const shift = (i - Math.floor(colorsPerSection / 2)) * 0.04;
            const nh = (baseHue + shift) % 1;
            palette.push(hsvToHex(nh, s, v));
        }
    }
    return palette;
}

/**
 * Generates monochromatic color palette (variations of saturation and value).
 * @param {string} baseHex - Base color in hex format
 * @param {number} [count=5] - Number of colors to generate
 * @returns {string[]} List of hex colors
 */
function monochromatic(baseHex, count = 5) {
    const { r, g, b } = hexToRgb(baseHex);
    const { h, s, v } = rgbToHsv(r / 255, g / 255, b / 255);

    const palette = [];

    for (let i = 0; i < count; i++) {
        const ratio = i / (count - 1);
        // This logic slightly deviates from the Python version but provides a smooth transition
        // by varying both saturation (s) and value (v) while keeping hue (h) constant.
        // Python: new_s = s * (0.3 + 0.7 * ratio), new_v = v * (0.4 + 0.6 * (1 - ratio))

        // Monochromatic is often about tints (adding white/increasing V) and shades (adding black/decreasing V)
        const newV = v * (1 - 0.5 * ratio); // Decrease value slightly
        const newS = s * (0.5 + 0.5 * ratio); // Increase saturation slightly

        palette.push(hsvToHex(h, newS, newV));
    }
    return palette;
}

/**
 * Generates palette with shades and tints (darker and lighter versions).
 * @param {string} baseHex - Base color in hex format
 * @param {number} [count=5] - Number of colors to generate
 * @returns {string[]} List of hex colors
 */
function shadesAndTints(baseHex, count = 5) {
    const { r, g, b } = hexToRgb(baseHex);
    const { h, s, v } = rgbToHsv(r / 255, g / 255, b / 255);

    const palette = [];

    for (let i = 0; i < count; i++) {
        const ratio = count > 1 ? i / (count - 1) : 0.5;
        // Simple linear interpolation of Value (V) from a darker shade (0.2*V) to a lighter tint (V)
        const newV = v * (0.2 + 0.8 * ratio);
        palette.push(hsvToHex(h, s, newV));
    }

    return palette;
}

// --- Main Generation Function ---

const PALETTE_MODES = {
    analogous: analogous,
    complementary: complementary,
    triadic: triadic,
    tetradic: tetradic,
    monochromatic: monochromatic,
    shades_and_tints: shadesAndTints,
};

/**
 * Generate a color palette using the specified mode.
 * @param {string} baseHex - Base color in hex format (e.g., '#3498db')
 * @param {string} [mode='analogous'] - Generation mode ('analogous', 'complementary', 'triadic', 'tetradic', 'monochromatic', 'shades_and_tints')
 * @param {number} [count=5] - Number of colors to generate
 * @returns {string[]} List of hex colors
 * @throws {Error} If mode is not recognized
 */
function generatePalette(baseHex, mode = "analogous", count = 5) {
    if (!PALETTE_MODES[mode]) {
        throw new Error(
            `Unknown mode: ${mode}. Available modes: ${Object.keys(
                PALETTE_MODES
            ).join(", ")}`
        );
    }
    // Convert baseHex to uppercase for consistency, although the functions handle lowercase
    return PALETTE_MODES[mode](baseHex.toUpperCase(), count);
}

export { generatePalette };
