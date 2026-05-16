import { FONT, TOP_MARGIN, LEFT_MARGIN, CHAR_SPACING } from "./font.js";

const FALLBACK_CHAR = " ";

/* ========================================
   RENDER CHARACTER
   Any non-space becomes this character
======================================== */
const RENDER_CHAR = "█";

function getGlyph(ch) {
    return FONT[ch] || FONT[FALLBACK_CHAR] || [" "];
}

/* ========================================
   Convert glyph row:
   spaces stay spaces
   everything else -> RENDER_CHAR
======================================== */
function normalizeRow(row) {

    let out = "";

    for (const ch of row) {
        out += (ch === " ") ? " " : RENDER_CHAR;
    }

    return out;
}

export function render(text) {

    const str = String(text ?? "");
    const chars = str.length ? str.split("") : [FALLBACK_CHAR];

    const firstGlyph = getGlyph(chars[0]);
    const h = firstGlyph.length;

    const out = [];

    /* top margin */
    const topPad = Math.max(0, TOP_MARGIN);

    for (let i = 0; i < topPad; i++) {
        out.push("");
    }

    for (let row = 0; row < h; row++) {

        let line = " ".repeat(LEFT_MARGIN);

        for (let i = 0; i < chars.length; i++) {

            const glyph = getGlyph(chars[i]);

            const rawRow = glyph[row] ?? " ";

            /* normalize all filled chars */
            line += normalizeRow(rawRow);

            /* character spacing */
            if (i < chars.length - 1) {
                line += " ".repeat(Math.max(0, CHAR_SPACING));
            }
        }

        out.push(line);
    }

    return out.join("\n");
}